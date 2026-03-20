from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr


CandidateStatus = Literal["pending", "selected", "interview_completed", "rejected"]
AuthorizationStatus = Literal["pending", "authorized", "portal_accessed"]


class ResumeProject(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    techStack: list[str]
    impact: str
    link: str | None = None


class Candidate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    candidateName: str
    jobRole: str
    atsScore: int
    extractedSkills: list[str]
    certifications: list[str]
    achievements: list[str]
    experience: str
    suitability: int
    status: CandidateStatus
    authorizationStatus: AuthorizationStatus = "pending"
    email: EmailStr
    phone: str | None = None
    location: str | None = None
    education: list[str] | None = None
    languages: list[str] | None = None
    professionalSummary: str | None = None
    projects: list[ResumeProject] | None = None
    zoomLink: str | None = None
    linkedinUrl: str | None = None
    githubUrl: str | None = None
    portfolioUrl: str | None = None
    currentCompany: str | None = None
    profilePhotoUrl: str | None = None
    resumeFileUrl: str | None = None


class CandidateListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[Candidate]


class CandidateBulkUpsertRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[Candidate]


class CandidateAuthorizationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    candidateId: str


class CandidateAuthorizationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    success: bool
    message: str
    candidateId: str
    email: str | None = None
    password: str | None = None


class JobPosting(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    requiredAts: int
    jdFileName: str
    jdFileUrl: str | None = None
    applySlug: str = ""
    applyLink: str = ""
    isActive: bool = True


class JobPostingListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[JobPosting]


class JobPostingBulkUpsertRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[JobPosting]


class JobPostingPublicResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    jdFileName: str
    jdFileUrl: str | None = None
    applySlug: str
