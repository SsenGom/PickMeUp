import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import api from '@/lib/api'
import { 
  JobApplication, 
  ApplicationStatus, 
  JobType,
  STATUS_LABELS,
  JOB_TYPE_LABELS,
  STATUS_ORDER
} from '@/types/job'
import { useModalKeyboard } from '@/hooks/useModalKeyboard'

interface JobFormModalProps {
  isOpen: boolean
  onClose: () => void
  editJob?: JobApplication | null
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
]

export default function JobFormModal({ isOpen, onClose, editJob }: JobFormModalProps) {
  const queryClient = useQueryClient()
  const isEditMode = !!editJob
  const firstInputRef = useRef<HTMLInputElement>(null)

  // ESC 키로 닫기
  useModalKeyboard(isOpen, onClose)

  // 모달 열릴 때 첫 입력칸에 포커스
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const [companyName, setCompanyName] = useState('')
  const [position, setPosition] = useState('')
  const [jobType, setJobType] = useState<JobType | ''>('')
  const [status, setStatus] = useState<ApplicationStatus>('INTERESTED')
  const [salary, setSalary] = useState('')
  const [bonus, setBonus] = useState('')
  const [workHours, setWorkHours] = useState('')
  const [location, setLocation] = useState('')
  const [distance, setDistance] = useState('')
  const [jobPostingUrl, setJobPostingUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [appliedAt, setAppliedAt] = useState('')
  const [deadlineAt, setDeadlineAt] = useState('')
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => {
    if (!isOpen) return

    if (editJob) {
      setCompanyName(editJob.companyName)
      setPosition(editJob.position || '')
      setJobType(editJob.jobType || '')
      setStatus(editJob.status)
      setSalary(editJob.salary || '')
      setBonus(editJob.bonus || '')
      setWorkHours(editJob.workHours || '')
      setLocation(editJob.location || '')
      setDistance(editJob.distance || '')
      setJobPostingUrl(editJob.jobPostingUrl || '')
      setNotes(editJob.notes || '')
      setAppliedAt(editJob.appliedAt || '')
      setDeadlineAt(editJob.deadlineAt ? format(new Date(editJob.deadlineAt), "yyyy-MM-dd'T'HH:mm") : '')
      setColor(editJob.color)
    } else {
      resetForm()
    }
  }, [isOpen, editJob])

  const resetForm = () => {
    setCompanyName('')
    setPosition('')
    setJobType('')
    setStatus('INTERESTED')
    setSalary('')
    setBonus('')
    setWorkHours('')
    setLocation('')
    setDistance('')
    setJobPostingUrl('')
    setNotes('')
    setAppliedAt('')
    setDeadlineAt('')
    setColor(COLORS[0])
  }

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/jobs', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobStats'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put(`/jobs/${editJob?.id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobStats'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      companyName,
      position: position || undefined,
      jobType: jobType || undefined,
      status,
      salary: salary || undefined,
      bonus: bonus || undefined,
      workHours: workHours || undefined,
      location: location || undefined,
      distance: distance || undefined,
      jobPostingUrl: jobPostingUrl || undefined,
      notes: notes || undefined,
      appliedAt: appliedAt || undefined,
      deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : undefined,
      color,
    }

    if (isEditMode) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b z-10">
          <h2 className="text-lg font-semibold">
            {isEditMode ? '회사 정보 수정' : '회사 추가'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회사명 *
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="회사명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                직무
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="프론트엔드 개발자"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                고용 형태
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">선택</option>
                {Object.entries(JOB_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                진행 상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                위치
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="서울 강남구"
              />
            </div>
          </div>

          {/* 급여 정보 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연봉
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="5,000만원"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                성과금
              </label>
              <input
                type="text"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="연봉의 10%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                근무시간
              </label>
              <input
                type="text"
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="9:00 - 18:00"
              />
            </div>
          </div>

          {/* 날짜 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                지원일
              </label>
              <input
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                마감일
              </label>
              <input
                type="datetime-local"
                value={deadlineAt}
                onChange={(e) => setDeadlineAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 기타 정보 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              채용공고 URL
            </label>
            <input
              type="url"
              value={jobPostingUrl}
              onChange={(e) => setJobPostingUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="메모를 입력하세요"
            />
          </div>

          {/* 색상 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              색상
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending || !companyName}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isPending ? '저장 중...' : isEditMode ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
