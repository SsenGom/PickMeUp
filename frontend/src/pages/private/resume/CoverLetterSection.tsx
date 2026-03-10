import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '@/lib/api'
import { Plus, Trash2, FileEdit } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CoverLetterSection() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: letters = [] } = useQuery({
    queryKey: ['coverLetters'],
    queryFn: async () => {
      const { data } = await api.get('/resume/cover-letters')
      return data.data ?? []
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/cover-letters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverLetters'] })
      toast.success('삭제되었습니다')
    },
  })

  const editingLetter = letters.find((l: any) => l.id === editingId)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">자기소개서를 추가해주세요</p>
        <button
          onClick={() => { setEditingId(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {letters.length > 0 ? (
        <div className="space-y-3">
          {letters.map((letter: any) => (
            <div key={letter.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{letter.title}</h4>
                  {letter.targetCompany && <p className="text-sm text-primary-600">{letter.targetCompany}</p>}
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{letter.content}</p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => { setEditingId(letter.id); setShowForm(true) }} className="p-1 hover:bg-gray-100 rounded">
                    <FileEdit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(letter.id)} className="p-1 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <FileEdit className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>등록된 자기소개서가 없습니다</p>
        </div>
      )}

      {showForm && (
        <CoverLetterFormModal
          letter={editingLetter}
          onClose={() => { setShowForm(false); setEditingId(null) }}
        />
      )}
    </div>
  )
}

function CoverLetterFormModal({ letter, onClose }: { letter?: any; onClose: () => void }) {
  const [title, setTitle] = useState(letter?.title || '')
  const [targetCompany, setTargetCompany] = useState(letter?.targetCompany || '')
  const [content, setContent] = useState(letter?.content || '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => letter
      ? api.put(`/resume/cover-letters/${letter.id}`, data)
      : api.post('/resume/cover-letters', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverLetters'] })
      toast.success(letter ? '수정되었습니다' : '추가되었습니다')
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{letter ? '자기소개서 수정' : '자기소개서 추가'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="지원 동기 및 포부" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">지원 회사 (선택)</label>
            <input type="text" value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="OO회사" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border rounded-lg resize-none"
              placeholder="자기소개서 내용을 작성해주세요"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button
              onClick={() => mutation.mutate({ title, targetCompany, content })}
              disabled={!title || !content || mutation.isPending}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
