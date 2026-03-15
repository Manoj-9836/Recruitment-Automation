from fastapi import APIRouter

from app.api.v1.auth.router import router as auth_router
from app.api.v1.candidates.router import router as candidates_router
from app.api.v1.coding.router import router as coding_router
from app.api.v1.interviews.router import router as interviews_router
from app.api.v1.jobs.router import router as jobs_router
from app.api.v1.projects.router import router as projects_router
from app.api.v1.reports.router import router as reports_router
from app.api.v1.users.router import router as users_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(jobs_router)
api_v1_router.include_router(candidates_router)
api_v1_router.include_router(interviews_router)
api_v1_router.include_router(coding_router)
api_v1_router.include_router(reports_router)
