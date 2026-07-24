package com.meridian.keystone.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class PartUsageDto {
    private Long id;
    private Long workOrderId;
    private Long partId;
    private String partName;
    private String partSku;
    private Integer qtyUsed;
    private BigDecimal unitCostAtTime;
    private BigDecimal totalCost;
    private Instant createdAt;

    public PartUsageDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(Long workOrderId) { this.workOrderId = workOrderId; }

    public Long getPartId() { return partId; }
    public void setPartId(Long partId) { this.partId = partId; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public String getPartSku() { return partSku; }
    public void setPartSku(String partSku) { this.partSku = partSku; }

    public Integer getQtyUsed() { return qtyUsed; }
    public void setQtyUsed(Integer qtyUsed) { this.qtyUsed = qtyUsed; }

    public BigDecimal getUnitCostAtTime() { return unitCostAtTime; }
    public void setUnitCostAtTime(BigDecimal unitCostAtTime) { this.unitCostAtTime = unitCostAtTime; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
