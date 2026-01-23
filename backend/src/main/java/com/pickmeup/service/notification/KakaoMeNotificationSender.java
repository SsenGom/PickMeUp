package com.pickmeup.service.notification;

import com.pickmeup.domain.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class KakaoMeNotificationSender implements NotificationSender {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String KAKAO_TALK_ME_URL = "https://kapi.kakao.com/v2/api/talk/memo/default/send";
    
    @Override
    public SendResult send(User user, String title, String content) {
        if (user.getKakaoAccessToken() == null) {
            return SendResult.failure("NO_TOKEN", "User has not linked Kakao account");
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBearerAuth(user.getKakaoAccessToken());
            
            String templateObject = """
                {"object_type":"text","text":"[%s]\\n\\n%s","link":{"web_url":"https://pickmeup.com"}}
                """.formatted(title, content);
            
            HttpEntity<String> entity = new HttpEntity<>("template_object=" + templateObject, headers);
            ResponseEntity<String> response = restTemplate.exchange(KAKAO_TALK_ME_URL, HttpMethod.POST, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("KakaoMe sent to user {}", user.getId());
                return SendResult.success(String.valueOf(response.getStatusCode().value()));
            }
            return SendResult.failure(String.valueOf(response.getStatusCode().value()), "Kakao API error");
        } catch (Exception e) {
            log.error("Failed to send KakaoMe: {}", e.getMessage());
            return SendResult.failure("ERROR", e.getMessage());
        }
    }
}
