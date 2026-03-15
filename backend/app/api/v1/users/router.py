from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/health")
async def users_health() -> dict[str, str]:
    return {"module": "users", "status": "ok"}
