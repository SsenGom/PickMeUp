# 🎭 더미 데이터 사용 가이드

## ✅ 생성된 계정

### 헤드헌터 계정 (3개)
| 이메일 | 비밀번호 | 이름 | 회사 | 직급 |
|--------|----------|------|------|------|
| recruiter1@kakao.com | test1234 | 김채용 | 카카오 | 인사팀장 |
| recruiter2@naver.com | test1234 | 이채용 | 네이버 | HR 매니저 |
| recruiter3@toss.im | test1234 | 박채용 | 토스 | 채용 담당자 |

### 구직자 계정 (5개)
| 이메일 | 비밀번호 | 이름 | 경력 | 주요 스킬 |
|--------|----------|------|------|-----------|
| backend1@gmail.com | test1234 | 홍길동 | 3년 (쿠팡) | Java, Spring Boot, AWS |
| frontend1@gmail.com | test1234 | 김영희 | 2년 (라인) | React, TypeScript, Next.js |
| fullstack1@gmail.com | test1234 | 박철수 | 4년 (배민) | Node.js, React, MongoDB |
| devops1@gmail.com | test1234 | 최민수 | 5년 (당근) | Kubernetes, AWS, Terraform |
| junior1@gmail.com | test1234 | 이수진 | 신입 | Python, JavaScript, Git |

---

## 🚀 헤드헌터 모드 사용하기

### 1단계: 헤드헌터 로그인
```
http://localhost:3000/login

이메일: recruiter1@kakao.com
비밀번호: test1234
```

### 2단계: 스와이프 페이지 접속
```
http://localhost:3000/recruiter/swipe

📱 Tinder 스타일 이력서 카드
- 프로필 이미지
- 이름, 경력, 학력
- 기술 스택 (태그)
- 주요 프로젝트
```

**기능**:
- 👍 **Pick** 버튼: 관심 있는 인재 저장
- 👎 **Pass** 버튼: 다음 이력서

### 3단계: 픽한 사람들 확인
```
http://localhost:3000/recruiter/picks

📋 픽한 인재 목록 (프로필 카드)
```

**기능**:
- 상태별 필터링 (전체/픽만/제안보냄/패스)
- **제안하기** 버튼: 면접 제안 모달
- **채팅하기** 버튼: 1:1 메시지

### 4단계: 면접 제안하기
```
픽한 사람 카드 → "제안하기" 버튼 클릭

모달 입력:
- 포지션: "시니어 백엔드 개발자"
- 연봉: "7천만원~9천만원"
- 근무지: "판교"
- 근무 형태: "하이브리드"
- 메시지: "함께 성장할 시니어 개발자를 찾습니다!"
```

---

## 🎯 구직자 모드 사용하기

### 1단계: 구직자 로그인
```
http://localhost:3000/login

이메일: backend1@gmail.com
비밀번호: test1234
```

### 2단계: 받은 제안 확인
```
http://localhost:3000/proposals

📨 헤드헌터가 보낸 제안 목록
```

**기능**:
- 제안 상세 확인
- ✅ **수락** 버튼: 채팅방 생성
- ❌ **거절** 버튼: 거절 사유 입력

---

## 🔄 전체 플로우 테스트

### 시나리오: 카카오가 홍길동 채용

**Step 1: 헤드헌터 로그인**
```
로그인: recruiter1@kakao.com / test1234
```

**Step 2: 이력서 스와이프**
```
/recruiter/swipe 접속
→ 홍길동 카드 확인
→ "Pick" 버튼 클릭
```

**Step 3: 픽 목록에서 제안**
```
/recruiter/picks 접속
→ 홍길동 카드 찾기
→ "제안하기" 버튼
→ 포지션/연봉 입력 후 제출
```

**Step 4: 구직자 로그인**
```
로그아웃 → backend1@gmail.com / test1234 로그인
```

**Step 5: 제안 확인 및 수락**
```
/proposals 접속
→ 카카오 제안 확인
→ "수락" 버튼 클릭
```

**Step 6: 1:1 채팅**
```
/inbox 접속
→ 카카오 채팅방 생성됨!
```

---

## 🗂️ 데이터 구조

### 이력서 5개
```
1. 홍길동 - 백엔드 3년차 (쿠팡)
   스킬: Java, Spring Boot, MySQL, Redis, AWS
   프로젝트: 대용량 트래픽 처리 시스템
   
2. 김영희 - 프론트엔드 2년차 (라인)
   스킬: React, TypeScript, Tailwind CSS, Next.js
   프로젝트: 사내 디자인 시스템
   
3. 박철수 - 풀스택 4년차 (배민)
   스킬: Node.js, React, MongoDB, Docker
   프로젝트: 실시간 주문 관리 시스템
   
4. 최민수 - DevOps 5년차 (당근)
   스킬: Kubernetes, AWS, Terraform, Jenkins
   
5. 이수진 - 신입
   스킬: Python, JavaScript, Git
```

---

## 🎨 UI 확인 포인트

### 스와이프 페이지
- ✅ 카드 UI (그림자, 둥근 모서리)
- ✅ 프로필 이미지 (원형)
- ✅ 기술 스택 태그 (색상별)
- ✅ Pick/Pass 버튼 (초록/빨강)
- ✅ 로딩 스켈레톤 (다음 카드 로딩 시)

### 픽 목록 페이지
- ✅ 그리드 레이아웃 (반응형)
- ✅ 프로필 카드 (호버 효과)
- ✅ 상태 필터 (탭)
- ✅ 제안하기 모달
- ✅ 빈 상태 메시지

### 제안 페이지
- ✅ 리스트 UI
- ✅ 회사 정보 표시
- ✅ 수락/거절 버튼
- ✅ 상태별 필터

---

## 🔧 트러블슈팅

### 데이터가 안 보여요
```bash
# 1. 백엔드 로그 확인
./gradlew bootRun

# 로그에서 "data.sql" 실행 확인

# 2. DB 직접 확인
mysql -u pickmeup -p pickmeup
SELECT * FROM users;
SELECT * FROM resumes;
```

### 이력서가 스와이프에 안 나와요
```sql
-- is_public = true 확인
SELECT id, title, is_public FROM resumes;

-- false면 수동으로 변경
UPDATE resumes SET is_public = true WHERE id = 1;
```

### 비밀번호 안 맞아요
```
비밀번호: test1234

BCrypt 해시: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

만약 안 되면 회원가입으로 새 계정 생성!
```

---

## 📸 스크린샷 예시

### 스와이프 페이지
```
┌─────────────────────────────┐
│   🧑 홍길동                  │
│   3년차 백엔드 개발자        │
│                             │
│   🏢 쿠팡                    │
│   🎓 서울대 컴퓨터공학       │
│                             │
│   💻 Java  Spring  AWS      │
│                             │
│  [  ❌ Pass  ] [  ✅ Pick  ]│
└─────────────────────────────┘
```

### 픽 목록 페이지
```
┌──────┐ ┌──────┐ ┌──────┐
│ 홍길동 │ │ 김영희 │ │ 박철수 │
│ 3년차 │ │ 2년차 │ │ 4년차 │
│[제안] │ │[제안] │ │[제안] │
└──────┘ └──────┘ └──────┘
```

---

## 🎉 즐기세요!

더미 데이터로 모든 기능을 테스트해보세요!

**문제 발생 시**: 
- 백엔드 로그 확인
- MySQL 데이터 확인
- 브라우저 콘솔 확인

**작성일**: 2025-02-07
