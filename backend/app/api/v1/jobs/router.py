import re
from uuid import uuid4

from fastapi import APIRouter
from fastapi import Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models.recruitment import JobPostingModel
from app.db.models.recruitment import CandidateModel
from app.db.session import get_db_session
from app.schemas.recruitment import (
    JobPostingBulkUpsertRequest,
    JobPostingListResponse,
    JobPostingPublicResponse,
)
from app.services.ai_orchestration import (
    CandidateApplicationPayload,
    extract_text_from_uploaded_document,
    run_candidate_application_ai,
)
from app.services.storage import normalize_filename, upload_bytes


def _to_response_item(item: JobPostingModel) -> dict:
    settings = get_settings()
    apply_slug = item.apply_slug or f"{_slugify(item.title)}-{item.id[-6:]}"
    apply_link = f"{settings.frontend_base_url.rstrip('/')}/?apply={apply_slug}"
    return {
        "id": item.id,
        "title": item.title,
        "requiredAts": item.required_ats,
        "jdFileName": item.jd_file_name,
        "jdFileUrl": item.jd_file_url,
        "applySlug": apply_slug,
        "applyLink": apply_link,
        "isActive": item.is_active,
    }


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "job"


def _try_upload_bytes(*, bucket: str, destination_path: str, content: bytes, content_type: str | None) -> str | None:
    try:
        return upload_bytes(
            bucket=bucket,
            destination_path=destination_path,
            content=content,
            content_type=content_type,
        )
    except RuntimeError:
        # Keep core job/application workflow running even when storage is not configured.
        return None

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/health")
async def jobs_health() -> dict[str, str]:
    return {"module": "jobs", "status": "ok"}


@router.get("", response_model=JobPostingListResponse)
async def get_jobs(db: AsyncSession = Depends(get_db_session)) -> JobPostingListResponse:
    result = await db.execute(select(JobPostingModel).order_by(JobPostingModel.id.asc()))
    items = result.scalars().all()
    return JobPostingListResponse(items=[_to_response_item(item) for item in items])


@router.post("", response_model=dict)
async def create_job(
    title: str = Form(...),
    requiredAts: int = Form(...),
    jdFile: UploadFile = File(...),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    if requiredAts < 0 or requiredAts > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="requiredAts must be between 0 and 100")

    if not jdFile.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JD file is required")

    file_name = jdFile.filename
    if not file_name.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JD must be a PDF")

    job_id = f"job-{uuid4().hex[:10]}"
    apply_slug = f"{_slugify(title)}-{uuid4().hex[:8]}"
    normalized_name = normalize_filename(file_name)
    jd_path = f"jobs/{job_id}/{normalized_name}"

    jd_bytes = await jdFile.read()
    jd_file_url = _try_upload_bytes(
        bucket=get_settings().supabase_jd_bucket,
        destination_path=jd_path,
        content=jd_bytes,
        content_type=jdFile.content_type,
    )
    jd_text = extract_text_from_uploaded_document(
        content=jd_bytes,
        filename=normalized_name,
        content_type=jdFile.content_type,
    )

    item = JobPostingModel(
        id=job_id,
        title=title.strip(),
        required_ats=requiredAts,
        jd_file_name=normalized_name,
        jd_file_url=jd_file_url,
        jd_text=jd_text or None,
        apply_slug=apply_slug,
        is_active=True,
    )

    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _to_response_item(item)


