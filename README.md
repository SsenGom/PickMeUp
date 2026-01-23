# PickMeUp

Personal OS + Public Resume 통합 웹 애플리케이션

## 프로젝트 구조

```
pickmeup/
├── frontend/          # React 프론트엔드
├── backend/           # Spring Boot 백엔드
├── docker/            # Docker 설정 파일
├── nginx/             # Nginx 설정
└── docs/              # 프로젝트 문서
```

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Spring Boot 3.2 + Java 21
- **Auth**: Spring Security + JWT
- **Database**: MySQL 8.0 + MongoDB 7.0
- **Realtime**: Redis Streams + WebSocket
- **Infra**: Docker + Nginx

## 실행 방법

### 개발 환경

```bash
# 인프라 실행 (MySQL, MongoDB, Redis)
docker-compose -f docker/docker-compose.dev.yml up -d

# 백엔드 실행
cd backend
./gradlew bootRun

# 프론트엔드 실행
cd frontend
npm install
npm run dev
```

### 프로덕션 환경

```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

## 핵심 기능

### Public (비로그인)
- 이력서/포트폴리오 조회
- Contact 메시지 전송

### Private (로그인)
- 캘린더 (일정/반복 일정)
- Task 관리
- 중요일 관리 + 알림 (D-7/D-1/당일)
- 메시지 인박스 (실시간)
- AI 보조 (요약, 태깅, 주간 리뷰)

## 알림 채널
- 웹 푸시
- 이메일
- 카카오톡 (나에게 보내기)
