package com.meridian.keystone.service;

import com.meridian.keystone.domain.User;
import com.meridian.keystone.dto.AuthRequest;
import com.meridian.keystone.dto.AuthResponse;
import com.meridian.keystone.dto.UserDto;
import com.meridian.keystone.repository.UserRepository;
import com.meridian.keystone.security.CustomUserDetails;
import com.meridian.keystone.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public AuthService(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is deactivated. Please contact your system administrator.");
        }

        String token = tokenProvider.generateToken(user);
        Long customerId = user.getCustomer() != null ? user.getCustomer().getId() : null;

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), customerId);
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUserDto(CustomUserDetails currentUser) {
        User user = userRepository.findById(currentUser.getUserId())
                .orElse(currentUser.getUser());
        Long customerId = currentUser.getCustomerId();
        String customerName = currentUser.getCustomerName();
        if (user.getCustomer() != null) {
            customerId = user.getCustomer().getId();
            customerName = user.getCustomer().getName();
        }
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), customerId, customerName, user.getPermissions());
    }
}
