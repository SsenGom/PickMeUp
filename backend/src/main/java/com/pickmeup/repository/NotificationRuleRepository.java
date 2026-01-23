package com.pickmeup.repository;

import com.pickmeup.domain.important.ImportantDate;
import com.pickmeup.domain.notification.NotificationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRuleRepository extends JpaRepository<NotificationRule, Long> {
    
    List<NotificationRule> findByImportantDateAndIsActiveTrue(ImportantDate importantDate);
    
    @Query("SELECT r FROM NotificationRule r " +
           "JOIN r.importantDate i " +
           "WHERE r.isActive = true AND i.isActive = true " +
           "AND r.daysBefore = :daysBefore")
    List<NotificationRule> findActiveRulesByDaysBefore(@Param("daysBefore") Integer daysBefore);
    
    void deleteByImportantDate(ImportantDate importantDate);
}
