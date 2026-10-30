# Run FashionAI on Google Colab

This project has three parts:

- `Frontend/`: static HTML, CSS, and JavaScript.
- `FastAPI-Server/`: Python API for virtual try-on.
- `Backend/` + `database/`: PHP/MySQL APIs for login, profile, cart persistence, orders, and product APIs.

Google Colab is best for the Python/FastAPI virtual try-on part. The included notebook runs:

- FastAPI on port `8000`.
- Frontend on port `5173`.
- Public Colab tunnel links for both services.

## Recommended Colab Flow

1. Put this project on GitHub or upload it to Google Drive as a ZIP.
2. Open `run_on_colab.ipynb` in Google Colab.
3. Run the cells from top to bottom.
4. Open the frontend tunnel URL printed by the notebook.
5. For virtual try-on, use `Frontend/virtual-tryon.html` from that frontend URL.

The notebook automatically installs Python dependencies, starts the FastAPI server, exposes both ports with `pyngrok`, and injects the public FastAPI URL into the frontend.

## Important Notes

- The current FastAPI AI engine returns a placeholder generated image unless you add the real CatVTON model code and weights under `FastAPI-Server/models/`.
- PHP/MySQL features are not fully portable to basic Colab. Pages that rely on `Backend/api/*.php` may not work unless you also install and start Apache/PHP/MySQL inside Colab.
- Static frontend pages and FastAPI virtual try-on are the best Colab demo target.

## Local Change Made for Colab

`Frontend/js/virtual-tryon.js` now supports:

```js
window.FASHIONAI_TRYON_ENDPOINT
```

When this value exists, the virtual try-on page sends requests directly to the FastAPI tunnel URL. Locally with XAMPP, it still uses the existing PHP endpoint.
