package com.pickmeup.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * SMS 알림 서비스 (네이버 SENS 또는 coolSMS 연동)
 * 실제 운영 시 API 키 설정 필요
 */
@Slf4j
@Service
public class SmsNotificationService {

    @Value("${sms.api-key:}")
    private String apiKey;

    @Value("${sms.api-secret:}")
    private String apiSecret;

    @Value("${sms.sender:}")
    private String sender;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank()
                && sender != null && !sender.isBlank();
    }

    public void sendNewMessageNotification(String phoneNumber, String senderName, String subject) {
        if (!isConfigured()) {
            log.info("[SMS DISABLED] Would send to {} - sender: {}, subject: {}", phoneNumber, senderName, subject);
            return;
        }
        // TODO: SMS API 연동 (네이버 SENS / coolSMS)
        log.info("[SMS] Sending to {} - sender: {}, subject: {}", phoneNumber, senderName, subject);
    }
}
