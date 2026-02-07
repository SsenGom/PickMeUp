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
    
    // 알림 서비스 (옵션)
    private final com.pickmeup.service.notification.KakaoNotificationService kakaoService;
    private final com.pickmeup.service.notification.SmsNotificationService smsService;
    
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
        
        // WebSocket 실시간 알림
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
        
        // 카카오톡 알림 (이력서 소유자 휴대폰 번호가 있는 경우)
        if (owner.getPhone() != null && !owner.getPhone().isEmpty()) {
            // 카카오톡 우선, 실패 시 SMS
            if (kakaoService.isConfigured()) {
                kakaoService.sendNewMessageNotification(
                    owner.getPhone(),
                    request.getSenderName(),
                    request.getSubject()
                );
            } else if (smsService.isConfigured()) {
                smsService.sendNewMessageNotification(
                    owner.getPhone(),
                    request.getSenderName(),
                    request.getSubject()
                );
            }
        }
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
            org.springframework.mail.javamail.MimeMessageHelper helper = 
                new org.springframework.mail.javamail.MimeMessageHelper(
                    mailSender.createMimeMessage(), true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(thread.getSenderEmail());
            helper.setSubject("Re: " + (thread.getSubject() != null ? thread.getSubject() : "메시지"));
            helper.setText(buildReplyEmailContentHtml(user, content, thread), true);
            
            mailSender.send(helper.getMimeMessage());
            log.info("Reply email sent to {} for thread {}", thread.getSenderEmail(), thread.getId());
        } catch (Exception e) {
            log.error("Failed to send reply email to {}: {}", thread.getSenderEmail(), e.getMessage());
            // 이메일 발송 실패해도 예외 던지지 않음 (DB 저장은 완료됨)
        }
    }
    
    /**
     * HTML 이메일 본문 생성
     */
    private String buildReplyEmailContentHtml(User user, String content, Thread thread) {
        String userName = user.getName() != null ? user.getName() : user.getEmail();
        String resumeUrl = "https://pickmeup.com/resume/" + user.getId(); // 실제 도메인으로 변경 필요
        
        return String.format("""
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>PickMeUp 답장</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">PickMeUp</h1>
                                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">취업 준비의 모든 것</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px;">
                                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                                                안녕하세요, <strong style="color: #667eea;">%s</strong>님!
                                            </p>
                                            <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                                                <strong style="color: #667eea;">%s</strong>님이 회원님의 메시지에 답장했습니다.
                                            </p>
                                            
                                            <!-- Message Box -->
                                            <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                                <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.8; white-space: pre-wrap;">%s</p>
                                            </div>
                                            
                                            <!-- CTA Button -->
                                            <table width="100%%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                                <tr>
                                                    <td align="center">
                                                        <a href="%s" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">
                                                            이력서 보러가기
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <p style="margin: 30px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.6;">
                                                💡 직접 회신하시면 답장이 전달되지 않습니다. 위 버튼을 클릭하여 이력서 페이지에서 답장해주세요.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280; text-align: center;">
                                                이 이메일은 PickMeUp을 통해 자동 발송되었습니다.
                                            </p>
                                            <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                                                © 2025 PickMeUp. All rights reserved.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """,
                thread.getSenderName(),
                userName,
                content.replace("<", "&lt;").replace(">", "&gt;"), // HTML 이스케이프
                resumeUrl
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
    
    /**
     * 제안 수락 시 1:1 채팅방 생성
     */
    @Transactional
    public Thread createProposalThread(com.pickmeup.domain.recruiter.ContactProposal proposal) {
        User recruiter = proposal.getRecruiter();
        User jobSeeker = proposal.getJobSeeker();
        
        String subject = String.format("[%s] %s 포지션 면접 제안", 
                proposal.getCompanyName(), 
                proposal.getPosition());
        
        // 스레드 생성
        Thread thread = Thread.builder()
                .owner(jobSeeker)  // 구직자가 owner
                .senderName(proposal.getCompanyName())
                .senderEmail(recruiter.getEmail())
                .subject(subject)
                .status(ThreadStatus.UNREAD)
                .build();
        
        threadRepository.save(thread);
        
        // 초기 시스템 메시지
        Message systemMessage = Message.builder()
                .thread(thread)
                .content(String.format(
                    "💼 %s에서 %s 포지션으로 면접을 제안했습니다.\n\n" +
                    "급여: %s\n" +
                    "근무지: %s\n\n" +
                    "채팅을 통해 상세한 면접 일정을 조율하세요!",
                    proposal.getCompanyName(),
                    proposal.getPosition(),
                    proposal.getSalaryRange() != null ? proposal.getSalaryRange() : "협의 가능",
                    proposal.getLocation() != null ? proposal.getLocation() : "미정"
                ))
                .direction(MessageDirection.INBOUND)
                .build();
        
        messageRepository.save(systemMessage);
        thread.incrementMessageCount();
        
        log.info("Proposal thread created - threadId: {}, recruiter: {}, jobSeeker: {}", 
                thread.getId(), recruiter.getId(), jobSeeker.getId());
        
        return thread;
    }
}
