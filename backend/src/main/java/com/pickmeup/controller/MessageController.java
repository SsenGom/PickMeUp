package com.pickmeup.controller;

import com.pickmeup.config.security.CurrentUser;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.common.ApiResponse;
import com.pickmeup.dto.message.MessageDto.*;
import com.pickmeup.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class MessageController {
    
    private final MessageService messageService;
    
    @PostMapping("/api/contact/{slug}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> sendContact(@PathVariable String slug, @Valid @RequestBody ContactRequest request, HttpServletRequest httpRequest) {
        messageService.receiveContactMessage(slug, request, 
                getClientIp(httpRequest), httpRequest.getHeader("User-Agent"), httpRequest.getHeader("Referer"));
        return ApiResponse.success("메시지가 전송되었습니다");
    }
    
    @GetMapping("/api/inbox")
    public ApiResponse<Page<ThreadResponse>> getThreads(@CurrentUser User user, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(messageService.getThreads(user, pageable));
    }
    
    @GetMapping("/api/inbox/unread")
    public ApiResponse<Page<ThreadResponse>> getUnreadThreads(@CurrentUser User user, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(messageService.getUnreadThreads(user, pageable));
    }
    
    @GetMapping("/api/inbox/starred")
    public ApiResponse<Page<ThreadResponse>> getStarredThreads(@CurrentUser User user, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(messageService.getStarredThreads(user, pageable));
    }
    
    @GetMapping("/api/inbox/{threadId}")
    public ApiResponse<ThreadDetailResponse> getThreadDetail(@CurrentUser User user, @PathVariable Long threadId) {
        return ApiResponse.success(messageService.getThreadDetail(user, threadId));
    }
    
    @PostMapping("/api/inbox/{threadId}/reply")
    public ApiResponse<MessageResponse> sendReply(@CurrentUser User user, @PathVariable Long threadId, @Valid @RequestBody ReplyRequest request) {
        return ApiResponse.success(messageService.sendReply(user, threadId, request));
    }
    
    @PatchMapping("/api/inbox/{threadId}/star")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void toggleStar(@CurrentUser User user, @PathVariable Long threadId) {
        messageService.toggleStar(user, threadId);
    }
    
    @PatchMapping("/api/inbox/{threadId}/archive")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archiveThread(@CurrentUser User user, @PathVariable Long threadId) {
        messageService.archiveThread(user, threadId);
    }
    
    @GetMapping("/api/inbox/unread-count")
    public ApiResponse<Long> getUnreadCount(@CurrentUser User user) {
        return ApiResponse.success(messageService.getUnreadCount(user));
    }
    
    @GetMapping("/api/inbox/search")
    public ApiResponse<Page<ThreadResponse>> searchThreads(@CurrentUser User user, @RequestParam String q, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(messageService.searchThreads(user, q, pageable));
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) ip = request.getRemoteAddr();
        return ip;
    }
}
