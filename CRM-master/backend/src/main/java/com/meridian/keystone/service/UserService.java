package com.meridian.keystone.service;

import com.meridian.keystone.domain.Customer;
import com.meridian.keystone.domain.Role;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.dto.UserCreateRequest;
import com.meridian.keystone.dto.UserDto;
import com.meridian.keystone.exception.ResourceNotFoundException;
import com.meridian.keystone.repository.CustomerRepository;
import com.meridian.keystone.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, CustomerRepository customerRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto createUser(UserCreateRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with email already exists");
        }

        Customer customer = null;
        if (request.getRole() == Role.CUSTOMER) {
            if (request.getCustomerId() == null) {
                throw new IllegalArgumentException("Customer ID is required for CUSTOMER role");
            }
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));
        }

        String perms = request.getPermissions();
        if (perms == null || perms.isBlank()) {
            perms = getDefaultPermissions(request.getRole());
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole(),
                customer
        );
        user.setPermissions(perms);

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Transactional
    public UserDto updateUserPermissions(Long userId, String permissions) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setPermissions(permissions);
        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Transactional
    public UserDto updateUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setActive(active);
        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    private String getDefaultPermissions(Role role) {
        switch (role) {
            case MANAGER:
                return "CREATE_WORK_ORDERS,ASSIGN_TECHNICIANS,EXECUTE_FIELD_JOBS,CLOSE_WORK_ORDERS,MANAGE_INVENTORY,MANAGE_TENANTS,MANAGE_USERS";
            case DISPATCHER:
                return "CREATE_WORK_ORDERS,ASSIGN_TECHNICIANS,EXECUTE_FIELD_JOBS,MANAGE_TENANTS";
            case TECHNICIAN:
                return "EXECUTE_FIELD_JOBS";
            case CUSTOMER:
                return "CREATE_WORK_ORDERS";
            default:
                return "CREATE_WORK_ORDERS";
        }
    }

    public UserDto mapToDto(User user) {
        Long customerId = user.getCustomer() != null ? user.getCustomer().getId() : null;
        String customerName = user.getCustomer() != null ? user.getCustomer().getName() : null;
        String perms = user.getPermissions() != null ? user.getPermissions() : getDefaultPermissions(user.getRole());
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), customerId, customerName, perms, user.isActive());
    }
}
