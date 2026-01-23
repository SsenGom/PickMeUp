package com.pickmeup.config.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 토큰 생성 및 검증 담당 클래스
 * 
 * JWT(JSON Web Token) 구조:
 * [Header].[Payload].[Signature]
 * 
 * 예시: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc123...
 * 
 * - Header: 암호화 알고리즘 정보 (HS256 등)
 * - Payload: 실제 데이터 (userId, email 등). Base64 인코딩이라 누구나 볼 수 있음! 민감 정보 X
 * - Signature: Header + Payload를 SecretKey로 서명. 위조 방지
 * 
 * Access Token vs Refresh Token:
 * - Access Token: 짧은 수명 (1시간). API 호출 시 사용
 * - Refresh Token: 긴 수명 (7일). Access Token 재발급용
 * 
 * 왜 두 개로 나눔?
 * - Access Token이 탈취되면 1시간만 유효
 * - Refresh Token은 저장소에 저장하고 재발급 시에만 사용
 */
@Slf4j              // Lombok: log 필드 자동 생성. log.info(), log.error() 등 사용 가능
@Component          // Spring Bean으로 등록. 다른 클래스에서 주입받아 사용 가능
@RequiredArgsConstructor  // final 필드를 파라미터로 받는 생성자 자동 생성
public class JwtTokenProvider {
    
    // JWT 설정값 (application.yml에서 주입)
    // - secret: 서명에 사용할 비밀키
    // - accessTokenExpiry: Access Token 만료 시간
    // - refreshTokenExpiry: Refresh Token 만료 시간
    private final JwtProperties jwtProperties;
    
    /**
     * 서명에 사용할 SecretKey 생성
     * 
     * HMAC-SHA 알고리즘 사용
     * 이 키로 토큰에 서명하고, 검증 시 같은 키로 확인
     * 키가 유출되면 토큰 위조 가능 → 절대 노출 금지!
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }
    
    /**
     * Access Token 생성
     * 
     * @param userId 사용자 ID (토큰에 저장)
     * @param email 사용자 이메일 (토큰에 저장)
     * @return JWT 문자열
     * 
     * 토큰 내용:
     * {
     *   "sub": "1",           // subject: 사용자 ID
     *   "email": "a@a.com",   // 커스텀 클레임
     *   "type": "access",     // 토큰 타입
     *   "iat": 1704067200,    // issued at: 발급 시간 (Unix timestamp)
     *   "exp": 1704070800     // expiration: 만료 시간
     * }
     */
    public String createAccessToken(Long userId, String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getAccessTokenExpiry());
        
        return Jwts.builder()
                .subject(String.valueOf(userId))    // sub 클레임 (주체)
                .claim("email", email)              // 커스텀 클레임
                .claim("type", "access")            // 토큰 타입 구분용
                .issuedAt(now)                      // 발급 시간
                .expiration(expiry)                 // 만료 시간
                .signWith(getSigningKey())          // 서명 (위조 방지)
                .compact();                         // JWT 문자열로 변환
    }
    
    /**
     * Refresh Token 생성
     * 
     * Access Token 재발급용. 더 긴 수명 (7일)
     * 최소한의 정보만 포함 (userId만)
     */
    public String createRefreshToken(Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getRefreshTokenExpiry());
        
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }
    
    /**
     * 토큰에서 사용자 ID 추출
     * 
     * @param token JWT 문자열
     * @return 사용자 ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }
    
    /**
     * 토큰에서 이메일 추출
     */
    public String getEmailFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("email", String.class);
    }
    
    /**
     * 토큰 유효성 검증
     * 
     * @param token JWT 문자열
     * @return 유효하면 true, 아니면 false
     * 
     * 검증 항목:
     * 1. 서명이 올바른지 (위조 여부)
     * 2. 만료되지 않았는지
     * 3. 형식이 올바른지
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);  // 파싱 성공하면 유효한 토큰
            return true;
        } catch (ExpiredJwtException e) {
            // 토큰 만료 - 클라이언트에서 Refresh Token으로 재발급 필요
            log.warn("Expired JWT token");
        } catch (UnsupportedJwtException e) {
            // 지원하지 않는 형식
            log.warn("Unsupported JWT token");
        } catch (MalformedJwtException e) {
            // 잘못된 구조
            log.warn("Malformed JWT token");
        } catch (IllegalArgumentException e) {
            // 빈 토큰 등
            log.warn("Invalid JWT token");
        }
        return false;
    }
    
    /**
     * Access Token인지 확인
     */
    public boolean isAccessToken(String token) {
        Claims claims = parseClaims(token);
        return "access".equals(claims.get("type", String.class));
    }
    
    /**
     * 토큰 파싱 (Claims 추출)
     * 
     * Claims: 토큰에 담긴 정보들 (subject, email, exp 등)
     * 
     * 이 메서드가 성공하면:
     * 1. 서명이 올바름 (위조 아님)
     * 2. 토큰이 만료되지 않음
     * 3. 형식이 올바름
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())    // 검증에 사용할 키
                .build()
                .parseSignedClaims(token)       // 파싱 및 검증
                .getPayload();                  // Claims(Payload) 반환
    }
}
