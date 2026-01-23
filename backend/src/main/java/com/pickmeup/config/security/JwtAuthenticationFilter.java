package com.pickmeup.config.security;

import com.pickmeup.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT 인증 필터
 * 
 * 모든 HTTP 요청에서 JWT 토큰을 확인하고 인증 처리
 * 
 * 동작 흐름:
 * 1. HTTP 요청 수신
 * 2. Authorization 헤더에서 "Bearer {token}" 추출
 * 3. 토큰 유효성 검증
 * 4. 토큰에서 userId 추출 → DB에서 User 조회
 * 5. SecurityContext에 인증 정보 저장
 * 6. 다음 필터로 진행
 * 
 * OncePerRequestFilter를 상속:
 * - 한 요청당 한 번만 실행되는 것을 보장
 * - redirect나 forward 시 중복 실행 방지
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;  // JWT 토큰 처리
    private final UserRepository userRepository;       // 사용자 조회
    
    // HTTP 헤더 상수
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";  // 토큰 타입 (RFC 6750 표준)
    
    /**
     * 실제 필터 로직
     * 
     * @param request  HTTP 요청 객체
     * @param response HTTP 응답 객체
     * @param filterChain 다음 필터로 요청을 전달하기 위한 체인
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // ========== 1. 토큰 추출 ==========
        // Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
        // → "eyJhbGciOiJIUzI1NiJ9..." 부분만 추출
        String token = extractToken(request);
        
        // ========== 2. 토큰 검증 및 인증 처리 ==========
        // 토큰이 있고, 유효한 경우에만 처리
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            
            // Access Token인지 확인 (Refresh Token으로 API 호출 방지)
            if (jwtTokenProvider.isAccessToken(token)) {
                
                // 토큰에서 userId 추출
                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                
                // DB에서 사용자 조회
                userRepository.findById(userId).ifPresent(user -> {
                    
                    // 활성 사용자인지 확인 (탈퇴하지 않은)
                    if (user.getIsActive()) {
                        
                        // ========== 3. 인증 객체 생성 ==========
                        // UsernamePasswordAuthenticationToken:
                        // - principal: 현재 사용자 객체 (User)
                        // - credentials: 비밀번호 (JWT 방식에서는 null)
                        // - authorities: 권한 목록 (ROLE_USER, ROLE_ADMIN 등)
                        UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(
                                        user,   // principal - @CurrentUser로 가져올 수 있음
                                        null,   // credentials
                                        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                                );
                        
                        // ========== 4. SecurityContext에 저장 ==========
                        // SecurityContextHolder: 현재 스레드의 보안 컨텍스트
                        // 여기에 인증 정보를 저장하면:
                        // - Controller에서 @CurrentUser로 사용자 정보 접근 가능
                        // - @PreAuthorize("hasRole('ADMIN')") 같은 권한 체크 가능
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                });
            }
        }
        
        // ========== 5. 다음 필터로 진행 ==========
        // 인증 실패해도 여기서 막지 않음
        // SecurityConfig의 authorizeHttpRequests()에서 최종 판단
        // permitAll()이면 통과, authenticated()이면 403 Forbidden
        filterChain.doFilter(request, response);
    }
    
    /**
     * HTTP 요청에서 JWT 토큰 추출
     * 
     * Authorization 헤더 형식: "Bearer {token}"
     * 
     * @param request HTTP 요청
     * @return JWT 토큰 문자열 (없으면 null)
     */
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        
        // "Bearer "로 시작하면 그 뒤의 토큰 부분만 추출
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());  // "Bearer " 이후 문자열
        }
        return null;
    }
}
