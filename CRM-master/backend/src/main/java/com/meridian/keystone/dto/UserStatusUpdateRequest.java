package com.meridian.keystone.dto;

public class UserStatusUpdateRequest {
    private Boolean active;

    public UserStatusUpdateRequest() {}

    public UserStatusUpdateRequest(Boolean active) {
        this.active = active;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
