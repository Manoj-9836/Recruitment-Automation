from __future__ import annotations

from threading import Lock

from app.schemas.recruitment import Candidate, JobPosting

_store_lock = Lock()

_candidates: list[Candidate] = [
    Candidate(
        id="cand-1",
        candidateName="Alice Chen",
        jobRole="Frontend Engineer",
        atsScore=92,
        extractedSkills=["React", "TypeScript", "Tailwind", "Framer Motion"],
        certifications=["AWS Cloud Practitioner", "Meta Front-End Developer"],
        achievements=["Led migration to App Router", "Reduced bundle size by 32%"],
        experience="3 yrs at TechCorp",
        suitability=92,
        status="pending",
        email="alice.chen@example.com",
    ),
    Candidate(
        id="cand-2",
        candidateName="Bob Smith",
        jobRole="Frontend Engineer",
        atsScore=74,
        extractedSkills=["React", "JavaScript", "CSS"],
        certifications=["Frontend Fundamentals"],
        achievements=["Built responsive marketing pages"],
        experience="1.2 yrs at PixelWorks",
        suitability=74,
        status="rejected",
        email="bob.smith@example.com",
    ),
    Candidate(
        id="cand-3",
        candidateName="Charlie Davis",
        jobRole="Backend Engineer",
        atsScore=88,
        extractedSkills=["FastAPI", "PostgreSQL", "Redis", "Docker"],
        certifications=["Azure Fundamentals"],
        achievements=["Built async processing pipeline"],
        experience="3 yrs at APIWorks",
        suitability=88,
        status="pending",
        email="charlie.davis@example.com",
    ),
    Candidate(
        id="cand-4",
        candidateName="Diana Evans",
        jobRole="Product Manager",
        atsScore=95,
        extractedSkills=["Roadmapping", "Stakeholder Management", "Analytics"],
        certifications=["PMI-ACP"],
        achievements=["Launched 2 enterprise products"],
        experience="5 yrs at ProdScale",
        suitability=95,
        status="selected",
        email="diana.evans@example.com",
    ),
    Candidate(
        id="cand-5",
        candidateName="Eve Foster",
        jobRole="Backend Engineer",
        atsScore=81,
        extractedSkills=["Python", "SQL", "Docker"],
        certifications=["Data Engineering Basics"],
        achievements=["Improved ETL throughput by 20%"],
        experience="2 yrs at DataBridge",
        suitability=81,
        status="pending",
        email="eve.foster@example.com",
    ),
    Candidate(
        id="cand-6",
        candidateName="Frank Green",
        jobRole="Frontend Engineer",
        atsScore=98,
        extractedSkills=["React", "TypeScript", "Next.js"],
        certifications=["Advanced React"],
        achievements=["Created design system used across 4 teams"],
        experience="4 yrs at UIForge",
        suitability=98,
        status="interview_completed",
        email="frank.green@example.com",
        zoomLink="https://zoom.us/j/92465000123?pwd=frontendSync",
    ),
    Candidate(
        id="cand-9",
        candidateName="Aarav Sharma",
        jobRole="Frontend Engineer",
        atsScore=89,
        extractedSkills=["React", "TypeScript", "Tailwind", "Framer Motion"],
        certifications=["Google UX Design", "Meta Front-End Developer"],
        achievements=["Built LMS with 10k monthly users", "Reduced bundle size by 32%"],
        experience="3.5 years in product-based startups building responsive SPA platforms.",
        suitability=89,
        status="selected",
        email="aarav.sharma@example.com",
        zoomLink="https://zoom.us/j/334623897?pwd=RecruitAuto",
    ),
    Candidate(
        id="cand-13",
        candidateName="Neeraj Kulkarni",
        jobRole="AI QA Engineer",
        atsScore=91,
        extractedSkills=["Playwright", "TypeScript", "API Testing", "Prompt Evaluation"],
        certifications=["ISTQB Foundation", "Azure AI Fundamentals"],
        achievements=["Automated 280+ end-to-end tests", "Reduced production regressions by 37%"],
        experience="3.2 yrs at TestPilot AI",
        suitability=91,
        status="selected",
        email="neeraj.kulkarni@example.com",
        zoomLink="https://zoom.us/j/665112349?pwd=RecruitAuto",
    ),
]

_jobs: list[JobPosting] = [
    JobPosting(
        id="job-1",
        title="Frontend Engineer",
        requiredAts=85,
        jdFileName="frontend-engineer-jd.pdf",
    ),
    JobPosting(
        id="job-2",
        title="Backend Engineer",
        requiredAts=88,
        jdFileName="backend-engineer-jd.pdf",
    ),
    JobPosting(
        id="job-3",
        title="AI QA Engineer",
        requiredAts=90,
        jdFileName="ai-qa-engineer-jd.pdf",
    ),
]


def list_candidates() -> list[Candidate]:
    with _store_lock:
        return [item.model_copy(deep=True) for item in _candidates]


def replace_candidates(items: list[Candidate]) -> list[Candidate]:
    with _store_lock:
        _candidates.clear()
        _candidates.extend(item.model_copy(deep=True) for item in items)
        return [item.model_copy(deep=True) for item in _candidates]


def list_jobs() -> list[JobPosting]:
    with _store_lock:
        return [item.model_copy(deep=True) for item in _jobs]


def replace_jobs(items: list[JobPosting]) -> list[JobPosting]:
    with _store_lock:
        _jobs.clear()
        _jobs.extend(item.model_copy(deep=True) for item in items)
        return [item.model_copy(deep=True) for item in _jobs]
