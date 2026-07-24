package com.meridian.keystone.service;

import com.meridian.keystone.domain.Attachment;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.domain.WorkOrder;
import com.meridian.keystone.dto.AttachmentDto;
import com.meridian.keystone.exception.ResourceNotFoundException;
import com.meridian.keystone.repository.AttachmentRepository;
import com.meridian.keystone.repository.WorkOrderRepository;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.meridian.keystone.domain.Role;
import com.meridian.keystone.repository.UserRepository;

@Service
public class AttachmentService {

    private final Path storageLocation = Paths.get("uploads").toAbsolutePath().normalize();
    private final AttachmentRepository attachmentRepository;
    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AttachmentService(
            AttachmentRepository attachmentRepository,
            WorkOrderRepository workOrderRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.attachmentRepository = attachmentRepository;
        this.workOrderRepository = workOrderRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Transactional
    public AttachmentDto uploadAttachment(Long workOrderId, MultipartFile file, String attachmentType, User currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with ID: " + workOrderId));

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo.jpg";
        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i);
        }
        String storedFilename = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = this.storageLocation.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + originalFilename, e);
        }

        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
        String type = (attachmentType != null && !attachmentType.isBlank()) ? attachmentType.toUpperCase() : "BEFORE";

        Attachment attachment = new Attachment(
                workOrder,
                storedFilename,
                originalFilename,
                contentType,
                file.getSize(),
                type,
                currentUser
        );

        Attachment saved = attachmentRepository.save(attachment);

        // Multi-role notifications for attachment uploads
        String title = "New Photo Attachment: " + workOrder.getCode();
        String message = currentUser.getName() + " uploaded a " + type + " photo (" + originalFilename + ") for Work Order [" + workOrder.getCode() + "].";

        for (User u : userRepository.findByRole(Role.MANAGER)) {
            notificationService.sendNotification(u, title, message);
        }
        for (User u : userRepository.findByRole(Role.DISPATCHER)) {
            notificationService.sendNotification(u, title, message);
        }
        for (User u : userRepository.findByCustomerId(workOrder.getCustomer().getId())) {
            notificationService.sendNotification(u, title, message);
        }

        return AttachmentDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<AttachmentDto> getWorkOrderAttachments(Long workOrderId) {
        if (!workOrderRepository.existsById(workOrderId)) {
            throw new ResourceNotFoundException("Work order not found with ID: " + workOrderId);
        }
        return attachmentRepository.findByWorkOrderIdOrderByCreatedAtDesc(workOrderId)
                .stream()
                .map(AttachmentDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = this.storageLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found: " + filename);
        }
    }

    public Attachment getAttachmentByFilename(String filename) {
        return attachmentRepository.findByFilename(filename)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment record not found for " + filename));
    }
}
