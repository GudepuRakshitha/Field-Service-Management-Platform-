package com.meridian.keystone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class LogPartUsageRequest {

    @NotNull(message = "Part ID is required")
    private Long partId;

    @NotNull(message = "Quantity used is required")
    @Min(value = 1, message = "Quantity used must be at least 1")
    private Integer qtyUsed;

    public LogPartUsageRequest() {}

    public LogPartUsageRequest(Long partId, Integer qtyUsed) {
        this.partId = partId;
        this.qtyUsed = qtyUsed;
    }

    public Long getPartId() { return partId; }
    public void setPartId(Long partId) { this.partId = partId; }

    public Integer getQtyUsed() { return qtyUsed; }
    public void setQtyUsed(Integer qtyUsed) { this.qtyUsed = qtyUsed; }
}
