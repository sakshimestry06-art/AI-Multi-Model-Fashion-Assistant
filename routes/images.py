import time
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from PIL import Image

from config import Settings, get_settings
from schemas.tryon import ImageEditResponse
from services.image_service import ImageService
from services.storage_service import StorageService

router = APIRouter(prefix="/images", tags=["Image Studio"])


def get_image_service(settings: Settings = Depends(get_settings)) -> ImageService:
    return ImageService(settings.inference_image_size)


def get_storage_service(settings: Settings = Depends(get_settings)) -> StorageService:
    return StorageService(settings)


@router.post("/edit", response_model=ImageEditResponse, status_code=status.HTTP_201_CREATED)
async def edit_image(
    image: UploadFile = File(..., description="JPG or PNG image to edit."),
    brightness: float = Form(1.0, ge=0.2, le=2.0),
    contrast: float = Form(1.0, ge=0.2, le=2.0),
    saturation: float = Form(1.0, ge=0.0, le=2.0),
    sharpness: float = Form(1.0, ge=0.0, le=3.0),
    rotation: int = Form(0, ge=-180, le=180),
    quality: str = Form("high", pattern="^(high|balanced)$"),
    settings: Settings = Depends(get_settings),
    image_service: ImageService = Depends(get_image_service),
    storage_service: StorageService = Depends(get_storage_service),
) -> ImageEditResponse:
    """Losslessly save image edits as PNG; no remote upload is made."""
    request_id = uuid4().hex
    started = time.perf_counter()
    await image_service.validate_upload(image, settings)

    with Image.open(image.file) as source:
        edited = image_service.edit_image(
            source,
            brightness=brightness,
            contrast=contrast,
            saturation=saturation,
            sharpness=sharpness,
            rotation=rotation,
            quality=quality,
        )

    output_path = storage_service.create_output_path()
    edited.save(output_path, format="PNG", optimize=False)
    processing_time = f"{time.perf_counter() - started:.2f}s"
    return ImageEditResponse(
        success=True,
        message="Image edited locally and saved as a lossless PNG.",
        edited_image=storage_service.output_url(output_path),
        processing_time=processing_time,
        request_id=request_id,
    )
