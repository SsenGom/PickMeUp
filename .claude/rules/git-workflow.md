# 🔀 PickMeUp Git 워크플로우 가이드

> **원칙**: 작고 명확한 커밋, 충분한 리뷰, 안정적인 배포

---

## 🌳 브랜치 전략 (Git Flow 변형)

```
main (production)
  │
  ├── hotfix/critical-bug     ← 긴급 수정 (main에서 분기)
  │
develop (staging)
  │
  ├── feature/job-calendar    ← 기능 개발
  ├── feature/resume-ai       ← 기능 개발
  ├── fix/login-redirect      ← 버그 수정
  └── refactor/auth-module    ← 리팩토링
```

### 브랜치 명명 규칙

| 접두사 | 용도 | 예시 |
|--------|------|------|
| `feature/` | 새 기능 | `feature/calendar-view` |
| `fix/` | 버그 수정 | `fix/token-expiry` |
| `refactor/` | 리팩토링 | `refactor/user-service` |
| `hotfix/` | 긴급 수정 | `hotfix/payment-error` |
| `docs/` | 문서 작업 | `docs/api-specification` |
| `chore/` | 설정/빌드 | `chore/ci-pipeline` |

### 브랜치 생명주기

```bash
# 1. 기능 브랜치 생성 (develop에서)
git checkout develop
git pull origin develop
git checkout -b feature/job-calendar

# 2. 작업 후 커밋
git add .
git commit -m "feat(calendar): 월별 캘린더 뷰 구현"

# 3. 최신 develop과 동기화 (주기적으로)
git fetch origin develop
git rebase origin/develop
# 또는 merge 선호 시: git merge origin/develop

# 4. Push 및 PR 생성
git push origin feature/job-calendar
# GitHub에서 PR 생성

# 5. 리뷰 후 Squash Merge
# PR 승인 → Squash and merge → 브랜치 삭제
```

---

## 📝 커밋 메시지 컨벤션

### 형식

```
<type>(<scope>): <subject>

[body]

[footer]
```

### Type 목록

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat(auth): 소셜 로그인 추가` |
| `fix` | 버그 수정 | `fix(calendar): 날짜 표시 오류 수정` |
| `refactor` | 리팩토링 | `refactor(user): 서비스 계층 분리` |
| `perf` | 성능 개선 | `perf(query): N+1 문제 해결` |
| `test` | 테스트 | `test(auth): 로그인 테스트 추가` |
| `docs` | 문서 | `docs(api): Swagger 설명 추가` |
| `style` | 코드 스타일 | `style: 코드 포맷팅` |
| `chore` | 빌드/설정 | `chore(deps): Spring Boot 업그레이드` |
| `ci` | CI/CD | `ci: GitHub Actions 워크플로우 추가` |

### Scope (선택사항)

- `auth`, `user`, `calendar`, `resume`, `interview`, `notification`
- `api`, `db`, `config`, `deps`

### Subject 규칙

- 50자 이내
- 마침표 없음
- 명령형 사용 ("추가" O, "추가함" X, "추가했음" X)
- 한글 또는 영어 (프로젝트 컨벤션에 따름)

### 예시

```bash
# ✅ 좋은 커밋 메시지
feat(calendar): 월별 지원 현황 차트 추가

- Chart.js를 이용한 월별 통계 그래프
- 상태별 색상 구분 (지원중: 파랑, 합격: 초록, 불합격: 빨강)
- 반응형 레이아웃 지원

Closes #123

# ✅ 좋은 커밋 메시지 (간단한 경우)
fix(auth): 토큰 갱신 시 무한 루프 수정

# ❌ 나쁜 커밋 메시지
수정함
버그 고침
feat: 기능 추가
WIP
asdf
```

### Breaking Changes

```bash
feat(api)!: 응답 형식 변경

BREAKING CHANGE: 모든 API 응답이 ApiResult<T> 형식으로 래핑됩니다.

Before:
{ "id": 1, "name": "test" }

After:
{ "success": true, "data": { "id": 1, "name": "test" } }

