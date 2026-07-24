package com.meridian.keystone.controller;

import com.meridian.keystone.domain.Role;
import com.meridian.keystone.dto.CustomerCreateRequest;
import com.meridian.keystone.dto.CustomerDto;
import com.meridian.keystone.dto.SiteCreateRequest;
import com.meridian.keystone.dto.SiteDto;
import com.meridian.keystone.exception.AccessDeniedSecurityException;
import com.meridian.keystone.security.CustomUserDetails;
import com.meridian.keystone.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customers & Sites", description = "Management of customers and commercial sites")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_TENANTS')")
    @Operation(summary = "Get paginated list of customers")
    public ResponseEntity<Page<CustomerDto>> getCustomers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy) {

        Page<CustomerDto> customers = customerService.getCustomers(query, PageRequest.of(page, size, Sort.by(sortBy)));
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer details by ID")
    public ResponseEntity<CustomerDto> getCustomerById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        if (currentUser.getRole() == Role.CUSTOMER && !currentUser.getCustomerId().equals(id)) {
            throw new AccessDeniedSecurityException("Customers can only view their own organization details.");
        }

        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_TENANTS')")
    @Operation(summary = "Create a new customer organization")
    public ResponseEntity<CustomerDto> createCustomer(@Valid @RequestBody CustomerCreateRequest request) {
        CustomerDto created = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_TENANTS')")
    @Operation(summary = "Update an existing customer")
    public ResponseEntity<CustomerDto> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerCreateRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @GetMapping("/{id}/sites")
    @Operation(summary = "Get all sites belonging to a customer")
    public ResponseEntity<List<SiteDto>> getCustomerSites(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        if (currentUser.getRole() == Role.CUSTOMER && !currentUser.getCustomerId().equals(id)) {
            throw new AccessDeniedSecurityException("Customers can only view sites for their own organization.");
        }

        return ResponseEntity.ok(customerService.getCustomerSites(id));
    }

    @PostMapping("/{id}/sites")
    @PreAuthorize("hasAuthority('MANAGE_TENANTS')")
    @Operation(summary = "Create a new site for a customer")
    public ResponseEntity<SiteDto> createSite(@PathVariable Long id, @Valid @RequestBody SiteCreateRequest request) {
        request.setCustomerId(id);
        SiteDto created = customerService.createSite(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
