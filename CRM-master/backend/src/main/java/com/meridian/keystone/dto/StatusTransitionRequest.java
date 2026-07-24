package com.meridian.keystone.dto;

import com.meridian.keystone.domain.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;

public class StatusTransitionRequest {

    @NotNull(message = "Target status is required")
    private WorkOrderStatus toStatus;

    private String note;

    public StatusTransitionRequest() {}

    public StatusTransitionRequest(WorkOrderStatus toStatus, String note) {
        this.toStatus = toStatus;
        this.note = note;
    }

    public WorkOrderStatus getToStatus() { return toStatus; }
    public void setToStatus(WorkOrderStatus toStatus) { this.toStatus = toStatus; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
