#!/bin/bash

# ==================== Git 브랜치 전략 설정 스크립트 ====================
# 
# 사용법:
#   chmod +x scripts/setup-git-branches.sh
#   ./scripts/setup-git-branches.sh

set -e

echo "🌳 Git 브랜치 전략 설정 시작..."

# ==================== 1. Git 초기화 확인 ====================
if [ ! -d .git ]; then
    echo "❌ Git 저장소가 아닙니다. git init을 먼저 실행하세요."
    exit 1
fi

# ==================== 2. 사용자 정보 확인 ====================
if [ -z "$(git config user.name)" ]; then
    echo "Git 사용자 이름을 입력하세요:"
    read git_name
    git config user.name "$git_name"
fi

if [ -z "$(git config user.email)" ]; then
    echo "Git 이메일을 입력하세요:"
    read git_email
    git config user.email "$git_email"
fi

echo "✅ Git 사용자: $(git config user.name) <$(git config user.email)>"

# ==================== 3. 첫 커밋 생성 (main) ====================
current_branch=$(git branch --show-current)

if [ -z "$(git log -1 2>/dev/null)" ]; then
    echo "📝 첫 커밋 생성 중..."
    
    # .gitignore가 없으면 생성
    if [ ! -f .gitignore ]; then
        cat > .gitignore << 'EOF'
# IDE
.idea/
.vscode/
*.iml

# Build
backend/build/
backend/.gradle/
frontend/node_modules/
frontend/dist/

# Environment
.env
.env.local
*.pem

# OS
.DS_Store
Thumbs.db
EOF
    fi
    
    git add .gitignore
    git add README.md CHANGELOG.md 2>/dev/null || true
    git commit -m "chore: 프로젝트 초기화" || true
    
    echo "✅ 첫 커밋 완료"
else
    echo "✅ 이미 커밋이 존재합니다"
fi

# ==================== 4. main 브랜치 확인/생성 ====================
if [ "$current_branch" != "main" ]; then
    if git show-ref --verify --quiet refs/heads/main; then
        git checkout main
    else
        git branch -m main
    fi
    echo "✅ main 브랜치로 전환"
fi

# ==================== 5. develop 브랜치 생성 ====================
if git show-ref --verify --quiet refs/heads/develop; then
    echo "✅ develop 브랜치가 이미 존재합니다"
else
    git checkout -b develop
    echo "✅ develop 브랜치 생성 완료"
    git checkout main
fi

# ==================== 6. Git Flow 별칭 설정 ====================
echo "📌 Git 별칭 설정 중..."

git config alias.new-feature '!f() { git checkout develop && git pull origin develop && git checkout -b feature/$1; }; f'
git config alias.new-hotfix '!f() { git checkout main && git pull origin main && git checkout -b hotfix/$1; }; f'
git config alias.new-release '!f() { git checkout develop && git pull origin develop && git checkout -b release/$1; }; f'
git config alias.finish-feature '!f() { git checkout develop && git merge --no-ff feature/$1 && git branch -d feature/$1; }; f'

echo "✅ Git 별칭 설정 완료"

# ==================== 7. 사용법 출력 ====================
cat << 'EOF'

🎉 Git 브랜치 전략 설정 완료!

📋 브랜치 구조:
  main (프로덕션)
    ↑
  develop (개발)
    ↑
  feature/* (기능 개발)
  hotfix/* (긴급 수정)
  release/* (배포 준비)

🚀 사용법:

1. 새 기능 개발
   git new-feature 헤드헌터-통계
   # 작업 후
   git add .
   git commit -m "feat(stats): 헤드헌터 통계 추가"
   git push origin feature/헤드헌터-통계
   # GitHub에서 PR: develop <- feature/헤드헌터-통계

2. 긴급 버그 수정
   git new-hotfix 픽-버그
   # 수정 후
   git commit -m "fix: 픽 중복 버그 수정"
   git push origin hotfix/픽-버그
   # GitHub에서 PR: main <- hotfix/픽-버그

3. 배포 준비
   git new-release v1.2.0
   # 버전 정보 수정 후
   git commit -m "chore: v1.2.0 배포 준비"
   git push origin release/v1.2.0
   # GitHub에서 PR: main <- release/v1.2.0
   # merge 후:
   git tag -a v1.2.0 -m "Release v1.2.0"
   git push origin v1.2.0

EOF

echo "현재 브랜치: $(git branch --show-current)"
echo ""
echo "다음 명령어 실행:"
echo "  git remote add origin <저장소 URL>"
echo "  git push -u origin main"
echo "  git push -u origin develop"
