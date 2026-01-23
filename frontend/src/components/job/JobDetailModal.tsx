import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  X, Pencil, Building2, MapPin, Calendar, Clock, 
  ExternalLink, DollarSign, Plus, Trash2, FileText, MessageSquare,
  Upload, Download, File, BookOpen, ClipboardCheck, Sparkles, Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { 
  JobApplication, 
  JobApplicationDetail,
  JobApplicationEvent,
  JobApplicationQna,
  JobApplicationFile,
  ApplicationStatus,
  JobEventType,
  QnaType,
  QnaMode,
  FileCategory,
  STATUS_LABELS, 
  STATUS_COLORS,
  JOB_TYPE_LABELS,
  EVENT_TYPE_LABELS,
  FILE_CATEGORY_LABELS
} from '@/types/job'
import { useModalKeyboard } from '@/hooks/useModalKeyboard'

interface JobDetailModalProps {
  isOpen: boolean
  onClose: () => void
  job: JobApplication | null
  onEdit: (job: JobApplication) => void
}

export default function JobDetailModal({ isOpen, onClose, job, onEdit }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'events' | 'document' | 'interview'>('info')
  const [localStatus, setLocalStatus] = useState<ApplicationStatus | null>(null)
  const queryClient = useQueryClient()

  useModalKeyboard(isOpen, onClose)

  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['job', job?.id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${job?.id}`)
      return data.data as JobApplicationDetail
    },
    enabled: !!job?.id && isOpen,
  })

  const statusMutation = useMutation({
    mutationFn: async (status: ApplicationStatus) => {
      await api.patch(`/jobs/${job?.id}/status`, { status })
    },
    onMutate: (status) => {
      setLocalStatus(status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', job?.id] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobStats'] })
    },
    onError: () => {
      setLocalStatus(null)
    },
  })

  if (!isOpen || !job) return null

  const currentDetail = detail || job
  const displayStatus = localStatus || currentDetail.status

  const documentQnas = detail?.qnas?.filter(q => q.qnaType === 'DOCUMENT') || []
  const interviewQnas = detail?.qnas?.filter(q => q.qnaType === 'INTERVIEW') || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="h-2 flex-shrink-0" style={{ backgroundColor: job.color }} />

        <div className="p-5 border-b flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{job.companyName}</h2>
              {job.position && (
                <p className="text-gray-500 mt-1">{job.position}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(job)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Pencil className="w-5 h-5 text-gray-500" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">진행 상태</p>
            <div className="flex flex-wrap gap-2">
              {(['APPLIED', 'DOCUMENT_PASSED', 'FIRST_INTERVIEW', 'SECOND_INTERVIEW', 'FINAL_PASSED'] as ApplicationStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => statusMutation.mutate(s)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    displayStatus === s
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={displayStatus === s ? { backgroundColor: STATUS_COLORS[s] } : {}}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              {(['INTERESTED', 'REJECTED'] as ApplicationStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => statusMutation.mutate(s)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    displayStatus === s
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  style={displayStatus === s ? { backgroundColor: STATUS_COLORS[s] } : {}}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex border-b overflow-x-auto flex-shrink-0">
          {[
            { key: 'info', label: '정보', icon: Building2 },
            { key: 'events', label: '일정', icon: Calendar, count: detail?.events?.length },
            { key: 'document', label: '서류 준비', icon: FileText, count: documentQnas.length },
            { key: 'interview', label: '면접 준비', icon: MessageSquare, count: interviewQnas.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0',
                activeTab === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">{count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'info' && (
            <InfoTab job={currentDetail as JobApplicationDetail} />
          )}
          {activeTab === 'events' && (
            isDetailLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : (
              <EventsTab jobId={job.id} events={detail?.events || []} />
            )
          )}
          {activeTab === 'document' && (
            isDetailLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : (
              <QnaTab jobId={job.id} qnas={documentQnas} qnaType="DOCUMENT" files={detail?.files || []} />
            )
          )}
          {activeTab === 'interview' && (
            isDetailLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : (
              <QnaTab jobId={job.id} qnas={interviewQnas} qnaType="INTERVIEW" files={detail?.files || []} />
            )
          )}
        </div>
      </div>
    </div>
  )
}

function InfoTab({ job }: { job: JobApplicationDetail }) {
  const [showJobDescForm, setShowJobDescForm] = useState(false)
  const [jobDescription, setJobDescription] = useState(job.jobDescription || '')
  const [requiredSkills, setRequiredSkills] = useState(job.requiredSkills || '')
  const [experienceRequired, setExperienceRequired] = useState(job.experienceRequired || '')
  const [jobPostingUrl, setJobPostingUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isCrawling, setIsCrawling] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<any>(null)
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: async () => {
      setIsSaving(true)
      await api.put(`/jobs/${job.id}`, {
        jobDescription,
        requiredSkills,
        experienceRequired,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', job.id] })
      setShowJobDescForm(false)
      setIsSaving(false)
    },
    onError: () => {
      setIsSaving(false)
    },
  })

  // URL에서 채용공고 크롤링
  const crawlJobPosting = async () => {
    if (!jobPostingUrl.trim()) return
    
    setIsCrawling(true)
    try {
      const { data } = await api.post(`/jobs/${job.id}/crawl-job-posting`, {
        url: jobPostingUrl
      })
      
      if (data.data.success) {
        setJobDescription(data.data.content)
        setJobPostingUrl('')
        queryClient.invalidateQueries({ queryKey: ['job', job.id] })
      } else {
        alert(data.data.content || '채용공고를 불러올 수 없습니다.')
      }
    } catch (error: any) {
      console.error('Crawl failed:', error)
      alert(error.response?.data?.message || '채용공고를 불러올 수 없습니다.')
    } finally {
      setIsCrawling(false)
    }
  }

  // 이미지 붙여넣기 핸들러
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue

        setIsExtracting(true)
        try {
          // 이미지를 Base64로 변환
          const base64 = await fileToBase64(file)
          
          // OCR API 호출
          const { data } = await api.post(`/jobs/${job.id}/extract-text`, {
            base64Image: base64.split(',')[1] // data:image/...;base64, 부분 제거
          })
          
          if (data.data.success && data.data.extractedText) {
            setJobDescription(prev => prev + (prev ? '\n\n' : '') + data.data.extractedText)
          }
        } catch (error) {
          console.error('OCR failed:', error)
        } finally {
          setIsExtracting(false)
        }
      }
    }
  }

  // 회사 정보 검색
  const searchCompany = async () => {
    setIsSearching(true)
    try {
      const { data } = await api.post(`/jobs/${job.id}/search-company`)
      setCompanyInfo(data.data)
      queryClient.invalidateQueries({ queryKey: ['job', job.id] })
    } catch (error: any) {
      console.error('Company search failed:', error)
      alert(error.response?.data?.message || '회사 정보 검색에 실패했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {job.jobType && (
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">고용형태</p>
              <p className="font-medium">{JOB_TYPE_LABELS[job.jobType]}</p>
            </div>
          </div>
        )}
        {job.location && (
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">위치</p>
              <p className="font-medium">{job.location}</p>
            </div>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">연봉</p>
              <p className="font-medium">{job.salary}{job.bonus && ` + ${job.bonus}`}</p>
            </div>
          </div>
        )}
        {job.workHours && (
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">근무시간</p>
              <p className="font-medium">{job.workHours}</p>
            </div>
          </div>
        )}
        {job.appliedAt && (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">지원일</p>
              <p className="font-medium">{format(new Date(job.appliedAt), 'yyyy년 M월 d일')}</p>
            </div>
          </div>
        )}
        {job.deadlineAt && (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">마감일</p>
              <p className="font-medium">{format(new Date(job.deadlineAt), 'yyyy년 M월 d일 HH:mm')}</p>
            </div>
          </div>
        )}
      </div>

      {job.jobPostingUrl && (
        <a
          href={job.jobPostingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary-600 hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          채용공고 보기
        </a>
      )}

      {job.notes && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">메모</p>
          <p className="whitespace-pre-wrap">{job.notes}</p>
        </div>
      )}

      {/* 회사 정보 검색 섹션 */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            회사 정보
          </h3>
          <button
            onClick={searchCompany}
            disabled={isSearching}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                AI로 회사 정보 검색
              </>
            )}
          </button>
        </div>

        {job.companyInfo ? (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="whitespace-pre-wrap text-sm">{job.companyInfo}</p>
          </div>
        ) : companyInfo ? (
          <div className="space-y-3">
            {companyInfo.overview && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">회사 개요</p>
                <p className="text-sm whitespace-pre-wrap">{companyInfo.overview}</p>
              </div>
            )}
            {companyInfo.recentNews && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">최근 뉴스</p>
                <p className="text-sm whitespace-pre-wrap">{companyInfo.recentNews}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            "AI로 회사 정보 검색" 버튼을 눌러 회사 정보를 가져오세요
          </p>
        )}
      </div>

      {/* 채용공고 상세 정보 섹션 */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            채용공고 상세 정보
          </h3>
          <button
            onClick={() => setShowJobDescForm(!showJobDescForm)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showJobDescForm ? '취소' : (job.jobDescription ? '수정' : '입력하기')}
          </button>
        </div>

        {showJobDescForm ? (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              💡 채용공고를 <b>복사해서 붙여넣기</b>하거나, <b>스크린샷을 Ctrl+V</b>로 붙여넣으면 AI가 텍스트를 추출해요!
            </div>

            {/* URL 크롤링 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                채용공고 URL로 불러오기
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={jobPostingUrl}
                  onChange={(e) => setJobPostingUrl(e.target.value)}
                  placeholder="https://www.saramin.co.kr/... 또는 wanted.co.kr/..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  disabled={isCrawling}
                />
                <button
                  onClick={crawlJobPosting}
                  disabled={!jobPostingUrl.trim() || isCrawling}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                >
                  {isCrawling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      불러오는 중...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      불러오기
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                사람인, 잡코리아, 원티드, 프로그래머스 등 지원
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                채용공고 내용
              </label>
              <div className="relative">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="채용공고 전문을 복사해서 붙여넣거나, 스크린샷을 Ctrl+V로 붙여넣으세요..."
                  rows={8}
                  className="w-full px-3 py-2 border rounded-lg resize-none text-sm"
                  disabled={isExtracting}
                />
                {isExtracting && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <div className="flex items-center gap-2 text-primary-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>이미지에서 텍스트 추출 중...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  요구 기술 스택
                </label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  경력 요건
                </label>
                <input
                  type="text"
                  value={experienceRequired}
                  onChange={(e) => setExperienceRequired(e.target.value)}
                  placeholder="3년 이상, 신입 가능..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <button
              onClick={() => saveMutation.mutate()}
              disabled={isSaving}
              className="w-full py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </button>
          </div>
        ) : job.jobDescription ? (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap text-sm">{job.jobDescription}</p>
            </div>
            {(job.requiredSkills || job.experienceRequired) && (
              <div className="flex gap-4 text-sm">
                {job.requiredSkills && (
                  <div>
                    <span className="text-gray-500">기술 스택:</span>
                    <span className="ml-2 text-gray-700">{job.requiredSkills}</span>
                  </div>
                )}
                {job.experienceRequired && (
                  <div>
                    <span className="text-gray-500">경력:</span>
                    <span className="ml-2 text-gray-700">{job.experienceRequired}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              채용공고 내용을 입력하면 AI가 더 정확한 질문을 생성해요
            </p>
            <button
              onClick={() => setShowJobDescForm(true)}
              className="text-sm text-primary-600 hover:underline"
            >
              채용공고 입력하기 →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Base64 변환 유틸 함수
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

function EventsTab({ jobId, events }: { jobId: number; events: JobApplicationEvent[] }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [eventType, setEventType] = useState<JobEventType>('DEADLINE')
  const [eventDate, setEventDate] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [eventNotes, setEventNotes] = useState('')
  const [syncToCalendar, setSyncToCalendar] = useState(true)

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/jobs/${jobId}/events`, {
        eventType,
        eventDate: new Date(eventDate).toISOString(),
        location: eventLocation || undefined,
        notes: eventNotes || undefined,
        syncToCalendar,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
      setShowForm(false)
      setEventDate('')
      setEventLocation('')
      setEventNotes('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await api.delete(`/jobs/${jobId}/events/${eventId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
    },
  })

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <Plus className="w-4 h-4" />
        일정 추가
      </button>

      {showForm && (
        <div className="p-4 border rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as JobEventType)}
              className="px-3 py-2 border rounded-lg"
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <input
            type="text"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="장소 (선택)"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            value={eventNotes}
            onChange={(e) => setEventNotes(e.target.value)}
            placeholder="메모 (선택)"
            rows={2}
            className="w-full px-3 py-2 border rounded-lg resize-none"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="syncToCalendar"
              checked={syncToCalendar}
              onChange={(e) => setSyncToCalendar(e.target.checked)}
            />
            <label htmlFor="syncToCalendar" className="text-sm">캘린더에 추가</label>
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!eventDate || createMutation.isPending}
            className="w-full py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
          >
            {createMutation.isPending ? '추가 중...' : '추가'}
          </button>
        </div>
      )}

      {events.length > 0 ? (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{EVENT_TYPE_LABELS[event.eventType]}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(event.eventDate), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                  {event.location && ` · ${event.location}`}
                </p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(event.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        !showForm && <p className="text-center text-gray-500 py-8">등록된 일정이 없습니다</p>
      )}
    </div>
  )
}

