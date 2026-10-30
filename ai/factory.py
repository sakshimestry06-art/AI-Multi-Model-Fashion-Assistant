from functools import lru_cache

from ai.base import TryOnProvider
from ai.catvton import CatVTONProvider
from ai.inference import CatVTONInference
from ai.ootdiffusion import OOTDiffusionProvider
from config import get_settings


@lru_cache
def get_tryon_provider() -> TryOnProvider:
    """Return the configured try-on provider."""

    settings = get_settings()

    if settings.ai_provider.lower() == "catvton":
        inference = CatVTONInference(settings)
        inference.load()
        return CatVTONProvider(inference)

    if settings.ai_provider.lower() == "ootdiffusion_gradio":
        return OOTDiffusionProvider(settings)

    raise ValueError(f"Unsupported AI provider: {settings.ai_provider}")


def warmup_tryon_provider() -> None:
    get_tryon_provider()
