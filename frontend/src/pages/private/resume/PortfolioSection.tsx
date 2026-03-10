import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '@/lib/api'
import { Plus, Trash2, ExternalLink, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PortfolioSection() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: files = [] } = useQuery({
    queryKey: ['portfolioFiles'],
    queryFn: async () => {
      const { data } = await api.get('/resume/portfolio-files')
      return data.data ?? []
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/portfolio-files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioFiles'] })
      toast.success('삭제되었습니다')
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">포트폴리오 파일 및 링크를 추가해주세요</p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {files.length > 0 ? (
        <div className="space-y-3">
          {files.map((file: any) => (
            <div key={file.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-medium">{file.title}</h4>
                <p className="text-sm text-gray-500">{file.fileType}</p>
                {file.externalUrl && (
                  <a href={file.externalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 flex items-center gap-1 mt-1">
                    <ExternalLink className="w-3 h-3" />
                    링크 열기
                  </a>
                )}
              </div>
              <button onClick={() => deleteMutation.mutate(file.id)} className="p-1 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>등록된 포트폴리오가 없습니다</p>
        </div>
      )}

      {showForm && <PortfolioFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}

function PortfolioFormModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [fileType, setFileType] = useState('PDF')
  const [description, setDescription] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/resume/portfolio-files', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioFiles'] })
      toast.success('추가되었습니다')
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">포트폴리오 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="포트폴리오 제목" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
            <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="PDF">PDF</option>
              <option value="IMAGE">이미지</option>
              <option value="VIDEO">영상</option>
              <option value="OTHER">기타</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">외부 URL</label>
            <input type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg resize-none" />
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button
              onClick={() => mutation.mutate({ title, fileType, description, externalUrl })}
              disabled={!title || mutation.isPending}
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
