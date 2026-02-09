# 🔧 프론트엔드 에러 수정

## ✅ 완료된 수정

### 1. api.ts export 문제
**에러**: `The requested module '/src/lib/api.ts' does not provide an export named 'api'`

**원인**: `export default api`인데 `import { api }`로 named import 사용

**해결**:
```typescript
// api.ts
export default api
export { api }  // named export 추가
```

이제 두 가지 방식 모두 사용 가능:
```typescript
// 방법 1 (권장)
import api from '@/lib/api'

// 방법 2 (호환성)
import { api } from '@/lib/api'
```

---

## 🔍 로그인 페이지 문제 진단

### 증상
"로그인 페이지가 안 나옴"

### 가능한 원인

#### 1. 브라우저에서 어떤 URL로 접속하고 있는지?
```
http://localhost:3000/          → PrivateRoute 체크 → /login으로 리다이렉트
http://localhost:3000/login     → LoginPage 직접 렌더링
```

#### 2. 이미 로그인되어 있는 경우
localStorage에 auth-storage가 남아있으면 자동 로그인됨!

**확인 방법**:
```javascript
// 브라우저 개발자도구 Console에서
localStorage.getItem('auth-storage')
```

**해결**:
```javascript
// 로그아웃 처리
localStorage.removeItem('auth-storage')
// 새로고침
```

#### 3. 컴포넌트 에러
LoginPage.tsx에서 에러 발생 시 화면이 안 나올 수 있음

**확인 방법**:
- 브라우저 개발자도구 Console 탭 확인
- Network 탭에서 index.html은 로드되는지 확인

---

## 🚀 테스트 방법

### 1. 완전 초기화
```javascript
// 브라우저 Console에서
localStorage.clear()
sessionStorage.clear()
```

새로고침 후 `/` 접속 → `/login`으로 리다이렉트되어야 함

### 2. 로그인 테스트
1. `http://localhost:3000/login` 직접 접속
2. 이메일/비밀번호 입력
3. 로그인 버튼 클릭
4. 성공 시 `/`로 이동

### 3. 회원가입 테스트
1. `http://localhost:3000/signup` 접속
2. 정보 입력 후 가입
3. 자동 로그인 → `/`로 이동

---

## 🐛 자주 발생하는 에러

### 1. "Cannot read property 'user' of undefined"
**원인**: authStore가 제대로 초기화 안 됨

**해결**:
```typescript
// authStore.ts 확인
const user = useAuthStore((state) => state.user)
// state가 null일 수 있으니 optional chaining 사용
const userName = user?.name
```

### 2. "Uncaught ReferenceError: api is not defined"
**원인**: api import 잘못됨

**해결**:
```typescript
// ❌ 틀림
import { api } from '@/lib/api'  // (이제는 가능)

// ✅ 올바름 (권장)
import api from '@/lib/api'
```

### 3. 무한 리다이렉트
**증상**: `/login`과 `/` 사이를 계속 왔다갔다

**원인**: 
- PrivateRoute에서 인증 체크 로직 오류
- authStore의 isAuthenticated가 계속 변경됨

**해결**:
```typescript
// authStore 확인
console.log(useAuthStore.getState())

// localStorage 확인
console.log(localStorage.getItem('auth-storage'))
```

---

## 📝 현재 상태 점검

### 확인할 것들

1. ✅ api.ts export 수정됨
2. ✅ LoginPage.tsx 존재
3. ✅ App.tsx 라우팅 설정됨
4. ✅ authStore 설정됨
5. ⏳ 백엔드 서버 실행 중?
6. ⏳ 프론트엔드 서버 실행 중?
7. ⏳ localStorage 깨끗한 상태?

### 다음 단계

#### 백엔드 실행 확인
```bash
cd backend
./gradlew bootRun

# 서버 실행 후
curl http://localhost:8080/actuator/health
```

#### 프론트엔드 실행 확인
```bash
cd frontend
npm run dev

# 서버 실행 후
# 브라우저: http://localhost:3000
```

#### Vite 프록시 설정 확인
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

---

## 🎯 최종 해결 방법

만약 여전히 로그인 페이지가 안 나온다면:

### 방법 1: 브라우저 완전 초기화
```
1. 개발자도구 열기 (F12)
2. Application 탭
3. Storage > Local Storage > localhost:3000
4. 우클릭 > Clear
5. 새로고침 (Ctrl+Shift+R)
```

### 방법 2: 시크릿 모드
```
1. Ctrl+Shift+N (Chrome)
2. http://localhost:3000 접속
3. localStorage가 깨끗한 상태로 테스트
```

### 방법 3: 강제 로그인 페이지 접속
```
http://localhost:3000/login
```
직접 URL 입력해서 접속

---

**작성일**: 2025-02-06  
**이슈**: api export 에러, 로그인 페이지 접근 문제
