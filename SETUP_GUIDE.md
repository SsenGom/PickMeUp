# 🚀 PickMeUp 헤드헌터 모드 설정 가이드

## 📋 구현 완료 체크리스트

### ✅ 백엔드
- [x] User 엔티티 확장 (userType, 헤드헌터 필드)
- [x] ResumePick 엔티티
- [x] ContactProposal 엔티티
- [x] Repository 계층 (2개 신규)
- [x] RecruiterService (완전 신규)
- [x] RecruiterController (완전 신규)
- [x] ProposalController (완전 신규)
- [x] RecruiterDto (13개 클래스)
- [x] AuthService 수정 (회원가입 시 userType 선택)
- [x] MessageService 확장 (채팅방 생성)

### ✅ 프론트엔드
- [x] SwipePage (이력서 스와이프)
- [x] MyPicksPage (픽 관리)
- [x] ProposalsPage (받은 제안)
- [x] 타입 정의 (recruiter.ts)
- [x] 라우팅 추가

### ✅ 문서화
- [x] README.md 업데이트
- [x] CHANGELOG.md
- [x] IMPLEMENTATION_SUMMARY.md
- [x] SETUP_GUIDE.md (이 파일)

---

## 🔧 설정 방법

### 1. 데이터베이스 초기화

**옵션 A: JPA 자동 스키마 생성 (추천)**

`application.yml`에 이미 설정되어 있으면 애플리케이션 실행 시 자동으로 테이블 생성됩니다:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # 또는 create
```

**옵션 B: 수동 마이그레이션**

`backend/src/main/resources/db/migration/V2__add_recruiter_features.sql` 파일을 MySQL에서 직접 실행:

```bash
mysql -u root -p pickmeup < backend/src/main/resources/db/migration/V2__add_recruiter_features.sql
```

---

### 2. 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

**확인사항:**
- 서버 시작 로그에서 테이블 생성 확인
- `users` 테이블에 `user_type`, `company_name` 등 새 컬럼 추가 확인
- `resume_picks`, `contact_proposals` 테이블 생성 확인

---

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

---

### 4. 테스트 시나리오

#### 시나리오 1: 헤드헌터 회원가입

**API 요청 예시:**
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@kakao.com",
    "password": "password123",
    "name": "김채용",
    "userType": "RECRUITER",
    "companyName": "카카오",
    "position": "채용 담당자",
    "department": "인사팀"
  }'
```

**응답:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "recruiter@kakao.com",
      "name": "김채용",
      "userType": "RECRUITER",
      "companyName": "카카오"
    }
  }
}
```

#### 시나리오 2: 구직자 회원가입

**API 요청:**
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jobseeker@gmail.com",
    "password": "password123",
    "name": "홍길동",
    "userType": "JOB_SEEKER"
  }'
```

또는 `userType`을 생략하면 자동으로 `JOB_SEEKER`:
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jobseeker@gmail.com",
    "password": "password123",
    "name": "홍길동"
  }'
```

#### 시나리오 3: 이력서 스와이프

1. 헤드헌터로 로그인
2. http://localhost:3000/recruiter/swipe 접속
3. 공개 이력서 스와이프
4. Pick 또는 Pass 선택

**API 호출:**
```bash
# 이력서 피드 조회
curl -X GET http://localhost:8080/api/recruiter/feed?limit=20 \
  -H "Authorization: Bearer {accessToken}"

# Pick
curl -X POST http://localhost:8080/api/recruiter/pick/1 \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{"memo": "백엔드 경력 좋음"}'
```

#### 시나리오 4: 제안 발송

1. http://localhost:3000/recruiter/picks 접속
2. 픽한 사람 중 한 명 선택
3. "제안하기" 클릭
4. 제안서 작성 및 발송

**API 호출:**
```bash
curl -X POST http://localhost:8080/api/recruiter/proposal/1 \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "백엔드 개발자",
    "salaryRange": "6000-8000만원",
    "location": "서울 강남",
    "workType": "정규직",
    "message": "안녕하세요! 카카오에서 연락드립니다..."
  }'
