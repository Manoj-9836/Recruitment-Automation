from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.recruitment import UserModel
from app.db.session import get_db_session
from app.schemas.auth import LoginRequest, LoginResponse
from app.utils.security import verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/health")
async def auth_health() -> dict[str, str]:
    return {"module": "auth", "status": "ok"}


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db_session)) -> LoginResponse:
    username = payload.username.strip().lower()
    password = payload.password.strip()

    # Look up user in database
    user = await db.scalar(select(UserModel).where(UserModel.email == username))
    
    if not user:
        return LoginResponse(
            authenticated=False,
            role="candidate",
            message="Invalid credentials. User not found.",
        )
    
    # Verify password
    if not verify_password(password, user.password_hash):
        return LoginResponse(
            authenticated=False,
            role=user.role,
            message="Invalid credentials. Incorrect password.",
        )
    
    # Authentication successful
    return LoginResponse(
        authenticated=True,
        role=user.role,
        message=f"{user.role.capitalize()} login successful.",
    )
