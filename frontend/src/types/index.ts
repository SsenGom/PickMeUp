/**
 * TypeScript 타입 정의
 * 
 * TypeScript란?
 * - JavaScript에 정적 타입을 추가한 언어
 * - 컴파일 타임에 타입 오류 감지 → 런타임 에러 방지
 * - IDE 자동완성, 리팩토링 지원
 * 
 * 이 파일에서 API 응답 타입을 정의해두면:
 * 1. 코드 작성 시 자동완성 지원
 * 2. 잘못된 필드 접근 시 컴파일 에러
 * 3. 코드 문서화 효과
 * 
 * 백엔드 DTO와 동기화 유지 필요!
 */

// ========== 공통 ==========

/**
 * API 응답 래퍼
 * 
 * 백엔드의 ApiResponse<T>와 동일
 * 모든 API 응답이 이 형식
 * 
 * Generic <T>: 실제 데이터 타입을 유연하게 지정
 * 예: ApiResponse<Task[]>, ApiResponse<User>
 */
export interface ApiResponse<T> {
  success: boolean
  message?: string   // ?는 optional (있어도 되고 없어도 됨)
  data: T
}

/**
 * 페이징 응답
 * 
 * Spring Data의 Page<T>와 동일
 * 목록 조회 시 페이징 정보 포함
 */
export interface PaginatedResponse<T> {
  content: T[]        // 실제 데이터 배열
  totalElements: number  // 전체 요소 수
  totalPages: number     // 전체 페이지 수
  size: number           // 페이지 크기
  number: number         // 현재 페이지 (0부터 시작)
}

// ========== 인증 ==========

/**
 * 사용자 정보
 */
export interface User {
  id: number
  email: string
  name: string
  profileImageUrl?: string
}

/**
 * 토큰 응답 (로그인/회원가입)
 */
export interface TokenResponse {
  accessToken: string    // API 호출용
  refreshToken: string   // 토큰 갱신용
  expiresIn: number      // 만료 시간 (ms)
  user: User             // 사용자 정보
}

// ========== 캘린더 ==========

/**
 * 캘린더 일정
 */
export interface CalendarEvent {
  id: number
  title: string
  description?: string
  startAt: string         // ISO 8601 형식: "2024-01-15T10:00:00"
  endAt: string
  isAllDay: boolean       // 종일 일정 여부
  location?: string
  color: string           // 일정 색상 (hex)
  recurrenceType?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'  // 반복 타입
  recurrenceInterval?: number  // 반복 간격
  recurrenceEndAt?: string     // 반복 종료일
  parentEventId?: number       // 반복 일정의 원본 ID
  createdAt: string
}

// ========== 할 일 ==========

/**
 * 할 일
 * 
 * Union Type (|): 지정된 값 중 하나만 허용
 * status는 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' 중 하나
 */
export interface Task {
  id: number
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string       // "2024-01-15"
  completedAt?: string
  category?: string
  displayOrder: number   // 드래그앤드롭 순서
  createdAt: string
  isOverdue: boolean     // 마감 지났는지 (계산된 필드)
}

/**
 * 할 일 통계
 */
export interface TaskStats {
  todo: number
  inProgress: number
  done: number
  overdue: number
}

// ========== 중요일 ==========

/**
 * 중요일 (기념일, 생일, D-day 등)
 */
export interface ImportantDate {
  id: number
  title: string
  description?: string
  targetDate: string
  type: 'ANNIVERSARY' | 'BIRTHDAY' | 'DEADLINE' | 'PAYMENT' | 'SUBSCRIPTION' | 'APPOINTMENT' | 'CUSTOM'
  isRecurring: boolean    // 매년 반복 여부
  color: string
  daysRemaining: number   // D-day (계산된 필드)
  nextOccurrence: string  // 다음 발생일
}

// ========== 메시지 (외부 연락) ==========

/**
 * 메시지 스레드 (대화방)
 */
export interface MessageThread {
  id: number
  senderName: string      // 보낸 사람 이름
  senderEmail: string
  subject?: string
  status: 'UNREAD' | 'READ' | 'REPLIED' | 'SPAM'
  isStarred: boolean      // 즐겨찾기
  isArchived: boolean     // 보관됨
  messageCount: number    // 메시지 수
  lastMessagePreview: string  // 마지막 메시지 미리보기
  createdAt: string
  updatedAt: string
}

