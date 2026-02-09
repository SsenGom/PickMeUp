import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Camera, Loader2, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  currentImageUrl?: string
}

export default function ProfileImageUpload({ currentImageUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하만 가능합니다')
      return
    }

    // 이미지 타입 체크
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다')
      return
    }

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 업로드
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      await api.post('/resume/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('프로필 이미지가 업로드되었습니다')
    } catch (err: any) {
      toast.error(err.response?.data?.message || '업로드에 실패했습니다')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const displayImage = preview || currentImageUrl

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {displayImage ? (
          <img
            src={displayImage}
            alt="프로필"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
            <User className="w-10 h-10 text-gray-400" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full text-white hover:bg-primary-700 transition-colors shadow-lg disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="text-sm text-gray-500">
        <p>프로필 이미지를 업로드하세요</p>
        <p className="text-xs mt-1">JPG, PNG, GIF (최대 5MB)</p>
      </div>
    </div>
  )
}
