package com.meridian.keystone.service;

import com.meridian.keystone.domain.Part;
import com.meridian.keystone.dto.PartCreateRequest;
import com.meridian.keystone.dto.PartDto;
import com.meridian.keystone.exception.ResourceNotFoundException;
import com.meridian.keystone.repository.PartRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartService {

    private final PartRepository partRepository;

    public PartService(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    @Transactional(readOnly = true)
    public Page<PartDto> getParts(String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            return partRepository.searchParts(query.trim(), pageable).map(this::mapToDto);
        }
        return partRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public PartDto getPartById(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + id));
        return mapToDto(part);
    }

    @Transactional
    public PartDto createPart(PartCreateRequest request) {
        if (partRepository.findBySku(request.getSku()).isPresent()) {
            throw new IllegalArgumentException("Part with SKU " + request.getSku() + " already exists");
        }
        Part part = new Part(request.getName(), request.getSku(), request.getUnitCost(), request.getStockQty());
        Part saved = partRepository.save(part);
        return mapToDto(saved);
    }

    @Transactional
    public PartDto updatePart(Long id, PartCreateRequest request) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + id));

        part.setName(request.getName());
        part.setUnitCost(request.getUnitCost());
        part.setStockQty(request.getStockQty());
        return mapToDto(part);
    }

    private PartDto mapToDto(Part part) {
        return new PartDto(part.getId(), part.getName(), part.getSku(), part.getUnitCost(), part.getStockQty());
    }
}
