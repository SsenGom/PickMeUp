package com.pickmeup.dto.message;

import com.pickmeup.domain.message.Message;
import com.pickmeup.domain.message.MessageDirection;
import com.pickmeup.domain.message.Thread;
import com.pickmeup.domain.message.ThreadStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class MessageDto {
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactRequest {
        @NotBlank(message = "이름은 필수입니다")
        private String senderName;
        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        private String senderEmail;
        private String subject;
        @NotBlank(message = "메시지 내용은 필수입니다")
        private String content;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReplyRequest {
        @NotBlank(message = "답장 내용은 필수입니다")
        private String content;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ThreadResponse {
        private Long id;
        private String senderName;
        private String senderEmail;
        private String subject;
        private ThreadStatus status;
        private Boolean isStarred;
        private Boolean isArchived;
        private Integer messageCount;
        private String lastMessagePreview;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        public static ThreadResponse from(Thread thread) {
            String preview = "";
            if (!thread.getMessages().isEmpty()) {
                Message lastMessage = thread.getMessages().get(thread.getMessages().size() - 1);
                preview = lastMessage.getContent().length() > 100 
                        ? lastMessage.getContent().substring(0, 100) + "..."
                        : lastMessage.getContent();
            }
            
            return ThreadResponse.builder()
                    .id(thread.getId())
                    .senderName(thread.getSenderName())
                    .senderEmail(thread.getSenderEmail())
                    .subject(thread.getSubject())
                    .status(thread.getStatus())
                    .isStarred(thread.getIsStarred())
                    .isArchived(thread.getIsArchived())
                    .messageCount(thread.getMessageCount())
                    .lastMessagePreview(preview)
                    .createdAt(thread.getCreatedAt())
                    .updatedAt(thread.getUpdatedAt())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ThreadDetailResponse {
        private Long id;
        private String senderName;
        private String senderEmail;
        private String subject;
        private ThreadStatus status;
        private Boolean isStarred;
        private List<MessageResponse> messages;
        
        public static ThreadDetailResponse from(Thread thread, List<MessageResponse> messages) {
            return ThreadDetailResponse.builder()
                    .id(thread.getId())
                    .senderName(thread.getSenderName())
                    .senderEmail(thread.getSenderEmail())
                    .subject(thread.getSubject())
                    .status(thread.getStatus())
                    .isStarred(thread.getIsStarred())
                    .messages(messages)
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageResponse {
        private Long id;
        private String content;
        private MessageDirection direction;
        private Boolean isRead;
        private LocalDateTime createdAt;
        
        public static MessageResponse from(Message message) {
            return MessageResponse.builder()
                    .id(message.getId())
                    .content(message.getContent())
                    .direction(message.getDirection())
                    .isRead(message.getIsRead())
                    .createdAt(message.getCreatedAt())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NewMessageEvent {
        private Long threadId;
        private Long messageId;
        private String senderName;
        private String senderEmail;
        private String subject;
        private String contentPreview;
        private LocalDateTime receivedAt;
    }
}
