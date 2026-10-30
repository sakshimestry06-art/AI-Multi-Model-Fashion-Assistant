document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("imageEditorForm");
    const fileInput = document.getElementById("studioImage");
    const preview = document.getElementById("studioPreview");
    const status = document.getElementById("statusMessage");
    const editButton = document.getElementById("editButton");
    const download = document.getElementById("downloadImage");
    const useInTryon = document.getElementById("useInTryon");
    const API_URL = window.FASHIONAI_IMAGE_EDIT_ENDPOINT || "http://127.0.0.1:8000/images/edit";

    document.querySelectorAll('input[type="range"]').forEach(input => {
        const output = document.getElementById(`${input.id}Value`);
        input.addEventListener("input", () => { output.value = `${Math.round(input.value * 100)}%`; });
    });

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 10 * 1024 * 1024) {
            status.textContent = "Choose a JPG or PNG smaller than 10 MB.";
            fileInput.value = "";
            return;
        }
        document.getElementById("fileName").textContent = file.name;
        preview.src = URL.createObjectURL(file);
        document.getElementById("imageMeta").textContent = "Original preview";
        download.hidden = true;
        useInTryon.hidden = true;
        status.textContent = "";
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const file = fileInput.files[0];
        if (!file) { status.textContent = "Choose an image first."; return; }

        const data = new FormData(form);
        data.append("image", file);
        editButton.disabled = true;
        status.textContent = "Editing locally…";
        try {
            const response = await fetch(API_URL, { method: "POST", body: data });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.success) throw new Error(result.detail || result.message || "The local image service is unavailable.");
            preview.src = result.edited_image;
            download.href = result.edited_image;
            download.hidden = false;
            sessionStorage.setItem("fashionaiEditedPhotoUrl", result.edited_image);
            useInTryon.hidden = false;
            document.getElementById("imageMeta").textContent = `Edited locally in ${result.processing_time}`;
            status.textContent = "Done — your edited PNG is ready.";
        } catch (error) {
            status.textContent = `${error.message} Start FastAPI on port 8000, then try again.`;
        } finally {
            editButton.disabled = false;
        }
    });
});