@router.put("/{job_id}", response_model=dict)
async def update_job(
    job_id: str,
    title: str = Form(...),
    requiredAts: int = Form(...),
    jdFile: UploadFile | None = File(default=None),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    item = await db.scalar(select(JobPostingModel).where(JobPostingModel.id == job_id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if requiredAts < 0 or requiredAts > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="requiredAts must be between 0 and 100")

    item.title = title.strip()
    item.required_ats = requiredAts

    if jdFile is not None and jdFile.filename:
        if not jdFile.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JD must be a PDF")
        normalized_name = normalize_filename(jdFile.filename)
        jd_path = f"jobs/{job_id}/{normalized_name}"
        jd_bytes = await jdFile.read()
        jd_file_url = _try_upload_bytes(
            bucket=get_settings().supabase_jd_bucket,
            destination_path=jd_path,
            content=jd_bytes,
            content_type=jdFile.content_type,
        )
        jd_text = extract_text_from_uploaded_document(
            content=jd_bytes,
            filename=normalized_name,
            content_type=jdFile.content_type,
        )
        item.jd_file_name = normalized_name
        item.jd_file_url = jd_file_url
        item.jd_text = jd_text or None

    await db.commit()
    await db.refresh(item)
    return _to_response_item(item)


@router.delete("/{job_id}", response_model=dict)
async def delete_job(job_id: str, db: AsyncSession = Depends(get_db_session)) -> dict:
    item = await db.scalar(select(JobPostingModel).where(JobPostingModel.id == job_id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    await db.delete(item)
    await db.commit()
    return {"deleted": True, "jobId": job_id}


@router.get("/public/{apply_slug}", response_model=JobPostingPublicResponse)
async def get_public_job(apply_slug: str, db: AsyncSession = Depends(get_db_session)) -> JobPostingPublicResponse:
    item = await db.scalar(
        select(JobPostingModel).where(JobPostingModel.apply_slug == apply_slug, JobPostingModel.is_active.is_(True))
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    return JobPostingPublicResponse(
        id=item.id,
        title=item.title,
        jdFileName=item.jd_file_name,
        jdFileUrl=item.jd_file_url,
        applySlug=item.apply_slug,
    )


@router.post("/public/{apply_slug}/apply", response_model=dict)
async def submit_job_application(
    apply_slug: str,
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(""),
    location: str = Form(""),
    totalExperience: str = Form(""),
    currentCompany: str = Form(""),
    linkedinUrl: str = Form(""),
    portfolioUrl: str = Form(""),
    education: str = Form(""),
    professionalSummary: str = Form(""),
    resume: UploadFile = File(...),
    profilePhoto: UploadFile | None = File(default=None),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    job = await db.scalar(
        select(JobPostingModel).where(JobPostingModel.apply_slug == apply_slug, JobPostingModel.is_active.is_(True))
    )
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if not resume.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Resume file is required")

    candidate_id = f"cand-{uuid4().hex[:12]}"
    resume_name = normalize_filename(resume.filename)
    resume_path = f"applications/{job.id}/{candidate_id}/resume-{resume_name}"

    resume_bytes = await resume.read()
    resume_url = _try_upload_bytes(
        bucket=get_settings().supabase_application_bucket,
        destination_path=resume_path,
        content=resume_bytes,
        content_type=resume.content_type,
    )

    resume_text = extract_text_from_uploaded_document(
        content=resume_bytes,
        filename=resume_name,
        content_type=resume.content_type,
    )

    parsed_education = [item.strip() for item in education.split(",") if item.strip()]

    ai_payload = CandidateApplicationPayload(
        job_title=job.title,
        required_ats=job.required_ats,
        jd_text=(job.jd_text or "").strip() or f"Role: {job.title}",
        candidate_name=fullName.strip(),
        email=email.strip().lower(),
        phone=phone.strip(),
        location=location.strip(),
        total_experience=totalExperience.strip(),
        current_company=currentCompany.strip(),
        linkedin_url=linkedinUrl.strip(),
        portfolio_url=portfolioUrl.strip(),
        education=education.strip(),
        professional_summary=professionalSummary.strip(),
        resume_text=resume_text,
    )
    
    try:
        ai_result = await run_candidate_application_ai(ai_payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI evaluation failed: {str(e)}"
        )

    resolved_linkedin_url = linkedinUrl.strip() or ai_result.linkedin_url
    resolved_github_url = ai_result.github_url
    resolved_portfolio_url = portfolioUrl.strip() or ai_result.portfolio_url

    resolved_projects = [project.model_dump() for project in ai_result.projects] if ai_result.projects else []
    extra_project_urls = [u for u in ai_result.project_urls if u.strip()]
    for idx, url in enumerate(extra_project_urls):
        if idx < len(resolved_projects):
            existing_link = resolved_projects[idx].get("link")
            if not existing_link:
                resolved_projects[idx]["link"] = url
        else:
            resolved_projects.append(
                {
                    "name": f"Project Link {idx + 1}",
                    "techStack": [],
                    "impact": "Project URL extracted from resume.",
                    "link": url,
                }
            )

    profile_url: str | None = None
    if profilePhoto is not None and profilePhoto.filename:
        profile_name = normalize_filename(profilePhoto.filename)
        profile_path = f"applications/{job.id}/{candidate_id}/profile-{profile_name}"
        profile_url = _try_upload_bytes(
            bucket=get_settings().supabase_application_bucket,
            destination_path=profile_path,
            content=await profilePhoto.read(),
            content_type=profilePhoto.content_type,
        )

    candidate = CandidateModel(
        id=candidate_id,
        candidate_name=fullName.strip(),
        job_role=job.title,
        ats_score=ai_result.ats_score,
        extracted_skills=ai_result.extracted_skills,
        certifications=ai_result.certifications,
        achievements=ai_result.achievements,
        experience=ai_result.experience_summary or totalExperience.strip() or "Not specified",
        suitability=ai_result.suitability,
        status="pending",
        email=email.strip().lower(),
        phone=phone.strip() or None,
        location=location.strip() or None,
        education=parsed_education or None,
        languages=["English"],
        professional_summary=ai_result.professional_summary or professionalSummary.strip() or None,
        projects=resolved_projects or None,
        zoom_link=None,
        linkedin_url=resolved_linkedin_url or None,
        github_url=resolved_github_url or None,
        portfolio_url=resolved_portfolio_url or None,
        current_company=currentCompany.strip() or None,
        profile_photo_url=profile_url,
        resume_file_url=resume_url,
    )

    db.add(candidate)
    await db.commit()

    return {"submitted": True, "candidateId": candidate_id, "message": "Application submitted successfully"}


@router.put("", response_model=JobPostingListResponse)
async def put_jobs(
    payload: JobPostingBulkUpsertRequest,
    db: AsyncSession = Depends(get_db_session),
) -> JobPostingListResponse:
    await db.execute(delete(JobPostingModel))

    db.add_all(
        JobPostingModel(
            id=item.id,
            title=item.title,
            required_ats=item.requiredAts,
            jd_file_name=item.jdFileName,
            jd_file_url=item.jdFileUrl,
            apply_slug=item.applySlug or f"{_slugify(item.title)}-{item.id[-6:]}",
            is_active=item.isActive,
        )
        for item in payload.items
    )

    await db.commit()

    result = await db.execute(select(JobPostingModel).order_by(JobPostingModel.id.asc()))
    items = result.scalars().all()
    return JobPostingListResponse(items=[_to_response_item(item) for item in items])
