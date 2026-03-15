from fastapi import APIRouter

router = APIRouter(prefix="/coding", tags=["coding"])


@router.get("/health")
async def coding_health() -> dict[str, str]:
    return {"module": "coding", "status": "ok"}
