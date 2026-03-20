import type { JobPosting, ResumeCandidate, ResumeProject } from "@/types/recruitment";

export const ATS_THRESHOLD = 85;

const BASE_RESUMES: ResumeCandidate[] = [
  {
    id: "cand-1",
    candidateName: "Alice Chen",
    jobRole: "Frontend Engineer",
    atsScore: 92,
    extractedSkills: ["React", "TypeScript", "Tailwind", "Framer Motion"],
    certifications: ["AWS Cloud Practitioner", "Meta Front-End Developer"],
    achievements: ["Led migration to App Router", "Reduced bundle size by 32%"],
    experience: "3 yrs at TechCorp",
    suitability: 92,
    status: "pending",
    email: "alice.chen@example.com"
  },
  {
    id: "cand-2",
    candidateName: "Bob Smith",
    jobRole: "Frontend Engineer",
    atsScore: 74,
    extractedSkills: ["React", "JavaScript", "CSS"],
    certifications: ["Frontend Fundamentals"],
    achievements: ["Built responsive marketing pages"],
    experience: "1.2 yrs at PixelWorks",
    suitability: 74,
    status: "rejected",
    email: "bob.smith@example.com"
  },
  {
    id: "cand-3",
    candidateName: "Charlie Davis",
    jobRole: "Backend Engineer",
    atsScore: 88,
    extractedSkills: ["FastAPI", "PostgreSQL", "Redis", "Docker"],
    certifications: ["Azure Fundamentals"],
    achievements: ["Built async processing pipeline"],
    experience: "3 yrs at APIWorks",
    suitability: 88,
    status: "pending",
    email: "charlie.davis@example.com"
  },
  {
    id: "cand-4",
    candidateName: "Diana Evans",
    jobRole: "Product Manager",
    atsScore: 95,
    extractedSkills: ["Roadmapping", "Stakeholder Management", "Analytics"],
    certifications: ["PMI-ACP"],
    achievements: ["Launched 2 enterprise products"],
    experience: "5 yrs at ProdScale",
    suitability: 95,
    status: "selected",
    email: "diana.evans@example.com"
  },
  {
    id: "cand-5",
    candidateName: "Eve Foster",
    jobRole: "Backend Engineer",
    atsScore: 81,
    extractedSkills: ["Python", "SQL", "Docker"],
    certifications: ["Data Engineering Basics"],
    achievements: ["Improved ETL throughput by 20%"],
    experience: "2 yrs at DataBridge",
    suitability: 81,
    status: "pending",
    email: "eve.foster@example.com"
  },
  {
    id: "cand-6",
    candidateName: "Frank Green",
    jobRole: "Frontend Engineer",
    atsScore: 98,
    extractedSkills: ["React", "TypeScript", "Next.js"],
    certifications: ["Advanced React"],
    achievements: ["Created design system used across 4 teams"],
    experience: "4 yrs at UIForge",
    suitability: 98,
    status: "interview_completed",
    email: "frank.green@example.com",
    zoomLink: "https://zoom.us/j/92465000123?pwd=frontendSync"
  },
  {
    id: "cand-7",
    candidateName: "Grace Hall",
    jobRole: "Backend Engineer",
    atsScore: 65,
    extractedSkills: ["Node.js", "MongoDB"],
    certifications: ["Backend Foundations"],
    achievements: ["Built prototype API"],
    experience: "1 yr at Startify",
    suitability: 65,
    status: "rejected",
    email: "grace.hall@example.com"
  },
  {
    id: "cand-8",
    candidateName: "John Smith",
    jobRole: "Frontend Engineer",
    atsScore: 89,
    extractedSkills: ["React", "TypeScript", "Accessibility"],
    certifications: ["WCAG Specialist"],
    achievements: ["Improved Lighthouse score to 98"],
    experience: "3 yrs at WebMotion",
    suitability: 89,
    status: "interview_completed",
    email: "john.smith@example.com"
  },
  {
    id: "cand-9",
    candidateName: "Aarav Sharma",
    jobRole: "Frontend Engineer",
    atsScore: 89,
    extractedSkills: ["React", "TypeScript", "Tailwind", "Framer Motion"],
    certifications: ["Google UX Design", "Meta Front-End Developer"],
    achievements: ["Built LMS with 10k monthly users", "Reduced bundle size by 32%"],
    experience: "3.5 years in product-based startups building responsive SPA platforms.",
    suitability: 89,
    status: "selected",
    email: "aarav.sharma@example.com",
    zoomLink: "https://zoom.us/j/334623897?pwd=RecruitAuto"
  },
  {
    id: "cand-10",
    candidateName: "Priya Nair",
    jobRole: "Backend Engineer",
    atsScore: 79,
    extractedSkills: ["FastAPI", "PostgreSQL", "Docker", "Celery"],
    certifications: ["AWS Developer Associate"],
    achievements: ["Reduced API latency by 41%", "Designed multi-tenant auth layer"],
    experience: "2.8 yrs at CloudNest",
    suitability: 79,
    status: "pending",
    email: "priya.nair@example.com"
  },
  {
    id: "cand-11",
    candidateName: "Rohan Mehta",
    jobRole: "Data Engineer",
    atsScore: 83,
    extractedSkills: ["Python", "Airflow", "dbt", "BigQuery"],
    certifications: ["Databricks Fundamentals"],
    achievements: ["Automated 14 ETL workflows", "Cut data freshness lag by 60%"],
    experience: "2.2 yrs at DataPulse",
    suitability: 83,
    status: "pending",
    email: "rohan.mehta@example.com"
  },
  {
    id: "cand-12",
    candidateName: "Sara Khan",
    jobRole: "Frontend Engineer",
    atsScore: 94,
    extractedSkills: ["React", "Next.js", "Accessibility", "Testing Library"],
    certifications: ["W3C Accessibility Specialist"],
    achievements: ["Improved Lighthouse accessibility to 100", "Led design system rollout"],
    experience: "4.1 yrs at PixelHive",
    suitability: 94,
    status: "pending",
    email: "sara.khan@example.com"
  },
  {
    id: "cand-13",
    candidateName: "Neeraj Kulkarni",
    jobRole: "AI QA Engineer",
    atsScore: 91,
    extractedSkills: ["Playwright", "TypeScript", "API Testing", "Prompt Evaluation"],
    certifications: ["ISTQB Foundation", "Azure AI Fundamentals"],
    achievements: ["Automated 280+ end-to-end tests", "Reduced production regressions by 37%"],
    experience: "3.2 yrs at TestPilot AI",
    suitability: 91,
    status: "selected",
    email: "neeraj.kulkarni@example.com",
    zoomLink: "https://zoom.us/j/665112349?pwd=RecruitAuto"
  }
];

