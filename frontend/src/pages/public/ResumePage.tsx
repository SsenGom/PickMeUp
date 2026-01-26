import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { 
  Github, Linkedin, Globe, Mail, Send, Loader2, ExternalLink, Download,
  MapPin, Phone, Calendar, Briefcase, GraduationCap, Award, Code,
  FileText, ChevronRight, Link2, Play
} from 'lucide-react'
import toast from 'react-hot-toast'

// 확장된 타입
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
  startDate: string
  endDate: string
  projectUrl: string
  githubUrl: string
  thumbnailUrl?: string
  techStacks: string[]
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
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioFile | null>(null)

  const { data: resume, isLoading, error } = useQuery({
    queryKey: ['publicResume', slug],
    queryFn: async () => {
      const { data } = await axios.get(`/api/resume/public/${slug}`)
      return data.data as PublicResume
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-400 mx-auto" />
          <p className="mt-4 text-slate-400">이력서를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">이력서를 찾을 수 없습니다</h1>
          <p className="mt-2 text-slate-400">존재하지 않거나 비공개 이력서입니다</p>
        </div>
      </div>
    )
  }

  // 자유 양식인 경우
  if (resume.resumeType === 'FREE') {
    return <FreeFormResume resume={resume} onContact={() => setShowContactForm(true)} />
  }

  // 카테고리별 스킬 그룹핑
  const skillsByCategory = resume.skills.reduce((acc, skill) => {
    const cat = skill.category || '기타'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  // 경력 기간 계산
  const totalExperience = resume.experiences.reduce((total, exp) => {
    const start = new Date(exp.startDate.replace('.', '-') + '-01')
    const end = exp.isCurrent ? new Date() : new Date((exp.endDate || '').replace('.', '-') + '-01')
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
  }, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image */}
            <div className="relative">
              {resume.profileImageUrl ? (
                <img
                  src={resume.profileImageUrl}
                  alt={resume.name}
                  className="w-40 h-40 md:w-48 md:h-48 rounded-2xl object-cover border-4 border-white/20 shadow-2xl"
                />
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                  <span className="text-6xl font-bold text-white">{resume.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute -bottom-3 -right-3 px-3 py-1 bg-primary-500 rounded-full text-sm font-medium shadow-lg">
                {totalExperience > 0 ? `${Math.floor(totalExperience)}년차` : '신입'}
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{resume.name}</h1>
              {resume.title && (
                <p className="text-xl md:text-2xl text-primary-300 font-medium mb-4">{resume.title}</p>
              )}
              {resume.bio && (
                <p className="text-slate-300 text-lg max-w-xl mb-6">{resume.bio}</p>
              )}

              {/* Quick Info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-300 mb-6">
                {resume.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {resume.email}
                  </div>
                )}
                {resume.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {resume.phone}
                  </div>
                )}
                {resume.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {resume.address}
                  </div>
                )}
              </div>

              {/* Social Links & Actions */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {resume.githubUrl && (
                  <a href={resume.githubUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Github className="w-5 h-5" />
                    GitHub
                  </a>
                )}
                {resume.linkedinUrl && (
                  <a href={resume.linkedinUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </a>
                )}
                {resume.blogUrl && (
                  <a href={resume.blogUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Globe className="w-5 h-5" />
                    Blog
                  </a>
                )}
                <button
                  onClick={() => setShowContactForm(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  연락하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {resume.experiences.length > 0 && (
              <a href="#experience" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg whitespace-nowrap">경력</a>
            )}
            {resume.projects.length > 0 && (
              <a href="#projects" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg whitespace-nowrap">프로젝트</a>
            )}
            {resume.skills.length > 0 && (
              <a href="#skills" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg whitespace-nowrap">기술</a>
            )}
            {resume.educations.length > 0 && (
              <a href="#education" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg whitespace-nowrap">학력</a>
            )}
            {resume.certificates.length > 0 && (
              <a href="#certificates" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg whitespace-nowrap">자격증</a>
            )}
            {(resume.portfolioFiles?.length ?? 0) > 0 && (
              <a href="#portfolio" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg whitespace-nowrap">포트폴리오</a>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Experience Section */}
        {resume.experiences.length > 0 && (
          <section id="experience">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">경력</h2>
            </div>
            <div className="space-y-6">
              {resume.experiences.map((exp, index) => (
                <div key={exp.id} className="relative pl-8 pb-6 last:pb-0">
                  {/* Timeline */}
                  {index < resume.experiences.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-200" />
                  )}
                  <div className="absolute left-0 top-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800">{exp.position}</h3>
                        <p className="text-primary-600 font-medium">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {exp.startDate} - {exp.isCurrent ? '현재' : exp.endDate}
                        {exp.isCurrent && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">재직중</span>
                        )}
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {resume.projects.length > 0 && (
          <section id="projects">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Code className="w-6 h-6 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">프로젝트</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {resume.projects.map((project) => (
                <div key={project.id} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all">
                  {project.thumbnailUrl ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Code className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-slate-500">{project.startDate} - {project.endDate || '진행중'}</p>
                      </div>
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                             className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {project.projectUrl && (
                          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer"
                             className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {project.techStacks.map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
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

        {/* Skills Section */}
        {resume.skills.length > 0 && (
          <section id="skills">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Code className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">기술 스택</h2>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="space-y-6">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill.id}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            skill.level === 'EXPERT' ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' :
                            skill.level === 'ADVANCED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                            skill.level === 'INTERMEDIATE' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                            'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          )}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Education Section */}
        {resume.educations.length > 0 && (
          <section id="education">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">학력</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {resume.educations.map((edu) => (
                <div key={edu.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                  <h3 className="font-semibold text-slate-800">{edu.schoolName}</h3>
                  <p className="text-primary-600">{edu.major}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {edu.startDate} - {edu.endDate || '현재'} · {edu.graduationStatus === 'GRADUATED' ? '졸업' : edu.graduationStatus}
                  </p>
                  {edu.gpa && (
                    <p className="text-sm text-slate-500 mt-1">학점: {edu.gpa} / {edu.maxGpa}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certificates Section */}
        {resume.certificates.length > 0 && (
          <section id="certificates">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Award className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">자격증</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {resume.certificates.map((cert) => (
                <div key={cert.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:border-primary-200 transition-colors">
                  <h3 className="font-semibold text-slate-800">{cert.name}</h3>
                  <p className="text-sm text-slate-500">{cert.issuingOrganization}</p>
                  <p className="text-sm text-slate-400 mt-2">{cert.acquiredDate}</p>
                  {cert.grade && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                      {cert.grade}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio Files Section */}
        {(resume.portfolioFiles?.length ?? 0) > 0 && (
          <section id="portfolio">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">포트폴리오</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {resume.portfolioFiles?.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    if (file.fileType === 'EXTERNAL_LINK' && file.externalUrl) {
                      window.open(file.externalUrl, '_blank')
                    } else {
                      setSelectedPortfolio(file)
                    }
                  }}
                  className="text-left bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {file.fileType === 'PDF' && <FileText className="w-8 h-8 text-red-500" />}
                    {file.fileType === 'IMAGE' && <FileText className="w-8 h-8 text-blue-500" />}
                    {file.fileType === 'EXTERNAL_LINK' && <Link2 className="w-8 h-8 text-green-500" />}
                    {file.fileType === 'VIDEO' && <Play className="w-8 h-8 text-purple-500" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate group-hover:text-primary-600 transition-colors">
                        {file.title}
                      </h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  {file.description && (
                    <p className="text-sm text-slate-500 line-clamp-2">{file.description}</p>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Languages & Awards */}
        <div className="grid md:grid-cols-2 gap-8">
          {resume.languages.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">어학</h3>
              <div className="space-y-3">
                {resume.languages.map((lang) => (
                  <div key={lang.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">{lang.name}</span>
                      {lang.score && <span className="text-primary-600 font-semibold">{lang.score}</span>}
                    </div>
                    {lang.testName && <p className="text-sm text-slate-500">{lang.testName}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {resume.awards.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">수상</h3>
              <div className="space-y-3">
                {resume.awards.map((award) => (
                  <div key={award.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                    <h4 className="font-medium text-slate-800">{award.name}</h4>
                    <p className="text-sm text-slate-500">{award.organization} · {award.awardedDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} {resume.name}. Powered by PickMeUp</p>
        </div>
      </footer>

      {/* Modals */}
      {showContactForm && (
        <ContactFormModal slug={slug!} onClose={() => setShowContactForm(false)} />
      )}

      {selectedPortfolio && (
        <PortfolioViewModal file={selectedPortfolio} onClose={() => setSelectedPortfolio(null)} />
      )}
    </div>
  )
}

// 자유양식 이력서
function FreeFormResume({ resume, onContact }: { resume: PublicResume; onContact: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-slate-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-6">
            {resume.profileImageUrl ? (
              <img src={resume.profileImageUrl} alt={resume.name} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-3xl font-bold">
                {resume.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{resume.name}</h1>
              {resume.title && <p className="text-primary-300 text-lg">{resume.title}</p>}
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            {resume.githubUrl && (
              <a href={resume.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white">
                <Github className="w-5 h-5" />
              </a>
            )}
            {resume.linkedinUrl && (
              <a href={resume.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            <button onClick={onContact} className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-500 rounded-lg hover:bg-primary-600">
              <Mail className="w-4 h-4" />
              연락하기
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {resume.freeContent ? (
          <article className="prose prose-slate max-w-none">
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(resume.freeContent) }} />
          </article>
        ) : (
          <p className="text-slate-500 text-center py-12">내용이 없습니다</p>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">메시지 보내기</h2>
          <p className="text-sm text-slate-500 mt-1">채용 담당자에게 직접 연락하세요</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">이메일 *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="채용 문의드립니다"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">내용 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 transition-colors"
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

// 포트폴리오 뷰어 모달
function PortfolioViewModal({ file, onClose }: { file: PortfolioFile; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">{file.title}</h2>
          <div className="flex items-center gap-2">
            {file.fileUrl && (
              <a
                href={file.fileUrl}
                download
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                다운로드
              </a>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              ✕
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          {file.fileType === 'PDF' && file.fileUrl && (
            <iframe src={file.fileUrl} className="w-full h-[70vh] rounded-lg" />
          )}
          {file.fileType === 'IMAGE' && file.fileUrl && (
            <img src={file.fileUrl} alt={file.title} className="max-w-full mx-auto rounded-lg" />
          )}
          {file.description && (
            <p className="mt-4 text-slate-600">{file.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
