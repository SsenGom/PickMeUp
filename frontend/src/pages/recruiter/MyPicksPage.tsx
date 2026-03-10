import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { User, Trash2, ExternalLink, Github, Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyPicksPage() {
  const queryClient = useQueryClient()

  const { data: picks = [], isLoading } = useQuery({
    queryKey: ['myPicks'],
    queryFn: async () => {
      const { data } = await api.get('/recruiter/picks')
      return data.data ?? []
    },
  })

  const removeMutation = useMutation({
    mutationFn: (userId: number) => api.delete(`/recruiter/picks/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPicks'] })
      toast.success('목록에서 제거했습니다')
    },
  })

  const proposeMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) =>
      api.post(`/recruiter/proposals/${userId}`, data),
    onSuccess: () => {
      toast.success('면접 제안을 보냈습니다')
    },
    onError: () => {
      toast.error('제안 발송에 실패했습니다')
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
        <h1 className="text-2xl font-bold">관심 인재</h1>
        <span className="text-sm text-gray-500">{picks.length}명</span>
      </div>

      {picks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">관심 인재가 없습니다</p>
          <p className="text-gray-400 text-sm mt-2">인재 탐색에서 마음에 드는 인재를 찜해보세요</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {picks.map((pick: any) => (
            <div key={pick.userId} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                {pick.profileImageUrl ? (
                  <img src={pick.profileImageUrl} alt={pick.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{pick.name}</h3>
                  {pick.title && <p className="text-sm text-primary-600">{pick.title}</p>}
                  {pick.bio && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{pick.bio}</p>}
                  
                  {pick.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pick.skills.slice(0, 4).map((skill: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{skill.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                {pick.githubUrl && (
                  <a href={pick.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded">
                    <Github className="w-4 h-4 text-gray-500" />
                  </a>
                )}
                {pick.linkedinUrl && (
                  <a href={pick.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded">
                    <Linkedin className="w-4 h-4 text-gray-500" />
                  </a>
                )}
                {pick.slug && (
                  <a href={`/resume/${pick.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </a>
                )}

                <div className="flex-1" />

                <button
                  onClick={() => proposeMutation.mutate({
                    userId: pick.userId,
                    data: { position: '개발자', companyName: '회사명' }
                  })}
                  className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                >
                  제안하기
                </button>
                <button
                  onClick={() => removeMutation.mutate(pick.userId)}
                  className="p-1.5 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
