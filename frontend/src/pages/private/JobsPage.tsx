import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Building2, Briefcase, MapPin, Calendar, ExternalLink, MoreVertical, Pencil, Trash2, GripVertical, PartyPopper, HelpCircle, X, ChevronRight, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import Confetti from 'react-confetti'
import { 
  JobApplication, 
  ApplicationStatus, 
  STATUS_LABELS, 
  STATUS_COLORS,
} from '@/types/job'
import JobFormModal from '@/components/job/JobFormModal'
import JobDetailModal from '@/components/job/JobDetailModal'

// 메인 프로세스 상태 (연속적)
const MAIN_PROCESS: ApplicationStatus[] = [
  'APPLIED',
  'DOCUMENT_PASSED',
  'FIRST_INTERVIEW',  // 면접중 (1차, 2차 통합 표시)
  'FINAL_PASSED',
]

// 면접 상태들 (FIRST_INTERVIEW 컬럼에 함께 표시)
const INTERVIEW_STATUSES: ApplicationStatus[] = ['FIRST_INTERVIEW', 'SECOND_INTERVIEW']

// 가이드 스텝
const GUIDE_STEPS = [
  {
    title: '회사 추가',
    description: '관심있는 회사를 추가해보세요. 회사명, 포지션, 마감일 등을 입력할 수 있어요.',
  },
  {
    title: '드래그 & 드롭으로 상태 변경',
    description: '회사 카드를 드래그해서 다른 단계로 옮길 수 있어요. 예: 지원완료 → 서류통과',
  },
  {
    title: '서류/면접 Q&A 관리',
    description: '지원완료 상태에서는 서류전형 Q&A를, 서류통과 이후에는 면접 Q&A를 관리할 수 있어요.',
  },
  {
    title: '최종합격 축하!',
    description: '최종합격으로 이동하면 축하 애니메이션이 표시됩니다! 🎉',
  },
]