Migration: 클라이언트에서 .data 접근 필요
```

---

## 🔄 Pull Request 가이드

### PR 제목

```
[타입] 간단한 설명 (#이슈번호)

예시:
[FEAT] 캘린더 월별 뷰 구현 (#123)
[FIX] 로그인 리다이렉트 오류 수정 (#456)
[REFACTOR] 인증 모듈 리팩토링 (#789)
```

### PR 템플릿

```markdown
## 📋 작업 내용

### 개요
[이 PR이 해결하는 문제 또는 추가하는 기능 설명]

### 변경 사항
- [변경 1]
- [변경 2]
- [변경 3]

### 스크린샷 (UI 변경 시)
| Before | After |
|--------|-------|
| 이미지 | 이미지 |

## ✅ 체크리스트

### 코드 품질
- [ ] 코딩 컨벤션 준수
- [ ] 불필요한 console.log / System.out 제거
- [ ] 하드코딩 없음

### 테스트
- [ ] 단위 테스트 작성/통과
- [ ] 통합 테스트 통과
- [ ] 수동 테스트 완료

### 문서
- [ ] API 문서 업데이트 (필요시)
- [ ] README 업데이트 (필요시)

## 🔗 관련 이슈
- Closes #123
- Related to #456

## 💬 리뷰어에게
[특별히 확인해줬으면 하는 부분이나 논의가 필요한 사항]
```

### 리뷰 규칙

#### 리뷰어
- 24시간 내 1차 리뷰 완료 목표
- 명확한 피드백 (개선 방향 제시)
- Approve / Request Changes / Comment 적극 사용

#### 리뷰 코멘트 접두사
```
[MUST] 반드시 수정 필요
[SHOULD] 수정 권장
[QUESTION] 질문
[NIT] 사소한 제안 (무시 가능)
[PRAISE] 칭찬 👍
```

#### 예시
```
[MUST] N+1 쿼리 발생합니다. Fetch Join 사용해주세요.

[SHOULD] 이 로직은 별도 메서드로 추출하면 가독성이 좋아질 것 같습니다.

[QUESTION] 이 예외 처리 방식을 선택한 이유가 있나요?

[NIT] 변수명을 좀 더 명확하게 바꾸면 어떨까요? data -> applicationList

[PRAISE] 테스트 케이스 잘 작성하셨네요! 👍
```

### Merge 전략

| 상황 | 전략 | 이유 |
|------|------|------|
| feature → develop | **Squash Merge** | 깔끔한 히스토리 |
| develop → main | **Merge Commit** | 배포 기록 보존 |
| hotfix → main/develop | **Merge Commit** | 양쪽 동기화 |

---

## 🚀 배포 워크플로우

### 환경별 브랜치

```
main       → Production (https://pickmeup.com)
develop    → Staging (https://staging.pickmeup.com)
feature/*  → Preview (PR별 자동 배포, 선택사항)
```

### 배포 프로세스

```
1. feature 브랜치에서 개발 완료
       ↓
2. PR 생성 → 코드 리뷰
       ↓
3. 승인 후 develop에 Squash Merge
       ↓
4. develop → Staging 자동 배포
       ↓
5. Staging에서 QA 검증
       ↓
6. develop → main PR 생성 (Release PR)
       ↓
7. 승인 후 main에 Merge
       ↓
8. main → Production 자동 배포
       ↓
9. Git Tag 생성 (v1.2.3)
```

### Release 태그 규칙

```bash
# Semantic Versioning
v{MAJOR}.{MINOR}.{PATCH}

# 예시
v1.0.0  # 첫 정식 릴리즈
v1.1.0  # 새 기능 추가
v1.1.1  # 버그 수정
v2.0.0  # Breaking Change

# 태그 생성
git tag -a v1.2.0 -m "Release v1.2.0: 캘린더 기능 추가"
git push origin v1.2.0
```

---

## 🔧 Git 설정

### 권장 Global 설정

```bash
# 사용자 정보
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 기본 브랜치명
git config --global init.defaultBranch main

# Pull 전략 (rebase 권장)
git config --global pull.rebase true

# Push 전략
git config --global push.default current

# 에디터 (선택)
git config --global core.editor "code --wait"

# 자동 CRLF 처리 (Windows)
git config --global core.autocrlf true

# 한글 파일명 처리
git config --global core.quotepath false
```

### .gitignore 템플릿

```gitignore
# ===== IDE =====
.idea/
*.iml
.vscode/
*.swp
*.swo

# ===== Build =====
/build/
/target/
/dist/
/out/

# ===== Dependencies =====
/node_modules/
/.gradle/

# ===== Environment =====
.env
.env.*
!.env.example
application-local.yml
application-prod.yml

# ===== Logs =====
*.log
logs/

# ===== OS =====
.DS_Store
Thumbs.db

# ===== Test =====
/coverage/
*.lcov
/test-results/

# ===== Secrets =====
*.pem
*.key
*.p12
secrets/
```

### Git Hooks (Husky + lint-staged)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## 📋 체크리스트

### 커밋 전
```bash
# 1. 변경 파일 확인
git status
git diff

# 2. 린트/포맷 확인
npm run lint
./gradlew ktlintCheck

# 3. 테스트 실행
npm test
./gradlew test

# 4. 빌드 확인
npm run build
./gradlew build
```

### PR 생성 전
- [ ] 코드 셀프 리뷰 완료
- [ ] 테스트 추가/통과
- [ ] 불필요한 파일 제거
- [ ] 커밋 메시지 정리 (Squash/Fixup)
- [ ] PR 템플릿 작성

### Merge 전
- [ ] 2명 이상 Approve
- [ ] CI 파이프라인 통과
- [ ] Conflict 해결
- [ ] 최신 develop/main과 동기화

---

## 🚨 긴급 상황 대응

### Hotfix 프로세스

```bash
# 1. main에서 hotfix 브랜치 생성
git checkout main
git pull origin main
git checkout -b hotfix/critical-payment-bug

# 2. 수정 후 커밋
git add .
git commit -m "hotfix(payment): 결제 오류 긴급 수정"

# 3. main에 머지 (빠른 리뷰 후)
git checkout main
git merge hotfix/critical-payment-bug
git push origin main

# 4. develop에도 머지
git checkout develop
git merge hotfix/critical-payment-bug
git push origin develop

# 5. hotfix 브랜치 삭제
git branch -d hotfix/critical-payment-bug
```

### Revert가 필요한 경우

```bash
# 특정 커밋 되돌리기
git revert <commit-hash>

# 여러 커밋 되돌리기
git revert <oldest-commit>..<newest-commit>

# Merge 커밋 되돌리기
git revert -m 1 <merge-commit-hash>
```
