from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models.recruitment import CandidateModel
from app.db.session import get_db_session
from app.schemas.recruitment import (
    CandidateAuthorizationRequest,
    CandidateAuthorizationResponse,
    CandidateBulkUpsertRequest,
    CandidateListResponse,
)
from app.services.email_service import EmailService
from app.utils.security import generate_password, hash_password


def _to_response_item(item: CandidateModel) -> dict:
    return {
        "id": item.id,
        "candidateName": item.candidate_name,
        "jobRole": item.job_role,
        "atsScore": item.ats_score,
        "extractedSkills": item.extracted_skills,
        "certifications": item.certifications,
        "achievements": item.achievements,
        "experience": item.experience,
        "suitability": item.suitability,
        "status": item.status,
        "authorizationStatus": item.authorization_status,
        "email": item.email,
        "phone": item.phone,
        "location": item.location,
        "education": item.education,
        "languages": item.languages,
        "professionalSummary": item.professional_summary,
        "projects": item.projects,
        "zoomLink": item.zoom_link,
        "linkedinUrl": item.linkedin_url,
        "githubUrl": item.github_url,
        "portfolioUrl": item.portfolio_url,
        "currentCompany": item.current_company,
        "profilePhotoUrl": item.profile_photo_url,
        "resumeFileUrl": item.resume_file_url,
    }

router = APIRouter(prefix="/candidates", tags=["candidates"])


@router.get("/health")
async def candidates_health() -> dict[str, str]:
    return {"module": "candidates", "status": "ok"}


@router.get("", response_model=CandidateListResponse)
async def get_candidates(db: AsyncSession = Depends(get_db_session)) -> CandidateListResponse:
    result = await db.execute(select(CandidateModel).order_by(CandidateModel.id.asc()))
    items = result.scalars().all()
    return CandidateListResponse(items=[_to_response_item(item) for item in items])


@router.post("/authorize", response_model=CandidateAuthorizationResponse)
async def authorize_candidate(
    payload: CandidateAuthorizationRequest,
    db: AsyncSession = Depends(get_db_session),
) -> CandidateAuthorizationResponse:
    """Authorize a candidate by generating credentials and sending email."""
    settings = get_settings()
    candidate = await db.scalar(
        select(CandidateModel).where(CandidateModel.id == payload.candidateId)
    )

    if not candidate:
        return CandidateAuthorizationResponse(
            success=False,
            message="Candidate not found",
            candidateId=payload.candidateId,
        )

    # Generate password
    password = generate_password()
    password_hash = hash_password(password)

    # Update candidate with authorization
    candidate.authorization_status = "authorized"
    candidate.password_hash = password_hash

    # Send email
    email_service = EmailService(
        smtp_server=settings.smtp_server,
        smtp_port=settings.smtp_port,
        sender_email=settings.smtp_sender_email,
        sender_password=settings.smtp_sender_password,
    )

    email_sent = email_service.send_authorization_email(
        recipient_email=candidate.email,
        candidate_name=candidate.candidate_name,
        username=candidate.email,
        password=password,
        job_title=candidate.job_role,
        portal_url=settings.candidate_portal_url,
    )

    if not email_sent:
        return CandidateAuthorizationResponse(
            success=False,
            message="Failed to send authorization email. Check SMTP configuration.",
            candidateId=payload.candidateId,
            email=candidate.email,
        )

    await db.commit()

    return CandidateAuthorizationResponse(
        success=True,
        message=f"Authorization email sent to {candidate.email}",
        candidateId=payload.candidateId,
        email=candidate.email,
        password=password,
    )


@router.delete("/{candidate_id}", response_model=dict)
async def delete_candidate(candidate_id: str, db: AsyncSession = Depends(get_db_session)) -> dict:
    item = await db.scalar(select(CandidateModel).where(CandidateModel.id == candidate_id))
    if item is None:
        return {"deleted": False, "candidateId": candidate_id}

    await db.delete(item)
    await db.commit()
    return {"deleted": True, "candidateId": candidate_id}


@router.put("", response_model=CandidateListResponse)
async def put_candidates(
    payload: CandidateBulkUpsertRequest,
    db: AsyncSession = Depends(get_db_session),
) -> CandidateListResponse:
    # Preserve sensitive auth fields generated server-side during HR authorization.
    existing_result = await db.execute(select(CandidateModel))
    existing_items = existing_result.scalars().all()
    existing_by_id = {item.id: item for item in existing_items}

    await db.execute(delete(CandidateModel))

    db.add_all(
        CandidateModel(
            id=item.id,
            candidate_name=item.candidateName,
            job_role=item.jobRole,
            ats_score=item.atsScore,
            extracted_skills=item.extractedSkills,
            certifications=item.certifications,
            achievements=item.achievements,
            experience=item.experience,
            suitability=item.suitability,
            status=item.status,
            authorization_status=(
                existing_by_id[item.id].authorization_status
                if item.id in existing_by_id
                else item.authorizationStatus
            ),
            password_hash=(
                existing_by_id[item.id].password_hash
                if item.id in existing_by_id
                else None
            ),
            email=str(item.email),
            phone=item.phone,
            location=item.location,
            education=item.education,
            languages=item.languages,
            professional_summary=item.professionalSummary,
            projects=[project.model_dump() for project in item.projects] if item.projects else None,
            zoom_link=item.zoomLink,
            linkedin_url=item.linkedinUrl,
            github_url=item.githubUrl,
            portfolio_url=item.portfolioUrl,
            current_company=item.currentCompany,
            profile_photo_url=item.profilePhotoUrl,
            resume_file_url=item.resumeFileUrl,
        )
        for item in payload.items
    )

    await db.commit()

    result = await db.execute(select(CandidateModel).order_by(CandidateModel.id.asc()))
    items = result.scalars().all()
    return CandidateListResponse(items=[_to_response_item(item) for item in items])
