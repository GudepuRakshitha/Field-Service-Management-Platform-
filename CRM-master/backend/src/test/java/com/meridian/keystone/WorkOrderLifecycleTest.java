package com.meridian.keystone;

import com.meridian.keystone.domain.*;
import com.meridian.keystone.exception.IllegalStateTransitionException;
import com.meridian.keystone.repository.*;
import com.meridian.keystone.security.CustomUserDetails;
import com.meridian.keystone.service.WorkOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class WorkOrderLifecycleTest {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private WorkOrderStatusHistoryRepository historyRepository;

    private User dispatcher;
    private User manager;
    private User tech1;
    private Customer customer;
    private Site site;
    private WorkOrder workOrder;

    @BeforeEach
    void setUp() {
        customer = customerRepository.save(new Customer("Test Customer", "test@customer.com"));
        site = siteRepository.save(new Site(customer, "Test Site", "123 Test St"));

        dispatcher = userRepository.save(new User("Dispatcher Dan", "disp@test.com", "hash", Role.DISPATCHER, null));
        manager = userRepository.save(new User("Manager Morgan", "mgr@test.com", "hash", Role.MANAGER, null));
        tech1 = userRepository.save(new User("Tech Alex", "tech@test.com", "hash", Role.TECHNICIAN, null));

        workOrder = new WorkOrder();
        workOrder.setCode("WO-TEST-0001");
        workOrder.setTitle("Lifecycle Test Job");
        workOrder.setDescription("Testing lifecycle state transitions");
        workOrder.setPriority(Priority.HIGH);
        workOrder.setStatus(WorkOrderStatus.NEW);
        workOrder.setCustomer(customer);
        workOrder.setSite(site);
        workOrder.setSlaDueAt(java.time.Instant.now().plusSeconds(3600 * 24));
        workOrder = workOrderRepository.save(workOrder);
    }

    @Test
    @DisplayName("Valid transition path: NEW -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> CLOSED")
    void testValidLifecyclePath() {
        CustomUserDetails dispatcherDetails = new CustomUserDetails(dispatcher);
        CustomUserDetails techDetails = new CustomUserDetails(tech1);
        CustomUserDetails managerDetails = new CustomUserDetails(manager);

        // 1. Assign (NEW -> ASSIGNED)
        workOrderService.assignWorkOrder(workOrder.getId(), new com.meridian.keystone.dto.AssignWorkOrderRequest(tech1.getId(), "Assigned to tech"), dispatcherDetails);
        WorkOrder updated = workOrderRepository.findById(workOrder.getId()).orElseThrow();
        assertEquals(WorkOrderStatus.ASSIGNED, updated.getStatus());
        assertEquals(tech1.getId(), updated.getAssignedTo().getId());

        // 2. Start (ASSIGNED -> IN_PROGRESS)
        workOrderService.changeStatus(workOrder.getId(), new com.meridian.keystone.dto.StatusTransitionRequest(WorkOrderStatus.IN_PROGRESS, "Started work"), techDetails);
        updated = workOrderRepository.findById(workOrder.getId()).orElseThrow();
        assertEquals(WorkOrderStatus.IN_PROGRESS, updated.getStatus());

        // 3. Complete (IN_PROGRESS -> COMPLETED)
        workOrderService.changeStatus(workOrder.getId(), new com.meridian.keystone.dto.StatusTransitionRequest(WorkOrderStatus.COMPLETED, "Completed job"), techDetails);
        updated = workOrderRepository.findById(workOrder.getId()).orElseThrow();
        assertEquals(WorkOrderStatus.COMPLETED, updated.getStatus());

        // 4. Close (COMPLETED -> CLOSED by Manager)
        workOrderService.changeStatus(workOrder.getId(), new com.meridian.keystone.dto.StatusTransitionRequest(WorkOrderStatus.CLOSED, "Approved & Closed"), managerDetails);
        updated = workOrderRepository.findById(workOrder.getId()).orElseThrow();
        assertEquals(WorkOrderStatus.CLOSED, updated.getStatus());
    }

    @Test
    @DisplayName("Invalid transition from NEW directly to COMPLETED must throw 409 Conflict")
    void testInvalidTransitionNewToCompleted() {
        CustomUserDetails techDetails = new CustomUserDetails(tech1);

        assertThrows(IllegalStateTransitionException.class, () -> {
            workOrderService.changeStatus(workOrder.getId(), new com.meridian.keystone.dto.StatusTransitionRequest(WorkOrderStatus.COMPLETED, "Skipping steps"), techDetails);
        });

        WorkOrder unchanged = workOrderRepository.findById(workOrder.getId()).orElseThrow();
        assertEquals(WorkOrderStatus.NEW, unchanged.getStatus());
    }

    @Test
    @DisplayName("Closed work order cannot undergo further transitions")
    void testClosedTerminalState() {
        workOrder.setStatus(WorkOrderStatus.CLOSED);
        workOrderRepository.save(workOrder);

        CustomUserDetails managerDetails = new CustomUserDetails(manager);

        assertThrows(IllegalStateTransitionException.class, () -> {
            workOrderService.changeStatus(workOrder.getId(), new com.meridian.keystone.dto.StatusTransitionRequest(WorkOrderStatus.IN_PROGRESS, "Reopening closed"), managerDetails);
        });
    }
}
