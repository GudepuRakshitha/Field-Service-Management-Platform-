package com.meridian.keystone.controller;

import com.meridian.keystone.domain.Priority;
import com.meridian.keystone.domain.Role;
import com.meridian.keystone.domain.WorkOrderStatus;
import com.meridian.keystone.dto.*;
import com.meridian.keystone.security.CustomUserDetails;
import com.meridian.keystone.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@Tag(name = "Work Orders", description = "Core Work Order operations, state transitions, dispatching, and field logging")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @GetMapping
    @Operation(summary = "Get paginated work orders with filtering & role scoping")
    public ResponseEntity<Page<WorkOrderDto>> getWorkOrders(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long assignedToUserId,
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<WorkOrderDto> workOrders = workOrderService.getWorkOrders(
                currentUser, customerId, assignedToUserId, status, priority, query, PageRequest.of(page, size, sort)
        );

        return ResponseEntity.ok(workOrders);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get work order details by ID")
    public ResponseEntity<?> getWorkOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        if (currentUser.getRole() == Role.CUSTOMER) {
            return ResponseEntity.ok(workOrderService.getWorkOrderCustomerDtoById(id, currentUser));
        }
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_WORK_ORDERS')")
    @Operation(summary = "Create a new work order")
    public ResponseEntity<WorkOrderDto> createWorkOrder(
            @Valid @RequestBody WorkOrderCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        WorkOrderDto created = workOrderService.createWorkOrder(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CREATE_WORK_ORDERS')")
    @Operation(summary = "Update an open work order")
    public ResponseEntity<WorkOrderDto> updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        WorkOrderDto updated = workOrderService.updateWorkOrder(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('ASSIGN_TECHNICIANS')")
    @Operation(summary = "Assign work order to a technician")
    public ResponseEntity<WorkOrderDto> assignWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody AssignWorkOrderRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        WorkOrderDto assigned = workOrderService.assignWorkOrder(id, request, currentUser);
        return ResponseEntity.ok(assigned);
    }

    @PostMapping("/{id}/status")
    @Operation(summary = "Transition work order status via guarded state machine")
    public ResponseEntity<WorkOrderDto> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusTransitionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        WorkOrderDto updated = workOrderService.changeStatus(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get append-only status change history for a work order")
    public ResponseEntity<List<WorkOrderStatusHistoryDto>> getStatusHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(workOrderService.getStatusHistory(id, currentUser));
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasAuthority('EXECUTE_FIELD_JOBS')")
    @Operation(summary = "Log part usage with atomic stock decrement")
    public ResponseEntity<PartUsageDto> logPartUsage(
            @PathVariable Long id,
            @Valid @RequestBody LogPartUsageRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        PartUsageDto usage = workOrderService.logPartUsage(id, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(usage);
    }

    @PostMapping("/{id}/time")
    @PreAuthorize("hasAuthority('EXECUTE_FIELD_JOBS')")
    @Operation(summary = "Log labor time spent on work order")
    public ResponseEntity<TimeLogDto> logTime(
            @PathVariable Long id,
            @Valid @RequestBody LogTimeRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        TimeLogDto timeLog = workOrderService.logTime(id, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(timeLog);
    }
}
