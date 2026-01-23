import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import api from '@/lib/api'
import { ApplicationStatus } from '@/types'

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
}

const COLORS = [
  '#6366F1', // indigo
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
]

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'INTERESTED', label: '관심' },
  { value: 'APPLIED', label: '지원완료' },
  { value: 'DOCUMENT_PASSED', label: '서류통과' },
  { value: 'FIRST_INTERVIEW', label: '1차면접' },
  { value: 'SECOND_INTERVIEW', label: '2차면접' },
  { value: 'FINAL_INTERVIEW', label: '최종면접' },
]

export default function CreateJobModal({ isOpen, onClose }: CreateJobModalProps) {
  const queryClient = useQueryClient()
  
  const [companyName, setCompanyName] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('INTERESTED')
  const [jobPostingUrl, setJobPostingUrl] = useState('')
  const [documentDeadline, setDocumentDeadline] = useState('')
  const [workLocation, setWorkLocation] = useState('')
  const [salaryInfo, setSalaryInfo] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/jobs', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobStats'] })
      handleClose()
    },
  })

  const handleClose = () => {
    setCompanyName('')
    setPosition('')
    setStatus('INTERESTED')
    setJobPostingUrl('')
    setDocumentDeadline('')
    setWorkLocation('')
    setSalaryInfo('')
    setColor(COLORS[0])
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    createMutation.mutate({
      companyName,
      position: position || undefined,
      status,
      jobPostingUrl: jobPostingUrl || undefined,
      documentDeadline: documentDeadline || undefined,
      workLocation: workLocation || undefined,
      salaryInfo: salaryInfo || undefined,
      color,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* 컬러 라인 */}
        <div className="h-2" style={{ backgroundColor: color }} />

        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">새 지원 등록</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 회사명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회사명 *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="지원할 회사명"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 직무 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              직무
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="예: 백엔드 개발자"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* 채용공고 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              채용공고 URL
            </label>
            <input
              type="url"
              value={jobPostingUrl}
              onChange={(e) => setJobPostingUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 서류 마감일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              서류 마감일
            </label>
            <input
              type="date"
              value={documentDeadline}
              onChange={(e) => setDocumentDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 근무지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              근무지
            </label>
            <input
              type="text"
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              placeholder="예: 서울 강남구"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 연봉 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연봉 정보
            </label>
            <input
              type="text"
              value={salaryInfo}
              onChange={(e) => setSalaryInfo(e.target.value)}
              placeholder="예: 4000~5000만원"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !companyName}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? '저장 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
