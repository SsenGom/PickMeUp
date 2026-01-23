package com.pickmeup.service.notification;

import com.pickmeup.domain.user.User;

public interface NotificationSender {
    
    SendResult send(User user, String title, String content);
    
    record SendResult(boolean success, String responseCode, String errorMessage) {
        public static SendResult success(String responseCode) {
            return new SendResult(true, responseCode, null);
        }
        public static SendResult failure(String responseCode, String errorMessage) {
            return new SendResult(false, responseCode, errorMessage);
        }
    }
}
