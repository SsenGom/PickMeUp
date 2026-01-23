package com.pickmeup.exception;

import com.pickmeup.dto.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 전역 예외 처리 핸들러
 * 
 * @RestControllerAdvice:
 * - 모든 @RestController에서 발생한 예외를 여기서 처리
 * - 예외별로 적절한 HTTP 응답 생성
 * 
 * 예외 처리 흐름:
 * 1. Controller/Service에서 예외 발생 (throw)
 * 2. @ExceptionHandler가 해당 예외 타입 catch
 * 3. 적절한 HTTP 응답 생성해서 반환
 * 
 * 왜 전역 예외 처리?
 * - 각 Controller에서 try-catch 안 해도 됨
 * - 일관된 에러 응답 형식 유지
 * - 에러 로깅 중앙화
 */
@Slf4j                   // Lombok: 로거 자동 생성 (log.error(), log.warn() 등)
@RestControllerAdvice    // 전역 예외 처리 + JSON 응답
public class GlobalExceptionHandler {
    
    /**
     * 비즈니스 예외 처리
     * 
     * BusinessException: 우리가 정의한 비즈니스 규칙 위반 예외
     * 예: 할일 없음, 권한 없음, 중복 이메일 등
     * 
     * ErrorCode에 정의된 HTTP 상태와 메시지로 응답
     * 
     * @param e 발생한 BusinessException
     * @return 에러 응답
     * 
     * 응답 예시:
     * HTTP 404 Not Found
     * {
     *   "success": false,
     *   "message": "할일을 찾을 수 없습니다",
     *   "data": null
     * }
     */
    @ExceptionHandler(BusinessException.class)  // BusinessException 타입만 처리
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        // 로그 레벨: warn (예상된 에러이므로 error 아님)
        log.warn("Business exception: {}", e.getMessage());
        
        return ResponseEntity
                .status(e.getErrorCode().getStatus())  // ErrorCode에 정의된 HTTP 상태
                .body(ApiResponse.error(e.getMessage()));
    }
    
    /**
     * Validation 예외 처리
     * 
     * @Valid 검증 실패 시 발생
     * DTO의 @NotBlank, @Size, @Email 등 어노테이션 검증 실패
     * 
     * 예:
     * - @NotBlank 필드에 빈 값 전달
     * - @Size(max=200) 필드에 200자 초과 값 전달
     * 
     * @param e MethodArgumentNotValidException
     * @return 검증 에러 메시지 응답
     * 
     * 응답 예시:
     * HTTP 400 Bad Request
     * {
     *   "success": false,
     *   "message": "제목은 필수입니다, 설명은 2000자 이내여야 합니다",
     *   "data": null
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException e) {
        
        // 모든 검증 에러 메시지를 ", "로 연결
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)  // @NotBlank(message = "...") 의 message
                .collect(Collectors.joining(", "));
        
        return ResponseEntity
                .badRequest()  // 400 Bad Request
                .body(ApiResponse.error(message));
    }
    
    /**
     * 그 외 모든 예외 처리 (Catch-All)
     * 
     * 위에서 처리되지 않은 모든 예외
     * 예: NullPointerException, DB 연결 오류 등
     * 
     * 내부 에러 상세 내용은 클라이언트에 노출하지 않음 (보안)
     * 로그에만 스택 트레이스 기록
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        // 로그 레벨: error (예상치 못한 에러)
        // 스택 트레이스 전체 기록 (디버깅용)
        log.error("Unexpected error", e);
        
        return ResponseEntity
                .internalServerError()  // 500 Internal Server Error
                .body(ApiResponse.error("서버 오류가 발생했습니다"));  // 상세 에러는 숨김
    }
}
