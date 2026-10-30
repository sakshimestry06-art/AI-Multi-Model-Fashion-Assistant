from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict


class StatusResponse(BaseModel):
    success: bool
    message: str
    service: str
    version: str
    tryon_provider: str
    remote_inference_enabled: bool


class TryOnResponse(BaseModel):
    success: bool
    message: str
    generated_image: str
    processing_time: str
    request_id: str


class HistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    generated_image: str
    processing_time: str
    created_at: datetime


class HistoryResponse(BaseModel):
    success: bool
    count: int
    history: List[HistoryItem]


class DeleteResponse(BaseModel):
    success: bool
    message: str


class ImageEditResponse(BaseModel):
    success: bool
    message: str
    edited_image: str
    processing_time: str
    request_id: str
