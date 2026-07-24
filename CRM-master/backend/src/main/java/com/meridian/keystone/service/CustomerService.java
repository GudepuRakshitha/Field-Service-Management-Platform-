package com.meridian.keystone.service;

import com.meridian.keystone.domain.Customer;
import com.meridian.keystone.domain.Site;
import com.meridian.keystone.dto.*;
import com.meridian.keystone.exception.ResourceNotFoundException;
import com.meridian.keystone.repository.CustomerRepository;
import com.meridian.keystone.repository.SiteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;

    public CustomerService(CustomerRepository customerRepository, SiteRepository siteRepository) {
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
    }

    @Transactional(readOnly = true)
    public Page<CustomerDto> getCustomers(String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            return customerRepository.searchCustomers(query.trim(), pageable).map(this::mapCustomerToDto);
        }
        return customerRepository.findAll(pageable).map(this::mapCustomerToDto);
    }

    @Transactional(readOnly = true)
    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return mapCustomerToDto(customer);
    }

    @Transactional
    public CustomerDto createCustomer(CustomerCreateRequest request) {
        Customer customer = new Customer(request.getName(), request.getContactEmail());
        Customer saved = customerRepository.save(customer);
        return mapCustomerToDto(saved);
    }

    @Transactional
    public CustomerDto updateCustomer(Long id, CustomerCreateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        customer.setName(request.getName());
        customer.setContactEmail(request.getContactEmail());
        return mapCustomerToDto(customer);
    }

    @Transactional(readOnly = true)
    public List<SiteDto> getCustomerSites(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + customerId);
        }
        return siteRepository.findByCustomerId(customerId).stream()
                .map(this::mapSiteToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SiteDto createSite(Long customerId, SiteCreateRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        Site site = new Site(customer, request.getName(), request.getAddress());
        Site saved = siteRepository.save(site);
        return mapSiteToDto(saved);
    }

    @Transactional(readOnly = true)
    public SiteDto getSiteById(Long siteId) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with ID: " + siteId));
        return mapSiteToDto(site);
    }

    private CustomerDto mapCustomerToDto(Customer customer) {
        int sitesCount = customer.getSites() != null ? customer.getSites().size() : 0;
        return new CustomerDto(
                customer.getId(),
                customer.getName(),
                customer.getContactEmail(),
                sitesCount,
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }

    private SiteDto mapSiteToDto(Site site) {
        return new SiteDto(
                site.getId(),
                site.getCustomer().getId(),
                site.getCustomer().getName(),
                site.getName(),
                site.getAddress(),
                site.getCreatedAt(),
                site.getUpdatedAt()
        );
    }
}
