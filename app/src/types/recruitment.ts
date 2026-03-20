export type Role = "hr" | "candidate";

export type ResumeProject = {
  name: string;
  techStack: string[];
  impact: string;
  link?: string;
};

export type ResumeCandidate = {
  id: string;
  candidateName: string;
  jobRole: string;
  atsScore: number;
  extractedSkills: string[];
  certifications: string[];
  achievements: string[];
  experience: string;
  suitability: number;
  status: "pending" | "selected" | "interview_completed" | "rejected";
  authorizationStatus?: "pending" | "authorized" | "portal_accessed";
  email: string;
  phone?: string;
  location?: string;
  education?: string[];
  languages?: string[];
  professionalSummary?: string;
  projects?: ResumeProject[];
  zoomLink?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  currentCompany?: string;
  profilePhotoUrl?: string;
  resumeFileUrl?: string;
};

export type JobPosting = {
  id: string;
  title: string;
  requiredAts: number;
  jdFileName: string;
  jdFileUrl?: string;
  applySlug?: string;
  applyLink?: string;
  isActive?: boolean;
};

export type JobApplicationPayload = {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  totalExperience?: string;
  currentCompany?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  education?: string;
  professionalSummary?: string;
  resume: File;
  profilePhoto?: File | null;
};

export type PublicJobPosting = {
  id: string;
  title: string;
  jdFileName: string;
  jdFileUrl?: string;
  applySlug: string;
};
