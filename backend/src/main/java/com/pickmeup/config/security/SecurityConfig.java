package com.pickmeup.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security 설정 클래스
 * 
 * Spring Security는 필터 체인 방식으로 동작:
 * 요청 → [Filter1] → [Filter2] → ... → [Controller]
 * 
 * 주요 역할:
 * 1. 인증(Authentication): 누구인지 확인 (로그인)
 * 2. 인가(Authorization): 권한 확인 (이 URL에 접근 가능한지)
 */
@Configuration          // 이 클래스가 설정 클래스임을 표시. @Bean 메서드들이 Bean으로 등록됨
@EnableWebSecurity      // Spring Security 활성화. 기본 보안 설정을 커스터마이징 가능하게 함
@RequiredArgsConstructor // final 필드를 파라미터로 받는 생성자 자동 생성 (Lombok)
public class SecurityConfig {
    
    // JWT 인증 필터 - 모든 요청에서 JWT 토큰 검증
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    /**
     * Security Filter Chain 설정
     * 
     * HTTP 요청이 들어오면 이 필터 체인을 통과함
     * 각 필터에서 인증/인가 처리
     */
    @Bean  // 이 메서드가 반환하는 객체를 Spring Bean으로 등록
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                // ========== CSRF 비활성화 ==========
                // CSRF(Cross-Site Request Forgery): 사이트 간 요청 위조 공격
                // REST API는 세션을 사용하지 않으므로 CSRF 공격에 취약하지 않음
                // JWT 토큰 방식을 사용하므로 비활성화해도 안전
                .csrf(AbstractHttpConfigurer::disable)
                
                // ========== CORS 설정 ==========
                // CORS(Cross-Origin Resource Sharing): 다른 도메인에서의 요청 허용
                // Frontend(localhost:3000)에서 Backend(localhost:8080)로 요청할 때 필요
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // ========== 세션 정책 ==========
                // STATELESS: 세션을 생성하지 않음
                // JWT는 토큰 자체에 정보가 있으므로 서버에 세션 저장 불필요
                // 이로 인해 서버 확장(Scale-out)이 쉬워짐
                .sessionManagement(session -> 
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // ========== URL별 접근 권한 설정 ==========
                .authorizeHttpRequests(auth -> auth
                        // permitAll(): 인증 없이 접근 가능
                        .requestMatchers("/api/auth/**").permitAll()        // 로그인, 회원가입
                        .requestMatchers("/api/public/**").permitAll()      // 공개 API
                        .requestMatchers(HttpMethod.GET, "/api/resume/{slug}").permitAll()  // 공개 이력서 조회
                        .requestMatchers(HttpMethod.POST, "/api/contact/**").permitAll()    // 외부 메시지 수신
                        .requestMatchers("/ws/**").permitAll()              // WebSocket
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()  // Swagger 문서
                        .requestMatchers("/actuator/health").permitAll()    // 헬스체크
                        
                        // authenticated(): 인증된 사용자만 접근 가능
                        // 위에서 permitAll()로 지정하지 않은 모든 요청
                        .anyRequest().authenticated()
                )
                
                // ========== JWT 필터 추가 ==========
                // UsernamePasswordAuthenticationFilter 앞에 JWT 필터 삽입
                // 모든 요청에서 JWT 토큰을 먼저 확인하도록 함
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
    
    /**
     * CORS 설정
     * 
     * 브라우저 보안 정책상 다른 도메인으로의 요청은 기본적으로 차단됨
     * Frontend와 Backend가 다른 포트를 사용하므로 CORS 설정 필요
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 Origin (요청을 보내는 도메인)
        // localhost:3000 - Vite 개발 서버
        // localhost:5173 - Vite 기본 포트
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
                "http://localhost:3003",
                "http://localhost:5173"
        ));
        
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // 허용할 헤더 (* = 모든 헤더)
        configuration.setAllowedHeaders(List.of("*"));
        
        // 응답에 노출할 헤더 (클라이언트가 읽을 수 있음)
        configuration.setExposedHeaders(List.of("Authorization"));
        
        // 쿠키 포함 허용
        configuration.setAllowCredentials(true);
        
        // Preflight 요청 캐시 시간 (초)
        // OPTIONS 요청 결과를 3600초(1시간) 동안 캐시
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);  // 모든 경로에 적용
        return source;
    }
    
    /**
     * 비밀번호 암호화 인코더
     * 
     * BCrypt: 단방향 해시 함수. 복호화 불가능
     * 같은 비밀번호도 매번 다른 해시값 생성 (Salt 사용)
     * 
     * 사용법:
     * - 암호화: passwordEncoder.encode("1234") → "$2a$10$..."
     * - 검증: passwordEncoder.matches("1234", "$2a$10$...") → true/false
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
