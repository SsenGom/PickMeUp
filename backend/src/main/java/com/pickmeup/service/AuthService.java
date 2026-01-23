package com.pickmeup.service;

import com.pickmeup.config.security.JwtProperties;
import com.pickmeup.config.security.JwtTokenProvider;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.auth.AuthDto.*;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import com.pickmeup.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 인증 Service - 회원가입, 로그인, 토큰 갱신 담당
 * 
 * 인증 흐름 정리:
 * 
 * [회원가입]
 * Client -> POST /api/auth/signup {email, password, name}
 * Server -> 이메일 중복 확인 -> 비밀번호 암호화 -> DB 저장 -> JWT 발급
 * 
 * [로그인]
 * Client -> POST /api/auth/login {email, password}
 * Server -> 이메일로 User 조회 -> 비밀번호 확인 -> JWT 발급
 * 
 * [토큰 갱신]
 * Client -> POST /api/auth/refresh {refreshToken}
 * Server -> Refresh Token 검증 -> 새 Access Token 발급
 * 
 * [API 호출]
 * Client -> GET /api/tasks + Header: "Authorization: Bearer {accessToken}"
 * Server -> JwtAuthenticationFilter에서 토큰 검증 -> Controller 진입
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;    // BCrypt 암호화
    private final JwtTokenProvider jwtTokenProvider;  // JWT 토큰 생성/검증
    private final JwtProperties jwtProperties;        // JWT 설정값
    
    /**
     * 회원가입
     * 
     * @param request 회원가입 요청 (email, password, name)
     * @return 토큰 응답 (accessToken, refreshToken, user)
     * @throws BusinessException DUPLICATE_EMAIL: 이메일 중복
     */
    @Transactional  // 쓰기 트랜잭션
    public TokenResponse signUp(SignUpRequest request) {
        // 1. 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }
        
        // 2. 사용자 Entity 생성
        User user = User.builder()
                .email(request.getEmail())
                // 비밀번호 암호화 (평문 -> BCrypt 해시)
                // "1234" -> "$2a$10$N9qo8uLOickgx2ZMRZoMy..."
                // 단방향이라 복호화 불가. 검증 시 matches() 사용
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();
        
        // 3. DB 저장
        userRepository.save(user);
        
        // 4. JWT 토큰 생성해서 응답
        return createTokenResponse(user);
    }
    
    /**
     * 로그인
     * 
     * @param request 로그인 요청 (email, password)
     * @return 토큰 응답
     * @throws BusinessException USER_NOT_FOUND: 사용자 없음
     * @throws BusinessException INVALID_PASSWORD: 비밀번호 틀림
     * @throws BusinessException USER_DEACTIVATED: 비활성 계정
     */
    public TokenResponse login(LoginRequest request) {
        // 1. 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        // 2. 비밀번호 확인
        // matches(평문, 해시): 평문을 해시해서 저장된 해시와 비교
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
        
        // 3. 계정 활성화 상태 확인
        if (!user.getIsActive()) {
            throw new BusinessException(ErrorCode.USER_DEACTIVATED);
        }
        
        // 4. 토큰 발급
        return createTokenResponse(user);
    }
    
    /**
     * 토큰 갱신
     * 
     * Access Token이 만료되면:
     * 1. Client가 저장해둔 Refresh Token으로 이 API 호출
     * 2. 새 Access Token 발급받음
     * 3. 새 토큰으로 원래 요청 재시도
     * 
     * Refresh Token도 만료되면 재로그인 필요
     */
    public TokenResponse refresh(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        
        // 1. Refresh Token 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
        
        // 2. 토큰에서 userId 추출 -> 사용자 조회
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        // 3. 새 토큰 발급
        return createTokenResponse(user);
    }
    
    /**
     * 토큰 응답 생성 (공통 메서드)
     * 
     * Access Token + Refresh Token + 사용자 정보 응답
     */
    private TokenResponse createTokenResponse(User user) {
        // Access Token: API 호출용 (짧은 수명: 1시간)
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());
        
        // Refresh Token: Access Token 재발급용 (긴 수명: 7일)
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());
        
        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtProperties.getAccessTokenExpiry())
                .user(UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .profileImageUrl(user.getProfileImageUrl())
                        .build())
                .build();
    }
}
