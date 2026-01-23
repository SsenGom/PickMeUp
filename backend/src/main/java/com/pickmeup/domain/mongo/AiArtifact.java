package com.pickmeup.domain.mongo;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "ai_artifacts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AiArtifact {
    
    @Id
    private String id;
    
    private Long userId;
    
    private AiArtifactType type;
    
    private String sourceId;
    
    private String sourceType;
    
    private Map<String, Object> input;
    
    private Map<String, Object> output;
    
    private String model;
    
    private Integer tokenUsed;
    
    private Long processingTimeMs;
    
    private LocalDateTime createdAt;
    
    public enum AiArtifactType {
        MESSAGE_SUMMARY,
        MESSAGE_TAGGING,
        WEEKLY_REVIEW,
        RESUME_SUGGESTION,
        JD_ANALYSIS
    }
}
