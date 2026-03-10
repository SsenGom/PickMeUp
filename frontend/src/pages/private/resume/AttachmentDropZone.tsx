/**
 * AttachmentDropZone
 * 이력서 탭에서 포트폴리오/자소서 파일을
 * 드래그앤드롭 또는 클릭으로 첨부하는 컴포넌트
 */
import { useState, useRef, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { X, FileText, FilePlus, Loader2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface AttachedFile {
  id?: number
  name: string
  url: string
  type: 'PORTFOLIO' | 'COVER_LETTER' | string
  size?: number
}

interface Props {
  label: string
  type: 'PORTFOLIO' | 'COVER_LETTER'
  accept?: string
  files?: AttachedFile[]
  onUploaded?: (file: AttachedFile) => void
  onRemoved?: (id: number) => void
}

export default function AttachmentDropZone({
  label,
  type,
  accept = '.pdf,.doc,.docx,.ppt,.pptx,.hwp',
  files = [],
  onUploaded,
  onRemoved,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', type)
      const { data } = await api.post('/resume/portfolio-files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data as AttachedFile
    },
    onSuccess: (f) => {
      qc.invalidateQueries({ queryKey: ['myResume'] })
      onUploaded?.(f)
      toast.success(`${label} 첨부됨`)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || '업로드 실패'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/portfolio-files/${id}`),
    onSuccess: (_: any, id: number) => {
      qc.invalidateQueries({ queryKey: ['myResume'] })
      onRemoved?.(id)
      toast.success('삭제됨')
    },
  })

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return
      Array.from(fileList).forEach((f) => upload.mutate(f))
    },
    [upload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const formatSize = (bytes?: number) => {
    if (!bytes) return ''
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all text-center',
          isDragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        )}
      >
        {upload.isPending ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            <p className="text-sm text-gray-500">업로드 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className={cn('p-2 rounded-full', isDragging ? 'bg-primary-100' : 'bg-gray-100')}>
              <FilePlus
                className={cn('w-5 h-5', isDragging ? 'text-primary-600' : 'text-gray-400')}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{label} 첨부</p>
              <p className="text-xs text-gray-400 mt-0.5">드래그앤드롭 또는 클릭하여 선택</p>
              <p className="text-xs text-gray-300 mt-0.5">{accept.split(',').join(', ')}</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <div key={f.id ?? i} className="flex items-center gap-3 px-3 py-2 bg-white border rounded-lg">
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 flex-1 truncate">{f.name}</span>
              {f.size && (
                <span className="text-xs text-gray-400 shrink-0">{formatSize(f.size)}</span>
              )}
              {f.url && (
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-gray-100 rounded shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              )}
              {f.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    remove.mutate(f.id!)
                  }}
                  disabled={remove.isPending}
                  className="p-1 hover:bg-red-50 rounded shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
