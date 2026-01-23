package com.pickmeup.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 에러 코드 정의 (Enum)
 * 
 * 모든 비즈니스 예외의 에러 코드를 한 곳에서 관리
 * 
 * 각 에러 코드는:
 * - HttpStatus: 응답할 HTTP 상태 코드 (404, 401, 500 등)
 * - message: 클라이언트에게 보낼 에러 메시지
 * 
 * 사용법:
 * throw new BusinessException(ErrorCode.USER_NOT_FOUND);
 * 
 * GlobalExceptionHandler에서 이 정보를 사용해 응답 생성:
 * HTTP 404 Not Found
 * { "success": false, "message": "사용자를 찾을 수 없습니다" }
 * 
 * HTTP 상태 코드 의미:
 * - 2xx: 성공
 *   - 200 OK: 일반 성공
 *   - 201 Created: 생성 성공
 *   - 204 No Content: 성공했지만 응답 본문 없음
 * 
 * - 4xx: 클라이언트 에러 (요청이 잘못됨)
 *   - 400 Bad Request: 잘못된 요청 형식
 *   - 401 Unauthorized: 인증 필요 (로그인 안 됨)
 *   - 403 Forbidden: 권한 없음 (로그인은 됐지만 접근 불가)
 *   - 404 Not Found: 리소스 없음
 *   - 409 Conflict: 충돌 (중복 등)
 * 
 * - 5xx: 서버 에러
 *   - 500 Internal Server Error: 서버 내부 오류
 */
@Getter
@RequiredArgsConstructor  // final 필드의 생성자 자동 생성
public enum ErrorCode {
    
    // ========== 인증 관련 ==========
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다"),       // 409
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다"),          // 404
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다"),  // 401
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다"),         // 401
    USER_DEACTIVATED(HttpStatus.FORBIDDEN, "비활성화된 계정입니다"),            // 403
    
    // ========== 리소스 관련 ==========
    EVENT_NOT_FOUND(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다"),
    TASK_NOT_FOUND(HttpStatus.NOT_FOUND, "할 일을 찾을 수 없습니다"),
    IMPORTANT_DATE_NOT_FOUND(HttpStatus.NOT_FOUND, "중요일을 찾을 수 없습니다"),
    
    // ========== 메시지 관련 ==========
    THREAD_NOT_FOUND(HttpStatus.NOT_FOUND, "메시지 스레드를 찾을 수 없습니다"),
    MESSAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "메시지를 찾을 수 없습니다"),
    
    // ========== 이력서 관련 ==========
    RESUME_NOT_FOUND(HttpStatus.NOT_FOUND, "이력서를 찾을 수 없습니다"),
    SLUG_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 사용 중인 슬러그입니다"),
    
    // ========== 공통 ==========
    NOT_FOUND(HttpStatus.NOT_FOUND, "리소스를 찾을 수 없습니다"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근 권한이 없습니다"),                // 다른 사용자의 리소스 접근 시도
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "잘못된 입력입니다"),                 // 입력값 오류
    FILE_UPLOAD_ERROR(HttpStatus.BAD_REQUEST, "파일 업로드에 실패했습니다"),
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다"),
    
    // ========== AI 관련 ==========
    AI_DAILY_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "오늘의 AI 사용 횟수를 초과했습니다 (하루 5회)"),
    AI_SERVICE_ERROR(HttpStatus.SERVICE_UNAVAILABLE, "AI 서비스 오류가 발생했습니다"),
    AI_API_KEY_NOT_CONFIGURED(HttpStatus.SERVICE_UNAVAILABLE, "AI 서비스가 설정되지 않았습니다"),
    
    // ========== 외부 API 관련 ==========
    EXTERNAL_API_ERROR(HttpStatus.SERVICE_UNAVAILABLE, "외부 서비스 오류가 발생했습니다"),
    CRAWL_FAILED(HttpStatus.BAD_REQUEST, "채용공고를 불러올 수 없습니다"),
    
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다"); // 예상치 못한 오류
    
    private final HttpStatus status;  // HTTP 상태 코드
    private final String message;     // 에러 메시지
}
