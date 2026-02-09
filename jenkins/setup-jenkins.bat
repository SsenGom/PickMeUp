@echo off
REM ==================== Jenkins 초기 설정 스크립트 (Windows) ====================

echo 🚀 Starting Jenkins setup for Windows...
echo.

REM ==================== 1. Jenkins 시작 ====================
echo 📦 Starting Jenkins container...
cd jenkins
docker-compose up -d

echo ⏳ Waiting for Jenkins to start (60 seconds)...
timeout /t 60 /nobreak

REM ==================== 2. 초기 비밀번호 확인 ====================
echo.
echo 🔑 Jenkins Initial Admin Password:
docker exec pickmeup-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
echo.

REM ==================== 3. Jenkins 접속 정보 ====================
echo ==================== Jenkins Setup ====================
echo.
echo 🌐 Jenkins URL: http://localhost:8081
echo.
echo 📋 다음 단계:
echo 1. http://localhost:8081 접속
echo 2. 위의 초기 비밀번호 입력
echo 3. 'Install suggested plugins' 선택
echo 4. 관리자 계정 생성
echo.
echo ====================================================
echo.

REM ==================== 4. Docker 권한 설정 ====================
echo 🔧 Setting up Docker permissions...
docker exec pickmeup-jenkins usermod -aG docker jenkins 2>nul
docker exec pickmeup-jenkins chown jenkins:jenkins /var/run/docker.sock 2>nul

echo.
echo ✅ Jenkins setup script completed!
echo.
echo 다음 단계: JENKINS_QUICKSTART_WINDOWS.md 파일을 참고하세요
echo.
pause
