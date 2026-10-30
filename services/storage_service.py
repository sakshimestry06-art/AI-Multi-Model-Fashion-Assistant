import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List
from uuid import uuid4

from fastapi import UploadFile

from config import Settings
from schemas.tryon import HistoryItem


class StorageService:
    """Filesystem persistence for uploads, generated outputs, and history."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def unique_path(self, directory: Path, original_filename: str, suffix: str | None = None) -> Path:
        extension = suffix or Path(original_filename).suffix.lower()
        return directory / f"{uuid4().hex}{extension}"

    async def save_upload(self, upload: UploadFile) -> Path:
        path = self.unique_path(self.settings.uploads_dir, upload.filename or "image.png")
        with path.open("wb") as destination:
            while chunk := await upload.read(1024 * 1024):
                destination.write(chunk)
        await upload.seek(0)
        return path

    def create_output_path(self) -> Path:
        return self.unique_path(self.settings.outputs_dir, "generated.png", ".png")

    def output_url(self, output_path: Path) -> str:
        return f"{self.settings.public_base_url.rstrip('/')}/outputs/{output_path.name}"

    def read_history(self) -> List[HistoryItem]:
        if not self.settings.history_file.exists():
            return []
        try:
            data = json.loads(self.settings.history_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return []
        if not isinstance(data, list):
            return []
        return [HistoryItem.model_validate(item) for item in data]

    def append_history(self, item: HistoryItem) -> None:
        history = self.read_history()
        history.insert(0, item)
        self._write_history(history)

    def delete_history_item(self, item_id: str) -> bool:
        history = self.read_history()
        item = next((entry for entry in history if entry.id == item_id), None)
        if item is None:
            return False

        output_name = Path(item.generated_image).name
        output_path = (self.settings.outputs_dir / output_name).resolve()
        if output_path.parent == self.settings.outputs_dir.resolve() and output_path.exists():
            output_path.unlink()

        self._write_history([entry for entry in history if entry.id != item_id])
        return True

    def make_history_item(self, output_path: Path, request_id: str, processing_time: str) -> HistoryItem:
        return HistoryItem(
            id=request_id,
            generated_image=self.output_url(output_path),
            processing_time=processing_time,
            created_at=datetime.now(timezone.utc),
        )

    def _write_history(self, history: List[HistoryItem]) -> None:
        self.settings.history_file.parent.mkdir(parents=True, exist_ok=True)
        payload = [item.model_dump(mode="json") for item in history]
        self.settings.history_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")
