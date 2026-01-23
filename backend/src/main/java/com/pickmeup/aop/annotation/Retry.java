package com.pickmeup.aop.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 커스텀 어노테이션 - 실패 시 자동 재시도
 * 
 * 외부 API 호출, 네트워크 요청 등 일시적 실패 가능한 작업에 사용
 * 
 * 사용법:
 * 
 * // 기본값: 3번 재시도, 1초 간격
 * @Retry
 * public Response callApi() { ... }
 * 
 * // 커스텀 설정: 5번 재시도, 2초 간격
 * @Retry(maxAttempts = 5, delay = 2000)
 * public Response callUnstableApi() { ... }
 * 
 * 동작:
 * 1. 메서드 실행 시도
 * 2. 예외 발생 시 delay만큼 대기
 * 3. maxAttempts까지 재시도
 * 4. 모두 실패하면 마지막 예외 던짐
 * 
 * 주의사항:
 * - 멱등성(Idempotent) 있는 작업에만 사용
 *   멱등성: 여러 번 실행해도 결과가 같은 것
 *   예: 조회(GET) - 멱등 O
 *       결제(POST) - 멱등 X (재시도하면 이중 결제!)
 * - 트랜잭션 내부에서 재시도 시 주의
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Retry {
    
    /**
     * 최대 재시도 횟수
     * 
     * 기본값: 3번
     * 첫 시도 + 재시도 2번 = 총 3번 시도
     */
    int maxAttempts() default 3;
    
    /**
     * 재시도 간격 (밀리초)
     * 
     * 기본값: 1000ms = 1초
     * 실패 후 다음 시도까지 대기 시간
     */
    long delay() default 1000;
    
    /*
     * 확장 가능한 속성들 (필요시 추가):
     * 
     * // 특정 예외만 재시도
     * Class<? extends Exception>[] retryOn() default { Exception.class };
     * 
     * // 특정 예외는 재시도 안 함
     * Class<? extends Exception>[] noRetryOn() default {};
     * 
     * // 지수 백오프 (1초 -> 2초 -> 4초...)
     * boolean exponentialBackoff() default false;
     */
}
