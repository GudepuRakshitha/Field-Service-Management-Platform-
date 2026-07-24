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
public class TechnicianSecurityIsolationTest {

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

    private User tech1;
    private User tech2;
    private WorkOrder jobAssignedToTech1;

    @BeforeEach
    void setUp() {
        Customer customer = customerRepository.save(new Customer("Acme Corp", "acme@corp.com"));
        Site site = siteRepository.save(new Site(customer, "Acme HQ", "100 Acme Way"));

        tech1 = userRepository.save(new User("Tech One", "tech1@meridian.com", "pass", Role.TECHNICIAN, null));
        tech2 = userRepository.save(new User("Tech Two", "tech2@meridian.com", "pass", Role.TECHNICIAN, null));

        jobAssignedToTech1 = new WorkOrder();
        jobAssignedToTech1.setCode("WO-TECH-100");
        jobAssignedToTech1.setTitle("Tech 1 Job");
        jobAssignedToTech1.setPriority(Priority.HIGH);
        jobAssignedToTech1.setStatus(WorkOrderStatus.ASSIGNED);
        jobAssignedToTech1.setCustomer(customer);
        jobAssignedToTech1.setSite(site);
        jobAssignedToTech1.setAssignedTo(tech1);
        jobAssignedToTech1.setSlaDueAt(java.time.Instant.now().plusSeconds(7200));
        jobAssignedToTech1 = workOrderRepository.save(jobAssignedToTech1);
    }

    @Test
    @DisplayName("Tech 2 attempting to start/act on job assigned to Tech 1 throws AccessDeniedSecurityException")
    void testTechnicianCannotActOnOtherTechnicianJob() {
        CustomUserDetails tech2Details = new CustomUserDetails(tech2);

        assertThrows(AccessDeniedSecurityException.class, () -> {
            workOrderService.logTime(jobAssignedToTech1.getId(), new com.meridian.keystone.dto.LogTimeRequest(60, "Tech 2 trying to log time"), tech2Details);
        });
    }

    @Test
    @DisplayName("Tech 1 can start and log time on their own assigned job")
    void testTechnicianCanActOnOwnJob() {
        CustomUserDetails tech1Details = new CustomUserDetails(tech1);

        assertDoesNotThrow(() -> {
            workOrderService.changeStatus(jobAssignedToTech1.getId(), new com.meridian.keystone.dto.StatusTransitionRequest(WorkOrderStatus.IN_PROGRESS, "Tech 1 starting"), tech1Details);
            var log = workOrderService.logTime(jobAssignedToTech1.getId(), new com.meridian.keystone.dto.LogTimeRequest(45, "Diagnostic done"), tech1Details);
            assertNotNull(log);
            assertEquals(45, log.getMinutes());
        });
    }
}
