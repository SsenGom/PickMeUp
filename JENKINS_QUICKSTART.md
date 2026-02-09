# ⚡ Jenkins CI/CD 빠른 시작

## 🚀 5분 안에 Jenkins 설정하기

### 1단계: Jenkins 실행 (1분)

```bash
# Jenkins 설정 스크립트 실행
chmod +x jenkins/setup-jenkins.sh
./jenkins/setup-jenkins.sh
```

출력에서 **초기 비밀번호** 복사!

### 2단계: Jenkins 접속 & 설정 (2분)

```
http://localhost:8081
```

1. 초기 비밀번호 입력
2. **"Install suggested plugins"** 클릭
3. 관리자 계정 생성
   - Username: `admin`
   - Password: `admin123` (원하는 거)
   - Email: `admin@pickmeup.com`

### 3단계: 도구 설정 (1분)

**Manage Jenkins > Global Tool Configuration**

#### JDK
- Name: `JDK17`
- ✅ Install automatically
- Version: `jdk-17.0.2`

#### NodeJS
- Name: `NodeJS18`
- ✅ Install automatically
- Version: `NodeJS 18.x`

**Save** 클릭!

### 4단계: 파이프라인 생성 (1분)

**New Item**

```
Name: PickMeUp-Pipeline
Type: Multibranch Pipeline
OK
```

**Branch Sources > Add source > Git**

```
Repository URL: https://github.com/your-username/pickmeup.git
Credentials: (없으면 Skip)

Build Configuration:
  Script Path: Jenkinsfile.simple
```

**Save**!

---

## ✅ 테스트

### develop 브랜치 푸시

```bash
git checkout develop
git commit --allow-empty -m "test: Jenkins"
git push origin develop
```

**Jenkins에서 확인**:
```
http://localhost:8081/blue
```

빌드 시작됨! 🎉

---

## 📋 다음 단계

### 완전한 CI/CD 구축

1. **Jenkinsfile.simple** → **Jenkinsfile**로 변경
2. **Docker Hub** 계정 연결
3. **배포 서버** SSH 설정

자세한 내용: [JENKINS_SETUP_GUIDE.md](JENKINS_SETUP_GUIDE.md)

---

## 🐛 문제 해결

### Jenkins가 안 떠요
```bash
docker logs pickmeup-jenkins
```

### 빌드가 실패해요
```bash
# Gradle 권한
chmod +x backend/gradlew
git add backend/gradlew
git commit -m "fix: gradlew permission"
git push
```

### Docker 명령어가 안 돼요
```bash
docker exec pickmeup-jenkins usermod -aG docker jenkins
docker restart pickmeup-jenkins
```

---

**완료!** 🎊

이제 코드 푸시할 때마다 자동으로 빌드 & 테스트됩니다!
