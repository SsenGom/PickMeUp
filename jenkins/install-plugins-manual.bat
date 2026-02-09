@echo off
REM Jenkins 플러그인 수동 설치 (Windows)

echo 🔧 Installing Jenkins Plugins...
echo.

REM Jenkins 컨테이너 내부에서 실행
docker exec pickmeup-jenkins bash -c "jenkins-plugin-cli --plugins workflow-multibranch:latest git:latest github-branch-source:latest docker-workflow:latest nodejs:latest junit:latest jacoco:latest ssh-agent:latest credentials-binding:latest pipeline-stage-view:latest"

echo.
echo 🔄 Restarting Jenkins...
docker restart pickmeup-jenkins

echo.
echo ⏳ Waiting 30 seconds for restart...
timeout /t 30 /nobreak

echo.
echo ✅ Done! Refresh your browser: http://localhost:8081
echo.
pause
