import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { 
  Plus, Trash2, X, Loader2, FileText, Link2, Image, Video,
  Upload, ExternalLink, Star, GripVertical
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PortfolioFile {
  id: number
  fileType: 'PDF' | 'IMAGE' | 'EXTERNAL_LINK' | 'VIDEO'
  title: string
  description: string
  fileUrl: string
  originalFilename: string
  fileSize: number
  externalUrl: string
  thumbnailUrl: string
  isPublic: boolean
  isFeatured: boolean
  displayOrder: number
}

export default function PortfolioSection() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['portfolioFiles'],
    queryFn: async () => {
      const { data } = await api.get('/resume/portfolio-files')
      return data.data as PortfolioFile[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/portfolio-files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioFiles'] })
      toast.success('삭제되었습니다')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      api.put(`/resume/portfolio-files/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioFiles'] })
    },
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-8 h-8 text-red-500" />
      case 'IMAGE': return <Image className="w-8 h-8 text-blue-500" />
      case 'EXTERNAL_LINK': return <Link2 className="w-8 h-8 text-green-500" />
      case 'VIDEO': return <Video className="w-8 h-8 text-purple-500" />
      default: return <FileText className="w-8 h-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

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
          <h3 className="font-medium text-gray-900">포트폴리오 파일</h3>
          <p className="text-sm text-gray-500">PDF, 이미지, 외부 링크를 추가하세요</p>
        </div>
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
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                'p-4 border rounded-lg flex items-center gap-4 hover:bg-gray-50 transition-colors',
                file.isFeatured && 'border-primary-300 bg-primary-50/50'
              )}
            >
              <div className="cursor-grab text-gray-400">
                <GripVertical className="w-5 h-5" />
              </div>
              
              {file.thumbnailUrl ? (
                <img src={file.thumbnailUrl} alt="" className="w-16 h-16 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getIcon(file.fileType)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 truncate">{file.title}</h4>
                  {file.isFeatured && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {file.fileType === 'EXTERNAL_LINK' ? file.externalUrl : file.originalFilename}
                </p>
                {file.fileSize > 0 && (
                  <span className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={file.isPublic}
                    onChange={(e) => updateMutation.mutate({
                      id: file.id,
                      data: { ...file, isPublic: e.target.checked }
                    })}
                    className="rounded"
                  />
                  공개
                </label>
                
                <button
                  onClick={() => updateMutation.mutate({
                    id: file.id,
                    data: { ...file, isFeatured: !file.isFeatured }
                  })}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    file.isFeatured ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100 text-gray-400'
                  )}
                  title="대표 포트폴리오"
                >
                  <Star className={cn('w-4 h-4', file.isFeatured && 'fill-current')} />
                </button>

                {(file.fileUrl || file.externalUrl) && (
                  <a
                    href={file.fileUrl || file.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={() => deleteMutation.mutate(file.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">등록된 포트폴리오가 없습니다</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-primary-600 hover:underline"
          >
            첫 포트폴리오 추가하기
          </button>
        </div>
      )}

      {showForm && <PortfolioFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}

function PortfolioFormModal({ onClose }: { onClose: () => void }) {
  const [fileType, setFileType] = useState<'PDF' | 'IMAGE' | 'EXTERNAL_LINK' | 'VIDEO'>('PDF')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const handleSubmit = async () => {
    if (!title) {
      toast.error('제목을 입력해주세요')
      return
    }

    if ((fileType === 'PDF' || fileType === 'IMAGE') && !file) {
      toast.error('파일을 선택해주세요')
      return
    }

    if ((fileType === 'EXTERNAL_LINK' || fileType === 'VIDEO') && !externalUrl) {
      toast.error('URL을 입력해주세요')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('data', new Blob([JSON.stringify({
        fileType,
        title,
        description,
        externalUrl: (fileType === 'EXTERNAL_LINK' || fileType === 'VIDEO') ? externalUrl : null,
        isPublic,
        isFeatured: false,
      })], { type: 'application/json' }))
      
      if (file) {
        formData.append('file', file)
      }

      await api.post('/resume/portfolio-files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      queryClient.invalidateQueries({ queryKey: ['portfolioFiles'] })
      toast.success('포트폴리오가 추가되었습니다')
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || '업로드에 실패했습니다')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // 10MB 제한
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('파일 크기는 10MB 이하만 가능합니다')
        return
      }
      setFile(selectedFile)
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">포트폴리오 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">파일 유형</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'PDF', icon: FileText, label: 'PDF', color: 'text-red-500' },
                { value: 'IMAGE', icon: Image, label: '이미지', color: 'text-blue-500' },
                { value: 'EXTERNAL_LINK', icon: Link2, label: '링크', color: 'text-green-500' },
                { value: 'VIDEO', icon: Video, label: '영상', color: 'text-purple-500' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFileType(type.value as any)}
                  className={cn(
                    'p-3 border-2 rounded-lg flex flex-col items-center gap-1 transition-all',
                    fileType === type.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <type.icon className={cn('w-6 h-6', type.color)} />
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 파일 업로드 (PDF, IMAGE) */}
          {(fileType === 'PDF' || fileType === 'IMAGE') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">파일 업로드 *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept={fileType === 'PDF' ? '.pdf' : 'image/*'}
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  file ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
                )}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    {fileType === 'PDF' ? <FileText className="w-8 h-8 text-red-500" /> : <Image className="w-8 h-8 text-blue-500" />}
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">클릭하여 파일 선택</p>
                    <p className="text-sm text-gray-400 mt-1">최대 10MB</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 외부 URL (EXTERNAL_LINK, VIDEO) */}
          {(fileType === 'EXTERNAL_LINK' || fileType === 'VIDEO') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fileType === 'VIDEO' ? '영상 URL (YouTube 등)' : '외부 링크 (Notion, Figma 등)'} *
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder={fileType === 'VIDEO' ? 'https://youtube.com/watch?v=...' : 'https://notion.so/...'}
              />
            </div>
          )}

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="포트폴리오 제목"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="포트폴리오에 대한 간단한 설명"
            />
          </div>

          {/* 공개 여부 */}
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

          {/* 버튼 */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading || !title}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  업로드 중...
                </>
              ) : (
                '추가'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
