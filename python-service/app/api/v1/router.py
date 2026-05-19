from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.billing import router as billing_router
from app.api.v1.briefing import router as briefing_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.riders import router as riders_router
from app.api.v1.tracking import router as tracking_router
from app.api.v1.uploads import router as uploads_router

api_router = APIRouter()
api_router.include_router(briefing_router)
api_router.include_router(auth_router)
api_router.include_router(billing_router)
api_router.include_router(notifications_router)
api_router.include_router(riders_router)
api_router.include_router(jobs_router)
api_router.include_router(tracking_router)
api_router.include_router(uploads_router)
