package com.meridian.keystone.dto;

import java.time.Instant;

public class CustomerDto {
    private Long id;
    private String name;
    private String contactEmail;
    private int sitesCount;
    private Instant createdAt;
    private Instant updatedAt;

    public CustomerDto() {}

    public CustomerDto(Long id, String name, String contactEmail, int sitesCount, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.contactEmail = contactEmail;
        this.sitesCount = sitesCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public int getSitesCount() { return sitesCount; }
    public void setSitesCount(int sitesCount) { this.sitesCount = sitesCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
