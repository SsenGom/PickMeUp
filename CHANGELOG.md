# 변경 로그

## [2025-02-06] - 헤드헌터 모드 추가 🎯

### ✨ 신규 기능: "Pick Me Up" - Tinder for Jobs

#### 💼 헤드헌터 기능 (완전 신규)
- **이력서 스와이프 피드**: 공개 이력서를 Tinder처럼 좌우 스와이프
  - 공개 설정된 이력서만 표시
  - 이미 픽한 이력서 자동 제외
  - 프로필 이미지, 기술 스택, 경력 요약 표시
  - 조회수, 픽 받은 횟수 뱃지

- **Pick 시스템**: 마음에 드는 인재 저장
  - 중복 픽 방지
  - 메모 기능 (예: "개발 경력 좋음")
  - 상태 관리 (PICKED, CONTACTED, REJECTED)
  - 픽 취소 가능

- **컨택 제안**: 구직자에게 면접 제안 발송
  - 제안서 작성 (포지션, 급여, 근무지, 메시지)
  - 회사명 자동 입력 (헤드헌터 프로필 기반)
  - 30일 만료 시스템
  - 이메일 + 앱 알림 발송

- **1:1 채팅**: 제안 수락 시 자동 채팅방 생성
  - 기존 Message 시스템 재활용
  - 시스템 초기 메시지 자동 생성
  - 헤드헌터 ↔ 구직자 직접 소통

#### 📊 통계 시스템
- **헤드헌터 통계**:
  - 총 픽 수, 상태별 픽 수
  - 총 제안 수, 상태별 제안 수
  - 제안 수락률, 응답률

- **구직자 통계** (이력서 픽 받은 통계):
  - 총 픽 수, 이번 주/이번 달 픽 수
  - 받은 제안 수
  - 최근 픽한 회사들 (익명 처리)

#### 🔔 알림 시스템
- **구직자에게**:
  - 누군가 픽했을 때 알림
  - 면접 제안 도착 시 이메일 + 앱 알림
  
- **헤드헌터에게**:
  - 제안 수락 시 알림
  - 제안 거절 시 알림

---

### 🗄️ 데이터베이스 설계

#### 새 테이블
1. **resume_picks**: 이력서 픽 기록
   - recruiter_id, resume_id, memo, status, picked_at

2. **contact_proposals**: 컨택 제안
   - recruiter_id, job_seeker_id, pick_id
   - company_name, position, salary_range, location, work_type, message
   - status (PENDING, ACCEPTED, REJECTED, EXPIRED)
   - proposed_at, responded_at, expires_at, thread_id

#### User 테이블 확장
- user_type (JOB_SEEKER, RECRUITER)
- company_name, position, department, business_email (헤드헌터용)

---

### 🎨 프론트엔드

#### 신규 페이지
1. **SwipePage.tsx**: 이력서 스와이프 (헤드헌터)
   - Tinder 스타일 카드 UI
   - 좌우 버튼 (Pass / Pick)
   - 프로그레스 표시

2. **MyPicksPage.tsx**: 내가 픽한 사람들 (헤드헌터)
   - 그리드 레이아웃
   - 상태별 필터 (전체/픽만 함/제안 보냄/패스)
   - 제안 모달

3. **ProposalsPage.tsx**: 받은 제안 (구직자)
   - 리스트 레이아웃
   - 수락/거절 버튼
   - 채팅방 바로가기

#### 라우팅
- `/recruiter/swipe` - 스와이프 페이지
- `/recruiter/picks` - 픽한 사람들
- `/proposals` - 받은 제안

---

### 🔧 백엔드 API

#### RecruiterController
- `GET /api/recruiter/feed` - 이력서 피드
- `POST /api/recruiter/pick/{resumeId}` - Pick
- `GET /api/recruiter/picks` - 픽 목록
- `POST /api/recruiter/proposal/{resumeId}` - 제안 발송
- `GET /api/recruiter/proposals` - 내가 보낸 제안
- `GET /api/recruiter/statistics` - 헤드헌터 통계

#### ProposalController
- `GET /api/proposals` - 받은 제안
- `POST /api/proposals/{id}/accept` - 수락
- `POST /api/proposals/{id}/reject` - 거절
- `GET /api/proposals/pick-stats` - 픽 통계

---

### 📝 개인정보 보호

- 헤드헌터 개인정보는 구직자에게 숨김
- 제안 알림: "카카오에서 연락이 왔습니다" (개인명 X)
- 픽 통계: 회사명만 표시 (담당자명 X)

---

## [2025-02-04] - 주요 기능 추가

### ✨ 새로운 기능

#### 📊 취업 활동 통계
- **전체 통계 요약**: 총 지원 수, 진행 중, 완료된 지원, 첫 지원일/최근 지원일
- **상태별 통계**: 관심/지원/서류 합격/면접/최종 합격/불합격 건수 및 비율
- **월별 추이**: 최근 6개월 지원 현황 그래프
- **합격률 분석**: 서류 합격률, 면접 합격률, 전체 합격률
- **기간별 필터**: 전체/최근 3개월/6개월/1년

