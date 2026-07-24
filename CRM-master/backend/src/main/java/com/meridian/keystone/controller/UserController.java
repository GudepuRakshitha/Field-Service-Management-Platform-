package com.meridian.keystone.controller;

import com.meridian.keystone.dto.UserCreateRequest;
import com.meridian.keystone.dto.UserDto;
import com.meridian.keystone.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Endpoints for managing system users and listing available technicians")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @Operation(summary = "List all registered users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAuthority('ASSIGN_TECHNICIANS')")
    @Operation(summary = "List available technicians for dispatch")
    public ResponseEntity<List<UserDto>> getTechnicians() {
        return ResponseEntity.ok(userService.getTechnicians());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @Operation(summary = "Create a new user")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserDto created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @RequestMapping(value = "/{id}/permissions", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @Operation(summary = "Update user role permissions")
    public ResponseEntity<UserDto> updateUserPermissions(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String permissions = body.get("permissions");
        UserDto updated = userService.updateUserPermissions(id, permissions);
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @Operation(summary = "Activate or Deactivate user account")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable Long id,
            @RequestBody com.meridian.keystone.dto.UserStatusUpdateRequest request) {
        Boolean active = request.getActive();
        if (active == null) active = true;
        UserDto updated = userService.updateUserStatus(id, active);
        return ResponseEntity.ok(updated);
    }
}
