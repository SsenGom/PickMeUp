package com.pickmeup.repository;

import com.pickmeup.domain.message.Thread;
import com.pickmeup.domain.message.ThreadStatus;
import com.pickmeup.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ThreadRepository extends JpaRepository<Thread, Long> {
    
    Page<Thread> findByOwnerAndIsArchivedFalseOrderByCreatedAtDesc(User owner, Pageable pageable);
    
    Page<Thread> findByOwnerAndStatusAndIsArchivedFalseOrderByCreatedAtDesc(
            User owner, ThreadStatus status, Pageable pageable);
    
    Page<Thread> findByOwnerAndIsStarredTrueAndIsArchivedFalseOrderByCreatedAtDesc(
            User owner, Pageable pageable);
    
    Page<Thread> findByOwnerAndIsArchivedTrueOrderByCreatedAtDesc(User owner, Pageable pageable);
    
    Optional<Thread> findByOwnerAndSenderEmail(User owner, String senderEmail);
    
    @Query("SELECT COUNT(t) FROM Thread t WHERE t.owner = :owner " +
           "AND t.status = 'UNREAD' AND t.isArchived = false")
    Long countUnreadThreads(@Param("owner") User owner);
    
    @Query("SELECT t FROM Thread t WHERE t.owner = :owner " +
           "AND t.isArchived = false " +
           "AND (LOWER(t.senderName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(t.senderEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Thread> searchThreads(
            @Param("owner") User owner,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
