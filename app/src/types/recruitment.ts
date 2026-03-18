export type Role = "hr" | "candidate";

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
  email: string;
  zoomLink?: string;
};

export type JobPosting = {
  id: string;
  title: string;
  requiredAts: number;
  jdFileName: string;
};
