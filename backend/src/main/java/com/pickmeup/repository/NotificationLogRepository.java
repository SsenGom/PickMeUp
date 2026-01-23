package com.pickmeup.repository;

import com.pickmeup.domain.notification.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    
    List<NotificationLog> findByJobIdOrderBySentAtDesc(Long jobId);
}
