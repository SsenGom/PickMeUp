package com.pickmeup.aop.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 커스텀 어노테이션 - 메서드 실행 시간 로깅
 * 
 * 어노테이션(Annotation)이란?
 * - 코드에 메타데이터를 추가하는 방법
 * - @Override, @Autowired 같은 것들
 * - 컴파일러나 런타임에 특별한 처리를 지시
 * 
 * 사용법:
 * @LogExecutionTime
 * public void someMethod() { ... }
 * 
 * 결과:
 * CustomAspect에서 이 어노테이션을 감지하고 실행 시간 로깅
 * 출력: ⏱ [ExecutionTime] someMethod(..) - 150ms
 * 
 * @Target: 어노테이션을 붙일 수 있는 대상
 * - ElementType.METHOD: 메서드에만 사용 가능
 * - ElementType.TYPE: 클래스에 사용 가능
 * - ElementType.FIELD: 필드에 사용 가능
 * - ElementType.PARAMETER: 파라미터에 사용 가능
 * 
 * @Retention: 어노테이션 유지 범위
 * - RetentionPolicy.SOURCE: 컴파일 시 제거 (주석용)
 * - RetentionPolicy.CLASS: 클래스 파일에 존재, 런타임에 없음
 * - RetentionPolicy.RUNTIME: 런타임에도 존재 (리플렉션으로 읽기 가능)
 *   → AOP에서 사용하려면 RUNTIME 필수!
 */
@Target(ElementType.METHOD)      // 메서드에만 사용 가능
@Retention(RetentionPolicy.RUNTIME)  // 런타임에도 유지 (AOP 필수)
public @interface LogExecutionTime {
    // 속성 없음 - 단순히 마커 역할
    // 어노테이션 붙이기만 하면 AOP가 처리
}
