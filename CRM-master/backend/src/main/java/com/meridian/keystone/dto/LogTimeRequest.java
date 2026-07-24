package com.meridian.keystone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class LogTimeRequest {

    @NotNull(message = "Minutes spent is required")
    @Min(value = 1, message = "Minutes spent must be at least 1")
    private Integer minutes;

    private String note;

    public LogTimeRequest() {}

    public LogTimeRequest(Integer minutes, String note) {
        this.minutes = minutes;
        this.note = note;
    }

    public Integer getMinutes() { return minutes; }
    public void setMinutes(Integer minutes) { this.minutes = minutes; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
