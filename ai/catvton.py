from pathlib import Path

from ai.base import TryOnProvider
from ai.inference import CatVTONInference


class CatVTONProvider(TryOnProvider):
    """Provider adapter that keeps the API independent from CatVTON internals."""

    name = "catvton"

    def __init__(self, inference: CatVTONInference) -> None:
        self.inference = inference

    async def generate(
        self,
        person_image: Path,
        cloth_image: Path,
        output_path: Path,
        category: str = "Upper-body",
    ) -> Path:
        return await self.inference.generate(person_image, cloth_image, output_path, category=category)
