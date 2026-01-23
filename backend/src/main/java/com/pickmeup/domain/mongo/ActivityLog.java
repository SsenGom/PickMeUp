package com.pickmeup.domain.mongo;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "activity_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ActivityLog {
    
    @Id
    private String id;
    
    private Long userId;
    
    private ActivityType type;
    
    private String action;
    
    private String targetType;
    
    private String targetId;
    
    private Map<String, Object> details;
    
    private String ipAddress;
    
    private String userAgent;
    
    private LocalDateTime occurredAt;
    
    public enum ActivityType {
        LOGIN,
        LOGOUT,
        CREATE,
        UPDATE,
        DELETE,
        VIEW,
        EXPORT,
        SHARE
    }
    
    public static ActivityLog login(Long userId, String ip, String userAgent) {
        return ActivityLog.builder()
                .userId(userId)
                .type(ActivityType.LOGIN)
                .action("User logged in")
                .ipAddress(ip)
                .userAgent(userAgent)
                .occurredAt(LocalDateTime.now())
                .build();
    }
    
    public static ActivityLog create(Long userId, String targetType, String targetId, 
                                      Map<String, Object> details) {
        return ActivityLog.builder()
                .userId(userId)
                .type(ActivityType.CREATE)
                .action("Created " + targetType)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .occurredAt(LocalDateTime.now())
                .build();
    }
}
