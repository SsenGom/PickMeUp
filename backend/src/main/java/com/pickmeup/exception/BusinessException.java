package com.pickmeup.exception;

import lombok.Getter;

/**
 * 비즈니스 예외 클래스
 * 
 * 비즈니스 규칙 위반 시 발생시키는 예외
 * GlobalExceptionHandler에서 catch해서 적절한 HTTP 응답으로 변환
 * 
 * RuntimeException을 상속하는 이유:
 * - Checked Exception (Exception 상속): 반드시 try-catch 또는 throws 필요
 * - Unchecked Exception (RuntimeException 상속): try-catch 강제 안 됨
 * 
 * 비즈니스 예외는 Unchecked로 만드는 게 일반적:
 * - 코드가 깔끔해짐 (매번 try-catch 안 해도 됨)
 * - GlobalExceptionHandler에서 한 번에 처리
 * 
 * 사용 예시:
 * 
 * // Service에서 예외 발생
 * if (userRepository.existsByEmail(email)) {
 *     throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
 * }
 * 
 * // GlobalExceptionHandler에서 처리
 * @ExceptionHandler(BusinessException.class)
 * public ResponseEntity<?> handle(BusinessException e) {
 *     return ResponseEntity
 *         .status(e.getErrorCode().getStatus())  // 409 Conflict
 *         .body(ApiResponse.error(e.getMessage())); // "이미 사용 중인 이메일입니다"
 * }
 */
@Getter
public class BusinessException extends RuntimeException {
    
    // 에러 코드 (HTTP 상태 + 메시지 포함)
    private final ErrorCode errorCode;
    
    /**
     * ErrorCode의 기본 메시지 사용
     * 
     * 사용: throw new BusinessException(ErrorCode.USER_NOT_FOUND);
     * 메시지: "사용자를 찾을 수 없습니다"
     */
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());  // RuntimeException의 message 설정
        this.errorCode = errorCode;
    }
    
    /**
     * 커스텀 메시지 사용
     * 
     * 사용: throw new BusinessException(ErrorCode.INVALID_INPUT, "이메일 형식이 올바르지 않습니다");
     * 메시지: "이메일 형식이 올바르지 않습니다" (ErrorCode의 기본 메시지 대신)
     */
    public BusinessException(ErrorCode errorCode, String message) {
        super(message);  // 커스텀 메시지
        this.errorCode = errorCode;
    }
}
