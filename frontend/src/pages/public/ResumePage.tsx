import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { 
  Github, Linkedin, Globe, Mail, Send, Loader2, ExternalLink,
  Phone, Briefcase, GraduationCap, Award, Code, FileText, Link2, Play, X,
  ArrowUpRight
} from 'lucide-react'
import toast from 'react-hot-toast'

// Types
interface PublicResume {
  resumeType: 'FREE' | 'SARAMIN'
  title: string
  name: string
  email: string
  phone?: string
  address?: string
  profileImageUrl: string
  bio: string
  freeContent: string
  githubUrl: string
  linkedinUrl: string
  blogUrl: string
  portfolioUrl: string
  educations: Education[]
  experiences: Experience[]
  projects: Project[]
  skills: Skill[]
  certificates: Certificate[]
  languages: Language[]
  awards: AwardType[]
  coverLetters?: CoverLetter[]
  portfolioFiles?: PortfolioFile[]
}

interface Education {
  id: number
  schoolName: string
  major: string
  level: string
  startDate: string
  endDate: string
  graduationStatus: string
  gpa: string
  maxGpa: string
}

interface Experience {
  id: number
  company: string
  position: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
}

interface Project {
  id: number
  title: string
  description: string
  detailContent: string
  role: string
  teamSize: number
  achievements: string
  startDate: string
  endDate: string
  projectUrl: string
  githubUrl: string
  demoUrl: string
  thumbnailUrl?: string
  screenshots: string
  techStacks: string[]
  isFeatured: boolean
}

interface Skill {
  id: number
  name: string
  category: string
  level: string
}

interface Certificate {
  id: number
  name: string
  issuingOrganization: string
  acquiredDate: string
  grade: string
}

interface Language {
  id: number
  name: string
  testName: string
  score: string
}

interface AwardType {
  id: number
  name: string
  organization: string
  awardedDate: string
  description: string
}

interface CoverLetter {
  id: number
  title: string
  content: string
}

interface PortfolioFile {
  id: number
  fileType: 'PDF' | 'IMAGE' | 'EXTERNAL_LINK' | 'VIDEO'
  title: string
  description: string
  fileUrl: string
  externalUrl: string
  thumbnailUrl: string
}

