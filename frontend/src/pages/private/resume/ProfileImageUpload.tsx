import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Camera, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  currentImageUrl?: string
}

export default function ProfileImageUpload({ currentImageUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/resume/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('프로필 이미지가 업데이트되었습니다')
    },
    onError: () => {
      toast.error('업로드에 실패했습니다')
      setPreview(null)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
    uploadMutation.mutate(file)
  }

  const imageUrl = preview || currentImageUrl

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="프로필" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploadMutation.isPending ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>
      <div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          이미지 변경
        </button>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG 최대 5MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
