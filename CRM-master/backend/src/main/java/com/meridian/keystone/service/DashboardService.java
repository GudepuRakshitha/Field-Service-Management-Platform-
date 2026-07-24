package com.meridian.keystone.service;

import com.meridian.keystone.domain.WorkOrderStatus;
import com.meridian.keystone.dto.DashboardSummaryDto;
import com.meridian.keystone.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final WorkOrderRepository workOrderRepository;

    public DashboardService(WorkOrderRepository workOrderRepository) {
        this.workOrderRepository = workOrderRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        DashboardSummaryDto dto = new DashboardSummaryDto();

        dto.setTotalWorkOrders(workOrderRepository.count());
        dto.setNewCount(workOrderRepository.countByStatus(WorkOrderStatus.NEW));
        dto.setAssignedCount(workOrderRepository.countByStatus(WorkOrderStatus.ASSIGNED));
        dto.setInProgressCount(workOrderRepository.countByStatus(WorkOrderStatus.IN_PROGRESS));
        dto.setOnHoldCount(workOrderRepository.countByStatus(WorkOrderStatus.ON_HOLD));
        dto.setCompletedCount(workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED));
        dto.setClosedCount(workOrderRepository.countByStatus(WorkOrderStatus.CLOSED));
        dto.setCancelledCount(workOrderRepository.countByStatus(WorkOrderStatus.CANCELLED));

        dto.setOverdueCount(workOrderRepository.countOverdue(Instant.now()));

        long finished = workOrderRepository.countTotalFinished();
        long onTime = workOrderRepository.countOnTimeFinished();

        double slaPercent = finished > 0 ? ((double) onTime / finished) * 100.0 : 100.0;
        dto.setSlaCompliancePercent(Math.round(slaPercent * 10.0) / 10.0);

        // Tech breakdown
        Map<String, Long> techMap = new HashMap<>();
        List<Object[]> techResults = workOrderRepository.countByTechnician();
        for (Object[] row : techResults) {
            String name = (String) row[0];
            Long count = (Long) row[1];
            techMap.put(name, count);
        }
        dto.setTechnicianBreakdown(techMap);

        // Site breakdown
        Map<String, Long> siteMap = new HashMap<>();
        List<Object[]> siteResults = workOrderRepository.countBySite();
        for (Object[] row : siteResults) {
            String name = (String) row[0];
            Long count = (Long) row[1];
            siteMap.put(name, count);
        }
        dto.setSiteBreakdown(siteMap);

        return dto;
    }
}
