# /pipeline - 전체 파이프라인 실행

6단계 Agent 파이프라인을 순차적으로 실행합니다.

## 사용법
```
/pipeline <기능 요청>
```

## 예시
```
/pipeline 로그인 기능 개발해줘
/pipeline WebSocket 실시간 알림 추가
/pipeline 이력서 PDF 내보내기 기능
```

## 파이프라인 순서

```
📋 Step 1: Planner (planner)
   └─ 기능 설계 및 작업 계획 수립
         ↓
💼 Step 2: Product Manager (product-manager)  
   └─ UX/기능 요구사항 검토
         ↓
🏗️ Step 3: Tech Lead (tech-lead)
   └─ 아키텍처/기술 검토
         ↓
💻 Step 4: Developer (developer)
   └─ 실제 코드 구현
         ↓
🔒 Step 5: Security Auditor (security-auditor)
   └─ 보안 취약점 검사
         ↓
🧪 Step 6: QA Engineer (qa-engineer)
   └─ 테스트 및 품질 검증
         ↓
🚀 Complete: 배포 준비 완료!
```

## 각 단계 설명

### Step 1: Planner 📋
- 요구사항 분석
- 파일 구조 설계
- 작업 분해 (Task breakdown)
- 위험 요소 파악

### Step 2: Product Manager 💼
- 사용자 스토리 검토
- UX 플로우 분석
- 엣지 케이스 발굴
- 우선순위 조정

### Step 3: Tech Lead 🏗️
- 아키텍처 적합성 검토
- API 설계 확정
- 데이터 모델 검토
- 성능/캐싱 전략

### Step 4: Developer 💻
- Backend 코드 작성 (Spring Boot)
- Frontend 코드 작성 (React/TypeScript)
- 테스트 코드 작성
- 문서화

### Step 5: Security Auditor 🔒
- OWASP Top 10 체크
- 인증/인가 검토
- 입력 검증 확인
- 민감 데이터 처리 검토

### Step 6: QA Engineer 🧪
- 단위 테스트 실행
- 통합 테스트 실행
- 코드 품질 검증
- 최종 배포 승인

## 단계별 실행 (개별)
특정 단계만 실행하려면:
```
@planner <요청>
@product-manager <Planner 결과>
@tech-lead <PM 승인 결과>
@developer <Tech Lead 승인 결과>
@security-auditor <Developer 코드>
@qa-engineer <Security 승인 코드>
```

## 중단/재개
- 각 단계에서 이슈 발생 시 이전 단계로 피드백
- `FAILED` 판정 시 해당 단계 재실행 필요

## 출력물
각 단계별로 마크다운 형식의 리포트가 생성됩니다:
- `plan-[feature].md` - 구현 계획
- `review-[feature].md` - 리뷰 결과
- `security-[feature].md` - 보안 감사 결과
- `qa-[feature].md` - QA 리포트
