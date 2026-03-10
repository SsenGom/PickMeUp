package com.pickmeup.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 카카오톡 알림 서비스 (카카오 알림톡 / 카카오 메시지)
 * 실제 운영 시 카카오 비즈니스 API 키 설정 필요
 */
@Slf4j
@Service
public class KakaoNotificationService {

    @Value("${kakao.api-key:}")
    private String kakaoApiKey;

    @Value("${kakao.sender-key:}")
    private String senderKey;

    public boolean isConfigured() {
        return kakaoApiKey != null && !kakaoApiKey.isBlank()
                && senderKey != null && !senderKey.isBlank();
    }

    public void sendNewMessageNotification(String phoneNumber, String senderName, String subject) {
        if (!isConfigured()) {
            log.info("[KAKAO DISABLED] Would send to {} - sender: {}, subject: {}", phoneNumber, senderName, subject);
            return;
        }
        // TODO: 카카오 알림톡 API 연동
        log.info("[KAKAO] Sending notification to {} - sender: {}, subject: {}", phoneNumber, senderName, subject);
    }
}
