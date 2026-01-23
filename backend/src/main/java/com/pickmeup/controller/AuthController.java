package com.pickmeup.controller;

import com.pickmeup.dto.auth.AuthDto.*;
import com.pickmeup.dto.common.ApiResponse;
import com.pickmeup.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 Controller - 회원가입, 로그인, 토큰 갱신 API
 * 
 * 모든 엔드포인트가 SecurityConfig에서 permitAll()로 설정됨
 * -> 인증 없이 접근 가능 (로그인 전이니까 당연)
 * 
 * API 목록:
 * - POST /api/auth/signup  : 회원가입
 * - POST /api/auth/login   : 로그인
 * - POST /api/auth/refresh : 토큰 갱신
 */
@RestController
@RequestMapping("/api/auth")  // 기본 URL: /api/auth
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * 회원가입
     * 
     * POST /api/auth/signup
     * 
     * 요청 Body:
     * {
     *   "email": "test@test.com",
     *   "password": "password123",
     *   "name": "홍길동"
     * }
     * 
     * 응답 (201 Created):
     * {
     *   "success": true,
     *   "message": "회원가입 성공",
     *   "data": {
     *     "accessToken": "eyJ...",
     *     "refreshToken": "eyJ...",
     *     "expiresIn": 3600000,
     *     "user": { "id": 1, "email": "test@test.com", "name": "홍길동" }
     *   }
     * }
     */
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)  // 201 응답 (리소스 생성됨)
    public ApiResponse<TokenResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        return ApiResponse.success("회원가입 성공", authService.signUp(request));
    }
    
    /**
     * 로그인
     * 
     * POST /api/auth/login
     * 
     * 요청 Body:
     * {
     *   "email": "test@test.com",
     *   "password": "password123"
     * }
     * 
     * 응답 (200 OK):
     * {
     *   "success": true,
     *   "data": {
     *     "accessToken": "eyJ...",
     *     "refreshToken": "eyJ...",
     *     "user": { ... }
     *   }
     * }
     * 
     * 에러 응답:
     * - 401: 비밀번호 틀림
     * - 404: 사용자 없음
     */
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }
    
    /**
     * 토큰 갱신
     * 
     * POST /api/auth/refresh
     * 
     * Access Token 만료 시 Refresh Token으로 새 Access Token 발급
     * 
     * 요청 Body:
     * {
     *   "refreshToken": "eyJ..."
     * }
     * 
     * 응답: 새로운 accessToken, refreshToken
     * 
     * 프론트엔드 흐름:
     * 1. API 호출 -> 401 응답 (토큰 만료)
     * 2. 저장된 refreshToken으로 이 API 호출
     * 3. 새 accessToken 받아서 저장
     * 4. 원래 요청 재시도
     */
    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.success(authService.refresh(request));
    }
}
