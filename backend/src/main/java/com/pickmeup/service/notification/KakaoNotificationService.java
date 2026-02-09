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
 * 카카오톡 알림톡 서비스
 * 
 * 카카오 비즈니스 API를 사용하여 알림톡 발송
 * - 신규 메시지 알림
 * - 면접 일정 알림
 * - 서류 마감 알림
 * 
 * @see <a href="https://developers.kakao.com/docs/latest/ko/message/rest-api">카카오 메시지 API</a>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KakaoNotificationService {

    @Value("${kakao.rest-api-key:}")
    private String apiKey;
    
    @Value("${kakao.sender-key:}")
    private String senderKey;  // 알림톡 발신 프로필 키
    
    @Value("${kakao.notification.enabled:false}")
    private boolean enabled;
    
    private static final String KAKAO_API_URL = "https://kapi.kakao.com/v1/api/talk/friends/message/default/send";
    
    /**
     * API 설정 여부 확인
     */
    public boolean isConfigured() {
        return enabled && apiKey != null && !apiKey.isEmpty() && 
               senderKey != null && !senderKey.isEmpty();
    }
    
    /**
     * 신규 메시지 알림
     * 
     * 이력서를 통해 새로운 컨택 메시지가 도착했을 때 알림
     */
    @Async
    public void sendNewMessageNotification(String phoneNumber, String senderName, String subject) {
        if (!isConfigured()) {
            log.info("[KAKAO DISABLED] New message notification would be sent to {}", phoneNumber);
            return;
        }
        
        try {
            String message = String.format(
                """
                [PickMeUp 신규 메시지]
                
                %s님으로부터 새로운 메시지가 도착했습니다.
                
                제목: %s
                
                지금 바로 확인해보세요!
                """,
                senderName,
                subject
            );
            
            sendKakaoMessage(phoneNumber, message, "https://pickmeup.com/inbox");
            log.info("Kakao notification sent to {}", phoneNumber);
            
        } catch (Exception e) {
            log.error("Failed to send Kakao notification to {}: {}", phoneNumber, e.getMessage());
        }
    }
    
    /**
     * 면접 일정 알림
     * 
     * 면접 하루 전 알림
     */
    @Async
    public void sendInterviewReminder(String phoneNumber, String companyName, LocalDateTime interviewDate) {
        if (!isConfigured()) {
            log.info("[KAKAO DISABLED] Interview reminder would be sent to {}", phoneNumber);
            return;
        }
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH:mm");
            String formattedDate = interviewDate.format(formatter);
            
            String message = String.format(
                """
                [PickMeUp 면접 알림]
                
                내일 %s 면접이 있습니다!
                
                일시: %s
                
                준비 잘 하시고 좋은 결과 있으시길 바랍니다! 💪
                """,
                companyName,
                formattedDate
            );
            
            sendKakaoMessage(phoneNumber, message, "https://pickmeup.com/calendar");
            log.info("Interview reminder sent to {} for {}", phoneNumber, companyName);
            
        } catch (Exception e) {
            log.error("Failed to send interview reminder to {}: {}", phoneNumber, e.getMessage());
        }
    }
    
    /**
     * 서류 마감 알림
     * 
     * 마감 D-day 알림
     */
    @Async
    public void sendDeadlineReminder(String phoneNumber, String companyName, LocalDateTime deadline) {
        if (!isConfigured()) {
            log.info("[KAKAO DISABLED] Deadline reminder would be sent to {}", phoneNumber);
            return;
        }
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH:mm");
            String formattedDate = deadline.format(formatter);
            
            String message = String.format(
                """
                [PickMeUp 마감 알림]
                
                %s 지원 마감이 얼마 남지 않았습니다!
                
                마감: %s
                
                서두르세요! ⏰
                """,
                companyName,
                formattedDate
            );
            
            sendKakaoMessage(phoneNumber, message, "https://pickmeup.com/jobs");
            log.info("Deadline reminder sent to {} for {}", phoneNumber, companyName);
            
        } catch (Exception e) {
            log.error("Failed to send deadline reminder to {}: {}", phoneNumber, e.getMessage());
        }
    }
    
    /**
     * 카카오톡 메시지 발송 (기본 템플릿)
     * 
     * 참고: 실제 프로덕션에서는 카카오 비즈니스 계정과 승인된 템플릿이 필요합니다.
     * 현재는 개발/테스트용 간소화 버전입니다.
     */
    private void sendKakaoMessage(String phoneNumber, String message, String linkUrl) {
        RestTemplate restTemplate = new RestTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Authorization", "KakaoAK " + apiKey);
        
        // 기본 템플릿 메시지 형식
        Map<String, Object> template = new HashMap<>();
        template.put("object_type", "text");
        template.put("text", message);
        template.put("link", Map.of(
            "web_url", linkUrl,
            "mobile_web_url", linkUrl
        ));
        
        Map<String, String> body = new HashMap<>();
        body.put("template_object", new com.fasterxml.jackson.databind.ObjectMapper()
            .valueToTree(template).toString());
        
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
            KAKAO_API_URL,
            HttpMethod.POST,
            entity,
            String.class
        );
        
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Kakao API error: " + response.getStatusCode());
        }
    }
}
