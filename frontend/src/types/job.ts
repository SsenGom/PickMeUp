export type ApplicationStatus = 
  | 'INTERESTED'
  | 'APPLIED'
  | 'DOCUMENT_PASSED'
  | 'FIRST_INTERVIEW'
  | 'SECOND_INTERVIEW'
  | 'FINAL_PASSED'
  | 'REJECTED'

export type JobType = 'FULL_TIME' | 'CONTRACT' | 'INTERN' | 'PART_TIME'

export type JobEventType = 
  | 'DEADLINE'
  | 'DOCUMENT_RESULT'
  | 'FIRST_INTERVIEW'
  | 'SECOND_INTERVIEW'
  | 'FINAL_INTERVIEW'
  | 'FINAL_RESULT'
  | 'ONBOARDING'
  | 'OTHER'

export type QnaType = 'DOCUMENT' | 'INTERVIEW'

export type QnaMode = 'EXPECTED' | 'ACTUAL'  // 예상 질문 / 실제 질문

export type FileCategory = 'RESUME' | 'COVER_LETTER' | 'PORTFOLIO' | 'INTERVIEW_PREP' | 'OTHER'

export interface JobApplication {
  id: number
  companyName: string
  position?: string
  jobType?: JobType
  status: ApplicationStatus
  salary?: string
  bonus?: string
  workHours?: string
  location?: string
  distance?: string
  jobPostingUrl?: string
  notes?: string
  appliedAt?: string
  deadlineAt?: string
  color: string
  jobDescription?: string
  companyInfo?: string
  requiredSkills?: string
  experienceRequired?: string
  createdAt: string
  updatedAt: string
}

export interface JobApplicationDetail extends JobApplication {
  events: JobApplicationEvent[]
  qnas: JobApplicationQna[]
  files: JobApplicationFile[]
}

export interface JobApplicationEvent {
  id: number
  eventType: JobEventType
  eventDate: string
  location?: string
  notes?: string
  calendarEventId?: number
  createdAt: string
}

export interface JobApplicationQna {
  id: number
  qnaType: QnaType
  qnaMode: QnaMode
  question: string
  myAnswer?: string
  aiFeedback?: string
  bestAnswer?: string
  aiGenerated: boolean
  displayOrder: number
  createdAt: string
}

export interface JobApplicationFile {
  id: number
  fileCategory: FileCategory
  originalName: string
  storedName: string
  fileSize: number
  mimeType: string
  description?: string
  createdAt: string
}

export interface JobStats {
  total: number
  interested: number
  applied: number
  documentPassed: number
  interviewing: number
  finalPassed: number
  rejected: number
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  INTERESTED: '관심',
  APPLIED: '지원완료',
  DOCUMENT_PASSED: '서류통과',
  FIRST_INTERVIEW: '1차면접',
  SECOND_INTERVIEW: '2차면접',
  FINAL_PASSED: '최종합격',
  REJECTED: '불합격',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  INTERESTED: '#6B7280',
  APPLIED: '#3B82F6',
  DOCUMENT_PASSED: '#10B981',
  FIRST_INTERVIEW: '#F59E0B',
  SECOND_INTERVIEW: '#F97316',
  FINAL_PASSED: '#22C55E',
  REJECTED: '#EF4444',
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: '정규직',
  CONTRACT: '계약직',
  INTERN: '인턴',
  PART_TIME: '파트타임',
}

export const EVENT_TYPE_LABELS: Record<JobEventType, string> = {
  DEADLINE: '서류 마감',
  DOCUMENT_RESULT: '서류 발표',
  FIRST_INTERVIEW: '1차 면접',
  SECOND_INTERVIEW: '2차 면접',
  FINAL_INTERVIEW: '최종 면접',
  FINAL_RESULT: '최종 발표',
  ONBOARDING: '입사일',
  OTHER: '기타',
}

export const STATUS_ORDER: ApplicationStatus[] = [
  'INTERESTED',
  'APPLIED',
  'DOCUMENT_PASSED',
  'FIRST_INTERVIEW',
  'SECOND_INTERVIEW',
  'FINAL_PASSED',
  'REJECTED',
]

export const QNA_MODE_LABELS: Record<QnaMode, string> = {
  EXPECTED: '예상 질문',
  ACTUAL: '실제 질문',
}

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  RESUME: '이력서',
  COVER_LETTER: '자기소개서',
  PORTFOLIO: '포트폴리오',
  INTERVIEW_PREP: '면접 준비 자료',
  OTHER: '기타',
}
