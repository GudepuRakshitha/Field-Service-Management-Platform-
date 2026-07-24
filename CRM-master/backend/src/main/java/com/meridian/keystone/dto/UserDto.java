package com.meridian.keystone.dto;

import com.meridian.keystone.domain.Role;

public class UserDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Long customerId;
    private String customerName;
    private String permissions;
    private boolean active = true;

    public UserDto() {}

    public UserDto(Long id, String name, String email, Role role, Long customerId, String customerName) {
        this(id, name, email, role, customerId, customerName, null, true);
    }

    public UserDto(Long id, String name, String email, Role role, Long customerId, String customerName, String permissions) {
        this(id, name, email, role, customerId, customerName, permissions, true);
    }

    public UserDto(Long id, String name, String email, Role role, Long customerId, String customerName, String permissions, boolean active) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.customerId = customerId;
        this.customerName = customerName;
        this.permissions = permissions;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getPermissions() { return permissions; }
    public void setPermissions(String permissions) { this.permissions = permissions; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
