package com.meridian.keystone.controller;

import com.meridian.keystone.dto.DashboardSummaryDto;
import com.meridian.keystone.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reporting & Analytics", description = "Manager/Dispatcher reports and KPI summaries")
public class ReportController {

    private final DashboardService dashboardService;

    public ReportController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('CREATE_WORK_ORDERS')")
    @Operation(summary = "Get high level KPI summary and breakdowns for dashboard")
    public ResponseEntity<DashboardSummaryDto> getSummaryReport() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }
}
