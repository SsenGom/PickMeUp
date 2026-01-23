package com.pickmeup.repository;

import com.pickmeup.domain.job.AIUsageLog;
import com.pickmeup.domain.job.AIUsageType;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface AIUsageLogRepository extends JpaRepository<AIUsageLog, Long> {
    
    Optional<AIUsageLog> findByUserAndUsageDateAndUsageType(User user, LocalDate date, AIUsageType type);
}
