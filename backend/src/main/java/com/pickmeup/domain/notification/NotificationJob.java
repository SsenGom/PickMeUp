package com.pickmeup.domain.notification;

import com.pickmeup.domain.common.BaseEntity;
import com.pickmeup.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_jobs", indexes = {
    @Index(name = "idx_scheduled_at_status", columnList = "scheduled_at, status")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NotificationJob extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id")
    private NotificationRule rule;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationJobStatus status = NotificationJobStatus.PENDING;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;
    
    @Column(name = "max_retries")
    @Builder.Default
    private Integer maxRetries = 3;
    
    @Column(name = "error_message", length = 500)
    private String errorMessage;
    
    public void markAsSent() {
        this.status = NotificationJobStatus.SENT;
        this.sentAt = LocalDateTime.now();
    }
    
    public void markAsFailed(String errorMessage) {
        this.retryCount++;
        if (this.retryCount >= this.maxRetries) {
            this.status = NotificationJobStatus.FAILED;
        } else {
            this.status = NotificationJobStatus.RETRY;
        }
        this.errorMessage = errorMessage;
    }
    
    public void cancel() {
        this.status = NotificationJobStatus.CANCELLED;
    }
    
    public boolean canRetry() {
        return this.retryCount < this.maxRetries;
    }
}
