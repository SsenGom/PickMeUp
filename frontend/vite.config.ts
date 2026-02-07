/**
 * Vite 설정 파일
 * 
 * Vite란?
 * - 차세대 프론트엔드 빌드 도구
 * - 개발 서버: ES Module 기반 초고속 HMR (Hot Module Replacement)
 * - 빌드: Rollup 기반 최적화된 번들링
 * 
 * CRA(Create React App)보다 훨씬 빠름
 * - CRA: Webpack → 전체 번들링 후 서버 시작 (느림)
 * - Vite: ES Module → 필요한 것만 즉시 로드 (빠름)
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  /**
   * 플러그인
   * 
   * @vitejs/plugin-react: React 지원
   * - JSX 변환
   * - Fast Refresh (HMR)
   */
  plugins: [react()],
  
  /**
   * 전역 변수 정의
   * 
   * sockjs-client가 Node.js의 global 변수를 참조하는데
   * 브라우저에는 없어서 window로 대체
   */
  define: {
    global: 'window',
  },
  
  /**
   * 모듈 해석 설정
   */
  resolve: {
    /**
     * 경로 별칭 (Path Alias)
     * 
     * '@': src 폴더를 가리킴
     * 
     * 사용 전: import api from '../../../lib/api'
     * 사용 후: import api from '@/lib/api'
     * 
     * 장점:
     * - 깔끔한 import 경로
     * - 파일 이동해도 경로 변경 불필요
     */
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  /**
   * 개발 서버 설정
   */
  server: {
    port: 3000,  // 개발 서버 포트
    
    /**
     * 프록시 설정
     * 
     * CORS 문제 해결용
     * 
     * 문제:
     * Frontend (localhost:3000) → Backend (localhost:8080)
     * 브라우저 보안 정책으로 차단됨 (Cross-Origin)
     * ss
     * 해결:
     * Frontend → Vite 프록시 → Backend
     * 같은 Origin으로 보이므로 CORS 우회
     * 
     * 흐름:
     * 브라우저 → localhost:3000/api/tasks
     *         → Vite 프록시 → localhost:8080/api/tasks
     *         → Backend 응답 → 브라우저
     */
    proxy: {
      // /api로 시작하는 요청 → localhost:8080으로 전달
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,  // Origin 헤더 변경 (Host 헤더를 target으로)
      },
      // 업로드된 파일 접근 (이미지, PDF 등)
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // WebSocket 연결도 프록시
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,  // WebSocket 프록시 활성화
      },
    },
  },
})
