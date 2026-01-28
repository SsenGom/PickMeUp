package com.pickmeup.service;

import com.pickmeup.domain.message.Message;
import com.pickmeup.domain.message.MessageDirection;
import com.pickmeup.domain.message.Thread;
import com.pickmeup.domain.message.ThreadStatus;
import com.pickmeup.domain.mongo.MessageRaw;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.message.MessageDto.*;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import com.pickmeup.repository.MessageRepository;
import com.pickmeup.repository.ResumeRepository;
import com.pickmeup.repository.ThreadRepository;
import com.pickmeup.repository.mongo.MessageRawRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 메시지(쪽지) 서비스
 * 
 * 주요 기능:
 * - 외부에서 이력서 소유자에게 연락 (Contact)
 * - 이력서 소유자가 답장 (Reply) → SMTP로 이메일 발송
 * - 실시간 알림 (WebSocket)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {
    
    private final ThreadRepository threadRepository;
    private final MessageRepository messageRepository;
    private final MessageRawRepository messageRawRepository;
    private final ResumeRepository resumeRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;
    
    @Transactional
    public void receiveContactMessage(String slug, ContactRequest request, 
                                       String ipAddress, String userAgent, String referer) {
        User owner = resumeRepository.findBySlugAndIsPublicTrue(slug)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND))
                .getUser();
        
        Thread thread = threadRepository.findByOwnerAndSenderEmail(owner, request.getSenderEmail())
                .orElseGet(() -> threadRepository.save(Thread.builder()
                        .owner(owner)
                        .senderName(request.getSenderName())
                        .senderEmail(request.getSenderEmail())
                        .subject(request.getSubject())
                        .build()));
        
        Message message = messageRepository.save(Message.builder()
                .thread(thread)
                .content(request.getContent())
                .direction(MessageDirection.INBOUND)
                .build());
        
        thread.incrementMessageCount();
        thread.updateStatus(ThreadStatus.UNREAD);
        
        messageRawRepository.save(MessageRaw.from(message.getId(), request.getContent(), 
                ipAddress, userAgent, referer));
        
        messagingTemplate.convertAndSendToUser(String.valueOf(owner.getId()), "/queue/messages",
                NewMessageEvent.builder()
                        .threadId(thread.getId())
                        .messageId(message.getId())
                        .senderName(thread.getSenderName())
                        .senderEmail(thread.getSenderEmail())
                        .subject(thread.getSubject())
                        .contentPreview(message.getContent().length() > 100 
                                ? message.getContent().substring(0, 100) + "..." : message.getContent())
                        .receivedAt(LocalDateTime.now())
                        .build());
    }
    
    public Page<ThreadResponse> getThreads(User user, Pageable pageable) {
        return threadRepository.findByOwnerAndIsArchivedFalseOrderByCreatedAtDesc(user, pageable)
                .map(ThreadResponse::from);
    }
    
    public Page<ThreadResponse> getUnreadThreads(User user, Pageable pageable) {
        return threadRepository.findByOwnerAndStatusAndIsArchivedFalseOrderByCreatedAtDesc(
                user, ThreadStatus.UNREAD, pageable).map(ThreadResponse::from);
    }
    
    public Page<ThreadResponse> getStarredThreads(User user, Pageable pageable) {
        return threadRepository.findByOwnerAndIsStarredTrueAndIsArchivedFalseOrderByCreatedAtDesc(
                user, pageable).map(ThreadResponse::from);
    }
    
    @Transactional
    public ThreadDetailResponse getThreadDetail(User user, Long threadId) {
        Thread thread = findThreadWithAuth(user, threadId);
        List<Message> messages = messageRepository.findByThreadOrderByCreatedAtAsc(thread);
        
        thread.markAsRead();
        messages.stream()
                .filter(m -> m.getDirection() == MessageDirection.INBOUND && !m.getIsRead())
                .forEach(Message::markAsRead);
        
        return ThreadDetailResponse.from(thread, messages.stream().map(MessageResponse::from).toList());
    }
    
    @Transactional
    public MessageResponse sendReply(User user, Long threadId, ReplyRequest request) {
        Thread thread = findThreadWithAuth(user, threadId);
        Message message = messageRepository.save(Message.builder()
                .thread(thread)
                .content(request.getContent())
                .direction(MessageDirection.OUTBOUND)
                .isRead(true)
                .build());
        thread.incrementMessageCount();
        thread.updateStatus(ThreadStatus.REPLIED);
        
        // 비동기로 이메일 발송 (트랜잭션 완료 후)
        sendReplyEmail(thread, user, request.getContent());
        
        return MessageResponse.from(message);
    }
    
    /**
     * 답장 이메일 발송 (비동기)
     * 
     * @Async: 별도 스레드에서 실행 → 응답 속도 저하 방지
     * 이메일 발송 실패해도 DB 저장은 이미 완료된 상태
     * 
     * SMTP 미설정 시 로그만 출력하고 스킵
     */
    @Async
    public void sendReplyEmail(Thread thread, User user, String content) {
        // SMTP 미설정 시 스킵
        if (!mailEnabled || fromEmail == null || fromEmail.isBlank()) {
            log.info("[MAIL DISABLED] Reply would be sent to {} for thread {} - Content: {}", 
                    thread.getSenderEmail(), thread.getId(), 
                    content.length() > 50 ? content.substring(0, 50) + "..." : content);
            return;
        }
        
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(thread.getSenderEmail());
            mailMessage.setSubject("Re: " + (thread.getSubject() != null ? thread.getSubject() : "메시지"));
            mailMessage.setText(buildReplyEmailContent(user, content, thread));
            
            mailSender.send(mailMessage);
            log.info("Reply email sent to {} for thread {}", thread.getSenderEmail(), thread.getId());
        } catch (Exception e) {
            log.error("Failed to send reply email to {}: {}", thread.getSenderEmail(), e.getMessage());
            // 이메일 발송 실패해도 예외 던지지 않음 (DB 저장은 완료됨)
        }
    }
    
    /**
     * 이메일 본문 생성
     */
    private String buildReplyEmailContent(User user, String content, Thread thread) {
        return String.format("""
                안녕하세요, %s님!
                
                %s님이 회원님의 메시지에 답장했습니다.
                
                ─────────────────────────────
                %s
                ─────────────────────────────
                
                이 이메일은 PickMeUp을 통해 발송되었습니다.
                직접 회신하시면 답장이 전달되지 않습니다.
                """,
                thread.getSenderName(),
                user.getName() != null ? user.getName() : user.getEmail(),
                content
        );
    }
    
    @Transactional
    public void toggleStar(User user, Long threadId) {
        findThreadWithAuth(user, threadId).toggleStar();
    }
    
    @Transactional
    public void archiveThread(User user, Long threadId) {
        findThreadWithAuth(user, threadId).archive();
    }
    
    public Long getUnreadCount(User user) {
        return threadRepository.countUnreadThreads(user);
    }
    
    public Page<ThreadResponse> searchThreads(User user, String keyword, Pageable pageable) {
        return threadRepository.searchThreads(user, keyword, pageable).map(ThreadResponse::from);
    }
    
    private Thread findThreadWithAuth(User user, Long threadId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new BusinessException(ErrorCode.THREAD_NOT_FOUND));
        if (!thread.getOwner().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        return thread;
    }
}
