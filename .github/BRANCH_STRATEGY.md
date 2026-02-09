# 🌳 Git 브랜치 전략

## 📋 브랜치 구조

```
main (프로덕션)
  ↑
develop (개발)
  ↑
feature/* (기능 개발)
hotfix/* (긴급 수정)
release/* (배포 준비)
```

---

## 🎯 브랜치 종류

### 1. main
- **목적**: 프로덕션 배포용
- **보호**: 직접 push 금지
- **배포**: 자동 배포 (CI/CD)
- **태그**: 버전 태그 필수 (v1.0.0, v1.1.0)

```bash
# main은 직접 수정 금지!
# release 브랜치나 hotfix만 merge
```

### 2. develop
- **목적**: 개발 통합 브랜치
- **배포**: 개발 서버 자동 배포
- **규칙**: feature 브랜치 merge 대상

```bash
git checkout develop
git pull origin develop
```

### 3. feature/*
- **목적**: 새 기능 개발
- **네이밍**: `feature/헤드헌터-스와이프`, `feature/이메일-알림`
- **생성 기준**: develop에서 분기
- **merge 대상**: develop

```bash
# 기능 개발 시작
git checkout develop
git pull origin develop
git checkout -b feature/헤드헌터-스와이프

# 작업 후 push
git add .
git commit -m "feat: 헤드헌터 스와이프 기능 구현"
git push origin feature/헤드헌터-스와이프

# GitHub에서 Pull Request 생성
# develop <- feature/헤드헌터-스와이프
```

### 4. hotfix/*
- **목적**: 프로덕션 긴급 수정
- **네이밍**: `hotfix/픽-중복-버그`
- **생성 기준**: main에서 분기
- **merge 대상**: main AND develop

```bash
# 긴급 버그 발생!
git checkout main
git pull origin main
git checkout -b hotfix/픽-중복-버그

# 수정 후
git add .
git commit -m "fix: 픽 중복 버그 수정"
git push origin hotfix/픽-중복-버그

# PR: main <- hotfix/픽-중복-버그
# PR: develop <- hotfix/픽-중복-버그
```

### 5. release/*
- **목적**: 배포 준비 (QA, 버전 업데이트)
- **네이밍**: `release/v1.2.0`
- **생성 기준**: develop에서 분기
- **merge 대상**: main AND develop

```bash
# 배포 준비
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 버전 정보 수정
# - package.json
# - build.gradle
# - CHANGELOG.md

git add .
git commit -m "chore: v1.2.0 배포 준비"
git push origin release/v1.2.0

# PR: main <- release/v1.2.0
# merge 후 태그 생성
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

---

## 📝 커밋 메시지 규칙 (Conventional Commits)

### 형식
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 종류
- **feat**: 새 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅 (기능 변경 X)
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드, 설정 변경

### 예시
```bash
# 기능 추가
git commit -m "feat(recruiter): 이력서 스와이프 기능 구현"

# 버그 수정
git commit -m "fix(pick): 중복 픽 방지 로직 수정"

# 문서 수정
git commit -m "docs(readme): 설치 가이드 추가"

# 리팩토링
git commit -m "refactor(service): RecruiterService 코드 정리"

# 테스트
git commit -m "test(recruiter): RecruiterService 테스트 추가"

# Breaking Change (주요 변경)
git commit -m "feat(api): API 응답 구조 변경

BREAKING CHANGE: ResumeFeedResponse 필드명 변경"
```

---

## 🔄 워크플로우

### 일반 기능 개발
```bash
1. develop에서 feature 브랜치 생성
2. 기능 개발 + 커밋
3. GitHub PR 생성 (develop <- feature)
4. 코드 리뷰
5. CI 테스트 통과 확인
6. develop에 merge
7. feature 브랜치 삭제
```

### 배포 프로세스
```bash
1. develop에서 release 브랜치 생성
2. 버전 정보 수정 + QA
3. GitHub PR 생성 (main <- release)
4. 최종 승인
5. main에 merge
6. 태그 생성 (v1.2.0)
7. 자동 배포 실행
8. release 브랜치 develop에도 merge
9. release 브랜치 삭제
```

### 긴급 수정
```bash
1. main에서 hotfix 브랜치 생성
2. 버그 수정
3. PR 2개 생성:
   - main <- hotfix
   - develop <- hotfix
4. 둘 다 merge
5. main에서 패치 태그 (v1.2.1)
6. hotfix 브랜치 삭제
```

---

## 🛡️ 브랜치 보호 규칙

### main 브랜치
- ✅ Require pull request reviews (최소 1명)
- ✅ Require status checks to pass (CI 테스트)
- ✅ Require branches to be up to date
- ✅ Include administrators (관리자도 규칙 적용)
- ✅ Restrict who can push (merge만 허용)

### develop 브랜치
- ✅ Require pull request reviews (최소 1명)
- ✅ Require status checks to pass
- ⚠️ Administrators can bypass (빠른 merge 허용)

---

## 📦 Merge 전략

### Squash Merge (feature → develop)
- 여러 커밋을 하나로 합침
- develop 히스토리 깔끔하게 유지

```bash
# GitHub에서 "Squash and merge" 선택
# 커밋 메시지 정리
feat(recruiter): 헤드헌터 스와이프 기능 구현

- 이력서 피드 API
- Pick 시스템
- 제안 발송 기능
```

### Merge Commit (release → main)
- 모든 커밋 히스토리 보존
- 배포 이력 추적 용이

```bash
# GitHub에서 "Create a merge commit" 선택
```

---

## 🏷️ 태그 규칙

### Semantic Versioning
```
v{major}.{minor}.{patch}

v1.0.0  - 첫 정식 릴리즈
v1.1.0  - 기능 추가
v1.1.1  - 버그 수정
v2.0.0  - Breaking Change
```

### 태그 생성
```bash
# Annotated Tag (권장)
git tag -a v1.2.0 -m "Release v1.2.0: 헤드헌터 모드 추가"
git push origin v1.2.0

# 태그 삭제 (잘못 생성 시)
git tag -d v1.2.0
git push origin :refs/tags/v1.2.0
```

---

## 🚀 실무 팁

### 1. PR 템플릿 사용
```markdown
## 변경 사항
- [ ] 이력서 스와이프 기능 추가
- [ ] Pick API 구현

## 테스트
- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과

## 스크린샷
(UI 변경이 있다면)

## 체크리스트
- [ ] 린트 통과
- [ ] 문서 업데이트
- [ ] 마이그레이션 필요 여부 확인
```

### 2. 커밋 자주 하기
```bash
# 나쁜 예: 하루 작업을 한 번에
git commit -m "작업함"

# 좋은 예: 의미 있는 단위로 분리
git commit -m "feat: 이력서 픽 엔티티 추가"
git commit -m "feat: Pick Repository 구현"
git commit -m "feat: RecruiterService 픽 로직 구현"
git commit -m "test: RecruiterService 테스트 추가"
```

### 3. rebase vs merge
```bash
# feature 브랜치 최신화
git checkout feature/my-feature
git rebase develop  # 히스토리 깔끔 (권장)

# 충돌 해결 후
git rebase --continue
```

---

## 📊 브랜치 현황 확인

```bash
# 모든 브랜치 보기
git branch -a

# 최근 브랜치 활동
git for-each-ref --sort=-committerdate refs/heads/

# 브랜치 삭제 (로컬)
git branch -d feature/old-feature

# 브랜치 삭제 (원격)
git push origin --delete feature/old-feature
```

---

**작성일:** 2025-02-06  
**팀원 필독**: 모든 개발자는 이 규칙을 따라주세요!
