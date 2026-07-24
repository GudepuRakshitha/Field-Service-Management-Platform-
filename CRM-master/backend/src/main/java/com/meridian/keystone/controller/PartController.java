package com.meridian.keystone.controller;

import com.meridian.keystone.dto.PartCreateRequest;
import com.meridian.keystone.dto.PartDto;
import com.meridian.keystone.service.PartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parts")
@Tag(name = "Parts Inventory", description = "Part inventory catalog and stock management")
public class PartController {

    private final PartService partService;

    public PartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    @Operation(summary = "Get paginated catalog of parts")
    public ResponseEntity<Page<PartDto>> getParts(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy) {

        Page<PartDto> parts = partService.getParts(query, PageRequest.of(page, size, Sort.by(sortBy)));
        return ResponseEntity.ok(parts);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get part details by ID")
    public ResponseEntity<PartDto> getPartById(@PathVariable Long id) {
        return ResponseEntity.ok(partService.getPartById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    @Operation(summary = "Add a new part to inventory catalog")
    public ResponseEntity<PartDto> createPart(@Valid @RequestBody PartCreateRequest request) {
        PartDto created = partService.createPart(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    @Operation(summary = "Update part stock and cost")
    public ResponseEntity<PartDto> updatePart(@PathVariable Long id, @Valid @RequestBody PartCreateRequest request) {
        return ResponseEntity.ok(partService.updatePart(id, request));
    }
}
