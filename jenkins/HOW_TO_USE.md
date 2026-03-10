# PickMeUp Jenkins CI/CD 사용 가이드

## 전체 흐름 한눈에 보기

```
코드 작성 → git push → GitHub Webhook → Jenkins 자동 빌드
                                              ↓
                                   main 브랜치면 자동 배포
                                   나머지 브랜치면 테스트/빌드만
```

---

# STEP 1. 최초 1회 세팅 (처음에만)

## 1-1. Jenkins 컨테이너 띄우기

```bash
# 프로젝트 루트에서
docker compose -f jenkins/docker-compose.jenkins.yml up -d

# 떴는지 확인
docker ps | grep jenkins
```

## 1-2. Jenkins 초기 로그인

브라우저에서 `http://localhost:8080` 접속

```bash
# 초기 비밀번호 확인
docker exec pickmeup-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

→ 비밀번호 입력 → **Install suggested plugins** 선택 → 관리자 계정 생성

## 1-3. 추가 플러그인 설치

Jenkins 관리 → Plugin Manager → Available → 검색해서 설치

| 플러그인 | 용도 |
|----------|------|
| `GitHub Plugin` | Webhook 연동 |
| `GitHub Branch Source` | 브랜치 자동 감지 |
| `Docker Pipeline` | Docker 명령어 파이프라인 내 사용 |

설치 후 Jenkins 재시작.

## 1-4. Credentials(환경변수) 등록

Jenkins 관리 → Credentials → System → Global → **Add Credentials**

- Kind: **Secret text**
- 아래 11개 모두 등록

| ID | 값 |
|----|----|
| `pickmeup-db-username` | MySQL 유저명 |
| `pickmeup-db-password` | MySQL 비밀번호 |
| `pickmeup-mongo-username` | MongoDB 유저명 |
| `pickmeup-mongo-password` | MongoDB 비밀번호 |
| `pickmeup-mysql-root-password` | MySQL root 비밀번호 |
| `pickmeup-redis-password` | Redis 비밀번호 |
| `pickmeup-jwt-secret` | JWT Secret |
| `pickmeup-mail-username` | SMTP 이메일 |
| `pickmeup-mail-password` | SMTP 앱 비밀번호 |
| `pickmeup-kakao-key` | Kakao REST API Key |
| `pickmeup-openai-key` | OpenAI API Key |

## 1-5. GitHub Personal Access Token 발급

GitHub → Settings → Developer settings → Personal access tokens → **Generate new token**

권한 체크:
- [x] `repo` (전체)
- [x] `admin:repo_hook`

발급된 토큰 복사 → Jenkins Credentials에 추가
- Kind: **Username with password**
- Username: GitHub 유저명
- Password: 발급한 토큰
- ID: `github-token`

## 1-6. Pipeline Job 생성

Jenkins 대시보드 → **새 Item** → 이름: `PickMeUp` → **Multibranch Pipeline**

설정:
```
Branch Sources → Add source → GitHub
  - Credentials: github-token 선택
  - Repository HTTPS URL: https://github.com/<유저명>/PickMeUp.git

Build Configuration
  - Mode: by Jenkinsfile
  - Script Path: Jenkinsfile        ← 루트의 Jenkinsfile 자동 인식

Scan Multibranch Pipeline Triggers
  - Periodically if not otherwise run: 1 minute
```

저장하면 자동으로 브랜치 스캔 시작.

## 1-7. GitHub Webhook 설정

> push할 때마다 Jenkins가 자동으로 빌드되게 하는 설정

### 로컬 서버인 경우 (ngrok 필요)
```bash
# ngrok 설치 후
ngrok http 8080
# 출력된 URL 복사 (예: https://abc123.ngrok.io)
```

### GitHub repo → Settings → Webhooks → Add webhook

| 항목 | 값 |
|------|-----|
| Payload URL | `https://abc123.ngrok.io/github-webhook/` |
| Content type | `application/json` |
| Secret | (비워도 됨) |
| Events | **Just the push event** |

→ **Add webhook** 클릭 → 초록 체크 뜨면 성공

---

# STEP 2. 매일 쓰는 개발 워크플로우

## 2-1. 기능 개발할 때

```bash
# 새 기능 브랜치 생성
git checkout -b feature/새기능이름

# 개발 작업...

# 커밋 & 푸시
git add .
git commit -m "feat: 새 기능 추가"
git push origin feature/새기능이름
```

→ Jenkins가 자동으로 **테스트만** 실행 (배포 X)
→ `http://localhost:8080` 에서 빌드 결과 확인 가능

## 2-2. develop 브랜치에 머지할 때

```bash
git checkout develop
git merge feature/새기능이름
git push origin develop
```

→ Jenkins가 자동으로 **테스트 + 빌드** 실행 (배포 X)

## 2-3. 배포할 때 (main 머지)

```bash
git checkout main
git merge develop
git push origin main
```

→ Jenkins 파이프라인 전체 실행:
1. 테스트
2. Backend/Frontend 빌드
3. Docker 이미지 빌드
4. 기존 컨테이너 내리고 새 컨테이너 올리기
5. 헬스체크 (`/actuator/health`)

---

# STEP 3. Jenkins에서 확인하는 법

## 빌드 상태 확인
`http://localhost:8080` → PickMeUp 클릭 → 브랜치별 빌드 현황

| 색상 | 의미 |
|------|------|
| 🔵 파란색 | 빌드 성공 |
| 🔴 빨간색 | 빌드 실패 |
| ⚪ 회색 | 아직 빌드 안 됨 |
| 🟡 노란색 | 불안정 (테스트 일부 실패) |

## 실패했을 때 로그 보는 법
빌드 번호 클릭 → **Console Output** 클릭 → 에러 메시지 확인

## 수동으로 빌드 트리거하는 법
브랜치 선택 → **지금 빌드** 버튼 클릭 (Webhook 없이도 수동 실행 가능)

---

# STEP 4. 트러블슈팅

## Docker 명령어 안 될 때
```bash
# Jenkins 컨테이너에서 Docker 접근 확인
docker exec pickmeup-jenkins docker ps

# 에러 나면 소켓 권한 문제 → 컨테이너 재시작
docker compose -f jenkins/docker-compose.jenkins.yml restart
```

## 빌드는 됐는데 배포가 안 될 때
```bash
# 실행 중인 컨테이너 확인
docker ps

# 로그 확인
docker logs pickmeup-backend
docker logs pickmeup-frontend
```

## Jenkins 자체가 안 뜰 때
```bash
# 컨테이너 상태 확인
docker logs pickmeup-jenkins

# 재시작
docker compose -f jenkins/docker-compose.jenkins.yml restart
```

## Webhook이 안 될 때 (로컬)
- ngrok이 실행 중인지 확인
- ngrok URL이 바뀌었으면 GitHub Webhook URL도 업데이트 필요
- ngrok은 재시작하면 URL이 바뀜 → 유료 플랜 쓰면 고정 URL 가능

---

# 요약 치트시트

```bash
# Jenkins 시작
docker compose -f jenkins/docker-compose.jenkins.yml up -d

# Jenkins 중지
docker compose -f jenkins/docker-compose.jenkins.yml down

# 기능 개발 → push → 자동 테스트
git checkout -b feature/xxx && git push origin feature/xxx

# 배포
git checkout main && git merge develop && git push origin main

# 배포된 앱 로그 확인
docker logs pickmeup-backend -f
docker logs pickmeup-frontend -f
```
