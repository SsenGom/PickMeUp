#!/bin/bash

# 빠른 Git 브랜치 설정 (한 줄씩 실행 가능)

echo "🚀 빠른 Git 설정..."

# 1. Git 사용자 설정 (필요시 수정)
git config user.name "순대왕자"
git config user.email "sunde@pickmeup.com"

# 2. main 브랜치로 변경 (기본 master인 경우)
git branch -m main 2>/dev/null || true

# 3. 모든 파일 추가 & 첫 커밋
git add .
git commit -m "chore: 헤드헌터 모드 구현 완료

- 백엔드: RecruiterService, Pick, Proposal API
- 프론트엔드: Swipe, MyPicks, Proposals 페이지  
- 테스트: 24개 테스트 케이스
- 문서: 완전한 가이드 및 CI/CD 설정" 2>/dev/null || echo "이미 커밋 존재"

# 4. develop 브랜치 생성
git checkout -b develop 2>/dev/null || git checkout develop

# 5. main으로 돌아가기
git checkout main

# 완료!
echo ""
echo "✅ 설정 완료!"
echo ""
echo "현재 브랜치:"
git branch
echo ""
echo "다음 단계:"
echo "1. GitHub에서 새 저장소 생성"
echo "2. git remote add origin https://github.com/your-org/pickmeup.git"
echo "3. git push -u origin main"
echo "4. git push -u origin develop"
