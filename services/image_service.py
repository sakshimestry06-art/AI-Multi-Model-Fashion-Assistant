from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image, ImageEnhance, ImageOps, UnidentifiedImageError

from config import Settings


class ImageService:
    """Image validation, decoding, and preprocessing utilities."""

    def __init__(self, target_size: int = 768) -> None:
        self.target_size = target_size

    async def validate_upload(self, file: UploadFile, settings: Settings) -> None:
        extension = Path(file.filename or "").suffix.lower()
        content_type_valid = file.content_type in settings.allowed_content_types or (
            file.content_type in {"application/octet-stream", "binary/octet-stream"}
            and extension in settings.allowed_extensions
        )
        extension_valid = extension in settings.allowed_extensions or not extension

        if not (content_type_valid or extension_valid):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"{file.filename or 'Uploaded file'} must be a JPG, PNG, or WEBP image.",
            )

        size = 0
        chunk_size = 1024 * 1024
        while chunk := await file.read(chunk_size):
            size += len(chunk)
            if size > settings.max_upload_size_bytes:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"{file.filename or 'Uploaded file'} exceeds the 10 MB upload limit.",
                )

        await file.seek(0)
        try:
            with Image.open(file.file) as image:
                image.verify()
            with Image.open(file.file) as image:
                if image.width * image.height > settings.max_image_pixels:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Image dimensions are too large. Use an image below 40 megapixels.",
                    )
        except (UnidentifiedImageError, OSError) as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{file.filename or 'Uploaded file'} is not a valid image.",
            ) from exc
        finally:
            await file.seek(0)

    def resize_for_inference(self, image: Image.Image) -> Image.Image:
        image.thumbnail((self.target_size, self.target_size), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (self.target_size, self.target_size), (248, 249, 252))
        x = (self.target_size - image.width) // 2
        y = (self.target_size - image.height) // 2
        canvas.paste(image.convert("RGB"), (x, y))
        return canvas

    def edit_image(
        self,
        image: Image.Image,
        *,
        brightness: float,
        contrast: float,
        saturation: float,
        sharpness: float,
        rotation: int,
        quality: str,
    ) -> Image.Image:
        """Apply non-generative edits without downscaling a High quality image."""
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = ImageEnhance.Brightness(image).enhance(brightness)
        image = ImageEnhance.Contrast(image).enhance(contrast)
        image = ImageEnhance.Color(image).enhance(saturation)
        image = ImageEnhance.Sharpness(image).enhance(sharpness)

        if rotation:
            image = image.rotate(-rotation, expand=True, resample=Image.Resampling.BICUBIC)

        # Balanced mode reduces long CPU waits. High mode intentionally retains source pixels.
        if quality == "balanced":
            image.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
        return image
