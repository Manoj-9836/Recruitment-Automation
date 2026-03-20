from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.recruitment import CandidateModel
from app.db.session import get_db_session
from app.utils.security import verify_password
from app.utils.token_manager import TokenResponse, get_token_manager

router = APIRouter(prefix="/auth", tags=["candidate-auth"])


@router.post("/candidate/login", response_model=TokenResponse)
async def candidate_login(
    username: str,
    password: str,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    """Authenticate a candidate and return JWT tokens."""
    # Fetch candidate by email
    candidate = await db.scalar(
        select(CandidateModel).where(CandidateModel.email == username)
    )

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Check if candidate is authorized
    if candidate.authorization_status not in ["authorized", "portal_accessed"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Candidate account not yet authorized. Please wait for HR to authorize your application.",
        )

    # Verify password
    if not candidate.password_hash or not verify_password(password, candidate.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Update authorization status to portal_accessed
    candidate.authorization_status = "portal_accessed"
    await db.commit()

    # Generate tokens
    token_manager = get_token_manager()
    tokens = token_manager.create_tokens(candidate.id, candidate.email)

    return tokens


@router.post("/candidate/refresh", response_model=TokenResponse)
async def refresh_candidate_token(refresh_token: str) -> TokenResponse:
    """Refresh access token using refresh token."""
    token_manager = get_token_manager()
    new_tokens = token_manager.refresh_access_token(refresh_token)

    if not new_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    return new_tokens


@router.post("/candidate/verify")
async def verify_candidate(
    token: str,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Verify if a candidate token is valid."""
    token_manager = get_token_manager()
    payload = token_manager.verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Fetch candidate details
    candidate = await db.scalar(
        select(CandidateModel).where(CandidateModel.id == payload.candidate_id)
    )

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found",
        )

    return {
        "authorized": candidate.authorization_status in ["authorized", "portal_accessed"],
        "candidateId": candidate.id,
        "candidateName": candidate.candidate_name,
        "email": candidate.email,
        "jobRole": candidate.job_role,
    }


@router.post("/candidate/validate")
async def validate_candidate_token(
    token: str,
) -> dict:
    """Quick token validation without database lookup."""
    token_manager = get_token_manager()
    payload = token_manager.verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return {
        "valid": True,
        "candidateId": payload.candidate_id,
        "email": payload.email,
        "expiresAt": payload.exp.isoformat() if payload.exp else None,
    }
