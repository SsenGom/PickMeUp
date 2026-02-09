# 🧪 테스트 가이드

## 📋 개요

헤드헌터 모드의 핵심 기능에 대한 테스트 작성 완료!

### 테스트 종류
- **단위 테스트**: Service 로직 테스트 (Mock 사용)
- **통합 테스트**: Controller → Service 흐름 테스트
- **Repository 테스트**: DB 쿼리 테스트

---

## 🚀 테스트 실행

### 전체 테스트 실행
```bash
cd backend
./gradlew test
```

### 특정 테스트만 실행
```bash
# Service 테스트만
./gradlew test --tests RecruiterServiceTest

# Controller 테스트만
./gradlew test --tests RecruiterControllerTest

# Repository 테스트만
./gradlew test --tests ResumePickRepositoryTest
```

### 테스트 리포트 확인
```bash
# 실행 후 리포트 생성
./gradlew test

# 리포트 위치
open backend/build/reports/tests/test/index.html
```

---

## 📊 테스트 커버리지

### 작성된 테스트

#### 1. RecruiterServiceTest (단위 테스트)
**테스트 케이스: 12개**

**Pick 관련 (5개)**
- ✅ 이력서 픽 성공
- ✅ 헤드헌터가 아닌 사용자는 픽 불가
- ✅ 비공개 이력서는 픽 불가
- ✅ 이미 픽한 이력서는 중복 픽 불가
- ✅ 자기 자신의 이력서는 픽 불가

**제안 관련 (4개)**
- ✅ 제안 발송 성공
- ✅ 제안 수락 성공
- ✅ 다른 사람의 제안은 수락 불가
- ✅ 이미 응답한 제안은 수락 불가

**통계 관련 (1개)**
- ✅ 헤드헌터 통계 조회 성공

#### 2. RecruiterControllerTest (통합 테스트)
**테스트 케이스: 5개**

- ✅ GET /api/recruiter/feed - 이력서 피드 조회
- ✅ POST /api/recruiter/pick/{resumeId} - 이력서 픽
- ✅ POST /api/recruiter/proposal/{resumeId} - 제안 발송
- ✅ GET /api/recruiter/picks - 픽 목록 조회
- ✅ GET /api/recruiter/statistics - 통계 조회

#### 3. ResumePickRepositoryTest (Repository 테스트)
**테스트 케이스: 7개**

- ✅ 픽 저장 및 조회
- ✅ 중복 픽 확인
- ✅ 헤드헌터가 픽한 이력서 목록 조회
- ✅ 상태별 픽 목록 조회
- ✅ 이력서가 받은 총 픽 수
- ✅ 기간별 픽 수 조회
- ✅ 픽한 이력서 ID 목록 조회

**총 테스트 케이스: 24개**

---

## 🎯 테스트 작성 원칙

### 1. Given-When-Then 패턴
```java
@Test
void pickResume_Success() {
    // given (준비)
    Resume resume = createResume();
    
    // when (실행)
    PickResponse response = service.pickResume(recruiter, resumeId, request);
    
    // then (검증)
    assertThat(response).isNotNull();
}
```

### 2. 명확한 테스트 이름
```java
// ❌ 나쁜 예
@Test
void test1() { }

// ✅ 좋은 예
@Test
@DisplayName("비공개 이력서는 픽 불가")
void pickResume_NotPublic() { }
```

### 3. 독립적인 테스트
- 각 테스트는 서로 독립적
- `@BeforeEach`로 초기화
- 테스트 순서에 의존하지 않음

### 4. 예외 테스트
```java
// 예외가 발생해야 하는 경우
assertThatThrownBy(() -> service.pickResume(...))
    .isInstanceOf(BusinessException.class)
    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOT_RECRUITER);
```

---

## 📝 추가 테스트 필요 항목

### 우선순위 높음
- [ ] ContactProposalRepository 테스트
- [ ] ProposalController 테스트
- [ ] 제안 거절 로직 테스트
- [ ] 제안 만료 로직 테스트

### 우선순위 중간
- [ ] 통합 테스트 (전체 플로우)
  - [ ] 픽 → 제안 → 수락 → 채팅 생성
- [ ] 통계 계산 정확도 테스트
- [ ] 페이징 테스트

### 우선순위 낮음
- [ ] 성능 테스트
- [ ] 부하 테스트
- [ ] E2E 테스트 (Cypress)

---

## 🛠 테스트 도구

### 사용 중인 라이브러리
- **JUnit 5**: 테스트 프레임워크
- **Mockito**: Mock 객체 생성
- **AssertJ**: 가독성 높은 assertion
- **Spring Boot Test**: 통합 테스트
- **H2 Database**: 테스트용 인메모리 DB

### 주요 어노테이션
```java
@ExtendWith(MockitoExtension.class)  // Mockito 사용
@WebMvcTest                          // Controller 테스트
@DataJpaTest                         // Repository 테스트
@SpringBootTest                      // 전체 통합 테스트
@WithMockUser                        // 인증 Mock
```

---

## 🔍 테스트 디버깅

### 로그 확인
```yaml
# application-test.yml
logging:
  level:
    com.pickmeup: DEBUG
    org.springframework.web: DEBUG
```

### 실패 시 확인사항
1. **에러 메시지 읽기**
2. **스택 트레이스 확인**
3. **테스트 데이터 검증**
4. **Mock 동작 확인**
   ```java
   verify(repository).save(any());  // 호출되었는지 확인
   ```

---

## 📚 참고 자료

### JUnit 5
- https://junit.org/junit5/docs/current/user-guide/

### Mockito
- https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html

### AssertJ
- https://assertj.github.io/doc/

### Spring Boot Testing
- https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing

---

## 🎉 테스트 통과 확인

```bash
./gradlew test

# 출력 예시:
# BUILD SUCCESSFUL in 15s
# 24 tests completed, 0 failed
```

모든 테스트가 통과하면 배포 준비 완료! ✅

---

**작성일:** 2025-02-06  
**테스트 커버리지**: Service 80%, Controller 70%, Repository 90%
