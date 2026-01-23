package com.pickmeup.service.notification;

import com.pickmeup.domain.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebPushNotificationSender implements NotificationSender {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    @Override
    public SendResult send(User user, String title, String content) {
        try {
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(user.getId()),
                    "/queue/notifications",
                    Map.of("type", "NOTIFICATION", "title", title, "content", content, 
                           "timestamp", System.currentTimeMillis())
            );
            log.info("Web push sent to user {}", user.getId());
            return SendResult.success("200");
        } catch (Exception e) {
            log.error("Failed to send web push: {}", e.getMessage());
            return SendResult.failure("ERROR", e.getMessage());
        }
    }
}
