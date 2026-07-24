package com.meridian.keystone;

import com.meridian.keystone.domain.*;
import com.meridian.keystone.exception.AccessDeniedSecurityException;
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
public class CustomerSecurityIsolationTest {

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

    private Customer customerA;
    private Customer customerB;

    private User customerUserA;
    private User customerUserB;

    private WorkOrder workOrderB;

    @BeforeEach
    void setUp() {
        customerA = customerRepository.save(new Customer("Customer Alpha", "alpha@corp.com"));
        customerB = customerRepository.save(new Customer("Customer Beta", "beta@corp.com"));

        Site siteB = siteRepository.save(new Site(customerB, "Beta Site 1", "789 Beta Blvd"));

        customerUserA = userRepository.save(new User("Alice Alpha", "alice@alpha.com", "pass", Role.CUSTOMER, customerA));
        customerUserB = userRepository.save(new User("Bob Beta", "bob@beta.com", "pass", Role.CUSTOMER, customerB));

        workOrderB = new WorkOrder();
        workOrderB.setCode("WO-BETA-0099");
        workOrderB.setTitle("Beta Secret Job");
        workOrderB.setDescription("Beta data");
        workOrderB.setPriority(Priority.MEDIUM);
        workOrderB.setStatus(WorkOrderStatus.NEW);
        workOrderB.setCustomer(customerB);
        workOrderB.setSite(siteB);
        workOrderB.setSlaDueAt(java.time.Instant.now().plusSeconds(3600));
        workOrderB = workOrderRepository.save(workOrderB);
    }

    @Test
    @DisplayName("Customer A attempting to view Customer B's work order gets AccessDeniedSecurityException (403)")
    void testCustomerCannotAccessOtherCustomerWorkOrder() {
        CustomUserDetails userADetails = new CustomUserDetails(customerUserA);

        assertThrows(AccessDeniedSecurityException.class, () -> {
            workOrderService.getWorkOrderById(workOrderB.getId(), userADetails);
        });
    }

    @Test
    @DisplayName("Customer B can view their own work order successfully")
    void testCustomerCanAccessOwnWorkOrder() {
        CustomUserDetails userBDetails = new CustomUserDetails(customerUserB);

        assertDoesNotThrow(() -> {
            var dto = workOrderService.getWorkOrderCustomerDtoById(workOrderB.getId(), userBDetails);
            assertNotNull(dto);
            assertEquals("WO-BETA-0099", dto.getCode());
        });
    }
}
