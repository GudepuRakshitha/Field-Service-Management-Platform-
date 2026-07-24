package com.meridian.keystone.repository;

import com.meridian.keystone.domain.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByWorkOrderIdOrderByCreatedAtDesc(Long workOrderId);
    Optional<Attachment> findByFilename(String filename);
}
