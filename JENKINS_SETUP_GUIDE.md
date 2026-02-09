# 🔧 Jenkins CI/CD 설정 가이드

## 📋 목차
1. [Jenkins 설치](#jenkins-설치)
2. [초기 설정](#초기-설정)
3. [파이프라인 생성](#파이프라인-생성)
4. [Credentials 설정](#credentials-설정)
5. [배포 설정](#배포-설정)
6. [트러블슈팅](#트러블슈팅)

---

## Jenkins 설치

### 1. Docker로 Jenkins 실행

```bash
# 설치 스크립트 실행
chmod +x jenkins/setup-jenkins.sh
./jenkins/setup-jenkins.sh
```

또는 수동 실행:

```bash
cd jenkins
docker-compose up -d

# 초기 비밀번호 확인
docker exec pickmeup-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 2. Jenkins 접속

```
http://localhost:8081
```

- 초기 비밀번호 입력
- "Install suggested plugins" 선택
- 관리자 계정 생성
  - Username: admin
  - Password: (원하는 비밀번호)
  - Full name: Admin
  - Email: admin@pickmeup.com

---

## 초기 설정

### 1. 필수 플러그인 설치

**Manage Jenkins > Manage Plugins > Available**

#### 필수 플러그인
- ✅ Git Plugin
- ✅ Pipeline
- ✅ Docker Pipeline
- ✅ SSH Agent Plugin
- ✅ JUnit Plugin
- ✅ JaCoCo Plugin
- ✅ Gradle Plugin
- ✅ NodeJS Plugin

#### 선택 플러그인
- Slack Notification Plugin
- Email Extension Plugin
- SonarQube Scanner

**설치 후 Jenkins 재시작**:
```
Manage Jenkins > Restart Safely
```

### 2. Global Tool Configuration

**Manage Jenkins > Global Tool Configuration**

#### JDK 설정
```
Name: JDK17
Install automatically: ✅
Version: jdk-17.0.2
```

#### Gradle 설정
```
Name: Gradle7
Install automatically: ✅
Version: Gradle 7.6
```

#### NodeJS 설정
```
Name: NodeJS18
Install automatically: ✅
Version: NodeJS 18.x
```

### 3. Docker 설정 확인

Jenkins 컨테이너 접속:
```bash
docker exec -it pickmeup-jenkins bash

# Docker 명령어 테스트
docker --version
docker ps
```

안 되면 권한 설정:
```bash
# 호스트에서 실행
docker exec pickmeup-jenkins usermod -aG docker jenkins
docker restart pickmeup-jenkins
```

---

## 파이프라인 생성

### 1. 새 파이프라인 생성

**Jenkins Dashboard > New Item**

```
Item name: PickMeUp-Pipeline
Type: Multibranch Pipeline
```

### 2. Branch Sources 설정

**Branch Sources > Add source > Git**

```
Project Repository: https://github.com/your-org/pickmeup.git

Credentials: (GitHub 자격증명 추가)

Behaviors:
  ✅ Discover branches
  ✅ Discover tags
  
Build Configuration:
  Mode: by Jenkinsfile
  Script Path: Jenkinsfile
```

### 3. Scan Multibranch Pipeline Triggers

```
✅ Periodically if not otherwise run
Interval: 1 minute
```

---

## Credentials 설정

**Manage Jenkins > Manage Credentials > Global > Add Credentials**

### 1. Docker Hub Credentials

```
Kind: Username with password
Username: your-dockerhub-username
Password: your-dockerhub-password
ID: dockerhub-credential
Description: Docker Hub Login
```

### 2. SSH Private Key (배포 서버)

#### Staging Server
```
Kind: SSH Username with private key
Username: ubuntu
Private Key: (프라이빗 키 입력)
ID: staging-server-ssh
Description: Staging Server SSH
```

#### Production Server
```
Kind: SSH Username with private key
Username: ubuntu
Private Key: (프라이빗 키 입력)
ID: production-server-ssh
Description: Production Server SSH
```

### 3. GitHub Token (선택)

```
Kind: Secret text
Secret: ghp_your_github_token
ID: github-token
Description: GitHub Access Token
```

---

## 배포 설정

### 1. 서버 준비

#### Staging Server (staging-server.com)
```bash
# Docker 설치
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# 프로젝트 클론
cd /app
git clone https://github.com/your-org/pickmeup.git
cd pickmeup

# 환경변수 설정
cp .env.example .env
nano .env
```

#### Production Server (production-server.com)
```bash
# 동일하게 설정
```

### 2. SSH 키 설정

```bash
# Jenkins 서버에서 SSH 키 생성
ssh-keygen -t rsa -b 4096 -C "jenkins@pickmeup.com"

# 공개키를 배포 서버에 추가
ssh-copy-id ubuntu@staging-server.com
ssh-copy-id ubuntu@production-server.com

# 프라이빗 키를 Jenkins Credentials에 추가
cat ~/.ssh/id_rsa
```

### 3. Jenkinsfile 수정

```groovy
// Jenkinsfile 상단 environment 수정
environment {
    DOCKER_HUB_USERNAME = 'your-actual-username'
}
```

---

## 브랜치별 배포 전략

### develop 브랜치
```
Push → Jenkins 자동 빌드 → 테스트 → Docker 이미지 → Staging 배포
```

**확인 URL**: http://staging-server.com

### main 브랜치
```
Push → Jenkins 자동 빌드 → 테스트 → Docker 이미지 → 수동 승인 → Production 배포
```

**확인 URL**: http://production-server.com

### feature/* 브랜치
```
Push → Jenkins 자동 빌드 → 테스트만 실행 (배포 안 함)
```

---

## 파이프라인 실행 흐름

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       ↓
┌─────────────────┐
│ Jenkins Webhook │
└──────┬──────────┘
       ↓
┌──────────────────────┐
│ 1. Checkout          │
│ 2. Backend Build     │
│ 3. Backend Test      │
│ 4. Frontend Build    │
│ 5. Frontend Lint     │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ 6. Docker Build      │
│ 7. Docker Push       │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ 8. Deploy            │
│   - Staging (auto)   │
│   - Prod (manual)    │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ 9. Notify (Slack)    │
└──────────────────────┘
```

---

## 테스트

### 1. develop 브랜치 테스트

```bash
git checkout develop
git commit --allow-empty -m "test: Jenkins CI/CD"
git push origin develop
```

**Jenkins에서 확인**:
- Blue Ocean 열기: http://localhost:8081/blue
- develop 브랜치 파이프라인 실행 확인
- 각 스테이지 통과 여부 확인

### 2. main 브랜치 테스트

```bash
git checkout main
git merge develop
git push origin main
```

**수동 승인 단계**:
- Jenkins에서 "Deploy to Production" 단계에서 대기
- "Proceed" 버튼 클릭하여 배포 진행

---

## Webhook 설정 (자동 빌드)

### GitHub Webhook

**GitHub Repository > Settings > Webhooks > Add webhook**

```
Payload URL: http://your-jenkins-server:8081/github-webhook/
Content type: application/json
Events: Just the push event
```

**Jenkins 설정**:
```
Job > Configure > Build Triggers
✅ GitHub hook trigger for GITScm polling
```

---

## 모니터링

### 1. Blue Ocean UI

```
http://localhost:8081/blue
```

- 시각적 파이프라인 뷰
- 각 스테이지별 로그
- 실패 지점 확인

### 2. 빌드 히스토리

```
http://localhost:8081/job/PickMeUp-Pipeline
```

- 브랜치별 빌드 목록
- 테스트 결과
- 커버리지 리포트

### 3. 알림 설정

#### Slack 알림
```groovy
// Jenkinsfile에 추가
slackSend(
    color: 'good',
    message: "Deployed to Production!",
    channel: '#deployments'
)
```

**Slack 설정**:
1. Slack App 생성
2. Incoming Webhook URL 복사
3. Jenkins > Manage Jenkins > Configure System > Slack
4. Webhook URL 입력

---

## 트러블슈팅

### 1. "Docker command not found"

```bash
# Jenkins 컨테이너에 Docker 설치
docker exec -it pickmeup-jenkins bash
curl -fsSL https://get.docker.com | sh

# 또는 권한 설정
docker exec pickmeup-jenkins usermod -aG docker jenkins
docker restart pickmeup-jenkins
```

### 2. "Permission denied (publickey)"

```bash
# SSH 키 확인
ssh -T ubuntu@staging-server.com

# Jenkins Credentials 다시 추가
# Private Key를 정확히 복사했는지 확인
```

### 3. "Gradle build failed"

```bash
# Gradle Wrapper 권한
chmod +x backend/gradlew

# 또는 Jenkinsfile에 추가
sh 'chmod +x gradlew'
```

### 4. "Port already in use"

```bash
# 포트 변경 (8081 → 8082)
# docker-compose.yml 수정
ports:
  - "8082:8080"
```

---

## 고급 설정

### 1. 병렬 실행

```groovy
stage('Parallel Build') {
    parallel {
        stage('Backend') {
            steps { sh './backend-build.sh' }
        }
        stage('Frontend') {
            steps { sh './frontend-build.sh' }
        }
    }
}
```

### 2. 조건부 배포

```groovy
when {
    allOf {
        branch 'main'
        expression { currentBuild.result == 'SUCCESS' }
    }
}
```

### 3. 롤백 기능

```groovy
stage('Rollback') {
    when { expression { currentBuild.result == 'FAILURE' } }
    steps {
        sh 'docker-compose down'
        sh 'git checkout HEAD~1'
        sh 'docker-compose up -d'
    }
}
```

---

## 보안 체크리스트

- [ ] Jenkins 관리자 비밀번호 강력하게 설정
- [ ] CSRF Protection 활성화
- [ ] Jenkins URL HTTPS로 설정
- [ ] Credentials 암호화 확인
- [ ] SSH 키 권한 600으로 설정
- [ ] Docker Hub 비밀번호 안전하게 저장
- [ ] Jenkins 업데이트 정기적으로 실행

---

## 유용한 명령어

```bash
# Jenkins 로그 확인
docker logs -f pickmeup-jenkins

# Jenkins 재시작
docker restart pickmeup-jenkins

# Jenkins 백업
docker exec pickmeup-jenkins tar -czf /tmp/jenkins-backup.tar.gz /var/jenkins_home
docker cp pickmeup-jenkins:/tmp/jenkins-backup.tar.gz ./

# Jenkins 복원
docker cp jenkins-backup.tar.gz pickmeup-jenkins:/tmp/
docker exec pickmeup-jenkins tar -xzf /tmp/jenkins-backup.tar.gz -C /
```

---

**작성일**: 2025-02-07  
**버전**: 1.0  
**문의**: DevOps 팀
