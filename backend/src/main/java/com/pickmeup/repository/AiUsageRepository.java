package com.pickmeup.repository;

import com.pickmeup.domain.user.AiUsage;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface AiUsageRepository extends JpaRepository<AiUsage, Long> {
    
    Optional<AiUsage> findByUserAndUsageDate(User user, LocalDate usageDate);
}
