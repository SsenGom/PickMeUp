package com.pickmeup.domain.message;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 메시지 원본 데이터 (IP, UserAgent, 스팸 스코어 등)
 * 기존 MongoDB MessageRaw에서 MySQL로 이전
 */
@Entity
@Table(name = "message_raws")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MessageRaw extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mysql_message_id")
    private Long mysqlMessageId;

    @Column(name = "raw_content", columnDefinition = "TEXT")
    private String rawContent;

    @Column(name = "sender_ip", length = 50)
    private String senderIp;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "referer", length = 500)
    private String referer;

    @Column(name = "spam_score")
    private Double spamScore;

    @Column(name = "detected_keywords", columnDefinition = "TEXT")
    private String detectedKeywords; // JSON 문자열로 저장

    @Column(name = "received_at")
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
}
