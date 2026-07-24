package com.meridian.keystone.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ErrorResponse {
    private Instant timestamp;
    private int status;
    private String message;
    private List<FieldErrorDto> fieldErrors = new ArrayList<>();

    public ErrorResponse() {
        this.timestamp = Instant.now();
    }

    public ErrorResponse(int status, String message) {
        this.timestamp = Instant.now();
        this.status = status;
        this.message = message;
    }

    public ErrorResponse(int status, String message, List<FieldErrorDto> fieldErrors) {
        this.timestamp = Instant.now();
        this.status = status;
        this.message = message;
        this.fieldErrors = fieldErrors != null ? fieldErrors : new ArrayList<>();
    }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<FieldErrorDto> getFieldErrors() { return fieldErrors; }
    public void setFieldErrors(List<FieldErrorDto> fieldErrors) { this.fieldErrors = fieldErrors; }
}
