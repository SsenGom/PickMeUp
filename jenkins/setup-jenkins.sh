#!/bin/bash

# ==================== Jenkins 초기 설정 스크립트 ====================

echo "🚀 Starting Jenkins setup..."

# ==================== 1. Jenkins 시작 ====================
echo "📦 Starting Jenkins container..."
cd jenkins
docker-compose up -d

echo "⏳ Waiting for Jenkins to start (60 seconds)..."
sleep 60

# ==================== 2. 초기 비밀번호 확인 ====================
echo ""
echo "🔑 Jenkins Initial Admin Password:"
docker exec pickmeup-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
echo ""

# ==================== 3. Jenkins 접속 정보 ====================
echo "==================== Jenkins Setup ===================="
echo ""
echo "🌐 Jenkins URL: http://localhost:8081"
echo ""
echo "📋 다음 단계:"
echo "1. http://localhost:8081 접속"
echo "2. 위의 초기 비밀번호 입력"
echo "3. 'Install suggested plugins' 선택"
echo "4. 관리자 계정 생성"
echo ""
echo "======================================================"

# ==================== 4. 필수 플러그인 목록 ====================
cat << 'EOF' > jenkins-plugins.txt
필수 플러그인 (Jenkins UI에서 설치):

1. Git Plugin - Git 저장소 연동
2. Pipeline - 파이프라인 지원
3. Docker Pipeline - Docker 빌드
4. SSH Agent - SSH 배포
5. JUnit Plugin - 테스트 결과
6. JaCoCo Plugin - 코드 커버리지
7. Slack Notification (선택) - 슬랙 알림
8. Email Extension (선택) - 이메일 알림
9. NodeJS Plugin - Node.js 빌드
10. Gradle Plugin - Gradle 빌드

설치 방법:
Manage Jenkins > Manage Plugins > Available > 검색 후 설치
EOF

echo ""
echo "📄 플러그인 목록이 jenkins-plugins.txt에 저장되었습니다"
echo ""

# ==================== 5. Docker 권한 설정 ====================
echo "🔧 Setting up Docker permissions..."
docker exec pickmeup-jenkins usermod -aG docker jenkins || true
docker exec pickmeup-jenkins chown jenkins:jenkins /var/run/docker.sock || true

echo ""
echo "✅ Jenkins setup script completed!"
echo ""
echo "다음 단계: jenkins-setup-guide.md 파일을 참고하세요"
