from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app import app


def make_png() -> BytesIO:
    image = Image.new("RGB", (32, 32), (124, 58, 237))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def test_tryon_rejects_invalid_content_type() -> None:
    client = TestClient(app)
    files = {
        "person_image": ("person.txt", BytesIO(b"not-image"), "text/plain"),
        "cloth_image": ("cloth.png", BytesIO(b"not-image"), "image/png"),
    }
    response = client.post("/tryon", files=files)
    assert response.status_code == 415
    assert response.json()["success"] is False


def test_tryon_rejects_invalid_image_bytes() -> None:
    client = TestClient(app)
    files = {
        "person_image": ("person.png", BytesIO(b"not-image"), "image/png"),
        "cloth_image": ("cloth.png", make_png(), "image/png"),
    }
    response = client.post("/tryon", files=files)
    assert response.status_code == 400
    assert response.json()["success"] is False


def test_tryon_requires_a_configured_real_provider() -> None:
    client = TestClient(app)
    files = {
        "person_image": ("person.png", make_png(), "image/png"),
        "cloth_image": ("cloth.png", make_png(), "image/png"),
    }
    response = client.post("/tryon", files=files)
    payload = response.json()
    assert response.status_code == 503
    assert payload["success"] is False
