from functools import lru_cache
from pathlib import Path
import tempfile
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "AI Multi-Modal Fashion Assistant Try-On API"
    app_version: str = "1.0.0"
    debug: bool = False

    base_dir: Path = Path(__file__).resolve().parent
    runtime_dir: Path = Path(tempfile.gettempdir()) / "fashionai-tryon"
    uploads_dir: Path = runtime_dir / "uploads"
    outputs_dir: Path = runtime_dir / "outputs"
    logs_dir: Path = runtime_dir / "logs"
    history_file: Path = runtime_dir / "outputs" / "history.json"

    max_upload_size_bytes: int = 10 * 1024 * 1024
    # Protect a laptop from decompression-bomb images while allowing high quality photos.
    max_image_pixels: int = 40_000_000
    allowed_content_types: List[str] = Field(
        default_factory=lambda: ["image/jpeg", "image/png", "image/webp"]
    )
    allowed_extensions: List[str] = Field(default_factory=lambda: [".jpg", ".jpeg", ".png", ".webp"])

    cors_origins: List[str] = Field(
        default_factory=lambda: [
            "http://localhost",
            "http://localhost:80",
            "http://localhost:8000",
            "http://localhost:8080",
            "http://localhost:5173",
            "http://127.0.0.1",
            "http://127.0.0.1:8000",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:5173",
        ]
    )

    public_base_url: str = "http://localhost:8000"
    ai_provider: str = "ootdiffusion_gradio"
    inference_image_size: int = 768

    # A laptop-friendly real try-on option. It is intentionally opt-in because
    # photos are sent to the configured remote GPU provider.
    remote_inference_enabled: bool = False
    ootdiffusion_url: str = "https://levihsu-ootdiffusion.hf.space"
    ootdiffusion_api_name: str = "/process_dc"
    ootdiffusion_steps: int = Field(default=30, ge=20, le=40)
    ootdiffusion_guidance_scale: float = Field(default=2.0, ge=1.0, le=5.0)

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug_mode(cls, value: object) -> object:
        if isinstance(value, str) and value.strip().lower() in {"release", "prod", "production"}:
            return False
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
