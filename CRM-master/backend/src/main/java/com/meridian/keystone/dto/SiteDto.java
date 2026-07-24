package com.meridian.keystone.dto;

import java.time.Instant;

public class SiteDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private String name;
    private String address;
    private Instant createdAt;
    private Instant updatedAt;

    public SiteDto() {}

    public SiteDto(Long id, Long customerId, String customerName, String name, String address, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.name = name;
        this.address = address;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
