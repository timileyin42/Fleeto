import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="google")
warnings.filterwarnings("ignore", message=".*NotOpenSSLWarning.*")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
import app.models  # noqa: F401 — registers all ORM models with Base.metadata

_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

# In production add your real domain via ALLOWED_ORIGINS env var
if settings.allowed_origins:
    _ALLOWED_ORIGINS.extend(
        [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
    )


def create_app() -> FastAPI:
    app = FastAPI(title="Fleeto", version="0.1.0", max_request_size=100 * 1024 * 1024)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
