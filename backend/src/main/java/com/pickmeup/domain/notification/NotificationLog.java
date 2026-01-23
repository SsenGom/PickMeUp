package com.pickmeup.domain.notification;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NotificationLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "job_id", nullable = false)
    private Long jobId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;
    
    @Column(nullable = false)
    private Boolean success;
    
    @Column(name = "response_code", length = 50)
    private String responseCode;
    
    @Column(name = "response_message", length = 500)
    private String responseMessage;
    
    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;
    
    @Column(name = "duration_ms")
    private Long durationMs;
    
    public static NotificationLog success(Long jobId, NotificationChannel channel, 
                                          String responseCode, long durationMs) {
        return NotificationLog.builder()
                .jobId(jobId)
                .channel(channel)
                .success(true)
                .responseCode(responseCode)
                .sentAt(LocalDateTime.now())
                .durationMs(durationMs)
                .build();
    }
    
    public static NotificationLog failure(Long jobId, NotificationChannel channel, 
                                          String responseCode, String errorMessage, long durationMs) {
        return NotificationLog.builder()
                .jobId(jobId)
                .channel(channel)
                .success(false)
                .responseCode(responseCode)
                .responseMessage(errorMessage)
                .sentAt(LocalDateTime.now())
                .durationMs(durationMs)
                .build();
    }
}
