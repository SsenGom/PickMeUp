package com.pickmeup.repository;

import com.pickmeup.domain.notification.NotificationJob;
import com.pickmeup.domain.notification.NotificationJobStatus;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationJobRepository extends JpaRepository<NotificationJob, Long> {
    
    @Query("SELECT j FROM NotificationJob j WHERE j.status IN ('PENDING', 'RETRY') " +
           "AND j.scheduledAt <= :now ORDER BY j.scheduledAt ASC")
    List<NotificationJob> findJobsToProcess(@Param("now") LocalDateTime now);
    
    List<NotificationJob> findByUserAndStatusOrderByScheduledAtDesc(User user, NotificationJobStatus status);
    
    @Query("SELECT j FROM NotificationJob j WHERE j.user = :user " +
           "AND j.scheduledAt > :now AND j.status = 'PENDING' " +
           "ORDER BY j.scheduledAt ASC")
    List<NotificationJob> findUpcomingJobs(
            @Param("user") User user,
            @Param("now") LocalDateTime now
    );
    
    Long countByUserAndStatus(User user, NotificationJobStatus status);
}
