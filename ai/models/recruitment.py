from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class CandidateApplicationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_title: str
    required_ats: int
    jd_text: str
    candidate_name: str
    email: str
    phone: str = ""
    location: str = ""
    total_experience: str = ""
    current_company: str = ""
    linkedin_url: str = ""
    portfolio_url: str = ""
    education: str = ""
    professional_summary: str = ""
    resume_text: str = ""


class CandidateEvaluationResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    ats_score: int = Field(ge=0, le=100)
    suitability: int = Field(ge=0, le=100)
    extracted_skills: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    projects: list["EvaluatedProject"] = Field(default_factory=list)
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    project_urls: list[str] = Field(default_factory=list)
    professional_summary: str = ""
    experience_summary: str = ""


class EvaluatedProject(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    techStack: list[str] = Field(default_factory=list)
    impact: str
    link: str | None = None

