# 🚀 배포 가이드

## 📋 목차
1. [사전 준비](#사전-준비)
2. [로컬 개발 환경](#로컬-개발-환경)
3. [개발 서버 배포](#개발-서버-배포)
4. [프로덕션 배포](#프로덕션-배포)
5. [트러블슈팅](#트러블슈팅)

---

## 사전 준비

### 필수 도구 설치
```bash
# Docker & Docker Compose
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Git
sudo apt-get install git

# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Java 17
sudo apt-get install openjdk-17-jdk
```

### GitHub Secrets 설정
```
Settings > Secrets and variables > Actions

필수 Secrets:
- DOCKER_USERNAME
- DOCKER_PASSWORD
- PRODUCTION_HOST
- PRODUCTION_USER
- SSH_PRIVATE_KEY
- MYSQL_ROOT_PASSWORD
- MYSQL_PASSWORD
- REDIS_PASSWORD
- JWT_SECRET
- OPENAI_API_KEY
- SMTP_USERNAME
- SMTP_PASSWORD
- SLACK_WEBHOOK (선택)
```

---

## 로컬 개발 환경

### 1. 저장소 클론
```bash
git clone https://github.com/your-org/pickmeup.git
cd pickmeup
```

### 2. 환경변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
nano .env
```

### 3. Docker Compose로 실행
```bash
# 전체 실행 (MySQL + Redis + Backend + Frontend)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스만 재시작
docker-compose restart backend
```

### 4. 개별 실행 (개발 중)
```bash
# 백엔드 (Spring Boot)
cd backend
./gradlew bootRun

# 프론트엔드 (Vite)
cd frontend
npm install
npm run dev
```

### 5. 헬스체크
```bash
# 백엔드
curl http://localhost:8080/actuator/health

# 프론트엔드
curl http://localhost:3000

# MySQL
docker exec -it pickmeup-mysql mysql -u pickmeup -p

# Redis
docker exec -it pickmeup-redis redis-cli -a your_password
```

---

## 개발 서버 배포

### 자동 배포 (GitHub Actions)
```bash
# develop 브랜치에 push하면 자동 배포
git checkout develop
git pull origin develop
git merge feature/my-feature
git push origin develop

# GitHub Actions에서 자동 실행:
# 1. 테스트
# 2. 빌드
# 3. Docker 이미지 생성
# 4. 개발 서버 배포
```

### 수동 배포
```bash
# SSH로 개발 서버 접속
ssh user@dev-server

# 최신 코드 받기
cd /app/pickmeup
git pull origin develop

# Docker Compose 재시작
docker-compose pull
docker-compose up -d

# 로그 확인
docker-compose logs -f backend
```

---

## 프로덕션 배포

### 배포 체크리스트

#### 1. 배포 전 (Pre-deployment)
- [ ] develop 브랜치에서 충분히 테스트
- [ ] 모든 CI 테스트 통과
- [ ] DB 마이그레이션 스크립트 준비
- [ ] 환경변수 변경 사항 확인
- [ ] Breaking Change 여부 확인
- [ ] 롤백 계획 수립

#### 2. Release 브랜치 생성
```bash
# develop에서 release 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 버전 정보 업데이트
# - backend/build.gradle
# - frontend/package.json
# - CHANGELOG.md

git add .
git commit -m "chore: v1.2.0 배포 준비"
git push origin release/v1.2.0
```

#### 3. Pull Request 생성
```
GitHub에서 PR 생성:
- Base: main
- Compare: release/v1.2.0
- 리뷰어 지정
- 라벨: release
```

#### 4. 코드 리뷰 & 승인
- 최소 1명 이상의 승인
- CI 테스트 모두 통과
- 최종 QA 완료

#### 5. main에 Merge & Tag 생성
```bash
# PR merge 후
git checkout main
git pull origin main

# 태그 생성
git tag -a v1.2.0 -m "Release v1.2.0: 헤드헌터 모드 추가"
git push origin v1.2.0

# GitHub Actions에서 자동 배포 시작!
```

#### 6. 배포 모니터링
```bash
# GitHub Actions 로그 확인
# Slack 알림 확인

# 서버 헬스체크
curl https://api.pickmeup.com/actuator/health

# 로그 확인
ssh user@prod-server
docker logs pickmeup-backend
docker logs pickmeup-frontend
```

#### 7. 배포 후 (Post-deployment)
- [ ] 프로덕션 서버 헬스체크
- [ ] 주요 기능 수동 테스트
- [ ] 에러 로그 모니터링
- [ ] 사용자 피드백 수집
- [ ] release 브랜치 develop에 merge
- [ ] release 브랜치 삭제

---

## 롤백 절차

### 긴급 롤백 (Docker)
```bash
# SSH로 프로덕션 서버 접속
ssh user@prod-server

cd /app/pickmeup

# 이전 버전으로 롤백
export VERSION=v1.1.0
docker-compose pull
docker-compose up -d

# 헬스체크
curl http://localhost:8080/actuator/health
```

### Git 롤백
```bash
# 이전 태그로 롤백
git checkout v1.1.0

# 새 hotfix 브랜치 생성
git checkout -b hotfix/rollback-v1.1.0

# 배포
git tag -a v1.1.1 -m "Rollback to v1.1.0"
git push origin v1.1.1
```

---

## 모니터링

### 로그 확인
```bash
# Docker 로그
docker logs -f pickmeup-backend
docker logs -f pickmeup-frontend

# 특정 시간 이후 로그
docker logs --since 30m pickmeup-backend

# 에러만 필터링
docker logs pickmeup-backend 2>&1 | grep ERROR
```

### 리소스 모니터링
```bash
# Docker 리소스 사용량
docker stats

# 디스크 사용량
df -h

# 메모리 사용량
free -h
```

### 데이터베이스 백업
```bash
# MySQL 백업
docker exec pickmeup-mysql mysqldump -u root -p pickmeup > backup_$(date +%Y%m%d).sql

# 복원
docker exec -i pickmeup-mysql mysql -u root -p pickmeup < backup_20250206.sql
```

---

## 트러블슈팅

### 백엔드가 시작되지 않음
```bash
# 로그 확인
docker logs pickmeup-backend

# 일반적인 원인:
# 1. MySQL 연결 실패 → 환경변수 확인
# 2. Redis 연결 실패 → Redis 컨테이너 확인
# 3. 포트 충돌 → 8080 포트 사용 중인 프로세스 확인
```

### 프론트엔드 빌드 실패
```bash
# 의존성 재설치
cd frontend
rm -rf node_modules package-lock.json
npm install

# 타입 에러 확인
npm run type-check

# 린트 에러 확인
npm run lint
```

### Docker 이미지 빌드 실패
```bash
# 캐시 삭제 후 재빌드
docker-compose build --no-cache

# 빌드 로그 자세히 보기
docker-compose build --progress=plain
```

### DB 마이그레이션 실패
```bash
# Flyway 상태 확인
docker exec pickmeup-backend ./gradlew flywayInfo

# 수동 실행
docker exec pickmeup-backend ./gradlew flywayMigrate

# 롤백 (주의!)
docker exec pickmeup-backend ./gradlew flywayUndo
```

---

## 성능 최적화

### Backend
```yaml
# application-prod.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
  
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
```

### Frontend
```bash
# 번들 사이즈 분석
npm run build
npx vite-bundle-visualizer

# Gzip 압축 확인
curl -H "Accept-Encoding: gzip" -I https://pickmeup.com
```

### Database
```sql
-- 인덱스 확인
SHOW INDEX FROM resume_picks;

-- 슬로우 쿼리 확인
SHOW VARIABLES LIKE 'slow_query%';
```

---

## 보안 체크리스트

- [ ] HTTPS 적용 (Let's Encrypt)
- [ ] 환경변수 암호화
- [ ] DB 비밀번호 강력하게 설정
- [ ] JWT Secret 256bit 이상
- [ ] CORS 설정 확인
- [ ] Rate Limiting 적용
- [ ] SQL Injection 방어 (JPA 사용)
- [ ] XSS 방어 (입력 검증)
- [ ] 민감한 로그 마스킹

---

## 연락처

**긴급 장애 발생 시:**
- 담당자: 순대왕자
- Slack: #pickmeup-alerts
- 이메일: admin@pickmeup.com

**작성일:** 2025-02-06  
**최종 업데이트:** 배포 시마다 업데이트