function QnaTab({ jobId, qnas, qnaType, files }: { jobId: number; qnas: JobApplicationQna[]; qnaType: QnaType; files: JobApplicationFile[] }) {
  const queryClient = useQueryClient()
  const [activeMode, setActiveMode] = useState<QnaMode>('EXPECTED')
  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState('')
  const [myAnswer, setMyAnswer] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>(
    qnaType === 'DOCUMENT' ? 'COVER_LETTER' : 'INTERVIEW_PREP'
  )
  const [fileDescription, setFileDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showFileSection, setShowFileSection] = useState(false)

  const documentCategories: FileCategory[] = ['RESUME', 'COVER_LETTER', 'PORTFOLIO']
  const interviewCategories: FileCategory[] = ['INTERVIEW_PREP', 'OTHER']
  const relevantCategories = qnaType === 'DOCUMENT' ? documentCategories : interviewCategories
  const relevantFiles = files.filter(f => relevantCategories.includes(f.fileCategory))

  const { data: aiUsage } = useQuery({
    queryKey: ['aiUsage'],
    queryFn: async () => {
      const { data } = await api.get('/jobs/ai/usage')
      return data.data as { questionsRemaining: number; feedbackRemaining: number; dailyLimit: number }
    },
  })

  const prepQnas = qnas.filter(q => q.qnaMode === 'EXPECTED')
  const reviewQnas = qnas.filter(q => q.qnaMode === 'ACTUAL')

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/jobs/${jobId}/qnas`, {
        qnaType,
        qnaMode: activeMode,
        question,
        myAnswer: myAnswer || undefined,
        aiGenerated: false,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      setShowForm(false)
      setQuestion('')
      setMyAnswer('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (qnaId: number) => {
      await api.delete(`/jobs/${jobId}/qnas/${qnaId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
    },
  })

  const generateQuestionsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true)
      setError(null)
      const { data } = await api.post(`/jobs/${jobId}/ai/generate-questions`, {
        qnaType,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['aiUsage'] })
      setIsGenerating(false)
    },
    onError: (err: any) => {
      setIsGenerating(false)
      const message = err.response?.data?.message || 'AI 질문 생성에 실패했습니다.'
      setError(message)
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', selectedCategory)
      if (fileDescription) formData.append('description', fileDescription)
      
      await api.post(`/jobs/${jobId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      setFileDescription('')
      setIsUploading(false)
    },
    onError: () => {
      setIsUploading(false)
    },
  })

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await api.delete(`/jobs/${jobId}/files/${fileId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  const handleDownload = async (file: JobApplicationFile) => {
    try {
      const response = await api.get(`/jobs/${jobId}/files/${file.id}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.originalName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const groupedFiles = relevantFiles.reduce((acc, file) => {
    if (!acc[file.fileCategory]) acc[file.fileCategory] = []
    acc[file.fileCategory].push(file)
    return acc
  }, {} as Record<FileCategory, JobApplicationFile[]>)

  const currentQnas = activeMode === 'EXPECTED' ? prepQnas : reviewQnas
  const isDocument = qnaType === 'DOCUMENT'
  const canGenerateQuestions = (aiUsage?.questionsRemaining ?? 0) > 0

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveMode('EXPECTED')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors',
            activeMode === 'EXPECTED' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <BookOpen className="w-4 h-4" />
          예상 질문 ({prepQnas.length})
        </button>
        <button
          onClick={() => setActiveMode('ACTUAL')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors',
            activeMode === 'ACTUAL' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <ClipboardCheck className="w-4 h-4" />
          실제 질문 ({reviewQnas.length})
        </button>
      </div>

      <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        {activeMode === 'EXPECTED' ? (
          isDocument 
            ? '예상되는 자기소개서 질문을 준비하고 답변을 연습해보세요. AI가 예상 질문을 생성해줄 수 있어요.'
            : '예상되는 면접 질문을 준비하고 답변을 연습해보세요. AI가 예상 질문을 생성해줄 수 있어요.'
        ) : (
          isDocument
            ? '실제 제출한 자기소개서 내용을 기록해두세요.'
            : '실제 받았던 면접 질문과 내 답변을 기록해두세요.'
        )}
      </div>

      {activeMode === 'EXPECTED' && (
        <div className="space-y-2">
          <button
            className={cn(
              "w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors",
              canGenerateQuestions 
                ? "border-primary-300 text-primary-600 hover:bg-primary-50" 
                : "border-gray-200 text-gray-400 cursor-not-allowed"
            )}
            onClick={() => canGenerateQuestions && generateQuestionsMutation.mutate()}
            disabled={isGenerating || !canGenerateQuestions}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI가 질문을 생성하고 있어요...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AI로 예상 질문 5개 생성하기
              </>
            )}
          </button>
          <p className="text-xs text-center text-gray-500">
            오늘 남은 횟수: {aiUsage?.questionsRemaining ?? '-'} / {aiUsage?.dailyLimit ?? 5}회
          </p>
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <Plus className="w-4 h-4" />
        직접 질문 추가
      </button>

      {showForm && (
        <div className="p-4 border rounded-lg space-y-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="질문"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            value={myAnswer}
            onChange={(e) => setMyAnswer(e.target.value)}
            placeholder={activeMode === 'EXPECTED' ? '내 답변 연습' : '실제 답변 내용'}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!question || createMutation.isPending}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
            >
              {createMutation.isPending ? '추가 중...' : '추가'}
            </button>
          </div>
        </div>
      )}

      {currentQnas.length > 0 ? (
        <div className="space-y-3">
          {currentQnas.map((qna) => (
            <QnaItem 
              key={qna.id} 
              qna={qna} 
              jobId={jobId}
              feedbackRemaining={aiUsage?.feedbackRemaining ?? 0}
              onDelete={() => deleteMutation.mutate(qna.id)} 
            />
          ))}
        </div>
      ) : (
        !showForm && (
          <p className="text-center text-gray-500 py-8">
            {activeMode === 'EXPECTED' 
              ? '예상 질문이 없습니다. AI로 생성하거나 직접 추가해보세요.'
              : '실제 질문이 없습니다. 받았던 질문과 답변을 기록해보세요.'}
          </p>
        )
      )}

      <div className="mt-6 pt-4 border-t">
        <button
          onClick={() => setShowFileSection(!showFileSection)}
          className="flex items-center gap-2 text-gray-700 font-medium mb-3"
        >
          <File className="w-4 h-4" />
          {qnaType === 'DOCUMENT' ? '서류 첨부파일' : '면접 준비 자료'}
          <span className="text-sm text-gray-500 font-normal">({relevantFiles.length})</span>
          <span className="text-gray-400 ml-auto">{showFileSection ? '\u25BC' : '\u25B6'}</span>
        </button>

        {showFileSection && (
          <div className="space-y-4">
            <div className="p-3 border border-dashed rounded-lg space-y-2">
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as FileCategory)}
                  className="px-2 py-1.5 text-sm border rounded-lg"
                >
                  {relevantCategories.map((key) => (
                    <option key={key} value={key}>{FILE_CATEGORY_LABELS[key]}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="설명 (선택)"
                  className="flex-1 px-2 py-1.5 text-sm border rounded-lg"
                />
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-600 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    파일 업로드
                  </>
                )}
              </button>
            </div>

            {Object.entries(groupedFiles).map(([category, categoryFiles]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {FILE_CATEGORY_LABELS[category as FileCategory]}
                </h4>
                <div className="space-y-1">
                  {categoryFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group text-sm"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{file.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.fileSize)}
                            {file.description && ` \u00B7 ${file.description}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Download className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => deleteFileMutation.mutate(file.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {relevantFiles.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">
                첨부된 파일이 없습니다
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function QnaItem({ qna, jobId, feedbackRemaining, onDelete }: { qna: JobApplicationQna; jobId: number; feedbackRemaining: number; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [myAnswer, setMyAnswer] = useState(qna.myAnswer || '')
  const [showBestAnswer, setShowBestAnswer] = useState(false)
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/jobs/${jobId}/qnas/${qna.id}`, {
        question: qna.question,
        myAnswer,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      setIsEditing(false)
    },
  })

  const feedbackMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingFeedback(true)
      setError(null)
      const { data } = await api.post(`/jobs/${jobId}/ai/feedback/${qna.id}`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['aiUsage'] })
      setIsGeneratingFeedback(false)
    },
    onError: (err: any) => {
      setIsGeneratingFeedback(false)
      const message = err.response?.data?.message || 'AI 피드백 생성에 실패했습니다.'
      setError(message)
    },
  })

  const canGetFeedback = feedbackRemaining > 0 && qna.myAnswer && qna.myAnswer.trim().length > 0
  const hasBestAnswer = qna.bestAnswer && qna.bestAnswer.trim().length > 0

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 flex-1">
          {qna.aiGenerated && <Sparkles className="w-4 h-4 text-yellow-500" />}
          <span className="font-medium truncate">{qna.question}</span>
        </div>
        <span className="text-gray-400 ml-2">{expanded ? '\u2212' : '+'}</span>
      </button>
      
      {expanded && (
        <div className="p-4 border-t space-y-3">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">내 답변</p>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  수정
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={myAnswer}
                  onChange={(e) => setMyAnswer(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setMyAnswer(qna.myAnswer || '') }}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    className="px-3 py-1 text-sm bg-primary-600 text-white rounded disabled:opacity-50"
                  >
                    {updateMutation.isPending ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-3 rounded-lg">
                {qna.myAnswer || '(답변 없음)'}
              </p>
            )}
          </div>

          {qna.aiFeedback && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                AI 피드백
              </p>
              <p className="whitespace-pre-wrap text-gray-700 bg-yellow-50 p-3 rounded-lg">
                {qna.aiFeedback}
              </p>
            </div>
          )}

          {/* 모범답변 토글 영역 */}
          {hasBestAnswer && (
            <div>
              {showBestAnswer ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      AI 모범답변
                    </p>
                    <button
                      onClick={() => setShowBestAnswer(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      숨기기
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-700 bg-green-50 p-3 rounded-lg">
                    {qna.bestAnswer}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowBestAnswer(true)}
                  className="w-full py-2 border border-green-200 bg-green-50 text-green-700 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  AI 모범답변 보기
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between pt-2 border-t">
            {qna.qnaMode === 'EXPECTED' && (
              <button
                onClick={() => canGetFeedback && feedbackMutation.mutate()}
                disabled={isGeneratingFeedback || !canGetFeedback}
                className={cn(
                  "text-sm flex items-center gap-1",
                  canGetFeedback 
                    ? "text-primary-600 hover:underline" 
                    : "text-gray-400 cursor-not-allowed"
                )}
                title={!qna.myAnswer ? "답변을 먼저 작성해주세요" : feedbackRemaining <= 0 ? "오늘 사용량을 모두 소진했습니다" : ""}
              >
                {isGeneratingFeedback ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    피드백 생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {qna.aiFeedback ? '내 답변 피드백 다시 받기' : '내 답변에 대한 피드백 받기'}
                  </>
                )}
              </button>
            )}
            {qna.qnaMode === 'ACTUAL' && <div />}
            <button
              onClick={onDelete}
              className="text-sm text-red-500 hover:text-red-600 ml-auto"
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
