package com.meridian.keystone.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "part_usages")
public class PartUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @Column(name = "qty_used", nullable = false)
    private Integer qtyUsed;

    @Column(name = "unit_cost_at_time", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCostAtTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public PartUsage() {}

    public PartUsage(WorkOrder workOrder, Part part, Integer qtyUsed, BigDecimal unitCostAtTime) {
        this.workOrder = workOrder;
        this.part = part;
        this.qtyUsed = qtyUsed;
        this.unitCostAtTime = unitCostAtTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WorkOrder getWorkOrder() { return workOrder; }
    public void setWorkOrder(WorkOrder workOrder) { this.workOrder = workOrder; }

    public Part getPart() { return part; }
    public void setPart(Part part) { this.part = part; }

    public Integer getQtyUsed() { return qtyUsed; }
    public void setQtyUsed(Integer qtyUsed) { this.qtyUsed = qtyUsed; }

    public BigDecimal getUnitCostAtTime() { return unitCostAtTime; }
    public void setUnitCostAtTime(BigDecimal unitCostAtTime) { this.unitCostAtTime = unitCostAtTime; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
