package com.meridian.keystone.dto;

import com.meridian.keystone.domain.Attachment;
import java.time.Instant;

public class AttachmentDto {
    private Long id;
    private Long workOrderId;
    private String filename;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String attachmentType;
    private Long uploadedByUserId;
    private String uploadedByName;
    private Instant createdAt;
    private String url;

    public AttachmentDto() {}

    public static AttachmentDto fromEntity(Attachment attachment) {
        AttachmentDto dto = new AttachmentDto();
        dto.setId(attachment.getId());
        dto.setWorkOrderId(attachment.getWorkOrder().getId());
        dto.setFilename(attachment.getFilename());
        dto.setOriginalFilename(attachment.getOriginalFilename());
        dto.setContentType(attachment.getContentType());
        dto.setFileSize(attachment.getFileSize());
        dto.setAttachmentType(attachment.getAttachmentType());
        dto.setUploadedByUserId(attachment.getUploadedBy().getId());
        dto.setUploadedByName(attachment.getUploadedBy().getName());
        dto.setCreatedAt(attachment.getCreatedAt());
        dto.setUrl("/api/attachments/file/" + attachment.getFilename());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(Long workOrderId) { this.workOrderId = workOrderId; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getAttachmentType() { return attachmentType; }
    public void setAttachmentType(String attachmentType) { this.attachmentType = attachmentType; }

    public Long getUploadedByUserId() { return uploadedByUserId; }
    public void setUploadedByUserId(Long uploadedByUserId) { this.uploadedByUserId = uploadedByUserId; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
