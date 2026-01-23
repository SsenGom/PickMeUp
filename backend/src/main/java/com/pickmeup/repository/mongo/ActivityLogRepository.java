package com.pickmeup.repository.mongo;

import com.pickmeup.domain.mongo.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    
    Page<ActivityLog> findByUserIdOrderByOccurredAtDesc(Long userId, Pageable pageable);
    
    List<ActivityLog> findByUserIdAndTypeOrderByOccurredAtDesc(
            Long userId, ActivityLog.ActivityType type);
    
    List<ActivityLog> findByUserIdAndOccurredAtBetweenOrderByOccurredAtDesc(
            Long userId, LocalDateTime start, LocalDateTime end);
}