export default function ResumePage() {
  const { slug } = useParams<{ slug: string }>()
  const [showContactForm, setShowContactForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const { data: resume, isLoading, error } = useQuery({
    queryKey: ['publicResume', slug],
    queryFn: async () => {
      const { data } = await axios.get(`/api/resume/public/${slug}`)
      return data.data as PublicResume
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-neutral-400" />
          </div>
          <h1 className="text-xl font-medium text-neutral-800">이력서를 찾을 수 없습니다</h1>
          <p className="mt-2 text-neutral-500 text-sm">존재하지 않거나 비공개 상태입니다</p>
        </div>
      </div>
    )
  }

  // 자유 양식
  if (resume.resumeType === 'FREE') {
    return <FreeFormResume resume={resume} onContact={() => setShowContactForm(true)} />
  }

  // 스킬 카테고리별 그룹핑
  const skillsByCategory = resume.skills.reduce((acc, skill) => {
    const cat = skill.category || '기타'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ===== Hero Section ===== */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image */}
            {resume.profileImageUrl ? (
              <img
                src={resume.profileImageUrl}
                alt={resume.name}
                className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl md:text-5xl font-medium text-neutral-500">{resume.name.charAt(0)}</span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">{resume.name}</h1>
              {resume.title && (
                <p className="text-lg text-neutral-600 mt-1">{resume.title}</p>
              )}
              {resume.bio && (
                <p className="text-neutral-500 mt-4 max-w-xl leading-relaxed">{resume.bio}</p>
              )}

              {/* Contact & Links */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                {resume.email && (
                  <a href={`mailto:${resume.email}`} className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                    <Mail className="w-4 h-4" />
                    {resume.email}
                  </a>
                )}
                {resume.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-neutral-600">
                    <Phone className="w-4 h-4" />
                    {resume.phone}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {resume.githubUrl && (
                  <a href={resume.githubUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm text-neutral-700 transition-colors">
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {resume.linkedinUrl && (
                  <a href={resume.linkedinUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm text-neutral-700 transition-colors">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {resume.blogUrl && (
                  <a href={resume.blogUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm text-neutral-700 transition-colors">
                    <Globe className="w-4 h-4" />
                    Blog
                  </a>
                )}
                <button
                  onClick={() => setShowContactForm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-sm text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  연락하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        
        {/* Skills */}
        {resume.skills.length > 0 && (
          <section>
            <SectionTitle icon={Code} title="Skills" />
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider w-20 flex-shrink-0">{category}</span>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-sm text-neutral-700 hover:border-neutral-400 transition-colors"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {resume.experiences.length > 0 && (
          <section>
            <SectionTitle icon={Briefcase} title="Experience" />
            <div className="space-y-8">
              {resume.experiences.map((exp) => (
                <div key={exp.id} className="group">
                  <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900">{exp.company}</h3>
                    <span className="text-sm text-neutral-400">{exp.startDate} — {exp.isCurrent ? '현재' : exp.endDate}</span>
                  </div>
                  <p className="text-neutral-600 font-medium">{exp.position}</p>
                  {exp.description && (
                    <p className="mt-2 text-neutral-500 text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <section>
            <SectionTitle icon={Code} title="Projects" />
            <div className="grid gap-4">
              {resume.projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="group p-5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-400 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center flex-shrink-0">
                        <Code className="w-8 h-8 text-neutral-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                          {project.title}
                        </h3>
                        {project.isFeatured && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Featured</span>
                        )}
                        <ArrowUpRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
                      </div>
                      <p className="text-sm text-neutral-400 mt-0.5">{project.startDate} — {project.endDate || '진행중'}</p>
                      {project.description && (
                        <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{project.description}</p>
                      )}
                      {project.techStacks?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {project.techStacks.slice(0, 5).map((tech) => (
                            <span key={tech} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded">
                              {tech}
                            </span>
                          ))}
                          {project.techStacks.length > 5 && (
                            <span className="px-2 py-0.5 text-neutral-400 text-xs">+{project.techStacks.length - 5}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {resume.educations.length > 0 && (
          <section>
            <SectionTitle icon={GraduationCap} title="Education" />
            <div className="space-y-4">
              {resume.educations.map((edu) => (
                <div key={edu.id} className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{edu.schoolName}</h3>
                    <p className="text-neutral-600 text-sm">{edu.major}</p>
                  </div>
                  <span className="text-sm text-neutral-400">{edu.startDate} — {edu.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certificates */}
        {resume.certificates.length > 0 && (
          <section>
            <SectionTitle icon={Award} title="Certificates" />
            <div className="grid md:grid-cols-2 gap-3">
              {resume.certificates.map((cert) => (
                <div key={cert.id} className="p-4 bg-white border border-neutral-200 rounded-lg">
                  <h3 className="font-medium text-neutral-900">{cert.name}</h3>
                  <p className="text-sm text-neutral-500">{cert.issuingOrganization} · {cert.acquiredDate}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio Files */}
        {(resume.portfolioFiles?.length ?? 0) > 0 && (
          <section>
            <SectionTitle icon={FileText} title="Portfolio" />
            <div className="grid md:grid-cols-3 gap-3">
              {resume.portfolioFiles?.map((file) => (
                <a
                  key={file.id}
                  href={file.fileType === 'EXTERNAL_LINK' ? file.externalUrl : file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors group"
                >
                  {file.fileType === 'PDF' && <FileText className="w-5 h-5 text-red-500" />}
                  {file.fileType === 'IMAGE' && <FileText className="w-5 h-5 text-blue-500" />}
                  {file.fileType === 'EXTERNAL_LINK' && <Link2 className="w-5 h-5 text-green-500" />}
                  {file.fileType === 'VIDEO' && <Play className="w-5 h-5 text-purple-500" />}
                  <span className="font-medium text-neutral-700 truncate group-hover:text-neutral-900">{file.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0" />
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-neutral-400">
          © {new Date().getFullYear()} {resume.name}
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactForm && (
        <ContactFormModal slug={slug!} onClose={() => setShowContactForm(false)} />
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  )
}

// Section Title Component
function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <Icon className="w-5 h-5 text-neutral-400" />
      <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">{title}</h2>
    </div>
  )
}

// 자유양식 이력서
function FreeFormResume({ resume, onContact }: { resume: PublicResume; onContact: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center gap-6">
            {resume.profileImageUrl ? (
              <img src={resume.profileImageUrl} alt={resume.name} className="w-20 h-20 rounded-xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-neutral-200 flex items-center justify-center text-2xl font-medium text-neutral-500">
                {resume.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{resume.name}</h1>
              {resume.title && <p className="text-neutral-500">{resume.title}</p>}
            </div>
            <button
              onClick={onContact}
              className="ml-auto px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800"
            >
              연락하기
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {resume.freeContent ? (
          <article className="prose prose-neutral max-w-none">
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(resume.freeContent) }} />
          </article>
        ) : (
          <p className="text-neutral-400 text-center py-12">내용이 없습니다</p>
        )}
      </main>
    </div>
  )
}

// 간단한 마크다운 파서
function parseMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h(\d)><\/p>/g, '</h$1>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>')
}

// 연락 폼 모달
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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">메시지 보내기</h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">제목</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
              placeholder="채용 문의드립니다"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm resize-none"
              rows={4}
              required
            />
          </div>

          {/* 안내 문구 */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-700 leading-relaxed">
              💌 답장은 입력하신 이메일({email || '이메일 주소'})로 발송됩니다. 정확한 이메일 주소를 입력해 주세요.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-sm font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 프로젝트 상세 모달
function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-neutral-900">{project.title}</h2>
              {project.isFeatured && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Featured</span>
              )}
            </div>
            <p className="text-sm text-neutral-500 mt-1">{project.startDate} — {project.endDate || '진행중'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
          {/* Thumbnail */}
          {project.thumbnailUrl && (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-64 object-cover rounded-xl"
            />
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-8 text-sm">
            {project.role && (
              <div>
                <span className="text-neutral-400">역할</span>
                <p className="font-medium text-neutral-900 text-base">{project.role}</p>
              </div>
            )}
            {project.teamSize && (
              <div>
                <span className="text-neutral-400">팀 규모</span>
                <p className="font-medium text-neutral-900 text-base">{project.teamSize}명</p>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800">
                <Github className="w-4 h-4" /> GitHub
              </a>
            )}
            {project.projectUrl && (
              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                <ExternalLink className="w-4 h-4" /> 배포 URL
              </a>
            )}
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700">
                <Play className="w-4 h-4" /> 데모
              </a>
            )}
          </div>

          {/* Tech Stack */}
          {project.techStacks?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-3">기술 스택</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStacks.map((tech) => (
                  <span key={tech} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-3">개요</h3>
              <p className="text-neutral-700 leading-relaxed text-base">{project.description}</p>
            </div>
          )}

          {/* Detail Content */}
          {project.detailContent && (
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-3">상세 설명</h3>
              <div className="prose prose-neutral max-w-none">
                <div dangerouslySetInnerHTML={{ __html: parseMarkdown(project.detailContent) }} />
              </div>
            </div>
          )}

          {/* Achievements */}
          {project.achievements && (
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-3">주요 성과</h3>
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-green-800 whitespace-pre-wrap">{project.achievements}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
