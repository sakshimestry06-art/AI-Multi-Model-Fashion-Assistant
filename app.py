from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from ai.factory import warmup_tryon_provider
from config import get_settings
from middleware.error_handler import register_exception_handlers
from routes.health import router as health_router
from routes.images import router as images_router
from routes.tryon import router as tryon_router
from utils.logging import configure_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    warmup_tryon_provider()
    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    settings = get_settings()
    configure_logging(settings.logs_dir)

    settings.uploads_dir.mkdir(parents=True, exist_ok=True)
    settings.outputs_dir.mkdir(parents=True, exist_ok=True)
    settings.logs_dir.mkdir(parents=True, exist_ok=True)

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Production-ready virtual try-on API for the FashionAI PHP project.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.mount("/outputs", StaticFiles(directory=settings.outputs_dir), name="outputs")

    app.include_router(health_router)
    app.include_router(images_router)
    app.include_router(tryon_router)
    return app


app = create_app()
