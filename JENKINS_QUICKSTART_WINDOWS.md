# ⚡ Jenkins CI/CD 빠른 시작 (Windows)

## 📋 사전 준비

### 1. Docker Desktop 설치
```
https://www.docker.com/products/docker-desktop/

다운로드 → 설치 → 재부팅
```

**설치 확인**:
```powershell
docker --version
docker-compose --version
```

### 2. Git Bash 설치 (선택)
```
https://git-scm.com/download/win

Git Bash를 통해 Unix 스타일 명령어 사용 가능
```

---

## 🚀 Jenkins 설치 (5분)

### 방법 1: PowerShell 사용 (권장)

**PowerShell을 관리자 권한으로 실행**

```powershell
# 프로젝트 디렉토리로 이동
cd C:\project\PickMeUp

# Jenkins 시작
cd jenkins
docker-compose up -d

# 초기 비밀번호 확인 (60초 대기 후)
timeout /t 60
docker exec pickmeup-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 방법 2: 배치 파일 사용

**파일 탐색기에서**:
```
C:\project\PickMeUp\jenkins\setup-jenkins.bat 더블클릭
```

또는 **PowerShell**:
```powershell
cd C:\project\PickMeUp
.\jenkins\setup-jenkins.bat
```

### 방법 3: Git Bash 사용

```bash
cd /c/project/PickMeUp
chmod +x jenkins/setup-jenkins.sh
./jenkins/setup-jenkins.sh
```

---

## 🌐 Jenkins 접속 & 초기 설정

### 1단계: 브라우저 접속
```
http://localhost:8081
```

### 2단계: 초기 비밀번호 입력

**PowerShell에서 출력된 비밀번호 복사**

예시:
```
8a9b7c6d5e4f3g2h1i0j
```

또는 직접 확인:
```powershell
docker exec pickmeup-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3단계: 플러그인 설치
```
✅ Install suggested plugins 선택

자동으로 필수 플러그인 설치됨 (3-5분 소요)
```

### 4단계: 관리자 계정 생성
```
Username: admin
Password: admin123
Confirm: admin123
Full name: Admin
Email: admin@pickmeup.com

Save and Continue
```

### 5단계: Jenkins URL 확인
```
Jenkins URL: http://localhost:8081/

Save and Finish
→ Start using Jenkins
```

---

## 🔧 도구 설정 (3분)

### 1. Global Tool Configuration

**Manage Jenkins > Global Tool Configuration**

#### JDK 설정
```
Add JDK
Name: JDK17
✅ Install automatically
Version: jdk-17.0.2+8 (Oracle)

Apply
```

#### Gradle 설정 (자동 추가됨, 확인만)
```
Name: Default
✅ Install automatically
Version: Gradle 7.6
```

#### NodeJS 설정
```
Add NodeJS
Name: NodeJS18
✅ Install automatically
Version: NodeJS 18.19.0

Apply → Save
```

---

## 📦 파이프라인 생성 (2분)

### 1단계: 새 항목 생성

**Jenkins Dashboard > New Item**

```
Enter an item name: PickMeUp-Pipeline
✅ Multibranch Pipeline
OK
```

### 2단계: Branch Sources 설정

**Branch Sources > Add source > Git**

```
Project Repository: https://github.com/your-username/pickmeup.git

Credentials: (아직 없으면 비워두기)

Discover branches:
  ✅ All branches

Build Configuration:
  Mode: by Jenkinsfile
  Script Path: Jenkinsfile.simple
```

**Save**

### 3단계: 자동 스캔

Jenkins가 자동으로 Git 저장소를 스캔하고 브랜치를 찾음!

---

## ✅ 테스트

### 1. 코드 푸시

**PowerShell 또는 Git Bash**:
```powershell
cd C:\project\PickMeUp

git checkout develop
git commit --allow-empty -m "test: Jenkins CI/CD"
git push origin develop
```

### 2. Jenkins 확인

**Blue Ocean UI**:
```
http://localhost:8081/blue

PickMeUp-Pipeline > develop 브랜치 확인
```

**Classic UI**:
```
http://localhost:8081/job/PickMeUp-Pipeline/job/develop/
```

빌드가 자동으로 시작됨! 🎉

---

## 🎨 Jenkins UI 둘러보기

### Blue Ocean (추천)
```
http://localhost:8081/blue

- 시각적 파이프라인
- 스테이지별 진행 상황
- 로그 확인 편리
```

### Classic UI
```
http://localhost:8081

- 전통적인 Jenkins UI
- 상세 설정 가능
```

---

## 🐛 문제 해결 (Windows)

### 1. "Docker is not running"

**Docker Desktop 시작**:
```
시작 메뉴 > Docker Desktop 실행
상태 표시줄에서 Docker 아이콘 확인 (초록색)
```

