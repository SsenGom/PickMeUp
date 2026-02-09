# /review - 코드 리뷰

지정된 파일 또는 최근 변경사항을 리뷰합니다.

## 사용법
```
/review [파일경로]
/review --staged    # Git staged 파일 리뷰
/review --last      # 마지막 커밋 리뷰
```

## 예시
```
/review backend/src/main/java/com/pickmeup/auth/AuthController.java
/review frontend/src/components/JobCard.tsx
/review --staged
```

## 실행 과정
1. 리뷰할 파일 식별
2. Code Reviewer 에이전트 실행
3. security.md, coding-style.md 규칙 적용
4. 포맷된 리뷰 결과 출력

## 자동 수정
- 제안된 수정사항을 확인 후 적용 가능
