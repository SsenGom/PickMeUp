# 🔧 컴파일 에러 전체 수정 가이드

## 에러 목록 (18개)

### 1. ✅ ApplicationStatus.INTERVIEWING
**파일**: `ApplicationStatus.java`  
**에러**: cannot find symbol: INTERVIEWING  
**해결**: 이미 추가됨

### 2-5. MessageService.getPhoneNumber()
**파일**: `MessageService.java` 라인 106, 110, 116  
**에러**: cannot find symbol: getPhoneNumber()  
**해결**: `owner.getPhone()`으로 수정

```java
// ❌ 틀림
if (owner.getPhoneNumber() != null) {

// ✅ 올바름
if (owner.getPhone() != null) {
```

### 6. Thread.Builder.isRead()
**파일**: `MessageService.java` 라인 336  
**에러**: cannot find symbol: isRead(boolean)  
**해결**: `.status(ThreadStatus.UNREAD)` 사용

```java
// ❌ 틀림
Thread.builder()
    .isRead(false)

// ✅ 올바름  
Thread.builder()
    .status(ThreadStatus.UNREAD)
```

### 7. Message.Builder.sender()
**파일**: `MessageService.java` 라인 344  
**에러**: cannot find symbol: sender(<null>)  
**해결**: sender 필드 제거 (Message 엔티티에 없음)

```java
// ❌ 틀림
Message.builder()
    .sender(null)
    .content(...)

// ✅ 올바름
Message.builder()
    .content(...)
```

### 8-9. Skill.getSkillName()
**파일**: `RecruiterDto.java` 라인 107, `RecruiterService.java` 라인 95  
**에러**: cannot find symbol: getSkillName()  
**해결**: Skill 엔티티 확인 후 올바른 getter 사용

```java
// Skill 엔티티 확인 필요
// 필드명이 skillName이면 getSkillName()
// 필드명이 name이면 getName()
.map(s -> s.getName())  // 또는 getSkillName()
```

### 10-12. Experience/Project 날짜 타입
**파일**: `RecruiterDto.java` 라인 114, `RecruiterService.java` 라인 87, 89  
**에러**: String cannot be converted to Temporal  
**해결**: Experience/Project의 startDate, endDate 타입 확인

```java
// Experience 엔티티의 startDate 타입이:
// - LocalDate면: ChronoUnit.MONTHS.between() 사용 불가
// - String이면: LocalDate.parse() 먼저 해야 함
// - LocalDateTime이면: 그대로 사용 가능
```

### 13. Experience.getCompanyName()
**파일**: `RecruiterService.java` 라인 101  
**에러**: cannot find symbol: getCompanyName()  
**해결**: Experience 엔티티의 실제 필드명 확인

```java
// Experience 엔티티 확인 필요
.map(exp -> exp.getCompany())  // 또는 getCompanyName()
```

### 14. Project.getProjectName()
**파일**: `RecruiterService.java` 라인 111  
**에러**: cannot find symbol: getProjectName()  
**해결**: Project 엔티티의 실제 필드명 확인

```java
// Project 엔티티 확인 필요  
.map(proj -> proj.getName())  // 또는 getProjectName() 또는 getTitle()
```

### 15. viewCount 타입 불일치
**파일**: `RecruiterService.java` 라인 126  
**에러**: Long cannot be converted to Integer  
**해결**: `.intValue()` 추가

```java
// ❌ 틀림
.viewCount(resume.getViewCount())

// ✅ 올바름
.viewCount(resume.getViewCount().intValue())
// 또는
.viewCount(Math.toIntExact(resume.getViewCount()))
```

### 16. Resume.isPublic()
**파일**: `RecruiterService.java` 라인 148  
**에러**: cannot find symbol: isPublic()  
**해결**: Resume 엔티티의 실제 메서드명 확인

```java
// Resume 엔티티 필드명이:
// - isPublic → resume.getIsPublic()
// - publicStatus → resume.isPublic()
```

### 17-18. List<Object> vs List<String>
**파일**: `RecruiterDto.java` 라인 109  
**에러**: List<Object> cannot be converted to List<String>  
**해결**: `.collect(Collectors.toList())` 사용

```java
// ❌ 틀림
.toList()

// ✅ 올바름
.collect(Collectors.toList())
```

---

## 🎯 수정 순서

1. Skill, Experience, Project 엔티티 확인
2. Resume 엔티티 확인  
3. RecruiterService 수정
4. RecruiterDto 수정
5. MessageService 수정 (이미 대부분 완료)

---

## 📝 확인할 엔티티

- `backend/src/main/java/com/pickmeup/domain/resume/Skill.java`
- `backend/src/main/java/com/pickmeup/domain/resume/Experience.java`
- `backend/src/main/java/com/pickmeup/domain/resume/Project.java`
- `backend/src/main/java/com/pickmeup/domain/resume/Resume.java`
