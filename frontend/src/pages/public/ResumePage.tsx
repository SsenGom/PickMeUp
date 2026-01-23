import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Resume } from '@/types'
import { cn } from '@/lib/utils'
import { Github, Linkedin, Globe, Mail, Send, Loader2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResumePage() {
  const { slug } = useParams<{ slug: string }>()
  const [showContactForm, setShowContactForm] = useState(false)

  const { data: resume, isLoading, error } = useQuery({
    queryKey: ['publicResume', slug],
    queryFn: async () => {
      const { data } = await axios.get(`/api/resume/${slug}`)
      return data.data as Resume
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">이력서를 찾을 수 없습니다</h1>
          <p className="mt-2 text-gray-500">존재하지 않거나 비공개 이력서입니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {resume.profileImageUrl ? (
            <img
              src={resume.profileImageUrl}
              alt={resume.name}
              className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/30"
            />
          ) : (
            <div className="w-32 h-32 rounded-full mx-auto mb-6 bg-white/20 flex items-center justify-center">
              <span className="text-5xl font-bold">{resume.name.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-4xl font-bold">{resume.name}</h1>
          {resume.title && <p className="mt-2 text-xl text-white/80">{resume.title}</p>}
          
          <div className="flex items-center justify-center gap-4 mt-6">
            {resume.githubUrl && (
              <a href={resume.githubUrl} target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Github className="w-6 h-6" />
              </a>
            )}
            {resume.linkedinUrl && (
              <a href={resume.linkedinUrl} target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            )}
            {resume.blogUrl && (
              <a href={resume.blogUrl} target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Globe className="w-6 h-6" />
              </a>
            )}
            <button
              onClick={() => setShowContactForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-full hover:bg-white/90 transition-colors"
            >
              <Mail className="w-5 h-5" />
              연락하기
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Bio */}
        {resume.bio && (
          <section>
            <h2 className="text-2xl font-bold mb-4">소개</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{resume.bio}</p>
          </section>
        )}

        {/* Experience */}
        {resume.experiences.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">경력</h2>
            <div className="space-y-6">
              {resume.experiences.map((exp) => (
                <div key={exp.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{exp.position}</h3>
                      <p className="text-primary-600">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {exp.startDate} - {exp.isCurrent ? '현재' : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-3 text-gray-600 whitespace-pre-wrap">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">프로젝트</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {resume.projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {project.thumbnailUrl && (
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                             className="text-gray-400 hover:text-gray-600">
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {project.projectUrl && (
                          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer"
                             className="text-gray-400 hover:text-gray-600">
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {project.techStacks.map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">기술</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-wrap gap-3">
                {resume.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm',
                      skill.level === 'EXPERT' ? 'bg-primary-100 text-primary-700' :
                      skill.level === 'ADVANCED' ? 'bg-blue-100 text-blue-700' :
                      skill.level === 'INTERMEDIATE' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    )}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactFormModal slug={slug!} onClose={() => setShowContactForm(false)} />
      )}
    </div>
  )
}

function ContactFormModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      axios.post(`/api/contact/${slug}`, { senderName: name, senderEmail: email, subject, content }),
    onSuccess: () => {
      toast.success('메시지가 전송되었습니다!')
      onClose()
    },
    onError: () => {
      toast.error('전송에 실패했습니다')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">메시지 보내기</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