/**
 * 개별 메시지
 */
export interface Message {
  id: number
  content: string
  direction: 'INBOUND' | 'OUTBOUND'  // 수신/발신
  isRead: boolean
  createdAt: string
}

/**
 * 스레드 상세 (메시지 목록 포함)
 */
export interface ThreadDetail {
  id: number
  senderName: string
  senderEmail: string
  subject?: string
  status: string
  isStarred: boolean
  messages: Message[]
}

// ========== 이력서 ==========

/**
 * 이력서
 */
export interface Resume {
  id: number
  name: string
  email: string
  profileImageUrl?: string
  title?: string           // 직함
  bio?: string             // 자기소개
  githubUrl?: string
  linkedinUrl?: string
  blogUrl?: string
  slug?: string            // 공개 URL용 슬러그 (/resume/{slug})
  isPublic: boolean        // 공개 여부
  experiences: Experience[]  // 경력
  projects: Project[]        // 프로젝트
  skills: Skill[]            // 기술 스택
}

/**
 * 경력
 */
export interface Experience {
  id: number
  company: string
  position: string
  startDate: string
  endDate?: string
  isCurrent: boolean    // 현재 재직 중
  description?: string
  displayOrder: number
}

/**
 * 프로젝트
 */
export interface Project {
  id: number
  title: string
  description?: string
  startDate?: string
  endDate?: string
  projectUrl?: string
  githubUrl?: string
  thumbnailUrl?: string
  techStacks: string[]   // 기술 스택 배열
  isFeatured: boolean    // 대표 프로젝트
  displayOrder: number
}

/**
 * 기술 스택
 */
export interface Skill {
  id: number
  name: string
  category?: string      // "Backend", "Frontend" 등
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  displayOrder: number
}

// ========== 취업 관리 ==========

/**
 * 지원 상태
 */
export type ApplicationStatus = 
  | 'INTERESTED'       // 관심
  | 'APPLIED'          // 지원완료
  | 'DOCUMENT_PASSED'  // 서류통과
  | 'FIRST_INTERVIEW'  // 1차면접
  | 'SECOND_INTERVIEW' // 2차면접
  | 'FINAL_INTERVIEW'  // 최종면접
  | 'ACCEPTED'         // 최종합격
  | 'REJECTED'         // 불합격
  | 'CANCELLED'        // 지원취소

/**
 * 취업 지원
 */
export interface JobApplication {
  id: number
  companyName: string
  position?: string
  department?: string
  jobPostingUrl?: string
  status: ApplicationStatus
  appliedAt?: string
  documentDeadline?: string
  documentResultAt?: string
  firstInterviewAt?: string
  secondInterviewAt?: string
  finalInterviewAt?: string
  finalResultAt?: string
  salaryInfo?: string
  bonusInfo?: string
  workHours?: string
  workLocation?: string
  commuteTime?: number
  notes?: string
  color: string
  createdAt: string
  updatedAt: string
}

/**
 * 취업 지원 상세 (질문/면접 포함)
 */
export interface JobApplicationDetail extends JobApplication {
  questions: ApplicationQuestion[]
  interviews: InterviewRecord[]
}

/**
 * 지원서 질문/답변
 */
export interface ApplicationQuestion {
  id: number
  question: string
  answer?: string
  displayOrder: number
  createdAt: string
}

/**
 * 면접 유형
 */
export type InterviewType = 
  | 'PHONE'         // 전화 면접
  | 'VIDEO'         // 화상 면접
  | 'ONSITE'        // 대면 면접
  | 'GROUP'         // 그룹 면접
  | 'PRESENTATION'  // PT 면접
  | 'CODING_TEST'   // 코딩 테스트
  | 'PERSONALITY'   // 인적성 검사
  | 'OTHER'         // 기타

/**
 * 면접 기록
 */
export interface InterviewRecord {
  id: number
  title: string
  type: InterviewType
  interviewAt?: string
  location?: string
  questions?: string
  answers?: string
  feedback?: string
  isPassed?: boolean
  displayOrder: number
  createdAt: string
}

/**
 * 취업 통계
 */
export interface JobStats {
  total: number
  interested: number
  applied: number
  documentPassed: number
  interviewing: number
  accepted: number
  rejected: number
}
