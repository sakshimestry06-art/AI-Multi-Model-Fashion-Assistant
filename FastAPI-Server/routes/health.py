from fastapi import APIRouter, Depends

from config import Settings, get_settings
from schemas.tryon import StatusResponse

router = APIRouter(tags=["Health"])


@router.get("/", response_model=StatusResponse)
async def root(settings: Settings = Depends(get_settings)) -> StatusResponse:
    return StatusResponse(
        success=True,
        message="Virtual try-on server is running.",
        service=settings.app_name,
        version=settings.app_version,
        tryon_provider=settings.ai_provider,
        remote_inference_enabled=settings.remote_inference_enabled,
    )


@router.get("/health", response_model=StatusResponse)
async def health(settings: Settings = Depends(get_settings)) -> StatusResponse:
    return StatusResponse(
        success=True,
        message="API health check passed.",
        service=settings.app_name,
        version=settings.app_version,
        tryon_provider=settings.ai_provider,
        remote_inference_enabled=settings.remote_inference_enabled,
    )