export default function JobsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editJob, setEditJob] = useState<JobApplication | null>(null)
  const [detailJob, setDetailJob] = useState<JobApplication | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  
  // 드래그 상태
  const [draggedJob, setDraggedJob] = useState<JobApplication | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<ApplicationStatus | null>(null)
  
  // 축하 애니메이션
  const [showConfetti, setShowConfetti] = useState(false)
  const [celebrateJob, setCelebrateJob] = useState<JobApplication | null>(null)
  const [confettiEnabled, setConfettiEnabled] = useState(() => {
    const saved = localStorage.getItem('jobs-confetti-enabled')
    return saved !== 'false' // 기본값 true
  })
  
  // 가이드
  const [showGuide, setShowGuide] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  
  const queryClient = useQueryClient()

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('jobs-guide-seen')
    if (!hasSeenGuide) {
      setShowGuide(true)
    }
  }, [])

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await api.get('/jobs')
      return data.data as JobApplication[]
    },
  })

  useQuery({
    queryKey: ['jobStats'],
    queryFn: async () => {
      const { data } = await api.get('/jobs/stats')
      return data.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/jobs/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobStats'] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ApplicationStatus }) => {
      await api.patch(`/jobs/${id}/status`, { status })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobStats'] })
      
      if (variables.status === 'FINAL_PASSED') {
        const job = jobs?.find(j => j.id === variables.id)
        if (job) {
          setCelebrateJob(job)
          if (confettiEnabled) {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 5000)
          }
        }
      }
    },
  })

  // 상태별 jobs 필터링
  const getJobsByStatus = (status: ApplicationStatus) => {
    if (status === 'FIRST_INTERVIEW') {
      // 면접중은 1차, 2차 면접 모두 포함
      return jobs?.filter(job => INTERVIEW_STATUSES.includes(job.status)) || []
    }
    return jobs?.filter(job => job.status === status) || []
  }

  // 드래그 핸들러
  const handleDragStart = (e: React.DragEvent, job: JobApplication) => {
    // 드래그 데이터 먼저 설정
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', job.id.toString())
    
    // 상태 설정은 setTimeout으로 지연 (브라우저 드래그 시작 후)
    setTimeout(() => {
      setDraggedJob(job)
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverStatus !== status) {
      setDragOverStatus(status)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // relatedTarget이 현재 요소의 자식이면 무시
    const currentTarget = e.currentTarget as HTMLElement
    const relatedTarget = e.relatedTarget as HTMLElement
    if (currentTarget.contains(relatedTarget)) {
      return
    }
    setDragOverStatus(null)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Drop on:', targetStatus, 'dragged:', draggedJob?.companyName)
    
    if (draggedJob && draggedJob.status !== targetStatus) {
      // 면접중 컬럼에 드롭하면 FIRST_INTERVIEW로 설정
      const actualStatus = targetStatus
      updateStatusMutation.mutate({
        id: draggedJob.id,
        status: actualStatus,
      })
    }
    
    setDraggedJob(null)
    setDragOverStatus(null)
  }

  const handleDragEnd = () => {
    setDraggedJob(null)
    setDragOverStatus(null)
  }

  const handleEdit = (job: JobApplication) => {
    setEditJob(job)
    setIsFormOpen(true)
    setMenuOpenId(null)
  }

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id)
    }
    setMenuOpenId(null)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditJob(null)
  }

  const handleGuideClose = (neverShow?: boolean) => {
    setShowGuide(false)
    setGuideStep(0)
    if (neverShow) {
      localStorage.setItem('jobs-guide-seen', 'true')
    }
  }

  // 상태 라벨 (면접중은 통합)
  const getStatusLabel = (status: ApplicationStatus) => {
    if (status === 'FIRST_INTERVIEW') return '면접중'
    return STATUS_LABELS[status]
  }

  // 작은 카드 컴포넌트
  const SmallJobCard = ({ job }: { job: JobApplication }) => {
    const isDragging = draggedJob?.id === job.id
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, job)}
        onDragEnd={handleDragEnd}
        onClick={() => !draggedJob && setDetailJob(job)}
        className={cn(
          'bg-white rounded-lg p-2 shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 group',
          isDragging && 'opacity-50 scale-95',
          !isDragging && 'hover:shadow-md'
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: job.color }}
          />
          <span className="text-sm font-medium truncate">{job.companyName}</span>
        </div>
        {job.position && (
          <p className="text-xs text-gray-400 truncate mt-0.5 ml-4">{job.position}</p>
        )}
      </div>
    )
  }

  // 메인 카드 컴포넌트
  const JobCard = ({ job }: { job: JobApplication }) => {
    const isDragging = draggedJob?.id === job.id
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, job)}
        onDragEnd={handleDragEnd}
        onClick={() => !draggedJob && setDetailJob(job)}
        className={cn(
          'bg-white rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 group',
          isDragging && 'opacity-50 scale-95',
          !isDragging && 'hover:shadow-lg hover:-translate-y-0.5'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: job.color }}
            />
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpenId(menuOpenId === job.id ? null : job.id)
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {menuOpenId === job.id && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[100px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(job)
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                >
                  <Pencil className="w-3 h-3" />
                  수정
                </button>
                {job.jobPostingUrl && (
                  <a
                    href={job.jobPostingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    공고
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(job.id)
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <h4 className="font-semibold truncate mb-1">{job.companyName}</h4>
        
        {job.position && (
          <p className="text-sm text-gray-500 truncate mb-2 flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {job.position}
          </p>
        )}

        {/* 면접 단계 표시 */}
        {INTERVIEW_STATUSES.includes(job.status) && (
          <span 
            className="inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2"
            style={{ 
              backgroundColor: STATUS_COLORS[job.status] + '20',
              color: STATUS_COLORS[job.status]
            }}
          >
            {STATUS_LABELS[job.status]}
          </span>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
          {job.location ? (
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
          ) : <span />}
          {job.deadlineAt && (
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {format(new Date(job.deadlineAt), 'M/d', { locale: ko })}
            </span>
          )}
        </div>
      </div>
    )
  }

  const interestedJobs = getJobsByStatus('INTERESTED')
  const rejectedJobs = getJobsByStatus('REJECTED')

  return (
    <div className="space-y-6">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* 축하 모달 */}
      {celebrateJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300">
            <PartyPopper className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-2">축하합니다! 🎉</h2>
            <p className="text-lg text-gray-600 mb-4">
              <span className="font-semibold text-primary-600">{celebrateJob.companyName}</span>
              {celebrateJob.position && <span> - {celebrateJob.position}</span>}
            </p>
            <p className="text-gray-500 mb-6">최종 합격을 진심으로 축하드립니다!</p>
            <button
              onClick={() => setCelebrateJob(null)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              감사합니다!
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">취업 관리</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newValue = !confettiEnabled
              setConfettiEnabled(newValue)
              localStorage.setItem('jobs-confetti-enabled', String(newValue))
            }}
            className={cn(
              'flex items-center gap-1 px-3 py-2 rounded-lg transition-colors',
              confettiEnabled 
                ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                : 'text-gray-400 hover:bg-gray-100'
            )}
            title={confettiEnabled ? '축하 효과 켜짐' : '축하 효과 꺼짐'}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">{confettiEnabled ? '🎉' : ''}</span>
          </button>
          <button
            onClick={() => { setShowGuide(true); setGuideStep(0) }}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">가이드</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            회사 추가
          </button>
        </div>
      </div>

      {/* 메인 프로세스 - 칸반 보드 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>지원 현황</span>
          <span className="text-sm font-normal text-gray-400">드래그하여 상태를 변경하세요</span>
        </h2>
        
        <div className="flex gap-4">
          {MAIN_PROCESS.map((status, index) => {
            const statusJobs = getJobsByStatus(status)
            const isDragOver = dragOverStatus === status
            const isLast = index === MAIN_PROCESS.length - 1
            
            return (
              <div key={status} className="flex-1 flex items-stretch gap-2">
                {/* Column */}
                <div className="flex-1 flex flex-col">
                  {/* Column Header */}
                  <div 
                    className="flex items-center gap-2 mb-3 pb-2 border-b-2"
                    style={{ borderColor: STATUS_COLORS[status] }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[status] }}
                    />
                    <h3 className="font-semibold">{getStatusLabel(status)}</h3>
                    <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {statusJobs.length}
                    </span>
                  </div>

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => handleDragOver(e, status)}
                    onDragLeave={(e) => handleDragLeave(e)}
                    onDrop={(e) => handleDrop(e, status)}
                    className={cn(
                      'flex-1 rounded-xl p-3 transition-all duration-200 min-h-[300px]',
                      isDragOver ? 'bg-primary-50 ring-2 ring-primary-400' : 'bg-gray-50'
                    )}
                  >
                    <div className="space-y-3">
                      {statusJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                      
                      {statusJobs.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">드래그하여 추가</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                {!isLast && (
                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 하단 영역 - 관심 & 불합격 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 관심 */}
        <div
          onDragOver={(e) => handleDragOver(e, 'INTERESTED')}
          onDragLeave={(e) => handleDragLeave(e)}
          onDrop={(e) => handleDrop(e, 'INTERESTED')}
          className={cn(
            'bg-white rounded-xl p-4 transition-all duration-200',
            dragOverStatus === 'INTERESTED' ? 'ring-2 ring-gray-400 bg-gray-50' : ''
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <h3 className="font-medium text-gray-600">관심</h3>
            <span className="text-xs text-gray-400">({interestedJobs.length})</span>
            <span className="text-xs text-gray-400 ml-auto">아직 지원 전</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto">
            {interestedJobs.map((job) => (
              <SmallJobCard key={job.id} job={job} />
            ))}
            {interestedJobs.length === 0 && (
              <p className="col-span-2 text-center text-gray-400 text-sm py-4">
                관심있는 회사를 추가해보세요
              </p>
            )}
          </div>
        </div>

        {/* 불합격 */}
        <div
          onDragOver={(e) => handleDragOver(e, 'REJECTED')}
          onDragLeave={(e) => handleDragLeave(e)}
          onDrop={(e) => handleDrop(e, 'REJECTED')}
          className={cn(
            'bg-white rounded-xl p-4 transition-all duration-200',
            dragOverStatus === 'REJECTED' ? 'ring-2 ring-red-400 bg-red-50' : ''
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <h3 className="font-medium text-gray-600">불합격</h3>
            <span className="text-xs text-gray-400">({rejectedJobs.length})</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto">
            {rejectedJobs.map((job) => (
              <SmallJobCard key={job.id} job={job} />
            ))}
            {rejectedJobs.length === 0 && (
              <p className="col-span-2 text-center text-gray-400 text-sm py-4">
                불합격 내역이 없습니다
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <JobFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editJob={editJob}
      />

      {/* Detail Modal */}
      <JobDetailModal
        isOpen={!!detailJob}
        onClose={() => setDetailJob(null)}
        job={detailJob}
        onEdit={(job) => {
          setDetailJob(null)
          handleEdit(job)
        }}
      />

      {/* Click outside to close menu */}
      {menuOpenId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setMenuOpenId(null)}
        />
      )}

      {/* 가이드 오버레이 */}
      {showGuide && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-80">
                    {guideStep + 1} / {GUIDE_STEPS.length}
                  </span>
                  <button
                    onClick={() => handleGuideClose(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-xl font-bold">{GUIDE_STEPS[guideStep].title}</h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  {GUIDE_STEPS[guideStep].description}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-primary-600"
                    onChange={(e) => {
                      if (e.target.checked) {
                        localStorage.setItem('jobs-guide-seen', 'true')
                      } else {
                        localStorage.removeItem('jobs-guide-seen')
                      }
                    }}
                  />
                  <span className="text-sm text-gray-500">다시 보지 않기</span>
                </label>
                
                <div className="flex items-center gap-2">
                  {guideStep > 0 && (
                    <button
                      onClick={() => setGuideStep(guideStep - 1)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      이전
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (guideStep < GUIDE_STEPS.length - 1) {
                        setGuideStep(guideStep + 1)
                      } else {
                        handleGuideClose()
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {guideStep === GUIDE_STEPS.length - 1 ? '완료' : '다음'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
