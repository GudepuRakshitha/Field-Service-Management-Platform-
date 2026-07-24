package com.meridian.keystone.service;

import com.meridian.keystone.domain.Role;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.domain.WorkOrder;
import com.meridian.keystone.domain.WorkOrderStatus;
import com.meridian.keystone.repository.UserRepository;
import com.meridian.keystone.repository.WorkOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@EnableScheduling
public class SlaSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SlaSchedulerService.class);

    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;
    private final WorkOrderService workOrderService;
    private final NotificationService notificationService;

    public SlaSchedulerService(
            WorkOrderRepository workOrderRepository,
            UserRepository userRepository,
            WorkOrderService workOrderService,
            NotificationService notificationService) {
        this.workOrderRepository = workOrderRepository;
        this.userRepository = userRepository;
        this.workOrderService = workOrderService;
        this.notificationService = notificationService;
    }

    // Run SLA check every 5 minutes (300,000 ms)
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkSlaBreachesAndRisks() {
        log.info("Running scheduled SLA breach & risk audit...");

        List<WorkOrder> activeOrders = workOrderRepository.findByStatusIn(
                Arrays.asList(WorkOrderStatus.NEW, WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.ON_HOLD)
        );

        List<User> managers = userRepository.findByRole(Role.MANAGER);

        for (WorkOrder wo : activeOrders) {
            String slaStatus = workOrderService.computeSlaStatus(wo);
            if ("BREACHED".equals(slaStatus)) {
                log.warn("SLA BREACH DETECTED for Work Order {}", wo.getCode());
                for (User manager : managers) {
                    notificationService.sendNotification(
                            manager,
                            "SLA BREACH ALERT: " + wo.getCode(),
                            "Work Order [" + wo.getCode() + "] (" + wo.getTitle() + ") at site " + wo.getSite().getName() + " has BREACHED its SLA due date (" + wo.getSlaDueAt() + ")."
                    );
                }
            } else if ("AT_RISK".equals(slaStatus)) {
                log.info("SLA AT RISK for Work Order {}", wo.getCode());
                for (User manager : managers) {
                    notificationService.sendNotification(
                            manager,
                            "SLA AT-RISK WARNING: " + wo.getCode(),
                            "Work Order [" + wo.getCode() + "] (" + wo.getTitle() + ") is due in less than 2 hours (" + wo.getSlaDueAt() + ")."
                    );
                }
            }
        }
    }
}
