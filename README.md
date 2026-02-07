# PickMeUp 🚀

> 취업 준비생을 위한 올인원 개인 생산성 플랫폼

캘린더, 할 일 관리, 이력서, 채용공고 관리, AI 면접 준비까지 취업 준비에 필요한 모든 기능을 하나의 플랫폼에서 제공합니다.

---

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [아키텍처](#-아키텍처)
- [API 문서](#-api-문서)

---

## ✨ 주요 기능

### 📅 캘린더
- 일정 등록/수정/삭제
- 반복 일정 지원 (매일/매주/매월/매년)
- 드래그 앤 드롭으로 일정 이동
- 월간/주간 뷰

### ✅ 할 일 관리
- 할 일 CRUD
- 우선순위 설정 (긴급/높음/보통/낮음)
- 상태 관리 (할 일/진행 중/완료/취소)
- 마감일 및 마감 알림
- 카테고리 분류

### 📄 이력서
- 온라인 이력서 작성 및 공개
- 경력, 프로젝트, 기술 스택 관리
- 공개 URL 슬러그 설정 (`/resume/your-name`)
- 실시간 미리보기

### 💼 채용공고 관리
- 채용공고 URL 등록 시 자동 파싱 (Jsoup)
- 지원 상태 추적 (준비 중/지원 완료/서류 합격/면접/합격/불합격)
- 마감일 D-day 표시
- AI 면접 질문 생성 (OpenAI GPT)
- **📊 취업 활동 통계**: 월별 지원 현황, 합격률, 상태별 분석

### 🤖 AI 면접 준비
- 이력서 + 채용공고 기반 맞춤 면접 질문 생성
- 기술 면접 / 인성 면접 질문 분리
- 예상 질문 및 모범 답변 제공
- 이미지 OCR을 통한 채용공고 텍스트 추출

### 📬 메시지 (Inbox)
- 외부 연락처 관리
- 메시지 스레드 방식
- WebSocket 실시간 알림
- **✉️ HTML 이메일 템플릿**: 답장 시 이쁜 이메일 발송
- **📱 카카오톡/SMS 알림**: 신규 메시지, 면접 일정, 서류 마감 알림

### 💼 헤드헌터 모드 (신규!)
- **👉 이력서 스와이프**: Tinder처럼 공개 이력서 스와이프
- **❤️ Pick 시스템**: 마음에 드는 인재 저장
- **📧 컨택 제안**: 픽한 인재에게 면접 제안 발송
- **💬 1:1 채팅**: 제안 수락 시 자동 채팅방 생성
- **📊 통계**: 픽/제안 성공률 분석

### 🔔 알림
- 마감일 임박 알림
- 일정 알림
- **신규 픽 알림**: 누군가 나를 픽했을 때
- **제안 알림**: 면접 제안이 왔을 때
- 실시간 WebSocket 푸시

---

## 🛠 기술 스택

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| **Java** | 17 | 메인 언어 |
| **Spring Boot** | 3.2.5 | 웹 프레임워크 |
| **Spring Security** | - | 인증/인가 |
| **Spring Data JPA** | - | ORM |
| **Spring Data MongoDB** | - | NoSQL (AI 대화 기록) |
| **Spring Data Redis** | - | 캐싱, 세션 |
| **Spring WebSocket** | - | 실시간 통신 |
| **JWT (jjwt)** | 0.12.5 | 토큰 인증 |
| **MySQL** | 8.0 | 메인 DB |
| **MongoDB** | 7.0 | AI 대화 저장 |
| **Redis** | 7 | 캐싱 |
| **OpenAI API** | - | AI 면접 준비 |
| **Jsoup** | 1.17.2 | 채용공고 크롤링 |
| **Swagger** | 2.4.0 | API 문서 |

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 18.2 | UI 라이브러리 |
| **TypeScript** | 5.3 | 정적 타입 |
| **Vite** | 5.0 | 빌드 도구 |
| **React Router** | 6.22 | 라우팅 |
| **TanStack Query** | 5.17 | 서버 상태 관리 |
| **Zustand** | 4.5 | 전역 상태 관리 |
| **Tailwind CSS** | 3.4 | 스타일링 |
| **React Hook Form** | 7.49 | 폼 관리 |
| **Zod** | 3.22 | 유효성 검증 |
| **Axios** | 1.6 | HTTP 클라이언트 |
| **STOMP.js** | 7.0 | WebSocket 클라이언트 |
| **Tiptap** | 3.17 | 리치 텍스트 에디터 |

### Infrastructure
| 기술 | 용도 |
|------|------|
| **Docker** | 컨테이너화 |
| **Docker Compose** | 로컬 개발 환경 |
| **Nginx** | 리버스 프록시 |

---

## 📁 프로젝트 구조

```
PickMeUp/
├── backend/                    # Spring Boot 백엔드
│   └── src/main/java/com/pickmeup/
│       ├── PickmeupApplication.java    # 앱 진입점
│       ├── config/             # 설정
│       │   ├── security/       # Spring Security, JWT
│       │   ├── WebConfig.java  # CORS 설정
│       │   └── WebSocketConfig.java
│       ├── controller/         # REST API 컨트롤러
│       ├── service/            # 비즈니스 로직
│       ├── repository/         # 데이터 접근 (JPA, MongoDB)
│       ├── domain/             # Entity (도메인 모델)
│       │   ├── user/           # 사용자
│       │   ├── calendar/       # 캘린더 일정
│       │   ├── task/           # 할 일
│       │   ├── resume/         # 이력서
│       │   ├── job/            # 채용공고
│       │   ├── message/        # 메시지
│       │   └── notification/   # 알림
│       ├── dto/                # 요청/응답 DTO
│       ├── exception/          # 예외 처리
│       │   ├── ErrorCode.java
│       │   ├── BusinessException.java
│       │   └── GlobalExceptionHandler.java
│       └── aop/                # AOP (로깅, 성능 측정)
│
├── frontend/                   # React 프론트엔드
│   └── src/
│       ├── main.tsx            # 앱 진입점
│       ├── App.tsx             # 라우팅 설정
│       ├── pages/              # 페이지 컴포넌트
│       │   ├── auth/           # 로그인, 회원가입
│       │   ├── private/        # 인증 필요 페이지
│       │   │   ├── DashboardPage.tsx
│       │   │   ├── CalendarPage.tsx
│       │   │   ├── TasksPage.tsx
│       │   │   ├── JobsPage.tsx
│       │   │   ├── InboxPage.tsx
│       │   │   └── ResumeEditPage.tsx
│       │   └── public/         # 공개 페이지
│       │       └── ResumePage.tsx
│       ├── components/         # 재사용 컴포넌트
│       ├── layouts/            # 레이아웃
│       │   ├── PrivateLayout.tsx
│       │   └── PublicLayout.tsx
│       ├── stores/             # Zustand 상태 관리
│       │   └── authStore.ts
│       ├── lib/                # 유틸리티
│       │   ├── api.ts          # Axios 인스턴스
│       │   └── utils.ts
│       └── types/              # TypeScript 타입
│           └── index.ts
│
├── docker/                     # Docker 설정
│   ├── docker-compose.dev.yml  # 개발 환경
│   └── docker-compose.prod.yml # 프로덕션 환경
│
├── docs/                       # 문서
│   └── architecture.html       # 아키텍처 다이어그램
│
└── nginx/                      # Nginx 설정
    └── nginx.conf
```

---

## 🚀 시작하기

### 사전 요구사항

- **Java 17+**
- **Node.js 18+**
- **Docker & Docker Compose**

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/PickMeUp.git
cd PickMeUp
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일 수정:
```env
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_DATABASE=pickmeup
MYSQL_USER=pickmeup
MYSQL_PASSWORD=pickmeup123

# MongoDB
MONGODB_HOST=localhost
MONGODB_PORT=27017

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key-at-least-256-bits

# OpenAI (AI 기능)
OPENAI_API_KEY=sk-your-openai-api-key

# 카카오톡 알림 (선택)
KAKAO_SENDER_KEY=your-kakao-sender-key
KAKAO_NOTIFICATION_ENABLED=false

# SMS 알림 (선택 - NCP SENS)
NCP_SENS_SERVICE_ID=your-service-id
NCP_SENS_ACCESS_KEY=your-access-key
NCP_SENS_SECRET_KEY=your-secret-key
NCP_SENS_FROM_NUMBER=01012345678
NCP_SENS_ENABLED=false

# SMTP 이메일 (선택)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENABLED=false
```

### 3. Docker로 인프라 실행

```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

실행되는 서비스:
- **MySQL**: localhost:3307
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### 4. Backend 실행

```bash
cd backend
./gradlew bootRun
```

- 서버: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

### 5. Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

- 앱: http://localhost:3000

---

## 🏗 아키텍처

### 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (Browser)                       │
│                    React + TypeScript                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Vite Dev Server                          │
│              (Proxy: /api → Backend:8080)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot Backend                       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Controller│→│ Service  │→│Repository│→│ Database │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Security Filter Chain                  │     │
│  │  Request → JwtFilter → Auth → Controller → Response │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│                                                              │
│    ┌─────────┐      ┌─────────┐      ┌─────────┐           │
│    │  MySQL  │      │ MongoDB │      │  Redis  │           │
│    │  :3307  │      │ :27017  │      │  :6379  │           │
│    └─────────┘      └─────────┘      └─────────┘           │
│    (메인 DB)        (AI 대화)         (캐싱)                │
└─────────────────────────────────────────────────────────────┘
```

### Backend 계층 구조

```
┌─────────────────────────────────────────────────────────────┐
│                      Controller Layer                        │
│   HTTP 요청 수신 → 파라미터 검증 → Service 호출 → 응답 반환   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Service Layer                          │
│        비즈니스 로직 → 트랜잭션 관리 → DTO ↔ Entity 변환      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Repository Layer                        │
│            JPA Repository → 쿼리 메서드 → DB 접근            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Domain Layer                           │
│              Entity (JPA) → DB 테이블 매핑                   │
└─────────────────────────────────────────────────────────────┘
```

### 인증 흐름

```
[회원가입/로그인]
Client → POST /api/auth/login → AuthController → AuthService
                                                      │
                                    ┌─────────────────┴─────────────────┐
                                    ▼                                   ▼
                              비밀번호 검증                      JWT 토큰 생성
                              (BCrypt)                     (Access + Refresh)
                                    │                                   │
                                    └─────────────────┬─────────────────┘
                                                      ▼
                                              Response (Token)

[API 호출]
Client → GET /api/tasks + Header: "Authorization: Bearer {token}"
              │
              ▼
    JwtAuthenticationFilter
              │
              ├─ 토큰 추출 ("Bearer " 제거)
              ├─ 토큰 검증 (서명, 만료)
              ├─ userId 추출
              ├─ User 조회
              └─ SecurityContext에 저장
              │
              ▼
        Controller (@CurrentUser User user)
```

---

## 📖 API 문서

### Swagger UI

서버 실행 후 접속: http://localhost:8080/swagger-ui.html

### 주요 API

#### 인증
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/refresh` | 토큰 갱신 |

#### 캘린더
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/calendar/events` | 일정 목록 조회 |
| POST | `/api/calendar/events` | 일정 생성 |
| PUT | `/api/calendar/events/{id}` | 일정 수정 |
| DELETE | `/api/calendar/events/{id}` | 일정 삭제 |

#### 할 일
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/tasks` | 할 일 목록 |
| POST | `/api/tasks` | 할 일 생성 |
| PUT | `/api/tasks/{id}` | 할 일 수정 |
| PATCH | `/api/tasks/{id}/status` | 상태 변경 |
| DELETE | `/api/tasks/{id}` | 할 일 삭제 |

#### 이력서
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/resume` | 내 이력서 조회 |
| PUT | `/api/resume` | 이력서 수정 |
| GET | `/api/resume/public/{slug}` | 공개 이력서 조회 |

#### 채용공고
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/jobs` | 채용공고 목록 |
| POST | `/api/jobs` | 채용공고 등록 |
| GET | `/api/jobs/statistics` | **📊 취업 활동 통계** |
| POST | `/api/jobs/{id}/parse` | URL 자동 파싱 |
| POST | `/api/jobs/{id}/interview-prep` | AI 면접 준비 |

#### 메시지
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/messages/threads` | 메시지 스레드 목록 |
| GET | `/api/messages/threads/{id}` | 스레드 상세 |
| POST | `/api/messages/threads/{id}/reply` | **✉️ 답장 (HTML 이메일)** |

#### 헤드헌터 (신규!)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/recruiter/feed` | **👉 이력서 스와이프 피드** |
| POST | `/api/recruiter/pick/{resumeId}` | **❤️ 이력서 Pick** |
| GET | `/api/recruiter/picks` | 내가 픽한 사람들 |
| POST | `/api/recruiter/proposal/{resumeId}` | **📧 컨택 제안 보내기** |
| GET | `/api/recruiter/proposals` | 내가 보낸 제안 목록 |
| GET | `/api/recruiter/statistics` | 헤드헌터 통계 |

#### 제안 (구직자용)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/proposals` | **받은 면접 제안** |
| POST | `/api/proposals/{id}/accept` | 제안 수락 |
| POST | `/api/proposals/{id}/reject` | 제안 거절 |
| GET | `/api/proposals/pick-stats` | **내 이력서 픽 통계** |

---

## 📝 라이선스

MIT License

---

## 👨‍💻 개발자

**순대왕자** - [GitHub](https://github.com/your-username)
