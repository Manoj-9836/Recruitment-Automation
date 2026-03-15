from fastapi import APIRouter

router = APIRouter(prefix="/candidates", tags=["candidates"])


@router.get("/health")
async def candidates_health() -> dict[str, str]:
    return {"module": "candidates", "status": "ok"}
