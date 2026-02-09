import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Heart, X, Briefcase, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ResumeFeed } from '@/types/recruiter';

export default function SwipePage() {
  const [resumes, setResumes] = useState<ResumeFeed[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/recruiter/feed?limit=20');
      setResumes(response.data.data);
    } catch (error) {
      console.error('Failed to load resumes:', error);
      toast.error('이력서를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handlePick = async () => {
    if (swiping) return;
    setSwiping(true);

    try {
      const resume = resumes[currentIndex];
      await api.post(`/api/recruiter/pick/${resume.resumeId}`, {
        memo: `${resume.title} - 관심있음`
      });
      
      toast.success('✨ Pick 완료!', { icon: '👍' });
      nextResume();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Pick 실패');
    } finally {
      setSwiping(false);
    }
  };

  const handlePass = () => {
    if (swiping) return;
    nextResume();
  };

  const nextResume = () => {
    if (currentIndex < resumes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 더 로드
      loadResumes();
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-md mx-auto">
          {/* 스켈레톤 로더 */}
          <div className="text-center mb-8">
            <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-6 mt-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">모든 이력서를 확인했어요!</h2>
        <p className="text-gray-600">나중에 다시 확인해보세요</p>
      </div>
    );
  }

  const currentResume = resumes[currentIndex];
  const experienceYears = Math.floor(currentResume.totalExperienceMonths / 12);
  const experienceMonths = currentResume.totalExperienceMonths % 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Pick Me Up
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {currentIndex + 1} / {resumes.length}
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Profile Image */}
            <div className="relative h-80 bg-gradient-to-br from-purple-400 to-blue-400">
              {currentResume.profileImageUrl ? (
                <img 
                  src={currentResume.profileImageUrl} 
                  alt={currentResume.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white text-8xl font-bold">
                  {currentResume.name.charAt(0)}
                </div>
              )}
              
              {/* Pick Count Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                <span className="font-semibold text-gray-900">{currentResume.pickCount}</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-6">
              
              {/* Name & Title */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {currentResume.name}, {experienceYears > 0 ? `${experienceYears}년` : '신입'}
                </h2>
                <p className="text-lg text-gray-700 font-medium">
                  {currentResume.title}
                </p>
              </div>

              {/* Bio */}
              {currentResume.bio && (
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {currentResume.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{currentResume.experienceSummary}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>조회 {currentResume.viewCount}회</span>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {currentResume.techStacks.slice(0, 6).map((tech, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {currentResume.techStacks.length > 6 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      +{currentResume.techStacks.length - 6}
                    </span>
                  )}
                </div>
              </div>

              {/* Education */}
              {currentResume.educationSummary && (
                <p className="text-sm text-gray-600 mb-2">
                  🎓 {currentResume.educationSummary}
                </p>
              )}

              {/* Featured Project */}
              {currentResume.featuredProject && (
                <p className="text-sm text-gray-600">
                  💡 {currentResume.featuredProject}
                </p>
              )}

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mt-8">
            
            {/* Pass Button */}
            <button
              onClick={handlePass}
              disabled={swiping}
              className="group relative"
            >
              <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50">
                <X className="h-8 w-8 text-red-500" />
              </div>
            </button>

            {/* Pick Button */}
            <button
              onClick={handlePick}
              disabled={swiping}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50">
                <Heart className="h-10 w-10 text-white" fill="white" />
              </div>
            </button>

          </div>

          {/* View Details Link */}
          <div className="text-center mt-6">
            <a 
              href={currentResume.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              상세 이력서 보기 →
            </a>
          </div>

        </div>

        {/* Tips */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-600">
            💡 Tip: 마음에 드는 인재는 <span className="font-semibold text-purple-600">Pick</span> 후 제안을 보내보세요!
          </p>
        </div>

      </div>
    </div>
  );
}
