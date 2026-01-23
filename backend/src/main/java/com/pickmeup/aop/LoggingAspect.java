package com.pickmeup.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * 로깅 AOP (Aspect-Oriented Programming)
 * 
 * AOP란?
 * - 관점 지향 프로그래밍
 * - 공통 관심사(로깅, 트랜잭션, 보안)를 비즈니스 로직에서 분리
 * 
 * AOP 없이 로깅하면?
 * 모든 메서드에 로깅 코드를 넣어야 함 → 중복, 유지보수 어려움
 * 
 * public Task create(...) {
 *     log.info("create 시작");         // 중복!
 *     // 비즈니스 로직
 *     log.info("create 끝");           // 중복!
 * }
 * 
 * AOP 사용하면?
 * 한 곳에서 설정하면 모든 대상 메서드에 자동 적용
 * 
 * AOP 동작 원리 (Proxy 패턴):
 * Client → Proxy(AOP) → Target(실제 메서드)
 * 
 * Proxy가 실제 메서드 호출 전후에 추가 로직(로깅) 실행
 */
@Aspect         // 이 클래스가 AOP Aspect임을 표시
@Component      // Spring Bean 등록
@Slf4j          // Lombok: 로거 자동 생성
public class LoggingAspect {

    // ========== Pointcut 정의 ==========
    // Pointcut: "어디에" 적용할지 정의
    
    /**
     * Controller 패키지의 모든 메서드
     * 
     * execution(* com.pickmeup.controller..*(..))
     *          ↑  ↑                      ↑  ↑
     *       리턴타입 패키지               클래스 메서드(파라미터)
     * 
     * *: 모든 타입
     * ..: 하위 패키지 포함
     * *: 모든 클래스
     * (..): 모든 파라미터
     */
    @Pointcut("execution(* com.pickmeup.controller..*(..))")
    public void controllerMethods() {}

    /**
     * Service 패키지의 모든 메서드
     */
    @Pointcut("execution(* com.pickmeup.service..*(..))")
    public void serviceMethods() {}

    // ========== Advice 정의 ==========
    // Advice: "언제" + "무엇을" 할지 정의
    
    /**
     * Controller 메서드 로깅 (@Around)
     * 
     * @Around: 메서드 실행 전후 모두 제어 가능
     * - 실행 전 로직
     * - 실제 메서드 호출 (proceed)
     * - 실행 후 로직
     * - 예외 처리
     * 
     * ProceedingJoinPoint:
     * - proceed(): 실제 메서드 실행
     * - getSignature(): 메서드 정보 (이름, 클래스 등)
     * - getArgs(): 메서드 파라미터들
     * 
     * 출력 예시:
     * ▶ [Controller] TaskController.createTask() 호출 - args: [User@123, CreateRequest@456]
     * ◀ [Controller] TaskController.createTask() 완료 - 150ms
     */
    @Around("controllerMethods()")  // controllerMethods() Pointcut에 적용
    public Object logController(ProceedingJoinPoint joinPoint) throws Throwable {
        // 메서드 정보 추출
        String className = joinPoint.getSignature().getDeclaringTypeName();  // 클래스명
        String methodName = joinPoint.getSignature().getName();               // 메서드명
        Object[] args = joinPoint.getArgs();                                  // 파라미터들

        // ===== Before: 메서드 실행 전 =====
        log.info("▶ [Controller] {}.{}() 호출 - args: {}", 
                className, methodName, Arrays.toString(args));

        long startTime = System.currentTimeMillis();
        try {
            // ===== 실제 메서드 실행 =====
            Object result = joinPoint.proceed();  // Target 메서드 호출
            
            // ===== AfterReturning: 성공 시 =====
            long endTime = System.currentTimeMillis();
            log.info("◀ [Controller] {}.{}() 완료 - {}ms", 
                    className, methodName, (endTime - startTime));
            
            return result;  // 결과 반환 (클라이언트에게)
            
        } catch (Exception e) {
            // ===== AfterThrowing: 예외 발생 시 =====
            long endTime = System.currentTimeMillis();
            log.error("✖ [Controller] {}.{}() 실패 - {}ms - {}", 
                    className, methodName, (endTime - startTime), e.getMessage());
            throw e;  // 예외 다시 던짐 (GlobalExceptionHandler에서 처리)
        }
    }

    /**
     * Service 메서드 성능 측정
     * 
     * 1초 이상 걸리면 WARN 로그 출력 (느린 메서드 감지)
     */
    @Around("serviceMethods()")
    public Object logService(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();  // "TaskService.create(..)"
        
        long startTime = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long endTime = System.currentTimeMillis();
            
            // 1초 이상이면 경고 (성능 문제 가능성)
            if ((endTime - startTime) > 1000) {
                log.warn("⚠ [Service] {} - SLOW: {}ms", methodName, (endTime - startTime));
            } else {
                log.debug("  [Service] {} - {}ms", methodName, (endTime - startTime));
            }
            return result;
        } catch (Exception e) {
            log.error("✖ [Service] {} 실패 - {}", methodName, e.getMessage());
            throw e;
        }
    }
    
    /*
     * ========== 다른 Advice 종류 (참고) ==========
     * 
     * @Before: 메서드 실행 전에만
     * @Before("controllerMethods()")
     * public void before(JoinPoint jp) {
     *     log.info("시작: {}", jp.getSignature().getName());
     * }
     * 
     * @After: 메서드 실행 후 (성공/실패 무관)
     * @After("controllerMethods()")
     * public void after(JoinPoint jp) {
     *     log.info("끝: {}", jp.getSignature().getName());
     * }
     * 
     * @AfterReturning: 성공적으로 반환 후
     * @AfterReturning(pointcut = "controllerMethods()", returning = "result")
     * public void afterReturning(JoinPoint jp, Object result) {
     *     log.info("결과: {}", result);
     * }
     * 
     * @AfterThrowing: 예외 발생 후
     * @AfterThrowing(pointcut = "controllerMethods()", throwing = "ex")
     * public void afterThrowing(JoinPoint jp, Exception ex) {
     *     log.error("에러: {}", ex.getMessage());
     * }
     */
}
