package com.meridian.keystone.dto;

import java.util.Map;

public class DashboardSummaryDto {
    private long totalWorkOrders;
    private long newCount;
    private long assignedCount;
    private long inProgressCount;
    private long onHoldCount;
    private long completedCount;
    private long closedCount;
    private long cancelledCount;
    private long overdueCount;
    private double slaCompliancePercent;

    private Map<String, Long> technicianBreakdown;
    private Map<String, Long> siteBreakdown;

    public DashboardSummaryDto() {}

    public long getTotalWorkOrders() { return totalWorkOrders; }
    public void setTotalWorkOrders(long totalWorkOrders) { this.totalWorkOrders = totalWorkOrders; }

    public long getNewCount() { return newCount; }
    public void setNewCount(long newCount) { this.newCount = newCount; }

    public long getAssignedCount() { return assignedCount; }
    public void setAssignedCount(long assignedCount) { this.assignedCount = assignedCount; }

    public long getInProgressCount() { return inProgressCount; }
    public void setInProgressCount(long inProgressCount) { this.inProgressCount = inProgressCount; }

    public long getOnHoldCount() { return onHoldCount; }
    public void setOnHoldCount(long onHoldCount) { this.onHoldCount = onHoldCount; }

    public long getCompletedCount() { return completedCount; }
    public void setCompletedCount(long completedCount) { this.completedCount = completedCount; }

    public long getClosedCount() { return closedCount; }
    public void setClosedCount(long closedCount) { this.closedCount = closedCount; }

    public long getCancelledCount() { return cancelledCount; }
    public void setCancelledCount(long cancelledCount) { this.cancelledCount = cancelledCount; }

    public long getOverdueCount() { return overdueCount; }
    public void setOverdueCount(long overdueCount) { this.overdueCount = overdueCount; }

    public double getSlaCompliancePercent() { return slaCompliancePercent; }
    public void setSlaCompliancePercent(double slaCompliancePercent) { this.slaCompliancePercent = slaCompliancePercent; }

    public Map<String, Long> getTechnicianBreakdown() { return technicianBreakdown; }
    public void setTechnicianBreakdown(Map<String, Long> technicianBreakdown) { this.technicianBreakdown = technicianBreakdown; }

    public Map<String, Long> getSiteBreakdown() { return siteBreakdown; }
    public void setSiteBreakdown(Map<String, Long> siteBreakdown) { this.siteBreakdown = siteBreakdown; }
}