const ROLE_PROJECTS: Record<string, ResumeProject[]> = {
  "Frontend Engineer": [
    {
      name: "Design System Platform",
      techStack: ["React", "TypeScript", "Storybook"],
      impact: "Built reusable UI primitives adopted by 4 teams and reduced UI defects by 28%.",
      link: "https://github.com/example/design-system",
    },
    {
      name: "Candidate Portal Revamp",
      techStack: ["Next.js", "Tailwind", "Framer Motion"],
      impact: "Improved onboarding completion rate by 19% through UX and performance optimizations.",
    },
  ],
  "Backend Engineer": [
    {
      name: "Async Resume Processing Pipeline",
      techStack: ["FastAPI", "PostgreSQL", "Redis", "Celery"],
      impact: "Reduced document-processing turnaround from 12 min to under 3 min.",
    },
    {
      name: "Interview Scheduling API",
      techStack: ["Node.js", "PostgreSQL", "Docker"],
      impact: "Delivered calendar + meeting APIs with 99.9% availability in production.",
    },
  ],
  "Data Engineer": [
    {
      name: "Hiring Analytics Warehouse",
      techStack: ["Airflow", "dbt", "BigQuery"],
      impact: "Automated weekly talent reports and cut manual reporting effort by 70%.",
    },
    {
      name: "Real-time ATS Scoring Stream",
      techStack: ["Python", "Kafka", "PostgreSQL"],
      impact: "Enabled near real-time candidate ranking updates for recruiter dashboards.",
    },
  ],
  "Product Manager": [
    {
      name: "Enterprise Hiring Workflow Launch",
      techStack: ["Product Strategy", "Analytics", "A/B Testing"],
      impact: "Launched workflow automation features improving recruiter throughput by 24%.",
    },
    {
      name: "Interview Experience Optimization",
      techStack: ["User Research", "Roadmapping", "SQL"],
      impact: "Increased candidate interview completion from 68% to 84%.",
    },
  ],
  "AI QA Engineer": [
    {
      name: "AI Assessment Regression Suite",
      techStack: ["Playwright", "TypeScript", "GitHub Actions"],
      impact: "Automated interview-journey smoke tests and cut release validation time by 54%.",
    },
    {
      name: "Prompt Quality Evaluation Harness",
      techStack: ["Python", "Pytest", "OpenAI Evals"],
      impact: "Introduced quality gates for AI scoring prompts and improved consistency across rounds.",
    },
  ],
};

export const INITIAL_RESUMES: ResumeCandidate[] = BASE_RESUMES.map((candidate, index) => ({
  ...candidate,
  phone: candidate.phone ?? `+91 98${String(10000000 + index * 379).slice(0, 8)}`,
  location:
    candidate.location ??
    (candidate.jobRole === "Backend Engineer"
      ? "Hyderabad, India"
      : candidate.jobRole === "Data Engineer"
        ? "Pune, India"
        : candidate.jobRole === "Product Manager"
          ? "Mumbai, India"
          : "Bengaluru, India"),
  education:
    candidate.education ??
    (candidate.jobRole === "Product Manager"
      ? ["MBA, Product Management", "B.Com"]
      : ["B.Tech in Computer Science", "Certification in Cloud/AI Foundations"]),
  languages: candidate.languages ?? ["English", "Hindi"],
  professionalSummary:
    candidate.professionalSummary ??
    `${candidate.experience}. ${candidate.candidateName} specializes in ${candidate.jobRole.toLowerCase()} workflows and cross-functional delivery in fast-paced product teams.`,
  projects: candidate.projects ?? ROLE_PROJECTS[candidate.jobRole] ?? [],
}));

export const INITIAL_JOB_POSTINGS: JobPosting[] = [];

export const INTERVIEW_ROUNDS = [
  "Aptitude Round",
  "Reasoning / Mental Ability",
  "Technical Round (MCQ)",
  "Coding Round",
  "Verbal Round"
];

export const STORAGE_KEYS = {
  resumes: "recruitment-portal-resumes",
  jobs: "recruitment-portal-jobs",
  lowAtsPrompt: "recruitment-portal-low-ats-prompt"
} as const;
