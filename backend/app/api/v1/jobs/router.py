from fastapi import APIRouter

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/health")
async def jobs_health() -> dict[str, str]:
    return {"module": "jobs", "status": "ok"}
