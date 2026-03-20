from __future__ import annotations

from sqlalchemy import delete, select, text

from app.db.base import Base
from app.db.models.recruitment import CandidateModel, JobPostingModel, UserModel
from app.db.session import AsyncSessionLocal, engine
from app.utils.security import hash_password


SEED_CANDIDATES = []

SEED_JOBS: list[dict] = []


async def init_database() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

        # Ensure backward compatibility for previously created tables.
        await connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT ''"))
        await connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'hr'"))

        await connection.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS jd_file_url TEXT"))
        await connection.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS jd_text TEXT"))
        await connection.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_slug VARCHAR(255)"))
        await connection.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true"))

        await connection.execute(text("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS linkedin_url TEXT"))
        await connection.execute(text("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS github_url TEXT"))
        await connection.execute(text("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS portfolio_url TEXT"))
        await connection.execute(text("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_company VARCHAR(255)"))
        await connection.execute(text("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS profile_photo_url TEXT"))
        await connection.execute(text("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_file_url TEXT"))
        await connection.execute(text("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS authorization_status VARCHAR(50) NOT NULL DEFAULT 'pending'"))
        await connection.execute(text("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)"))

    async with AsyncSessionLocal() as session:
        # Remove legacy seeded jobs from previous schema versions.
        await session.execute(delete(JobPostingModel).where(JobPostingModel.apply_slug.is_(None)))

        # Seed HR user
        existing_hr = await session.scalar(select(UserModel).where(UserModel.email == "hr@company.com"))
        if existing_hr is None:
            session.add(
                UserModel(
                    email="hr@company.com",
                    password_hash=hash_password("hr123"),
                    role="hr",
                )
            )
        else:
            existing_hr.password_hash = hash_password("hr123")
            existing_hr.role = "hr"

        # Seed jobs
        existing_jobs = await session.scalar(select(JobPostingModel.id).limit(1))
        if existing_jobs is None and SEED_JOBS:
            session.add_all(JobPostingModel(**payload) for payload in SEED_JOBS)

        # Seed candidates
        existing_candidates = await session.scalar(select(CandidateModel.id))
        if existing_candidates is None:
            session.add_all(CandidateModel(**payload) for payload in SEED_CANDIDATES)

        # Removed: Candidate users are no longer auto-seeded
        # Only HR user (hr@company.com) is seeded above

        await session.commit()
