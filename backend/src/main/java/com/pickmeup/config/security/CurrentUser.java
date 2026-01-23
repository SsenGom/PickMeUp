package com.pickmeup.config.security;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.lang.annotation.*;

/**
 * 커스텀 어노테이션 - 현재 로그인한 사용자 주입
 * 
 * Controller 파라미터에 사용하면 현재 로그인한 User 객체를 자동 주입
 * 
 * 사용법:
 * @GetMapping("/tasks")
 * public List<Task> getTasks(@CurrentUser User user) {
 *     // user = 현재 로그인한 사용자
 *     return taskService.findByUser(user);
 * }
 * 
 * 동작 원리:
 * 1. JwtAuthenticationFilter에서 JWT 토큰 검증
 * 2. 토큰에서 userId 추출 -> DB에서 User 조회
 * 3. SecurityContextHolder에 인증 정보(User) 저장
 * 4. @CurrentUser가 SecurityContext에서 User 꺼내서 파라미터에 주입
 * 
 * @AuthenticationPrincipal:
 * Spring Security가 제공하는 어노테이션
 * SecurityContext에서 principal(인증된 사용자) 꺼내줌
 * 
 * 왜 커스텀 어노테이션으로 감쌈?
 * - @AuthenticationPrincipal은 이름이 길고 의미가 모호
 * - @CurrentUser는 명확하고 짧음
 * - 나중에 추가 로직 넣기 쉬움
 * 
 * @Target:
 * - PARAMETER: 메서드 파라미터에 사용 가능
 * - TYPE: 클래스/인터페이스에 사용 가능 (메타 어노테이션용)
 * 
 * @Documented: Javadoc에 포함
 */
@Target({ElementType.PARAMETER, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@AuthenticationPrincipal  // 핵심! 이게 실제로 SecurityContext에서 User 꺼내줌
public @interface CurrentUser {
    // 속성 없음 - @AuthenticationPrincipal을 감싸는 역할만
}
