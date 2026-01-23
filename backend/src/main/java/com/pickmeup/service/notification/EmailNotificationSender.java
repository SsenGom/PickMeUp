package com.pickmeup.service.notification;

import com.pickmeup.domain.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationSender implements NotificationSender {
    
    private final JavaMailSender mailSender;
    
    @Override
    public SendResult send(User user, String title, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("[PickMeUp] " + title);
            message.setText(content);
            mailSender.send(message);
            log.info("Email sent to {} - {}", user.getEmail(), title);
            return SendResult.success("200");
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
            return SendResult.failure("500", e.getMessage());
        }
    }
}
