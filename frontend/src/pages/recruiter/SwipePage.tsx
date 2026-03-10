import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { X, Heart, Github, Linkedin, Globe, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface PublicResume {
  id: number
  userId: number
  name: string
  title: string
  bio: string
  profileImageUrl: string
  githubUrl: string
  linkedinUrl: string
  blogUrl: string
  skills: { name: string; level: string }[]
  experiences: { company: string; position: string }[]
}

export default function SwipePage() {
  const [index, setIndex] = useState(0)
  const [likedIds, setLikedIds] = useState<number[]>([])

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['publicResumes'],
    queryFn: async () => {
      const { data } = await api.get('/resumes/public')
      return data.data ?? []
    },
  })

  const current: PublicResume | undefined = resumes[index]

  const handleLike = async () => {
    if (!current) return
    try {
      await api.post(`/recruiter/picks/${current.userId}`)
      setLikedIds(prev => [...prev, current.userId])
      toast.success('관심 목록에 추가했습니다')
    } catch {
      toast.error('오류가 발생했습니다')
    }
    setIndex(i => i + 1)
  }

  const handlePass = () => {
    setIndex(i => i + 1)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">인재 탐색</h1>

      {!current ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">더 이상 볼 이력서가 없습니다</p>
          <p className="text-gray-400 text-sm mt-2">나중에 다시 확인해주세요</p>
        </div>
      ) : (
        <>
          {/* 카드 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* 프로필 */}
            <div className="flex items-center gap-4 mb-6">
              {current.profileImageUrl ? (
                <img src={current.profileImageUrl} alt={current.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">{current.name}</h2>
                {current.title && <p className="text-primary-600">{current.title}</p>}
              </div>
            </div>

            {/* 자기소개 */}
            {current.bio && (
              <p className="text-gray-600 mb-6 leading-relaxed">{current.bio}</p>
            )}

            {/* 경력 */}
            {current.experiences?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">최근 경력</h3>
                {current.experiences.slice(0, 2).map((exp, i) => (
                  <p key={i} className="text-sm text-gray-700">{exp.company} · {exp.position}</p>
                ))}
              </div>
            )}

            {/* 기술 */}
            {current.skills?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">기술 스택</h3>
                <div className="flex flex-wrap gap-2">
                  {current.skills.slice(0, 8).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{skill.name}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 링크 */}
            <div className="flex gap-3">
              {current.githubUrl && <a href={current.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700"><Github className="w-5 h-5" /></a>}
              {current.linkedinUrl && <a href={current.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600"><Linkedin className="w-5 h-5" /></a>}
              {current.blogUrl && <a href={current.blogUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700"><Globe className="w-5 h-5" /></a>}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handlePass}
              className="w-16 h-16 rounded-full bg-white shadow-lg border flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <X className="w-7 h-7 text-gray-500" />
            </button>
            <button
              onClick={handleLike}
              className="w-16 h-16 rounded-full bg-primary-600 shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
            >
              <Heart className="w-7 h-7 text-white" />
            </button>
          </div>

          <p className="text-center text-sm text-gray-400">{index + 1} / {resumes.length}</p>
        </>
      )}
    </div>
  )
}
