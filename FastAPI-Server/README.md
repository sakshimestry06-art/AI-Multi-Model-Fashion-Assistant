# AI Multi-Modal Fashion Assistant - FastAPI Try-On Server

This folder contains the Python backend for AI Virtual Try-On. It is designed to run beside the existing PHP/XAMPP project and expose browser-friendly `multipart/form-data` endpoints for JavaScript `fetch()`.

## Features

- FastAPI + Uvicorn server
- CatVTON-first provider architecture
- Future IDM-VTON provider support without changing API endpoints
- Upload validation for JPG and PNG files
- 10 MB per-file upload limit
- Unique upload and output filenames
- Centralized logging and exception handling
- CORS enabled for local XAMPP and Vite origins
- Auto-generated Swagger docs at `/docs`
- Generated image history with delete support
- Local Image Studio endpoint for lossless JPG/PNG adjustments

## Folder Structure

```text
FastAPI-Server/
  app.py
  config.py
  requirements.txt
  uploads/
  outputs/
  logs/
  models/
  ai/
  utils/
  routes/
  schemas/
  services/
  middleware/
  tests/
```

## Setup

```bash
cd FastAPI-Server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Open:

- API status: `http://127.0.0.1:8000/`
- Health: `http://127.0.0.1:8000/health`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Try-On Request

Endpoint:

```http
POST /tryon
Content-Type: multipart/form-data
```

Fields:

- `person_image`: JPG or PNG person photo
- `cloth_image`: JPG or PNG clothing photo

JavaScript example:

```javascript
const formData = new FormData();
formData.append("person_image", userImage.files[0]);
formData.append("cloth_image", clothImage.files[0]);

const response = await fetch("http://127.0.0.1:8000/tryon", {
  method: "POST",
  body: formData
});

const data = await response.json();
console.log(data.generated_image);
```

The included XAMPP-compatible PHP proxy is `Backend/api/tryon.php`. It accepts
the same `person_image` and `cloth_image` fields from the frontend, sends them
to FastAPI with cURL, returns the JSON response, and stores successful results
in the existing `virtual_tryons` table.

For a standalone PHP upload form that displays the generated image directly,
open `Backend/tryon-upload-example.php` through XAMPP after the FastAPI server
is running.

Successful response:

```json
{
  "success": true,
  "message": "Virtual try-on generated successfully.",
  "generated_image": "http://localhost:8000/outputs/example.png",
  "processing_time": "1.25s",
  "request_id": "unique-request-id"
}
```

## Local Image Editing

`POST /images/edit` accepts an `image` plus optional `brightness`, `contrast`,
`saturation`, `sharpness`, `rotation`, and `quality` form fields. It runs only
on `localhost`, returns a lossless PNG, and never sends the photo to a cloud
service. Use `quality=high` to retain the original image dimensions; use
`balanced` on an i5 laptop when a faster result is more important than native
resolution.

This is a real CPU image editor, not a generative model. High-quality AI image
creation/complex edits require a model (typically a GPU or a cloud image API);
the current CatVTON try-on implementation remains a placeholder until its
official model weights are installed.

## Real High-Quality Virtual Try-On (GPU provider)

The default local server deliberately does **not** return a fake try-on image.
To use the supplied OOTDiffusion GPU provider, copy `.env.example` to `.env`,
then set `REMOTE_INFERENCE_ENABLED=true` and restart FastAPI. This sends the
person and garment photos to the configured remote OOTDiffusion/Gradio URL;
the browser requires an explicit privacy checkbox before it makes a request.

For reliable production output, host OOTDiffusion on your own GPU instance and
set `OOTDIFFUSION_URL` to that deployment. The public URL in `.env.example`
is useful for testing but may queue, rate-limit, or change. CatVTON/OOTDiffusion
quality cannot be produced by an i5 CPU alone; the official CatVTON deployment
documents a GPU with roughly 8 GB VRAM at 1024x768.

## CatVTON Integration

`ai/inference.py` contains the production integration point. The inference engine is loaded once during FastAPI startup, uses GPU when PyTorch reports CUDA support, and currently returns a deterministic dummy try-on image until official CatVTON code and weights are added.

To connect the real CatVTON model:

1. Place model weights or cloned model code under `models/`.
2. Add CatVTON loading logic in `CatVTONInference.load()`.
3. Replace `_placeholder_inference()` with official preprocessing and inference calls.
4. Keep `generate(person_image, cloth_image, output_path)` unchanged.

To add IDM-VTON later, create `ai/idmvton.py`, implement `TryOnProvider`, and update `ai/factory.py`.

## History

```http
GET /history
DELETE /history/{id}
```

History is stored in `outputs/history.json`. Deleting a history record also deletes the generated image when it is inside the `outputs/` directory.

## Tests

```bash
pytest
```