### 2. "docker command not found" (PowerShell)

**환경 변수 확인**:
```powershell
# Docker 경로 확인
where docker

# 없으면 환경 변수 추가
$env:Path += ";C:\Program Files\Docker\Docker\resources\bin"
```

### 3. "Permission denied" (파일 권한)

**PowerShell 관리자 권한으로 실행**:
```powershell
# PowerShell 우클릭 > 관리자 권한으로 실행
```

### 4. "gradlew: command not found"

**Git 설정 확인**:
```powershell
# Git Bash에서
cd /c/project/PickMeUp/backend
chmod +x gradlew
git add gradlew
git commit -m "fix: gradlew permission"
git push
```

또는 **Windows에서**:
```powershell
# gradlew.bat 사용
cd C:\project\PickMeUp\backend
.\gradlew.bat build
```

### 5. Jenkins 접속 안 됨

**포트 확인**:
```powershell
# 8081 포트 사용 중인지 확인
netstat -ano | findstr :8081

# 다른 포트 사용하려면 docker-compose.yml 수정
ports:
  - "8082:8080"
```

### 6. Docker Desktop WSL 2 에러

**WSL 2 업데이트**:
```powershell
# PowerShell 관리자 권한
wsl --update
wsl --set-default-version 2
```

---

## 📂 Windows 경로 주의사항

### Git Bash vs PowerShell

**Git Bash**:
```bash
cd /c/project/PickMeUp
./gradlew build
```

**PowerShell**:
```powershell
cd C:\project\PickMeUp
.\gradlew.bat build
```

### Jenkinsfile 경로

**Windows 스타일 (X - 사용 금지)**:
```groovy
dir('C:\\project\\PickMeUp\\backend')  // ❌
```

**Unix 스타일 (O - 권장)**:
```groovy
dir('backend')  // ✅
```

---

## 🔑 GitHub Credentials 추가

### 1. GitHub Token 생성

**GitHub.com**:
```
Settings > Developer settings > Personal access tokens > Tokens (classic)
> Generate new token

Note: Jenkins PickMeUp
Expiration: 90 days

Scopes:
✅ repo (전체)
✅ admin:repo_hook

Generate token → 토큰 복사!
```

### 2. Jenkins에 추가

**Manage Jenkins > Manage Credentials > Global > Add Credentials**

```
Kind: Username with password
Username: your-github-username
Password: ghp_xxxxxxxxxxxx (위에서 복사한 토큰)
ID: github-token
Description: GitHub Access Token

OK
```

### 3. 파이프라인에 적용

**PickMeUp-Pipeline > Configure > Branch Sources**

```
Credentials: github-token 선택

Save
```

---

## 🎯 다음 단계

### 간단한 CI만 (현재)
```
Jenkinsfile.simple 사용
- 빌드
- 테스트
```

### 완전한 CI/CD (고급)
```
Jenkinsfile 사용
- 빌드
- 테스트
- Docker 이미지 생성
- Docker Hub 푸시
- 서버 배포

자세한 내용: JENKINS_SETUP_GUIDE_WINDOWS.md
```

---

## 📝 유용한 명령어 (PowerShell)

### Jenkins 관리
```powershell
# Jenkins 로그 확인
docker logs -f pickmeup-jenkins

# Jenkins 재시작
docker restart pickmeup-jenkins

# Jenkins 중지
cd C:\project\PickMeUp\jenkins
docker-compose down

# Jenkins 시작
docker-compose up -d

# Jenkins 컨테이너 접속
docker exec -it pickmeup-jenkins bash
```

### Jenkins 백업
```powershell
# 백업 생성
docker exec pickmeup-jenkins tar -czf /tmp/jenkins-backup.tar.gz /var/jenkins_home

# Windows로 복사
docker cp pickmeup-jenkins:/tmp/jenkins-backup.tar.gz C:\backup\

# 복원
docker cp C:\backup\jenkins-backup.tar.gz pickmeup-jenkins:/tmp/
docker exec pickmeup-jenkins tar -xzf /tmp/jenkins-backup.tar.gz -C /
docker restart pickmeup-jenkins
```

---

## 🎊 완료!

이제 코드를 푸시할 때마다 자동으로:
1. ✅ 코드 체크아웃
2. ✅ 백엔드 테스트
3. ✅ 프론트엔드 빌드

모든 게 자동으로 실행됩니다!

---

## 📚 추가 문서

- **JENKINS_SETUP_GUIDE_WINDOWS.md** - Windows용 상세 가이드
- **Jenkinsfile** - 전체 CI/CD 파이프라인
- **Jenkinsfile.simple** - 간단한 빌드 파이프라인

---

**작성일**: 2025-02-07  
**플랫폼**: Windows 10/11 + Docker Desktop
