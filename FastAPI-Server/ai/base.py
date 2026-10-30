from abc import ABC, abstractmethod
from pathlib import Path


class TryOnProvider(ABC):
    """Interface every virtual try-on model provider must implement."""

    name: str

    @abstractmethod
    async def generate(
        self,
        person_image: Path,
        cloth_image: Path,
        output_path: Path,
        category: str = "Upper-body",
    ) -> Path:
        """Generate a try-on image and return the saved output path."""
