# 🪟 Jenkins CI/CD 완벽 가이드 (Windows)

## 📋 목차
1. [사전 준비](#사전-준비)
2. [Jenkins 설치](#jenkins-설치)
3. [도구 설정](#도구-설정)
4. [파이프라인 구성](#파이프라인-구성)
5. [Docker Hub 연동](#docker-hub-연동)
6. [자동 배포 설정](#자동-배포-설정)
7. [트러블슈팅](#트러블슈팅)

---

## 사전 준비

### 1. Docker Desktop 설치

**다운로드**:
```
https://www.docker.com/products/docker-desktop/
```

**설치 과정**:
1. Docker Desktop Installer.exe 실행
2. "Use WSL 2 instead of Hyper-V" 체크
3. Install → 재부팅

**설정 (Docker Desktop 실행 후)**:
```
Settings > Resources > WSL Integration
✅ Enable integration with my default WSL distro
✅ Ubuntu (있다면)
Apply & Restart
```

**확인**:
```powershell
docker --version
# Docker version 24.0.x

docker-compose --version
# Docker Compose version v2.x.x
```

### 2. Git 설치

**다운로드**:
```
https://git-scm.com/download/win
```

**설치 옵션**:
- ✅ Git Bash Here
- ✅ Git GUI Here
- Editor: Visual Studio Code (또는 원하는 에디터)

**확인**:
```powershell
git --version
```

### 3. Java 17 설치 (선택 - Jenkins가 자동 설치함)

**다운로드**:
```
https://adoptium.net/
```

**환경 변수 설정**:
```
시스템 속성 > 환경 변수
JAVA_HOME: C:\Program Files\Eclipse Adoptium\jdk-17.x.x
Path 추가: %JAVA_HOME%\bin
```

---

## Jenkins 설치

### 방법 1: 배치 파일 (가장 쉬움)

**파일 탐색기**:
```
C:\project\PickMeUp\jenkins\setup-jenkins.bat
더블클릭!
```

### 방법 2: PowerShell

**PowerShell 관리자 권한으로 실행**:
```powershell
cd C:\project\PickMeUp\jenkins
docker-compose up -d
```

**초기 비밀번호 확인 (60초 후)**:
```powershell
docker exec pickmeup-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**출력 예시**:
```
a1b2c3d4e5f6g7h8i9j0
```

### 방법 3: Git Bash

```bash
cd /c/project/PickMeUp/jenkins
docker-compose up -d
sleep 60
docker exec pickmeup-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

---

## Jenkins 초기 설정

### 1. 브라우저 접속
```
http://localhost:8081
```

### 2. 초기 비밀번호 입력
위에서 확인한 비밀번호 붙여넣기

### 3. 플러그인 설치
```
Customize Jenkins:
✅ Install suggested plugins

자동 설치 시작 (3-5분)
```

**설치되는 플러그인**:
- Git plugin
- Pipeline
- Credentials
- SSH Agent
- JUnit
- 기타 필수 플러그인

### 4. 관리자 계정 생성
```
Create First Admin User:

Username: admin
Password: admin123
Confirm Password: admin123
Full name: Administrator
Email address: admin@pickmeup.com

Save and Continue
```

### 5. Instance Configuration
```
Jenkins URL: http://localhost:8081/

Save and Finish
→ Start using Jenkins
```

---

## 도구 설정

### 1. JDK 설정

**Manage Jenkins > Global Tool Configuration**

**JDK 섹션**:
```
Add JDK

Name: JDK17
✅ Install automatically
  Add Installer: Install from adoptium.net
  Version: jdk-17.0.9+9

Apply
```

### 2. Gradle 설정

**Gradle 섹션** (보통 자동 추가됨):
```
Name: Gradle7
✅ Install automatically
Version: Gradle 7.6

Apply
```

### 3. NodeJS 설정

**플러그인 먼저 설치**:
```
Manage Jenkins > Manage Plugins > Available
검색: NodeJS Plugin
✅ Install without restart
```

**Global Tool Configuration으로 돌아가기**:
```
NodeJS 섹션:
Add NodeJS

Name: NodeJS18
✅ Install automatically
Version: NodeJS 18.19.0
Global npm packages to install: (비워두기)

Apply → Save
```

---

## 파이프라인 구성

### 1. 간단한 파이프라인 (테스트용)

**New Item**:
```
Enter an item name: PickMeUp-Test
✅ Multibranch Pipeline
OK
```

**Branch Sources > Add source > Git**:
```
Project Repository: https://github.com/your-username/pickmeup.git

Credentials: (나중에 추가)

Behaviors:
  Discover branches: ✅

Build Configuration:
  Mode: by Jenkinsfile
  Script Path: Jenkinsfile.simple

Scan Multibranch Pipeline Triggers:
  ✅ Periodically if not otherwise run
  Interval: 1 minute

Save
```

**자동 스캔 시작**:
Jenkins가 자동으로 Git을 스캔하고 브랜치를 찾음!

### 2. GitHub Token으로 인증 추가

#### GitHub Token 생성

**GitHub.com > Settings**:
```
Developer settings
> Personal access tokens
> Tokens (classic)
> Generate new token (classic)

Note: Jenkins CI/CD
Expiration: 90 days

Select scopes:
  ✅ repo (전체)
  ✅ admin:repo_hook (webhook용)

Generate token
```

**토큰 복사** (한 번만 보임!):
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Jenkins에 Credential 추가

**Manage Jenkins > Manage Credentials**:
```
Stores scoped to Jenkins
  > System
  > Global credentials (unrestricted)
  > Add Credentials

Kind: Username with password
Username: your-github-username
Password: ghp_xxxxxxxxxxxx (위에서 복사)
ID: github-credential
Description: GitHub Token

OK
```

#### 파이프라인에 적용

**PickMeUp-Test > Configure**:
```
Branch Sources > Git

Credentials: github-credential 선택

Save
```

---

## 파이프라인 테스트

### 1. 코드 푸시

**PowerShell**:
```powershell
cd C:\project\PickMeUp

git checkout develop
git commit --allow-empty -m "test: Jenkins CI"
git push origin develop
```

### 2. Jenkins 확인

**Blue Ocean**:
```
http://localhost:8081/blue/organizations/jenkins/PickMeUp-Test/activity

develop 브랜치 빌드 확인
```

**Classic UI**:
```
http://localhost:8081/job/PickMeUp-Test/job/develop/

Console Output 확인
```

### 3. 성공 확인

**성공 시**:
```
✅ Checkout
✅ Backend Test
✅ Frontend Build

Finished: SUCCESS
```

**실패 시**:
```
Console Output에서 에러 확인
```

---

## Docker Hub 연동

### 1. Docker Hub 계정

**가입**:
```
https://hub.docker.com/signup
```

**Repository 생성**:
```
Create Repository

Name: pickmeup-backend
Visibility: Public (or Private)
Create

Name: pickmeup-frontend
Create
```

### 2. Jenkins Credential 추가

**Manage Jenkins > Manage Credentials > Add**:
```
Kind: Username with password
Username: your-dockerhub-username
Password: your-dockerhub-password
ID: dockerhub-credential
Description: Docker Hub

OK
```

### 3. Jenkinsfile 수정

**Jenkinsfile** 상단:
```groovy
environment {
    DOCKER_HUB_CREDENTIAL = 'dockerhub-credential'
    DOCKER_HUB_USERNAME = 'your-dockerhub-username'  // 실제 이름으로 변경!
    
    BACKEND_IMAGE = "${DOCKER_HUB_USERNAME}/pickmeup-backend"
    FRONTEND_IMAGE = "${DOCKER_HUB_USERNAME}/pickmeup-frontend"
}
```

### 4. Docker 권한 설정

**PowerShell 관리자 권한**:
```powershell
# Jenkins 컨테이너에 Docker 권한 부여
docker exec pickmeup-jenkins usermod -aG docker jenkins
docker restart pickmeup-jenkins
```

### 5. Dockerfile 확인

**backend/Dockerfile**과 **frontend/Dockerfile** 확인 (이미 생성됨)

### 6. 전체 파이프라인 사용

**파이프라인 설정 변경**:
```
Script Path: Jenkinsfile  (Jenkinsfile.simple → Jenkinsfile)
```

---

## Webhook 설정 (자동 빌드)

### 1. ngrok 설치 (로컬 테스트용)

**다운로드**:
```
https://ngrok.com/download
```

**실행**:
```powershell
ngrok http 8081
```

**URL 복사**:
```
Forwarding: https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:8081
```

### 2. GitHub Webhook 설정

**GitHub Repository > Settings > Webhooks > Add webhook**:
```
Payload URL: https://xxxx-xxxx-xxxx.ngrok-free.app/github-webhook/
Content type: application/json
Events: Just the push event
✅ Active

Add webhook
```

### 3. Jenkins 설정

**파이프라인 > Configure**:
```
Scan Multibranch Pipeline Triggers:
  ✅ Periodically if not otherwise run
  Interval: 1 minute (webhook 백업용)

Save
```

---

## 트러블슈팅 (Windows 특화)

### 1. WSL 2 에러

**증상**:
```
Docker Desktop requires WSL 2
```

**해결**:
```powershell
# PowerShell 관리자 권한
wsl --install
wsl --update
wsl --set-default-version 2

# 재부팅
```

### 2. Hyper-V 충돌

**증상**:
```
Hyper-V and WSL 2 conflict
```

**해결**:
```powershell
# PowerShell 관리자 권한
bcdedit /set hypervisorlaunchtype auto
# 재부팅
```

### 3. 포트 충돌 (8081)

**증상**:
```
Port 8081 already in use
```

**해결**:
```powershell
# 포트 사용 확인
netstat -ano | findstr :8081

# PID 확인 후 종료
taskkill /PID xxxx /F

# 또는 Jenkins 포트 변경
# jenkins/docker-compose.yml 수정
ports:
  - "8082:8080"
```

### 4. gradlew 권한 에러

**증상**:
```
Permission denied: gradlew
```

**해결 (Git Bash)**:
```bash
cd /c/project/PickMeUp/backend
chmod +x gradlew
git add gradlew
git commit -m "fix: gradlew permission"
git push
```

**또는 gradlew.bat 사용**:
```groovy
// Jenkinsfile에서
sh './gradlew test'  // ❌ Linux only
bat 'gradlew.bat test'  // ✅ Windows
```

### 5. Docker 명령어 안 됨

**증상**:
```
docker: command not found
```

**해결**:
```powershell
# 환경 변수 추가
$env:Path += ";C:\Program Files\Docker\Docker\resources\bin"

# 영구 추가 (시스템 속성 > 환경 변수)
Path에 추가: C:\Program Files\Docker\Docker\resources\bin
```

### 6. Jenkins 컨테이너 내부 진입

```powershell
docker exec -it pickmeup-jenkins bash

# Jenkins 컨테이너 내부에서
pwd
ls -la /var/jenkins_home
exit
```

---

## 백업 & 복원

### 백업

```powershell
# Jenkins 홈 디렉토리 백업
docker exec pickmeup-jenkins tar -czf /tmp/jenkins-backup.tar.gz /var/jenkins_home

# Windows로 복사
docker cp pickmeup-jenkins:/tmp/jenkins-backup.tar.gz C:\backup\jenkins-backup-20250207.tar.gz
```

### 복원

```powershell
# 백업 파일을 컨테이너로 복사
docker cp C:\backup\jenkins-backup-20250207.tar.gz pickmeup-jenkins:/tmp/

# 압축 해제
docker exec pickmeup-jenkins tar -xzf /tmp/jenkins-backup-20250207.tar.gz -C /

# Jenkins 재시작
docker restart pickmeup-jenkins
```

---

## 유용한 PowerShell 명령어

```powershell
# Jenkins 로그 실시간 확인
docker logs -f pickmeup-jenkins

# Jenkins 재시작
docker restart pickmeup-jenkins

# Jenkins 중지
cd C:\project\PickMeUp\jenkins
docker-compose down

# Jenkins 시작
docker-compose up -d

# 컨테이너 상태 확인
docker ps

# Jenkins 홈 디렉토리 확인
docker exec pickmeup-jenkins ls -la /var/jenkins_home

# Docker Desktop 재시작
taskkill /IM "Docker Desktop.exe" /F
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

---

## 다음 단계

### 완전한 CI/CD 구축

1. ✅ Jenkins 설치 완료
2. ✅ 기본 파이프라인 동작 확인
3. ⏳ Docker Hub 연동
4. ⏳ 배포 서버 설정 (AWS EC2, Azure VM 등)
5. ⏳ Slack 알림 연동

---

**작성일**: 2025-02-07  
**환경**: Windows 10/11 + Docker Desktop + WSL 2
