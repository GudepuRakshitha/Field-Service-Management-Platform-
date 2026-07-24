package com.meridian.keystone.repository;

import com.meridian.keystone.domain.Priority;
import com.meridian.keystone.domain.WorkOrder;
import com.meridian.keystone.domain.WorkOrderStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    Optional<WorkOrder> findByCode(String code);

    @Query("SELECT w FROM WorkOrder w WHERE " +
           "(:customerId IS NULL OR w.customer.id = :customerId) AND " +
           "(:assignedToUserId IS NULL OR w.assignedTo.id = :assignedToUserId) AND " +
           "(:status IS NULL OR w.status = :status) AND " +
           "(:priority IS NULL OR w.priority = :priority) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(w.code) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(w.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(w.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<WorkOrder> findWithFilters(
            @Param("customerId") Long customerId,
            @Param("assignedToUserId") Long assignedToUserId,
            @Param("status") WorkOrderStatus status,
            @Param("priority") Priority priority,
            @Param("query") String query,
            Pageable pageable
    );

    List<WorkOrder> findByStatusIn(List<WorkOrderStatus> statuses);

    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.status = :status")
    long countByStatus(@Param("status") WorkOrderStatus status);

    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED') AND w.slaDueAt < :now")
    long countOverdue(@Param("now") Instant now);

    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.status IN ('COMPLETED', 'CLOSED')")
    long countTotalFinished();

    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.status IN ('COMPLETED', 'CLOSED') AND w.updatedAt <= w.slaDueAt")
    long countOnTimeFinished();

    @Query("SELECT w.assignedTo.name, COUNT(w) FROM WorkOrder w WHERE w.assignedTo IS NOT NULL GROUP BY w.assignedTo.id, w.assignedTo.name")
    List<Object[]> countByTechnician();

    @Query("SELECT w.site.name, COUNT(w) FROM WorkOrder w GROUP BY w.site.id, w.site.name")
    List<Object[]> countBySite();
}
