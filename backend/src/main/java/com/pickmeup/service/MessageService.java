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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
        return MessageResponse.from(message);
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
