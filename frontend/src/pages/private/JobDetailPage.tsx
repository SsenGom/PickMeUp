import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { JobApplicationDetail } from '@/types/job'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}`)
      return data.data as JobApplicationDetail
    },
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="p-8 text-center">로딩 중...</div>
  }

  if (!job) {
    return <div className="p-8 text-center">회사 정보를 찾을 수 없습니다.</div>
  }

  return (
    <div>
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        목록으로
      </button>

      <h1 className="text-2xl font-bold">{job.companyName}</h1>
      {/* 나머지 상세 내용은 JobDetailModal과 유사하게 구현 */}
    </div>
  )
}
