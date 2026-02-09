package com.pickmeup.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * SMS 알림 서비스 (NCP SENS 사용)
 * 
 * Naver Cloud Platform Simple & Easy Notification Service
 * 
 * 설정:
 * - NCP 콘솔에서 SENS 프로젝트 생성
 * - 발신번호 등록 및 승인
 * - Access Key, Secret Key 발급
 * 
 * @see <a href="https://api.ncloud-docs.com/docs/ai-application-service-sens-smsv2">NCP SENS API</a>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsNotificationService {

    @Value("${ncp.sens.service-id:}")
    private String serviceId;
    
    @Value("${ncp.sens.access-key:}")
    private String accessKey;
    
    @Value("${ncp.sens.secret-key:}")
    private String secretKey;
    
    @Value("${ncp.sens.from-number:}")
    private String fromNumber;  // 발신번호 (등록 필요)
    
    @Value("${ncp.sens.enabled:false}")
    private boolean enabled;
    
    private static final String NCP_SENS_URL = "https://sens.apigw.ntruss.com/sms/v2/services/%s/messages";
    
    /**
     * API 설정 여부 확인
     */
    public boolean isConfigured() {
        return enabled && serviceId != null && !serviceId.isEmpty() &&
               accessKey != null && !accessKey.isEmpty() &&
               secretKey != null && !secretKey.isEmpty() &&
               fromNumber != null && !fromNumber.isEmpty();
    }
    
    /**
     * 신규 메시지 알림
     */
    @Async
    public void sendNewMessageNotification(String phoneNumber, String senderName, String subject) {
        if (!isConfigured()) {
            log.info("[SMS DISABLED] New message notification would be sent to {}", phoneNumber);
            return;
        }
        
        try {
            String message = String.format(
                "[PickMeUp] %s님으로부터 메시지가 도착했습니다. 제목: %s",
                senderName,
                subject.length() > 20 ? subject.substring(0, 20) + "..." : subject
            );
            
            sendSms(phoneNumber, message);
            log.info("SMS notification sent to {}", phoneNumber);
            
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
        }
    }
    
    /**
     * 면접 일정 알림
     */
    @Async
    public void sendInterviewReminder(String phoneNumber, String companyName, LocalDateTime interviewDate) {
        if (!isConfigured()) {
            log.info("[SMS DISABLED] Interview reminder would be sent to {}", phoneNumber);
            return;
        }
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd HH:mm");
            String formattedDate = interviewDate.format(formatter);
            
            String message = String.format(
                "[PickMeUp] 내일 %s 면접이 있습니다. 일시: %s",
                companyName,
                formattedDate
            );
            
            sendSms(phoneNumber, message);
            log.info("Interview reminder sent to {} for {}", phoneNumber, companyName);
            
        } catch (Exception e) {
            log.error("Failed to send interview reminder to {}: {}", phoneNumber, e.getMessage());
        }
    }
    
    /**
     * 서류 마감 알림
     */
    @Async
    public void sendDeadlineReminder(String phoneNumber, String companyName, LocalDateTime deadline) {
        if (!isConfigured()) {
            log.info("[SMS DISABLED] Deadline reminder would be sent to {}", phoneNumber);
            return;
        }
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd HH:mm");
            String formattedDate = deadline.format(formatter);
            
            String message = String.format(
                "[PickMeUp] %s 지원 마감이 얼마 남지 않았습니다! 마감: %s",
                companyName,
                formattedDate
            );
            
            sendSms(phoneNumber, message);
            log.info("Deadline reminder sent to {} for {}", phoneNumber, companyName);
            
        } catch (Exception e) {
            log.error("Failed to send deadline reminder to {}: {}", phoneNumber, e.getMessage());
        }
    }
    
    /**
     * SMS 발송 (NCP SENS API)
     */
    private void sendSms(String toNumber, String content) {
        RestTemplate restTemplate = new RestTemplate();
        
        // HMAC 서명 생성 (NCP SENS 인증)
        String timestamp = String.valueOf(System.currentTimeMillis());
        String signature = makeSignature(timestamp);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-ncp-apigw-timestamp", timestamp);
        headers.set("x-ncp-iam-access-key", accessKey);
        headers.set("x-ncp-apigw-signature-v2", signature);
        
        Map<String, Object> body = new HashMap<>();
        body.put("type", "SMS");  // SMS or LMS or MMS
        body.put("contentType", "COMM");
        body.put("countryCode", "82");
        body.put("from", fromNumber);
        body.put("content", content);
        body.put("messages", new Object[] {
            Map.of("to", toNumber.replaceAll("[^0-9]", ""))  // 숫자만 추출
        });
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        
        String url = String.format(NCP_SENS_URL, serviceId);
        ResponseEntity<String> response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            entity,
            String.class
        );
        
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("NCP SENS API error: " + response.getStatusCode());
        }
    }
    
    /**
     * HMAC SHA256 서명 생성 (NCP 인증용)
     */
    private String makeSignature(String timestamp) {
        try {
            String space = " ";
            String newLine = "\n";
            String method = "POST";
            String url = "/sms/v2/services/" + serviceId + "/messages";
            
            String message = method + space + url + newLine + timestamp + newLine + accessKey;
            
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(
                secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8), 
                "HmacSHA256"));
            
            byte[] rawHmac = mac.doFinal(message.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(rawHmac);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to create signature", e);
        }
    }
}
