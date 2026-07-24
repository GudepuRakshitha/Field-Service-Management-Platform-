package com.meridian.keystone.controller;

import com.meridian.keystone.dto.AttachmentDto;
import com.meridian.keystone.security.CustomUserDetails;
import com.meridian.keystone.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Tag(name = "Attachments", description = "Work Order Field Photo & Inspection File Attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/api/work-orders/{workOrderId}/attachments")
    @Operation(summary = "Upload photo attachment for a work order")
    public ResponseEntity<AttachmentDto> uploadAttachment(
            @PathVariable Long workOrderId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "attachmentType", required = false, defaultValue = "BEFORE") String attachmentType,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        AttachmentDto attachment = attachmentService.uploadAttachment(workOrderId, file, attachmentType, currentUser.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
    }

    @GetMapping("/api/work-orders/{workOrderId}/attachments")
    @Operation(summary = "Get all photo attachments for a work order")
    public ResponseEntity<List<AttachmentDto>> getAttachments(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(attachmentService.getWorkOrderAttachments(workOrderId));
    }

    @GetMapping("/api/attachments/file/{filename}")
    @Operation(summary = "Download or view attachment image file")
    public ResponseEntity<Resource> getAttachmentFile(@PathVariable String filename) {
        Resource file = attachmentService.loadFileAsResource(filename);
        String contentType = "image/jpeg";
        try {
            var attachmentInfo = attachmentService.getAttachmentByFilename(filename);
            if (attachmentInfo.getContentType() != null) {
                contentType = attachmentInfo.getContentType();
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(file);
    }
}
