# /tdd - TDD 워크플로우 가이드

Test-Driven Development 사이클을 단계별로 진행합니다.

## 워크플로우
1. **Define**: 테스트 스펙 작성
2. **RED**: 실패하는 테스트 생성
3. **GREEN**: 최소 구현으로 통과
4. **IMPROVE**: 리팩토링 + 최적화
5. **VERIFY**: 커버리지 확인 (80%+ 목표)

## 사용법
```
/tdd <구현할 기능>
```

## 예시
```
/tdd 회원가입 이메일 검증 추가
/tdd JobApplication 중복 지원 방지 로직
/tdd useAuth 훅 로그인 상태 관리
```

## 실행 단계
```markdown
Step 1/5: Define - 테스트 스펙 정의
- 함수가 무엇을 해야 하는가?
- Edge case는 무엇인가?
- 무엇을 반환/던져야 하는가?

Step 2/5: RED - 실패 테스트 작성
[테스트 파일 생성]

Step 3/5: GREEN - 최소 구현
[테스트를 통과하는 최소 코드 생성]

Step 4/5: IMPROVE - 리팩토링
[테스트를 유지하며 코드 개선]

Step 5/5: VERIFY - 커버리지 확인
[커버리지 80% 이상 확인]
```
