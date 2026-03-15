from fastapi import APIRouter

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/health")
async def reports_health() -> dict[str, str]:
    return {"module": "reports", "status": "ok"}
