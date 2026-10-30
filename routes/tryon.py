import logging
import time
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from ai.base import TryOnProvider
from ai.factory import get_tryon_provider
from config import Settings, get_settings
from schemas.tryon import DeleteResponse, HistoryResponse, TryOnResponse
from services.image_service import ImageService
from services.storage_service import StorageService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Virtual Try-On"])


def get_image_service(settings: Settings = Depends(get_settings)) -> ImageService:
    return ImageService(settings.inference_image_size)


def get_storage_service(settings: Settings = Depends(get_settings)) -> StorageService:
    return StorageService(settings)


@router.post("/tryon", response_model=TryOnResponse, status_code=status.HTTP_201_CREATED)
async def generate_tryon(
    person_image: UploadFile = File(..., description="Person image as JPG or PNG."),
    cloth_image: UploadFile = File(..., description="Clothing image as JPG or PNG."),
    category: str = Form("Upper-body", pattern="^(Upper-body|Lower-body|Dress)$"),
    settings: Settings = Depends(get_settings),
    image_service: ImageService = Depends(get_image_service),
    storage_service: StorageService = Depends(get_storage_service),
    provider: TryOnProvider = Depends(get_tryon_provider),
) -> TryOnResponse:
    request_id = uuid4().hex
    started = time.perf_counter()

    logger.info("Try-on request received: request_id=%s", request_id)
    await image_service.validate_upload(person_image, settings)
    await image_service.validate_upload(cloth_image, settings)

    saved_person = await storage_service.save_upload(person_image)
    saved_cloth = await storage_service.save_upload(cloth_image)
    output_path = storage_service.create_output_path()

    try:
        generated_path = await provider.generate(saved_person, saved_cloth, output_path, category)
    except RuntimeError as exc:
        logger.warning("Try-on provider unavailable: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    processing_time = f"{time.perf_counter() - started:.2f}s"

    history_item = storage_service.make_history_item(generated_path, request_id, processing_time)
    storage_service.append_history(history_item)

    return TryOnResponse(
        success=True,
        message="Virtual try-on generated successfully.",
        generated_image=history_item.generated_image,
        processing_time=processing_time,
        request_id=request_id,
    )


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    storage_service: StorageService = Depends(get_storage_service),
) -> HistoryResponse:
    history = storage_service.read_history()
    return HistoryResponse(success=True, count=len(history), history=history)


@router.delete("/history/{item_id}", response_model=DeleteResponse)
async def delete_history_item(
    item_id: str,
    storage_service: StorageService = Depends(get_storage_service),
) -> DeleteResponse:
    deleted = storage_service.delete_history_item(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="History item not found.")
    return DeleteResponse(success=True, message="Generated image deleted successfully.")
