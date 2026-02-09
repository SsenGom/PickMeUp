// 헤드헌터 관련 타입 정의

export interface ResumeFeed {
  resumeId: number;
  userId: number;
  name: string;
  profileImageUrl?: string;
  title: string;
  bio?: string;
  techStacks: string[];
  keywords: string[];
  totalExperienceMonths: number;
  experienceSummary: string;
  educationSummary: string;
  featuredProject: string;
  viewCount: number;
  pickCount: number;
  publicUrl: string;
  alreadyPicked: boolean;
}

export type PickStatus = 'PICKED' | 'CONTACTED' | 'REJECTED';

export interface Pick {
  id: number;
  resumeId: number;
  name: string;
  title: string;
  profileImageUrl?: string;
  techStacks: string[];
  experienceYears: number;
  memo?: string;
  status: PickStatus;
  pickedAt: string;
  contactedAt?: string;
  publicUrl: string;
  proposal?: ProposalInfo;
}

export interface ProposalInfo {
  proposalId: number;
  status: ProposalStatus;
  proposedAt: string;
  threadId?: number;
}

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Proposal {
  id: number;
  companyName: string;
  position: string;
  salaryRange?: string;
  location?: string;
  workType?: string;
  message: string;
  status: ProposalStatus;
  proposedAt: string;
  respondedAt?: string;
  expiresAt?: string;
  threadId?: number;
  recruiter?: {
    companyName: string;
    position: string;
  };
  jobSeeker?: {
    userId: number;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
}

export interface ProposalCreateRequest {
  position: string;
  salaryRange?: string;
  location?: string;
  workType?: string;
  message: string;
}

export interface PickCreateRequest {
  memo?: string;
}

export interface ProposalResponseRequest {
  responseMessage?: string;
}

export interface RecruiterStats {
  totalPicks: number;
  pickedOnly: number;
  contacted: number;
  rejected: number;
  totalProposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  proposalAcceptanceRate: number;
  proposalResponseRate: number;
}

export interface ResumePickStats {
  totalPicks: number;
  thisWeekPicks: number;
  thisMonthPicks: number;
  totalProposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  recentPickers: PickerInfo[];
}

export interface PickerInfo {
  companyName: string;
  pickedAt: string;
}
