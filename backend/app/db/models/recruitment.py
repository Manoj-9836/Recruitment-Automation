from __future__ import annotations

from sqlalchemy import JSON, Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)


class CandidateModel(Base):
    __tablename__ = "candidates"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    candidate_name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_role: Mapped[str] = mapped_column(String(255), nullable=False)
    ats_score: Mapped[int] = mapped_column(Integer, nullable=False)
    extracted_skills: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    certifications: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    achievements: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    experience: Mapped[str] = mapped_column(Text, nullable=False)
    suitability: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    education: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    languages: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    professional_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    projects: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    zoom_link: Mapped[str | None] = mapped_column(Text, nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    github_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    portfolio_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    profile_photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    resume_file_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    authorization_status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)


class JobPostingModel(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    required_ats: Mapped[int] = mapped_column(Integer, nullable=False)
    jd_file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    jd_file_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    jd_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    apply_slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
