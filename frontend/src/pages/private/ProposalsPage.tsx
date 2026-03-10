import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Briefcase, Building2, MapPin, DollarSign, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProposalsPage() {
  const navigate = useNavigate()

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data } = await api.get('/proposals')
      return data.data ?? []
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">면접 제안</h1>
        <span className="text-sm text-gray-500">{proposals.length}개의 제안</span>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">아직 받은 면접 제안이 없습니다</p>
          <p className="text-gray-400 text-sm mt-2">이력서를 공개하면 채용 담당자로부터 제안을 받을 수 있어요</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {proposals.map((proposal: any) => (
            <div key={proposal.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-lg">{proposal.companyName}</h3>
                  </div>
                  <p className="text-primary-600 font-medium">{proposal.position}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {proposal.salaryRange && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {proposal.salaryRange}
                      </span>
                    )}
                    {proposal.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {proposal.location}
                      </span>
                    )}
                  </div>
                  {proposal.message && (
                    <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3 mt-2">{proposal.message}</p>
                  )}
                </div>
                <StatusBadge status={proposal.status} />
              </div>

              {proposal.status === 'PENDING' && (
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <button
                    onClick={() => api.post(`/proposals/${proposal.id}/accept`)}
                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => api.post(`/proposals/${proposal.id}/reject`)}
                    className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                  >
                    거절
                  </button>
                </div>
              )}

              {proposal.status === 'ACCEPTED' && proposal.threadId && (
                <button
                  onClick={() => navigate('/inbox')}
                  className="flex items-center gap-2 mt-4 pt-4 border-t text-primary-600 text-sm hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  채팅 열기
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING: { label: '대기중', className: 'bg-yellow-100 text-yellow-700' },
    ACCEPTED: { label: '수락됨', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: '거절됨', className: 'bg-red-100 text-red-700' },
  }
  const { label, className } = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' }
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span>
}
