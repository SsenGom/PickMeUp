import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { Plus, Trash2, X, Loader2, FileText, Edit3, Eye, EyeOff, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface CoverLetter {
  id: number
  title: string
  targetCompany: string
  content: string
  isPublic: boolean
  isDefault: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export default function CoverLetterSection() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: coverLetters = [], isLoading } = useQuery({
    queryKey: ['coverLetters'],
    queryFn: async () => {
      const { data } = await api.get('/resume/cover-letters')
      return data.data as CoverLetter[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/cover-letters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverLetters'] })
      toast.success('삭제되었습니다')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/resume/cover-letters/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverLetters'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900">자기소개서</h3>
          <p className="text-sm text-gray-500">회사별로 다른 자기소개서를 관리하세요</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {coverLetters.length > 0 ? (
        <div className="space-y-3">
          {coverLetters.map((cl) => (
            <div
              key={cl.id}
              className={cn(
                'p-4 border rounded-lg hover:bg-gray-50 transition-colors',
                cl.isDefault && 'border-primary-300 bg-primary-50/50'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{cl.title}</h4>
                    {cl.isDefault && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                        기본
                      </span>
                    )}
                  </div>
                  {cl.targetCompany && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <Building2 className="w-4 h-4" />
                      {cl.targetCompany}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {cl.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    마지막 수정: {new Date(cl.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => updateMutation.mutate({
                      id: cl.id,
                      data: { ...cl, isPublic: !cl.isPublic }
                    })}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      cl.isPublic ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'
                    )}
                    title={cl.isPublic ? '공개 중' : '비공개'}
                  >
                    {cl.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => { setEditingId(cl.id); setShowForm(true) }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteMutation.mutate(cl.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">등록된 자기소개서가 없습니다</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-primary-600 hover:underline"
          >
            첫 자기소개서 작성하기
          </button>
        </div>
      )}

      {showForm && (
        <CoverLetterFormModal
          coverLetter={editingId ? coverLetters.find(c => c.id === editingId) : undefined}
          onClose={() => { setShowForm(false); setEditingId(null) }}
        />
      )}
    </div>
  )
}

function CoverLetterFormModal({ coverLetter, onClose }: { coverLetter?: CoverLetter; onClose: () => void }) {
  const [title, setTitle] = useState(coverLetter?.title || '')
  const [targetCompany, setTargetCompany] = useState(coverLetter?.targetCompany || '')
  const [content, setContent] = useState(coverLetter?.content || '')
  const [isPublic, setIsPublic] = useState(coverLetter?.isPublic || false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => coverLetter
      ? api.put(`/resume/cover-letters/${coverLetter.id}`, data)
      : api.post('/resume/cover-letters', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverLetters'] })
      toast.success(coverLetter ? '수정되었습니다' : '추가되었습니다')
      onClose()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '저장에 실패했습니다')
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            {coverLetter ? '자기소개서 수정' : '자기소개서 작성'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="네이버 지원용 자기소개서"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대상 회사 (선택)</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="네이버"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
              placeholder={`# 지원 동기

귀사에 지원하게 된 계기는...

# 성장 과정

저는 어릴 때부터...

# 성격의 장단점

저의 가장 큰 장점은...

# 입사 후 포부

입사 후에는...`}
            />
            <p className="text-xs text-gray-400 mt-1">
              마크다운 문법을 사용할 수 있습니다 (# 제목, ** 굵게, * 기울임)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              공개 이력서에 표시
            </label>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded-lg hover:bg-white transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => mutation.mutate({ title, targetCompany, content, isPublic })}
            disabled={!title || !content || mutation.isPending}
            className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