```

#### 시나리오 5: 제안 수락

1. 구직자로 로그인
2. http://localhost:3000/proposals 접속
3. 받은 제안 확인
4. "관심있어요" 클릭

**API 호출:**
```bash
# 받은 제안 조회
curl -X GET http://localhost:8080/api/proposals \
  -H "Authorization: Bearer {accessToken}"

# 수락
curl -X POST http://localhost:8080/api/proposals/1/accept \
  -H "Authorization: Bearer {accessToken}"
```

---

## 🔍 트러블슈팅

### 문제 1: 테이블이 생성되지 않음

**확인:**
```sql
SHOW TABLES LIKE '%pick%';
SHOW TABLES LIKE '%proposal%';
```

**해결:**
1. `application.yml`에서 `spring.jpa.hibernate.ddl-auto: update` 확인
2. 애플리케이션 재시작
3. 로그에서 DDL 생성 확인

### 문제 2: userType 컬럼이 없음

**확인:**
```sql
DESCRIBE users;
```

**해결:**
```sql
ALTER TABLE users 
ADD COLUMN user_type VARCHAR(20) NOT NULL DEFAULT 'JOB_SEEKER';
```

### 문제 3: 외래키 제약조건 오류

**확인:**
```sql
SELECT * FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_NAME IN ('resume_picks', 'contact_proposals');
```

**해결:**
테이블 삭제 후 재생성:
```sql
DROP TABLE IF EXISTS contact_proposals;
DROP TABLE IF EXISTS resume_picks;
-- 애플리케이션 재시작하면 자동 생성
```

### 문제 4: 공개 이력서가 안 보임

**확인:**
```sql
SELECT id, title, is_public FROM resumes WHERE is_public = 1;
```

**해결:**
구직자 계정으로 로그인 → 이력서 편집 → "공개" 체크

---

## 📊 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  profile_image_url VARCHAR(500),
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  kakao_id VARCHAR(255),
  kakao_access_token VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 헤드헌터 모드 추가
  user_type VARCHAR(20) NOT NULL DEFAULT 'JOB_SEEKER',
  company_name VARCHAR(100),
  position VARCHAR(100),
  department VARCHAR(100),
  business_email VARCHAR(100),
  
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### resume_picks 테이블
```sql
CREATE TABLE resume_picks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  recruiter_id BIGINT NOT NULL,
  resume_id BIGINT NOT NULL,
  memo VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'PICKED',
  picked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  contacted_at DATETIME,
  contact_method VARCHAR(50),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (recruiter_id) REFERENCES users(id),
  FOREIGN KEY (resume_id) REFERENCES resumes(id),
  UNIQUE KEY (recruiter_id, resume_id)
);
```

### contact_proposals 테이블
```sql
CREATE TABLE contact_proposals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  recruiter_id BIGINT NOT NULL,
  job_seeker_id BIGINT NOT NULL,
  pick_id BIGINT,
  
  company_name VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  salary_range VARCHAR(100),
  location VARCHAR(100),
  work_type VARCHAR(50),
  message TEXT NOT NULL,
  
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  proposed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  response_message VARCHAR(1000),
  expires_at DATETIME,
  thread_id BIGINT,
  
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (recruiter_id) REFERENCES users(id),
  FOREIGN KEY (job_seeker_id) REFERENCES users(id),
  FOREIGN KEY (pick_id) REFERENCES resume_picks(id),
  FOREIGN KEY (thread_id) REFERENCES threads(id)
);
```

---

## 🎯 다음 단계

### 필수 작업
1. [ ] 프론트엔드 회원가입 페이지에서 userType 선택 UI 추가
2. [ ] 네비게이션 메뉴에 헤드헌터 링크 추가
3. [ ] 알림 시스템 통합 (이메일, 웹소켓)
4. [ ] 배치 작업 (만료된 제안 자동 처리)

### 선택 작업
1. [ ] 스와이프 애니메이션 개선 (react-spring)
2. [ ] 필터링 기능 (기술 스택, 경력, 지역)
3. [ ] 추천 알고리즘
4. [ ] 통계 차트/그래프
5. [ ] 프리미엄 기능

---

**작성일:** 2025-02-06  
**버전:** 1.0.0
