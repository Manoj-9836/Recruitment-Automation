from fastapi import APIRouter

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/health")
async def projects_health() -> dict[str, str]:
    return {"module": "projects", "status": "ok"}
