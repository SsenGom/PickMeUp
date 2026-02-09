# 📝 TODO - 헤드헌터 모드

## ✅ 완료됨

### Phase 1: 핵심 기능
- [x] User 엔티티 확장
- [x] ResumePick, ContactProposal 엔티티
- [x] RecruiterService, RecruiterController
- [x] ProposalController
- [x] 스와이프 UI (SwipePage)
- [x] 픽 관리 UI (MyPicksPage)
- [x] 받은 제안 UI (ProposalsPage)
- [x] 네비게이션 메뉴 추가
- [x] 타입 정의 (recruiter.ts)
- [x] DB 마이그레이션 SQL
- [x] Swagger 문서화
- [x] 로딩 스켈레톤
- [x] 빈 상태 UI 개선
- [x] 반응형 디자인
- [x] 이메일 템플릿 (EmailTemplates.java)

---

## 🔥 우선순위 높음 (필수)

### 1. 알림 시스템 통합
- [ ] WebSocket 알림 활성화
  - [ ] RecruiterService에서 주석 해제
  - [ ] 프론트엔드 WebSocket 연결
  - [ ] 알림 수신 테스트

### 2. 이메일 발송 구현
- [ ] MessageService에 제안 이메일 메서드 추가
- [ ] EmailTemplates 사용
- [ ] SMTP 설정 확인
- [ ] 이메일 발송 테스트

### 3. 회원가입 UI
- [ ] SignupPage.tsx 생성
- [ ] userType 선택 라디오 버튼
- [ ] 헤드헌터일 때 추가 필드 표시
- [ ] 폼 유효성 검사

### 4. 캐시 설정
- [ ] application.yml에 Redis 캐시 설정
- [ ] @EnableCaching 추가
- [ ] 피드 캐시 TTL 설정 (10분)

---

## ⚡ 우선순위 중간 (권장)

### 5. 배치 작업
- [ ] 만료된 제안 자동 처리 배치
  ```java
  @Scheduled(cron = "0 0 2 * * *")  // 매일 새벽 2시
  public void expireProposals() {
      List<ContactProposal> expired = 
          proposalRepository.findExpiredProposals(LocalDateTime.now());
      expired.forEach(ContactProposal::expire);
  }
  ```

### 6. 통계 차트
- [ ] Chart.js or Recharts 설치
- [ ] 헤드헌터 통계 페이지
  - [ ] 픽/제안 추이 그래프
  - [ ] 성공률 파이 차트
  - [ ] 분야별 분석

### 7. 필터링 기능
- [ ] SwipePage에 필터 추가
  - [ ] 기술 스택 선택
  - [ ] 경력 범위 (0-3년, 3-5년, 5년+)
  - [ ] 지역 선택
  - [ ] 학력

### 8. 검색 기능
- [ ] MyPicksPage에 검색바 추가
- [ ] 이름, 기술 스택으로 검색
- [ ] ProposalsPage에도 검색 추가

---

## 🎨 우선순위 낮음 (선택)

### 9. 애니메이션 개선
- [ ] react-spring 설치
- [ ] 스와이프 제스처 추가
- [ ] 카드 스택 애니메이션
- [ ] 좌우 드래그 인터랙션

### 10. AI 추천
- [ ] 헤드헌터의 픽 패턴 분석
- [ ] 맞춤형 이력서 추천
- [ ] 유사한 인재 추천

### 11. 프리미엄 기능
- [ ] 무제한 픽 (유료)
- [ ] 우선 노출 (유료)
- [ ] 통계 다운로드

### 12. 추가 기능
- [ ] 픽 메모 편집
- [ ] 태그 기능 (픽한 사람에게 태그 붙이기)
- [ ] 즐겨찾기/북마크
- [ ] 픽 공유 (팀원에게 공유)

---

## 🐛 버그 & 개선

### 알려진 이슈
없음! 🎉

### 성능 개선
- [ ] Resume 쿼리 N+1 문제 확인
- [ ] 피드 조회 쿼리 최적화
- [ ] 인덱스 추가 검토

### 보안 강화
- [ ] Rate Limiting (스와이프 제한)
- [ ] CSRF 토큰
- [ ] XSS 방어
- [ ] SQL Injection 방어 (JPA 사용하므로 안전)

---

## 📚 문서화

- [ ] API 문서 완성 (Swagger)
- [ ] 사용자 가이드 작성
- [ ] 관리자 가이드 작성
- [ ] 트러블슈팅 가이드

---

## 🧪 테스트

### 단위 테스트
- [ ] RecruiterService 테스트
- [ ] RecruiterController 테스트
- [ ] Repository 테스트

### 통합 테스트
- [ ] 전체 플로우 테스트
  - [ ] 픽 → 제안 → 수락 → 채팅

### E2E 테스트
- [ ] Cypress or Playwright
- [ ] 핵심 시나리오 자동화

---

## 📊 모니터링

- [ ] 픽 성공률 모니터링
- [ ] 제안 수락률 모니터링
- [ ] 사용자 행동 분석
- [ ] 에러 로깅

---

**작성일:** 2025-02-06  
**업데이트:** 계속 업데이트 예정
