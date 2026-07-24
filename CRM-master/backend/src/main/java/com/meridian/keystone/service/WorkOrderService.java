package com.meridian.keystone.service;

import com.meridian.keystone.domain.*;
import com.meridian.keystone.dto.*;
import com.meridian.keystone.exception.AccessDeniedSecurityException;
import com.meridian.keystone.exception.IllegalStateTransitionException;
import com.meridian.keystone.exception.InsufficientStockException;
import com.meridian.keystone.exception.ResourceNotFoundException;
import com.meridian.keystone.repository.*;
import com.meridian.keystone.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderStatusHistoryRepository historyRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final PartRepository partRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;
    private final NotificationService notificationService;

    public WorkOrderService(
            WorkOrderRepository workOrderRepository,
            WorkOrderStatusHistoryRepository historyRepository,
            CustomerRepository customerRepository,
            SiteRepository siteRepository,
            UserRepository userRepository,
            PartRepository partRepository,
            PartUsageRepository partUsageRepository,
            TimeLogRepository timeLogRepository,
            NotificationService notificationService) {
        this.workOrderRepository = workOrderRepository;
        this.historyRepository = historyRepository;
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
        this.userRepository = userRepository;
        this.partRepository = partRepository;
        this.partUsageRepository = partUsageRepository;
        this.timeLogRepository = timeLogRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public Page<WorkOrderDto> getWorkOrders(
            CustomUserDetails currentUser,
            Long customerId,
            Long assignedToUserId,
            WorkOrderStatus status,
            Priority priority,
            String query,
            Pageable pageable) {

        // Data Ownership Scoping
        if (currentUser.getRole() == Role.CUSTOMER) {
            customerId = currentUser.getCustomerId(); // Force customer scope
        } else if (currentUser.getRole() == Role.TECHNICIAN && assignedToUserId == null) {
            assignedToUserId = currentUser.getUserId(); // Default technician view to assigned jobs
        }

        return workOrderRepository.findWithFilters(customerId, assignedToUserId, status, priority, query, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public WorkOrderDto getWorkOrderById(Long id, CustomUserDetails currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order not found with ID: " + id));

        enforceReadAccess(workOrder, currentUser);
        return mapToDto(workOrder);
    }

    @Transactional(readOnly = true)
    public WorkOrderCustomerDto getWorkOrderCustomerDtoById(Long id, CustomUserDetails currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order not found with ID: " + id));

        enforceReadAccess(workOrder, currentUser);
        return mapToCustomerDto(workOrder);
    }

    @Transactional
    public WorkOrderDto createWorkOrder(WorkOrderCreateRequest request, CustomUserDetails currentUser) {
        // Enforce customer scoping if role is CUSTOMER
        if (currentUser.getRole() == Role.CUSTOMER) {
            if (!request.getCustomerId().equals(currentUser.getCustomerId())) {
                throw new AccessDeniedSecurityException("Customers can only create work orders for their own organization");
            }
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with ID: " + request.getSiteId()));

        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Site ID " + request.getSiteId() + " does not belong to Customer ID " + request.getCustomerId());
        }

        WorkOrder workOrder = new WorkOrder();
        workOrder.setCode(generateUniqueCode());
        workOrder.setTitle(request.getTitle());
        workOrder.setDescription(request.getDescription());
        workOrder.setPriority(request.getPriority());
        workOrder.setStatus(WorkOrderStatus.NEW);
        workOrder.setCustomer(customer);
        workOrder.setSite(site);
        workOrder.setSlaDueAt(calculateSlaDueAt(request.getPriority()));

        WorkOrder saved = workOrderRepository.save(workOrder);

        // Record initial status history
        WorkOrderStatusHistory history = new WorkOrderStatusHistory(
                saved,
                null,
                WorkOrderStatus.NEW,
                currentUser.getUser(),
                "Work order created"
        );
        historyRepository.save(history);

        // Multi-role Notifications for Work Order Creation
        notifyManagersAndDispatchers(
                "New Work Order Created: " + saved.getCode(),
                "Work Order [" + saved.getCode() + "] (" + saved.getTitle() + ") created for Customer " + customer.getName() + " at site " + site.getName() + "."
        );
        notifyCustomerUsers(
                customer.getId(),
                "Work Order Request Received: " + saved.getCode(),
                "Work Order [" + saved.getCode() + "] (" + saved.getTitle() + ") has been submitted for site " + site.getName() + "."
        );

        return mapToDto(saved);
    }

    @Transactional
    public WorkOrderDto updateWorkOrder(Long id, WorkOrderUpdateRequest request, CustomUserDetails currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order not found with ID: " + id));

        enforceWriteAccess(workOrder, currentUser);

        if (workOrder.getStatus() == WorkOrderStatus.CLOSED || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new IllegalStateTransitionException("Work Order is " + workOrder.getStatus() + " and cannot be modified.");
        }

        workOrder.setTitle(request.getTitle());
        workOrder.setDescription(request.getDescription());
        if (workOrder.getPriority() != request.getPriority()) {
            workOrder.setPriority(request.getPriority());
            workOrder.setSlaDueAt(calculateSlaDueAt(request.getPriority()));
        }

        return mapToDto(workOrderRepository.save(workOrder));
    }

    @Transactional
    public WorkOrderDto assignWorkOrder(Long id, AssignWorkOrderRequest request, CustomUserDetails currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order not found with ID: " + id));

        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + request.getTechnicianId()));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Target user must have TECHNICIAN role");
        }

        WorkOrderStatus oldStatus = workOrder.getStatus();
        workOrder.setAssignedTo(technician);

        // If status was NEW, transition to ASSIGNED automatically
        if (oldStatus == WorkOrderStatus.NEW) {
            validateAndTransitionStatus(workOrder, WorkOrderStatus.ASSIGNED, currentUser.getUser(), request.getNote() != null ? request.getNote() : "Assigned to technician " + technician.getName());
        } else {
            // Write assignment history note
            WorkOrderStatusHistory history = new WorkOrderStatusHistory(
                    workOrder,
                    oldStatus,
                    oldStatus,
                    currentUser.getUser(),
                    "Reassigned to technician " + technician.getName() + (request.getNote() != null ? ": " + request.getNote() : "")
            );
            historyRepository.save(history);
        }

        WorkOrder saved = workOrderRepository.save(workOrder);

        // Multi-role notifications for Assignment
        notifyTechnician(
                technician,
                "New Work Order Assigned: " + saved.getCode(),
                "You have been assigned to Work Order [" + saved.getCode() + "]: " + saved.getTitle() + " at site " + saved.getSite().getName()
        );
        notifyCustomerUsers(
                saved.getCustomer().getId(),
                "Technician Assigned to " + saved.getCode(),
                "Technician " + technician.getName() + " has been assigned to your Work Order [" + saved.getCode() + "]."
        );

        return mapToDto(saved);
    }

    @Transactional
    public WorkOrderDto changeStatus(Long id, StatusTransitionRequest request, CustomUserDetails currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order not found with ID: " + id));

        validateAndTransitionStatus(workOrder, request.getToStatus(), currentUser.getUser(), request.getNote());
        return mapToDto(workOrderRepository.save(workOrder));
    }

    @Transactional
    public PartUsageDto logPartUsage(Long workOrderId, LogPartUsageRequest request, CustomUserDetails currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order not found with ID: " + workOrderId));

        enforceTechnicianOrManagementAccess(workOrder, currentUser);

        if (workOrder.getStatus() == WorkOrderStatus.CLOSED || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new IllegalStateTransitionException("Cannot log parts for work order in " + workOrder.getStatus() + " status");
        }

        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + request.getPartId()));

        // Check stock quantity atomically
        if (part.getStockQty() < request.getQtyUsed()) {
            throw new InsufficientStockException("Insufficient stock for part '" + part.getName() + "'. Required: " + request.getQtyUsed() + ", Available: " + part.getStockQty());
        }

        // Decrement stock in same transaction
        part.setStockQty(part.getStockQty() - request.getQtyUsed());
        partRepository.save(part);

        PartUsage usage = new PartUsage(workOrder, part, request.getQtyUsed(), part.getUnitCost());
        PartUsage saved = partUsageRepository.save(usage);

        PartUsageDto dto = new PartUsageDto();
        dto.setId(saved.getId());
        dto.setWorkOrderId(workOrder.getId());
        dto.setPartId(part.getId());
        dto.setPartName(part.getName());
        dto.setPartSku(part.getSku());
        dto.setQtyUsed(saved.getQtyUsed());
        dto.setUnitCostAtTime(saved.getUnitCostAtTime());
        dto.setTotalCost(saved.getUnitCostAtTime().multiply(BigDecimal.valueOf(saved.getQtyUsed())));
        dto.setCreatedAt(saved.getCreatedAt());

        // Notifications for Part Usage & Low Stock Alert
        if (part.getStockQty() <= 5) {
            notifyManagersAndDispatchers(
                    "⚠️ Low Stock Alert: " + part.getName(),
                    "Part '" + part.getName() + "' (SKU: " + part.getSku() + ") is running low on stock! Current stock: " + part.getStockQty() + " units remaining."
            );
        }
        notifyCustomerUsers(
                workOrder.getCustomer().getId(),
                "Part Logged on " + workOrder.getCode(),
                "Part '" + part.getName() + "' (Qty: " + request.getQtyUsed() + ") was logged for Work Order [" + workOrder.getCode() + "]."
        );

        return dto;
    }

    @Transactional
    public TimeLogDto logTime(Long workOrderId, LogTimeRequest request, CustomUserDetails currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order not found with ID: " + workOrderId));

        enforceTechnicianOrManagementAccess(workOrder, currentUser);

        if (workOrder.getStatus() == WorkOrderStatus.CLOSED || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new IllegalStateTransitionException("Cannot log time for work order in " + workOrder.getStatus() + " status");
        }

        TimeLog timeLog = new TimeLog(workOrder, currentUser.getUser(), request.getMinutes(), request.getNote());
        TimeLog saved = timeLogRepository.save(timeLog);

        TimeLogDto dto = new TimeLogDto();
        dto.setId(saved.getId());
        dto.setWorkOrderId(workOrder.getId());
        dto.setTechnicianId(currentUser.getUserId());
        dto.setTechnicianName(currentUser.getUser().getName());
        dto.setMinutes(saved.getMinutes());
        dto.setNote(saved.getNote());
        dto.setCreatedAt(saved.getCreatedAt());

        // Notifications for Labor Time Logging
        notifyManagersAndDispatchers(
                "Labor Time Logged: " + workOrder.getCode(),
                currentUser.getUser().getName() + " logged " + request.getMinutes() + " minutes of labor on Work Order [" + workOrder.getCode() + "]" + (request.getNote() != null ? ": " + request.getNote() : "") + "."
        );

        return dto;
    }

    @Transactional(readOnly = true)
    public List<WorkOrderStatusHistoryDto> getStatusHistory(Long workOrderId, CustomUserDetails currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order not found with ID: " + workOrderId));

        enforceReadAccess(workOrder, currentUser);

        return historyRepository.findByWorkOrderIdOrderByChangedAtDesc(workOrderId).stream()
                .map(h -> new WorkOrderStatusHistoryDto(
                        h.getId(),
                        h.getWorkOrder().getId(),
                        h.getFromStatus(),
                        h.getToStatus(),
                        h.getChangedBy().getId(),
                        h.getChangedBy().getName(),
                        h.getChangedAt(),
                        h.getNote()
                )).collect(Collectors.toList());
    }

    // --- State Machine & Guard Rules ---

    public void validateAndTransitionStatus(WorkOrder workOrder, WorkOrderStatus toStatus, User changedBy, String note) {
        WorkOrderStatus fromStatus = workOrder.getStatus();

        if (fromStatus == toStatus) {
            return; // No-op
        }

        // Terminal states check
        if (fromStatus == WorkOrderStatus.CLOSED || fromStatus == WorkOrderStatus.CANCELLED) {
            throw new IllegalStateTransitionException("Cannot transition from terminal state " + fromStatus + " to " + toStatus);
        }

        Role role = changedBy.getRole();
        boolean isAssignedTech = workOrder.getAssignedTo() != null && workOrder.getAssignedTo().getId().equals(changedBy.getId());
        boolean isManagerOrDispatcher = role == Role.MANAGER || role == Role.DISPATCHER;

        boolean allowed = false;

        switch (fromStatus) {
            case NEW:
                if (toStatus == WorkOrderStatus.ASSIGNED && isManagerOrDispatcher) allowed = true;
                if (toStatus == WorkOrderStatus.CANCELLED && isManagerOrDispatcher) allowed = true;
                break;

            case ASSIGNED:
                if (toStatus == WorkOrderStatus.IN_PROGRESS && (isAssignedTech || isManagerOrDispatcher)) allowed = true;
                if (toStatus == WorkOrderStatus.CANCELLED && isManagerOrDispatcher) allowed = true;
                break;

            case IN_PROGRESS:
                if (toStatus == WorkOrderStatus.ON_HOLD && (isAssignedTech || isManagerOrDispatcher)) allowed = true;
                if (toStatus == WorkOrderStatus.COMPLETED && (isAssignedTech || isManagerOrDispatcher)) allowed = true;
                break;

            case ON_HOLD:
                if (toStatus == WorkOrderStatus.IN_PROGRESS && (isAssignedTech || isManagerOrDispatcher)) allowed = true;
                break;

            case COMPLETED:
                if (toStatus == WorkOrderStatus.IN_PROGRESS && isManagerOrDispatcher) allowed = true;
                if (toStatus == WorkOrderStatus.CLOSED && role == Role.MANAGER) allowed = true;
                break;

            default:
                allowed = false;
        }

        if (!allowed) {
            throw new IllegalStateTransitionException(
                    "Illegal status transition from " + fromStatus + " to " + toStatus + " for user role " + role
            );
        }

        // Apply transition
        workOrder.setStatus(toStatus);

        // Record history inside SAME transaction
        WorkOrderStatusHistory history = new WorkOrderStatusHistory(workOrder, fromStatus, toStatus, changedBy, note);
        historyRepository.save(history);

        // Dispatch Multi-Role Notifications
        String techName = workOrder.getAssignedTo() != null ? workOrder.getAssignedTo().getName() : "Technician";
        Long customerId = workOrder.getCustomer().getId();

        switch (toStatus) {
            case IN_PROGRESS:
                notifyCustomerUsers(customerId, "Work Started: " + workOrder.getCode(), "Technician " + techName + " has started work on Work Order [" + workOrder.getCode() + "] (" + workOrder.getTitle() + ").");
                notifyManagersAndDispatchers("Work Order In Progress: " + workOrder.getCode(), "Technician " + techName + " started work on Work Order [" + workOrder.getCode() + "].");
                break;
            case ON_HOLD:
                notifyCustomerUsers(customerId, "Work Order On Hold: " + workOrder.getCode(), "Work Order [" + workOrder.getCode() + "] is temporarily on hold" + (note != null ? ": " + note : "") + ".");
                notifyManagersAndDispatchers("Work Order On Hold: " + workOrder.getCode(), "Work Order [" + workOrder.getCode() + "] placed on hold by " + changedBy.getName() + (note != null ? ": " + note : "") + ".");
                break;
            case COMPLETED:
                notifyCustomerUsers(customerId, "Work Order Completed: " + workOrder.getCode(), "Work on your Work Order [" + workOrder.getCode() + "] (" + workOrder.getTitle() + ") has been completed. Pending manager review.");
                notifyManagersAndDispatchers("Work Order Completed: " + workOrder.getCode(), "Technician " + techName + " completed Work Order [" + workOrder.getCode() + "]. Ready for review and closure.");
                break;
            case CLOSED:
                notifyCustomerUsers(customerId, "Work Order Closed: " + workOrder.getCode(), "Work Order [" + workOrder.getCode() + "] has been reviewed and closed by management.");
                notifyTechnician(workOrder.getAssignedTo(), "Work Order Archived: " + workOrder.getCode(), "Work Order [" + workOrder.getCode() + "] has been closed & archived.");
                break;
            case CANCELLED:
                notifyCustomerUsers(customerId, "Work Order Cancelled: " + workOrder.getCode(), "Work Order [" + workOrder.getCode() + "] was cancelled.");
                notifyTechnician(workOrder.getAssignedTo(), "Work Order Cancelled: " + workOrder.getCode(), "Work Order [" + workOrder.getCode() + "] was cancelled by management.");
                break;
            default:
                break;
        }
    }

    // --- Helper Notification Dispatchers for All Roles ---

    private void notifyManagersAndDispatchers(String title, String message) {
        List<User> managers = userRepository.findByRole(Role.MANAGER);
        List<User> dispatchers = userRepository.findByRole(Role.DISPATCHER);
        for (User u : managers) {
            notificationService.sendNotification(u, title, message);
        }
        for (User u : dispatchers) {
            notificationService.sendNotification(u, title, message);
        }
    }

    private void notifyCustomerUsers(Long customerId, String title, String message) {
        if (customerId == null) return;
        List<User> customerUsers = userRepository.findByCustomerId(customerId);
        for (User u : customerUsers) {
            notificationService.sendNotification(u, title, message);
        }
    }

    private void notifyTechnician(User technician, String title, String message) {
        if (technician != null) {
            notificationService.sendNotification(technician, title, message);
        }
    }

    // --- Helper Scoping & Access Control Methods ---

    private void enforceReadAccess(WorkOrder workOrder, CustomUserDetails currentUser) {
        if (currentUser.getRole() == Role.CUSTOMER) {
            if (!workOrder.getCustomer().getId().equals(currentUser.getCustomerId())) {
                throw new AccessDeniedSecurityException("Access Denied: You cannot view work orders belonging to another customer.");
            }
        }
    }

    private void enforceWriteAccess(WorkOrder workOrder, CustomUserDetails currentUser) {
        if (currentUser.getRole() == Role.CUSTOMER) {
            if (!workOrder.getCustomer().getId().equals(currentUser.getCustomerId())) {
                throw new AccessDeniedSecurityException("Access Denied: You cannot modify work orders belonging to another customer.");
            }
        }
    }

    private void enforceTechnicianOrManagementAccess(WorkOrder workOrder, CustomUserDetails currentUser) {
        if (currentUser.getRole() == Role.TECHNICIAN) {
            if (workOrder.getAssignedTo() == null || !workOrder.getAssignedTo().getId().equals(currentUser.getUserId())) {
                throw new AccessDeniedSecurityException("Access Denied: Technicians can only act on work orders assigned to them.");
            }
        } else if (currentUser.getRole() == Role.CUSTOMER) {
            throw new AccessDeniedSecurityException("Customers cannot perform technician actions on work orders.");
        }
    }

    private Instant calculateSlaDueAt(Priority priority) {
        Instant now = Instant.now();
        switch (priority) {
            case CRITICAL: return now.plus(Duration.ofHours(4));
            case HIGH: return now.plus(Duration.ofHours(24));
            case MEDIUM: return now.plus(Duration.ofHours(72));
            case LOW: return now.plus(Duration.ofHours(120));
            default: return now.plus(Duration.ofHours(72));
        }
    }

    public String computeSlaStatus(WorkOrder workOrder) {
        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED || workOrder.getStatus() == WorkOrderStatus.CLOSED || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            return "ON_TRACK";
        }
        Instant now = Instant.now();
        if (now.isAfter(workOrder.getSlaDueAt())) {
            return "BREACHED";
        }
        if (Duration.between(now, workOrder.getSlaDueAt()).toHours() <= 2) {
            return "AT_RISK";
        }
        return "ON_TRACK";
    }

    private String generateUniqueCode() {
        int year = ZonedDateTime.now(ZoneId.of("UTC")).getYear();
        int randomNum = 100000 + new Random().nextInt(900000);
        return "WO-" + year + "-" + randomNum;
    }

    public WorkOrderDto mapToDto(WorkOrder wo) {
        WorkOrderDto dto = new WorkOrderDto();
        dto.setId(wo.getId());
        dto.setCode(wo.getCode());
        dto.setTitle(wo.getTitle());
        dto.setDescription(wo.getDescription());
        dto.setPriority(wo.getPriority());
        dto.setStatus(wo.getStatus());
        dto.setSlaDueAt(wo.getSlaDueAt());
        dto.setSlaStatus(computeSlaStatus(wo));

        dto.setCustomerId(wo.getCustomer().getId());
        dto.setCustomerName(wo.getCustomer().getName());

        dto.setSiteId(wo.getSite().getId());
        dto.setSiteName(wo.getSite().getName());
        dto.setSiteAddress(wo.getSite().getAddress());

        if (wo.getAssignedTo() != null) {
            dto.setAssignedToId(wo.getAssignedTo().getId());
            dto.setAssignedToName(wo.getAssignedTo().getName());
        }

        BigDecimal partsTotal = wo.getPartUsages().stream()
                .map(p -> p.getUnitCostAtTime().multiply(BigDecimal.valueOf(p.getQtyUsed())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalPartsCost(partsTotal);

        int laborMinutes = wo.getTimeLogs().stream()
                .mapToInt(TimeLog::getMinutes)
                .sum();
        dto.setTotalLaborMinutes(laborMinutes);

        dto.setCreatedAt(wo.getCreatedAt());
        dto.setUpdatedAt(wo.getUpdatedAt());
        return dto;
    }

    public WorkOrderCustomerDto mapToCustomerDto(WorkOrder wo) {
        WorkOrderCustomerDto dto = new WorkOrderCustomerDto();
        dto.setId(wo.getId());
        dto.setCode(wo.getCode());
        dto.setTitle(wo.getTitle());
        dto.setDescription(wo.getDescription());
        dto.setPriority(wo.getPriority());
        dto.setStatus(wo.getStatus());
        dto.setSlaDueAt(wo.getSlaDueAt());
        dto.setSlaStatus(computeSlaStatus(wo));

        dto.setCustomerId(wo.getCustomer().getId());
        dto.setCustomerName(wo.getCustomer().getName());

        dto.setSiteId(wo.getSite().getId());
        dto.setSiteName(wo.getSite().getName());
        dto.setSiteAddress(wo.getSite().getAddress());

        dto.setCreatedAt(wo.getCreatedAt());
        dto.setUpdatedAt(wo.getUpdatedAt());
        return dto;
    }
}
