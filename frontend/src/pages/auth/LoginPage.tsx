/**
 * 로그인 페이지
 * 
 * 주요 기술:
 * - react-hook-form: 폼 상태 관리 (입력값, 에러 등)
 * - zod: 스키마 기반 유효성 검증
 * - zustand: 전역 인증 상태 관리
 * 
 * 흐름:
 * 1. 사용자 입력 → react-hook-form이 상태 관리
 * 2. 제출 → zod로 유효성 검증
 * 3. 검증 통과 → API 호출
 * 4. 성공 → authStore에 저장 → 홈으로 이동
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

/**
 * Zod 스키마 - 폼 유효성 검증 규칙
 * 
 * Zod란?
 * - TypeScript 우선 스키마 검증 라이브러리
 * - 런타임 + 타입 동시 검증
 * - react-hook-form과 통합 가능
 */
const schema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),  // 이메일 형식 검증
  password: z.string().min(1, '비밀번호를 입력하세요'),   // 빈 문자열 불가
})

/**
 * 스키마에서 타입 추론
 * 
 * z.infer: Zod 스키마에서 TypeScript 타입 자동 생성
 * 
 * FormData = {
 *   email: string
 *   password: string
 * }
 */
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  // ===== 로컬 상태 =====
  const [showPassword, setShowPassword] = useState(false)  // 비밀번호 표시 토글
  const [loading, setLoading] = useState(false)            // 로딩 상태
  
  // ===== 훅 =====
  const navigate = useNavigate()                           // 페이지 이동
  const setAuth = useAuthStore((state) => state.setAuth)   // 인증 정보 저장 액션

  /**
   * react-hook-form 설정
   * 
   * useForm: 폼 상태 관리 훅
   * 
   * 반환값:
   * - register: input에 연결 (onChange, value 등 자동 관리)
   * - handleSubmit: 폼 제출 핸들러 래퍼
   * - formState.errors: 유효성 검증 에러
   * 
   * zodResolver: Zod 스키마를 react-hook-form과 연결
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),  // Zod로 유효성 검증
  })

  /**
   * 폼 제출 핸들러
   * 
   * handleSubmit(onSubmit) 형태로 사용
   * - 먼저 유효성 검증 실행
   * - 통과하면 onSubmit 호출
   * - 실패하면 errors에 에러 저장
   */
  const onSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      // API 호출: POST /api/auth/login
      const { data } = await api.post('/auth/login', formData)
      
      // 인증 정보 저장 (Zustand + localStorage)
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken)
      
      toast.success('로그인 성공!')
      navigate('/')  // 홈으로 이동
      
    } catch (error: any) {
      // 에러 메시지 표시 (서버 메시지 또는 기본 메시지)
      toast.error(error.response?.data?.message || '로그인에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600">PickMeUp</h1>
          <p className="mt-2 text-gray-600">Personal OS에 로그인하세요</p>
        </div>

        {/* 로그인 폼 */}
        {/* handleSubmit: 폼 제출 시 유효성 검증 후 onSubmit 호출 */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm">
          
          {/* 이메일 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              {...register('email')}  /* register: input을 form에 연결. name='email' 필드 관리 */
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="you@example.com"
            />
            {/* 유효성 검증 에러 표시 */}
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}  /* 토글로 표시/숨김 전환 */
                {...register('password')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                placeholder="••••••••"
              />
              {/* 비밀번호 표시/숨김 버튼 */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}  /* 로딩 중 비활성화 */
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {/* 로딩 스피너 */}
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            로그인
          </button>

          {/* 회원가입 링크 */}
          <p className="text-center text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-primary-600 hover:underline">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
