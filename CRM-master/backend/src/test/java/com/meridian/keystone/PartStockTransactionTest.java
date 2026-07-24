package com.meridian.keystone;

import com.meridian.keystone.domain.*;
import com.meridian.keystone.exception.InsufficientStockException;
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

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class PartStockTransactionTest {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SiteRepository siteRepository;

    private Part part;
    private WorkOrder workOrder;
    private User tech;

    @BeforeEach
    void setUp() {
        Customer customer = customerRepository.save(new Customer("Test Customer", "c@test.com"));
        Site site = siteRepository.save(new Site(customer, "Test Site", "123 St"));

        tech = userRepository.save(new User("Alex Tech", "alex@tech.com", "pass", Role.TECHNICIAN, null));

        part = partRepository.save(new Part("Filter Valve", "PRT-VALVE-01", new BigDecimal("45.00"), 5));

        workOrder = new WorkOrder();
        workOrder.setCode("WO-PART-001");
        workOrder.setTitle("Part Stock Test");
        workOrder.setPriority(Priority.MEDIUM);
        workOrder.setStatus(WorkOrderStatus.IN_PROGRESS);
        workOrder.setCustomer(customer);
        workOrder.setSite(site);
        workOrder.setAssignedTo(tech);
        workOrder.setSlaDueAt(java.time.Instant.now().plusSeconds(3600));
        workOrder = workOrderRepository.save(workOrder);
    }

    @Test
    @DisplayName("Logging part usage decrements stock quantity atomically in DB")
    void testPartStockDecrement() {
        CustomUserDetails techDetails = new CustomUserDetails(tech);

        var usage = workOrderService.logPartUsage(workOrder.getId(), new com.meridian.keystone.dto.LogPartUsageRequest(part.getId(), 3), techDetails);

        assertNotNull(usage);
        assertEquals(3, usage.getQtyUsed());

        Part updatedPart = partRepository.findById(part.getId()).orElseThrow();
        assertEquals(2, updatedPart.getStockQty()); // 5 - 3 = 2
    }

    @Test
    @DisplayName("Attempting to use more parts than in stock throws InsufficientStockException and stock remains unchanged")
    void testInsufficientStockRejection() {
        CustomUserDetails techDetails = new CustomUserDetails(tech);

        assertThrows(InsufficientStockException.class, () -> {
            workOrderService.logPartUsage(workOrder.getId(), new com.meridian.keystone.dto.LogPartUsageRequest(part.getId(), 10), techDetails);
        });

        Part unchangedPart = partRepository.findById(part.getId()).orElseThrow();
        assertEquals(5, unchangedPart.getStockQty()); // Unchanged
    }
}