**엔드포인트**
```
GET /api/jobs/statistics?startDate=2024-01-01&endDate=2025-02-04
```

**프론트엔드**
- `/statistics` 페이지 추가
- 차트 및 시각화 컴포넌트

---

#### ✉️ HTML 이메일 템플릿
- **기존**: 일반 텍스트 이메일
- **개선**: 반응형 HTML 템플릿
  - 그라데이션 헤더
  - 메시지 박스 디자인
  - CTA 버튼 (이력서 보러가기)
  - 푸터 정보

**적용 위치**
- 이력서 컨택 메시지 답장 시 자동 발송
- `MessageService.sendReplyEmail()`

---

#### 📱 카카오톡/SMS 알림 서비스

**1. 카카오톡 알림톡** (`KakaoNotificationService`)
- 신규 메시지 알림
- 면접 일정 알림 (D-1)
- 서류 마감 알림

**2. SMS 알림** (`SmsNotificationService`)
- NCP SENS 연동
- 카카오톡 미설정 시 대체 수단
- 동일한 알림 기능

**설정**
```yaml
# application.yml
kakao:
  sender-key: ${KAKAO_SENDER_KEY}
  notification:
    enabled: ${KAKAO_NOTIFICATION_ENABLED:false}

ncp:
  sens:
    service-id: ${NCP_SENS_SERVICE_ID}
    access-key: ${NCP_SENS_ACCESS_KEY}
    secret-key: ${NCP_SENS_SECRET_KEY}
    from-number: ${NCP_SENS_FROM_NUMBER}
    enabled: ${NCP_SENS_ENABLED:false}
```

---

### 🔧 개선 사항

#### 백엔드
1. **Repository 메서드 추가**
   - `JobApplicationRepository`: 통계 쿼리 메서드 12개 추가
   - 월별 집계, 상태별 카운트, 기간별 필터링

2. **Service 레이어**
   - `JobApplicationService.getStatistics()` 구현
   - `MessageService`: 알림 서비스 통합

3. **DTO 추가**
   - `JobStatisticsDto.java`: 통계 응답 모델
   - 7개의 중첩 클래스 (OverallStats, StatusStats, MonthlyTrend 등)

#### 프론트엔드
1. **통계 페이지**
   - `StatisticsPage.tsx`: 차트 및 시각화
   - 반응형 디자인
   - 기간별 필터

2. **라우팅**
   - `/statistics` 경로 추가
   - `App.tsx` 업데이트

---

### 📝 문서화
- `README.md` 업데이트: 새 기능 추가
- `CHANGELOG.md` 생성: 변경 이력 관리
- `.env.example` 업데이트: 카카오톡/SMS 설정 추가

---

### 🎯 다음 단계 (TODO)

#### UI 개선
- [ ] 취업 관리 칸반 보드 (드래그 앤 드롭)
- [ ] 대시보드 강화 (위젯, 차트)
- [ ] 메시지 Inbox Gmail 스타일 UI

#### 기능 추가
- [ ] 평균 소요 시간 계산 (지원→서류→면접→최종)
- [ ] 직무별 통계
- [ ] 엑셀 내보내기
- [ ] 공유 기능 (통계 페이지)

#### 알림
- [ ] 스케줄러 추가 (매일 오전 9시 D-day 알림)
- [ ] 푸시 알림 (브라우저)
- [ ] 이메일 다이제스트 (주간 요약)

---

### 🐛 버그 수정
- ✅ 프로필 이미지 로딩: Static 리소스 핸들러 확인 완료
- ✅ WebConfig CORS 설정 확인

---

### 📌 참고 사항

#### 카카오톡 알림톡 설정
1. 카카오 비즈니스 계정 생성
2. 발신 프로필 등록 및 승인
3. 템플릿 등록 (사전 승인 필요)
4. Sender Key 발급

#### NCP SENS SMS 설정
1. Naver Cloud Platform 가입
2. SENS 프로젝트 생성
3. 발신번호 등록 및 승인
4. Access Key, Secret Key 발급

#### SMTP 이메일 설정 (Gmail)
1. Gmail 계정 → 2단계 인증 활성화
2. 앱 비밀번호 생성
3. `MAIL_USERNAME`, `MAIL_PASSWORD` 설정

---

## 기술 부채
- [ ] Redis 활용 최적화 (현재 미사용)
- [ ] MongoDB AI 대화 저장 구조 개선
- [ ] 파일 업로드 S3 마이그레이션
- [ ] 테스트 코드 작성

---

## 성능 최적화
- [ ] N+1 쿼리 해결 (JPA fetch join)
- [ ] 캐싱 전략 (Redis)
- [ ] 인덱스 최적화
- [ ] 페이지네이션 개선

---

**작성자**: 순대왕자  
**날짜**: 2025-02-04
