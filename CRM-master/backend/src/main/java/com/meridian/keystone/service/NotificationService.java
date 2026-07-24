package com.meridian.keystone.service;

import com.meridian.keystone.domain.Notification;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.dto.NotificationDto;
import com.meridian.keystone.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    public NotificationService(NotificationRepository notificationRepository, JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    @Transactional
    public void sendNotification(User recipient, String title, String message) {
        // 1. Save in-app notification
        Notification notification = new Notification(recipient, title, message);
        notificationRepository.save(notification);

        // 2. Send SMTP email to MailHog
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(recipient.getEmail());
            mailMessage.setSubject("[KEYSTONE] " + title);
            mailMessage.setText("Hello " + recipient.getName() + ",\n\n" + message + "\n\nRegards,\nKEYSTONE Field Service Platform");
            mailSender.send(mailMessage);
            log.info("Sent email notification to {} (MailHog/SMTP)", recipient.getEmail());
        } catch (Exception e) {
            log.warn("Could not send SMTP email notification to {}: {}", recipient.getEmail(), e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(User recipient) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipient.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId, User recipient) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!notification.getRecipient().getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Unauthorized notification access");
        }
        notification.setReadStatus(true);
    }

    private NotificationDto mapToDto(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setRecipientId(n.getRecipient().getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setReadStatus(n.getReadStatus());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
