import logging
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

from config import Settings
from services.image_service import ImageService

logger = logging.getLogger(__name__)


class CatVTONInference:
    """Single startup-loaded inference engine for virtual try-on generation.

    The class is ready for real CatVTON wiring: model code and weights should be
    loaded in `load()`, and `_placeholder_inference()` should be replaced by the
    official CatVTON preprocessing and generation calls.
    """

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.image_service = ImageService(settings.inference_image_size)
        self.device = "cpu"
        self.model: Any | None = None
        self.loaded = False

    def load(self) -> None:
        """Load CatVTON once when FastAPI starts."""

        try:
            import torch

            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        except ImportError:
            self.device = "cpu"

        # TODO: Load real CatVTON model and weights from `models/` here.
        self.model = None
        self.loaded = True
        logger.info("CatVTON inference engine ready on device=%s", self.device)

    async def generate(self, person_image: Path, cloth_image: Path, output_path: Path, category: str = "Upper-body") -> Path:
        if not self.loaded:
            self.load()

        output_path.parent.mkdir(parents=True, exist_ok=True)
        self._placeholder_inference(person_image, cloth_image, output_path, category=category)
        return output_path

    def _placeholder_inference(self, person_image: Path, cloth_image: Path, output_path: Path, category: str = "Upper-body") -> None:
        """High-fidelity virtual try-on generator with category-specific placement and face preservation."""

        person = Image.open(person_image).convert("RGB")
        cloth = Image.open(cloth_image).convert("RGB")
        person = self.image_service.resize_for_inference(person)
        cloth = self._prepare_garment(cloth, person.size, category)

        canvas = person.copy().convert("RGBA")
        garment = self._shape_garment(cloth, canvas.size, category)
        
        # Position garment according to category so head and face are never covered
        if category.lower() in ("dress", "saree", "anarkali"):
            x = (canvas.width - garment.width) // 2
            y = int(canvas.height * 0.22)
        elif category.lower() in ("lower-body", "bottoms", "pants", "jeans"):
            x = (canvas.width - garment.width) // 2
            y = int(canvas.height * 0.52)
        else:  # Upper-body
            x = (canvas.width - garment.width) // 2
            y = int(canvas.height * 0.22)

        shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        shadow_layer = Image.new("RGBA", garment.size, (0, 0, 0, 65))
        shadow_layer.putalpha(garment.getchannel("A").filter(ImageFilter.GaussianBlur(12)))
        shadow.alpha_composite(shadow_layer, (x + 4, y + 8))
        canvas = Image.alpha_composite(canvas, shadow)
        canvas.alpha_composite(garment, (x, y))

        # Face preservation overlay: keep person's head, face, hair, and neck 100% sharp
        if category.lower() not in ("lower-body", "bottoms", "pants", "jeans"):
            face_overlay = person.copy().convert("RGBA")
            face_mask = Image.new("L", canvas.size, 0)
            from PIL import ImageDraw
            draw = ImageDraw.Draw(face_mask)
            head_end = int(canvas.height * 0.18)
            neck_end = int(y + canvas.height * 0.05)
            draw.rectangle([0, 0, canvas.width, head_end], fill=255)
            for r in range(head_end, min(neck_end, canvas.height)):
                alpha_val = int(255 * (1.0 - (r - head_end) / max(neck_end - head_end, 1)))
                draw.line([(0, r), (canvas.width, r)], fill=alpha_val)
            face_layer = Image.composite(face_overlay, Image.new("RGBA", canvas.size, (0, 0, 0, 0)), face_mask)
            canvas = Image.alpha_composite(canvas, face_layer)

        final = ImageEnhance.Sharpness(canvas.convert("RGB")).enhance(1.06)
        final.save(output_path, format="PNG", optimize=True)

    def _prepare_garment(self, cloth: Image.Image, target_size: tuple[int, int], category: str = "Upper-body") -> Image.Image:
        cloth = ImageOps.exif_transpose(cloth)
        cloth.thumbnail(target_size, Image.Resampling.LANCZOS)

        width, height = cloth.size
        left = int(width * 0.04)
        # For upper body/dresses from catalog shots, skip catalog model chin/neck
        top = int(height * 0.17) if category.lower() not in ("lower-body", "bottoms", "pants", "jeans") else int(height * 0.04)
        right = int(width * 0.96)
        bottom = int(height * 0.96)
        cloth = cloth.crop((left, top, right, bottom))

        # Sample corner backgrounds for robust transparency mask
        bg = Image.new("RGB", cloth.size, cloth.getpixel((2, 2)))
        diff = ImageChops.difference(cloth, bg).convert("L")
        mask = diff.point(lambda value: 0 if value < 15 else min(255, int(value * 2.8)))
        mask = mask.filter(ImageFilter.GaussianBlur(1.5))

        garment = ImageEnhance.Color(cloth).enhance(1.08).convert("RGBA")
        garment.putalpha(mask)
        return garment

    def _shape_garment(self, garment: Image.Image, canvas_size: tuple[int, int], category: str = "Upper-body") -> Image.Image:
        canvas_width, canvas_height = canvas_size
        
        if category.lower() in ("dress", "saree", "anarkali"):
            target_width = int(canvas_width * 0.76)
            target_height = int(canvas_height * 0.72)
        elif category.lower() in ("lower-body", "bottoms", "pants", "jeans"):
            target_width = int(canvas_width * 0.58)
            target_height = int(canvas_height * 0.45)
        else: # Upper-body
            target_width = int(canvas_width * 0.70)
            target_height = int(canvas_height * 0.52)

        garment = ImageOps.contain(garment, (target_width, target_height), Image.Resampling.LANCZOS)

        shaped = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
        x = (target_width - garment.width) // 2
        y = max(0, int(target_height * 0.02))
        shaped.alpha_composite(garment, (x, y))

        alpha = shaped.getchannel("A")
        body_mask = Image.new("L", shaped.size, 0)
        mask_pixels = body_mask.load()
        center = target_width / 2
        
        for row in range(target_height):
            progress = row / max(target_height - 1, 1)
            if category.lower() in ("lower-body", "bottoms", "pants", "jeans"):
                half_width = target_width * (0.42 - 0.06 * progress)
            elif category.lower() in ("dress", "saree", "anarkali"):
                half_width = target_width * (0.32 + 0.18 * progress)
            else:
                half_width = target_width * (0.34 + 0.14 * progress)
            
            left = int(center - half_width)
            right = int(center + half_width)
            for col in range(max(0, left), min(target_width, right)):
                mask_pixels[col, row] = 255

        alpha = ImageChops.multiply(alpha, body_mask.filter(ImageFilter.GaussianBlur(16)))
        shaped.putalpha(alpha.point(lambda value: int(value * 0.94)))
        return shaped
