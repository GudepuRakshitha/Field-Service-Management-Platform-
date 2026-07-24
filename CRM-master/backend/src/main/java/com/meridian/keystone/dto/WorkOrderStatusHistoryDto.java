package com.meridian.keystone.dto;

import com.meridian.keystone.domain.WorkOrderStatus;

import java.time.Instant;

public class WorkOrderStatusHistoryDto {
    private Long id;
    private Long workOrderId;
    private WorkOrderStatus fromStatus;
    private WorkOrderStatus toStatus;
    private Long changedById;
    private String changedByName;
    private Instant changedAt;
    private String note;

    public WorkOrderStatusHistoryDto() {}

    public WorkOrderStatusHistoryDto(Long id, Long workOrderId, WorkOrderStatus fromStatus, WorkOrderStatus toStatus, Long changedById, String changedByName, Instant changedAt, String note) {
        this.id = id;
        this.workOrderId = workOrderId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedById = changedById;
        this.changedByName = changedByName;
        this.changedAt = changedAt;
        this.note = note;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(Long workOrderId) { this.workOrderId = workOrderId; }

    public WorkOrderStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(WorkOrderStatus fromStatus) { this.fromStatus = fromStatus; }

    public WorkOrderStatus getToStatus() { return toStatus; }
    public void setToStatus(WorkOrderStatus toStatus) { this.toStatus = toStatus; }

    public Long getChangedById() { return changedById; }
    public void setChangedById(Long changedById) { this.changedById = changedById; }

    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }

    public Instant getChangedAt() { return changedAt; }
    public void setChangedAt(Instant changedAt) { this.changedAt = changedAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
