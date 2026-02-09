# Jenkins 플러그인 자동 설치 스크립트 (PowerShell)

Write-Host "🔧 Installing Jenkins Plugins..." -ForegroundColor Green

# 필수 플러그인 목록
$plugins = @(
    "workflow-multibranch",
    "workflow-aggregator",
    "git",
    "github-branch-source",
    "docker-workflow",
    "nodejs",
    "junit",
    "jacoco",
    "ssh-agent",
    "credentials-binding",
    "pipeline-stage-view"
)

Write-Host "📦 Installing plugins..."

foreach ($plugin in $plugins) {
    Write-Host "  Installing $plugin..." -ForegroundColor Cyan
    docker exec pickmeup-jenkins jenkins-plugin-cli --plugins "$plugin`:latest"
}

Write-Host ""
Write-Host "🔄 Restarting Jenkins..." -ForegroundColor Yellow
docker restart pickmeup-jenkins

Write-Host ""
Write-Host "⏳ Waiting for Jenkins to restart (30 seconds)..."
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "✅ Plugins installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Jenkins URL: http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please refresh your browser and try creating a Multibranch Pipeline again!"
