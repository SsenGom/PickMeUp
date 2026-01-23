package com.pickmeup.domain.mongo;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "message_raw")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MessageRaw {
    
    @Id
    private String id;
    
    private Long mysqlMessageId;
    
    private String rawContent;
    
    private String senderIp;
    
    private String userAgent;
    
    private String referer;
    
    private Double spamScore;
    
    private List<String> detectedKeywords;
    
    private Map<String, Object> metadata;
    
    private LocalDateTime receivedAt;
    
    public static MessageRaw from(Long messageId, String content, String ip, 
                                   String userAgent, String referer) {
        return MessageRaw.builder()
                .mysqlMessageId(messageId)
                .rawContent(content)
                .senderIp(ip)
                .userAgent(userAgent)
                .referer(referer)
                .receivedAt(LocalDateTime.now())
                .build();
    }
    
    public void updateSpamAnalysis(Double score, List<String> keywords) {
        this.spamScore = score;
        this.detectedKeywords = keywords;
    }
}
