# 🚀 Git 브랜치 설정 명령어

## ⚡ 빠른 설정 (복사 & 붙여넣기)

```bash
# 1. Git 사용자 정보 설정
git config user.name "순대왕자"
git config user.email "your-email@example.com"

# 2. Git 초기화 (아직 안 했으면)
git init
git branch -m main

# 3. .gitignore 생성
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
*.log
EOF

# 4. 첫 커밋 (모든 파일)
git add .
git commit -m "chore: 헤드헌터 모드 구현 완료"

# 5. develop 브랜치 생성
git checkout -b develop

# 6. main으로 돌아가기
git checkout main

# 7. GitHub 연결
git remote add origin https://github.com/your-username/pickmeup.git

# 8. Push
git push -u origin main
git push -u origin develop

# ✅ 완료!
```

---

## 📋 단계별 설명

### 1단계: Git 사용자 설정
```bash
git config user.name "순대왕자"
git config user.email "sunde@pickmeup.com"

# 확인
git config user.name
git config user.email
```

### 2단계: 브랜치 확인
```bash
# 현재 브랜치 확인
git branch

# 현재 상태 확인
git status
```

### 3단계: 첫 커밋
```bash
# 파일 추가
git add .

# 커밋
git commit -m "chore: 프로젝트 초기화"

# 커밋 확인
git log --oneline
```

### 4단계: develop 브랜치 생성
```bash
# develop 브랜치 생성 & 전환
git checkout -b develop

# 브랜치 확인
git branch
# 출력:
# * develop
#   main
```

### 5단계: GitHub 연결
```bash
# 원격 저장소 추가
git remote add origin https://github.com/your-username/pickmeup.git

# 원격 저장소 확인
git remote -v

# Push
git push -u origin main
git push -u origin develop
```

---

## 🌳 브랜치 전략 별칭 설정

```bash
# 새 기능 개발
git config alias.new-feature '!f() { git checkout develop && git pull origin develop && git checkout -b feature/$1; }; f'

# 긴급 수정
git config alias.new-hotfix '!f() { git checkout main && git pull origin main && git checkout -b hotfix/$1; }; f'

# 배포 준비
git config alias.new-release '!f() { git checkout develop && git pull origin develop && git checkout -b release/$1; }; f'

# 사용 예시:
git new-feature 헤드헌터-통계
git new-hotfix 픽-버그
git new-release v1.2.0
```

---

## 🎯 실전 예시

### 기능 개발
```bash
# 1. feature 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/이메일-알림

# 2. 작업 & 커밋
git add .
git commit -m "feat(notification): 이메일 알림 기능 추가"

# 3. Push
git push origin feature/이메일-알림

# 4. GitHub에서 PR 생성
# develop <- feature/이메일-알림

# 5. Merge 후 로컬 브랜치 삭제
git checkout develop
git pull origin develop
git branch -d feature/이메일-알림
```

### 배포
```bash
# 1. release 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. 버전 정보 수정
# - backend/build.gradle
# - frontend/package.json
# - CHANGELOG.md

git add .
git commit -m "chore: v1.2.0 배포 준비"
git push origin release/v1.2.0

# 3. GitHub에서 PR 생성
# main <- release/v1.2.0

# 4. Merge 후 태그 생성
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 5. develop에도 merge
git checkout develop
git merge main
git push origin develop

# 6. release 브랜치 삭제
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

### 긴급 수정
```bash
# 1. hotfix 브랜치 생성
git checkout main
git pull origin main
git checkout -b hotfix/픽-버그

# 2. 버그 수정
git add .
git commit -m "fix: 픽 중복 버그 수정"
git push origin hotfix/픽-버그

# 3. GitHub에서 PR 2개 생성
# - main <- hotfix/픽-버그
# - develop <- hotfix/픽-버그

# 4. 둘 다 merge 후 태그
git checkout main
git pull origin main
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin v1.2.1

# 5. hotfix 브랜치 삭제
git branch -d hotfix/픽-버그
git push origin --delete hotfix/픽-버그
```

---

## 🛡️ 트러블슈팅

### 이미 커밋이 있는데 브랜치 만들기
```bash
# develop 브랜치가 없으면
git checkout -b develop

# 이미 있으면
git checkout develop
```

### 원격 저장소 URL 변경
```bash
# 기존 remote 삭제
git remote remove origin

# 새로 추가
git remote add origin https://github.com/new-url/pickmeup.git
```

### 브랜치 이름 변경
```bash
# 로컬 브랜치 이름 변경
git branch -m old-name new-name

# 원격도 변경
git push origin :old-name new-name
git push origin -u new-name
```

### 커밋 되돌리기 (아직 push 안 함)
```bash
# 마지막 커밋 취소 (파일은 유지)
git reset --soft HEAD~1

# 마지막 커밋 취소 (파일도 되돌림)
git reset --hard HEAD~1
```

---

**작성일:** 2025-02-06  
**바로 복사해서 사용하세요!**
