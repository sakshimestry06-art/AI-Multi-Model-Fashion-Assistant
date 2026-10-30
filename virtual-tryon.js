/*==================================================
        AI VIRTUAL TRY-ON JAVASCRIPT
==================================================*/

document.addEventListener("DOMContentLoaded", () => {
    const userImage = document.getElementById("userImage");
    const userPreview = document.getElementById("userPreview");
    const clothImage = document.getElementById("clothImage");
    const clothPreview = document.getElementById("clothPreview");
    const generateBtn = document.getElementById("generateBtn");
    const afterImage = document.getElementById("afterImage");
    const beforeImage = document.getElementById("beforeImage");
    const topBtn = document.getElementById("topBtn");

    function readFileAsDataUrl(file){
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => resolve(event.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function loadImage(src){
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
        });
    }

    function drawCover(ctx, image, x, y, width, height){
        const scale = Math.max(width / image.width, height / image.height);
        const sourceWidth = width / scale;
        const sourceHeight = height / scale;
        const sourceX = (image.width - sourceWidth) / 2;
        const sourceY = (image.height - sourceHeight) / 2;

        ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
    }

    function roundedRect(ctx, x, y, width, height, radius){
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }

    async function generateRealTryOn(){
        if(!userImage.files[0] || !clothImage.files[0]){
            alert("Please upload your photo and outfit image first.");
            return null;
        }

        const user = FashionApi.currentUser();
        const formData = new FormData();
        formData.append("person", userImage.files[0]);
        formData.append("outfit", clothImage.files[0]);

        if(user?.id){
            formData.append("user_id", user.id);
        }

        const response = await fetch("../Backend/api/tryon-generate.php", {
            method: "POST",
            body: formData
        });

        const data = await response.json().catch(() => ({}));

        if(!response.ok || data.success === false){
            throw new Error(data.message || "Realistic AI try-on generation failed.");
        }

        return data.image;
    }

    async function generateBrowserPreview(){
        if(!userImage.files[0] || !clothImage.files[0]){
            alert("Please upload your photo and outfit image first.");
            return null;
        }

        const userSrc = await readFileAsDataUrl(userImage.files[0]);
        const clothSrc = await readFileAsDataUrl(clothImage.files[0]);
        const [person, outfit] = await Promise.all([
            loadImage(userSrc),
            loadImage(clothSrc)
        ]);

        const canvas = document.createElement("canvas");
        canvas.width = 900;
        canvas.height = 1100;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#f8f9fc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawCover(ctx, person, 0, 0, canvas.width, canvas.height);

        const outfitWidth = canvas.width * 0.48;
        const outfitHeight = canvas.height * 0.42;
        const outfitX = (canvas.width - outfitWidth) / 2;
        const outfitY = canvas.height * 0.29;

        ctx.save();
        roundedRect(ctx, outfitX, outfitY, outfitWidth, outfitHeight, 42);
        ctx.clip();
        ctx.globalAlpha = 0.88;
        drawCover(ctx, outfit, outfitX, outfitY, outfitWidth, outfitHeight);
        ctx.globalAlpha = 1;
        ctx.restore();

        const gradient = ctx.createLinearGradient(0, outfitY, 0, outfitY + outfitHeight);
        gradient.addColorStop(0, "rgba(255,255,255,0.18)");
        gradient.addColorStop(0.55, "rgba(255,255,255,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.18)");
        ctx.fillStyle = gradient;
        roundedRect(ctx, outfitX, outfitY, outfitWidth, outfitHeight, 42);
        ctx.fill();

        ctx.strokeStyle = "rgba(124,58,237,0.55)";
        ctx.lineWidth = 5;
        roundedRect(ctx, outfitX, outfitY, outfitWidth, outfitHeight, 42);
        ctx.stroke();

        ctx.fillStyle = "rgba(17,24,39,0.78)";
        roundedRect(ctx, 28, canvas.height - 86, 360, 50, 16);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "600 24px Poppins, Arial";
        ctx.fillText("FashionAI Try-On Preview", 52, canvas.height - 53);

        return canvas.toDataURL("image/png", 0.95);
    }

    async function updatePreview(input, preview){
        const file = input.files[0];

        if(!file){
            return;
        }

        preview.src = await readFileAsDataUrl(file);
    }

    userImage?.addEventListener("change", () => updatePreview(userImage, userPreview));
    clothImage?.addEventListener("change", () => updatePreview(clothImage, clothPreview));

    generateBtn?.addEventListener("click", async () => {
        const loader = document.querySelector(".processing-card");

        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating AI Try-On...`;
        loader?.scrollIntoView({ behavior: "smooth" });

        try {
            let resultImage = null;
            let usedRealAI = true;

            try {
                resultImage = await generateRealTryOn();
            } catch (error) {
                usedRealAI = false;

                if(error.message.includes("OPENAI_API_KEY")){
                    alert(error.message + "\n\nA browser preview will be shown now, but realistic clothing replacement requires the API key.");
                } else {
                    alert(error.message + "\n\nA browser preview will be shown now.");
                }

                resultImage = await generateBrowserPreview();
            }

            if(!resultImage){
                generateBtn.disabled = false;
                generateBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> Generate Try-On`;
                return;
            }

            beforeImage.src = userPreview.src;
            afterImage.src = resultImage;
            afterImage.dataset.generated = "true";
            afterImage.dataset.mode = usedRealAI ? "ai" : "preview";
            animateScores();

            if(!usedRealAI){
                const user = FashionApi.currentUser();

                FashionApi.request("tryon.php", {
                    method: "POST",
                    body: JSON.stringify({
                        user_id: user?.id || null,
                        user_image_name: userImage.files[0]?.name || "",
                        cloth_image_name: clothImage.files[0]?.name || "",
                        result_image_path: "browser-generated-preview",
                        fit_score: 78,
                        style_score: 74,
                        color_score: 76,
                        notes: "Fallback browser preview generated because realistic AI API was unavailable."
                    })
                }).catch(error => console.warn(error.message));
            }

            generateBtn.innerHTML = usedRealAI
                ? `<i class="fa-solid fa-check"></i> Realistic AI Try-On Generated`
                : `<i class="fa-solid fa-check"></i> Preview Generated`;
            document.querySelector(".comparison-section")?.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            console.error(error);
            alert("Could not generate the try-on preview. Please use clear JPG/PNG images and try again.");
            generateBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> Generate Try-On`;
        } finally {
            generateBtn.disabled = false;
        }
    });

    function animateScores(){
        const scores = document.querySelectorAll(".result-box span");

        scores.forEach(score => {
            const value = parseInt(score.innerText);

            if(Number.isNaN(value)){
                return;
            }

            let count = 0;
            const interval = setInterval(() => {
                count++;
                score.innerText = count + "%";

                if(count >= value){
                    clearInterval(interval);
                    score.innerText = value + "%";
                }
            }, 12);
        });
    }

    document.querySelector(".download-btn")?.addEventListener("click", () => {
        if(!afterImage.src || afterImage.src.includes("default-result")){
            alert("Please generate a try-on result first.");
            return;
        }

        const link = document.createElement("a");
        link.href = afterImage.src;
        link.download = "FashionAI-Virtual-TryOn.png";
        link.click();
    });

    document.querySelector(".share-btn")?.addEventListener("click", () => {
        if(navigator.share){
            navigator.share({
                title: "FashionAI Virtual Try-On",
                text: "Check my FashionAI virtual try-on preview.",
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied successfully");
        }
    });

    document.querySelector(".retry-btn")?.addEventListener("click", () => {
        userImage.value = "";
        clothImage.value = "";
        userPreview.src = "images/default-user.png";
        clothPreview.src = "images/default-dress.png";
        beforeImage.src = "images/default-user.png";
        afterImage.src = "images/default-result.png";
        generateBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> Generate Try-On`;
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => {
        topBtn.style.display = window.scrollY > 300 ? "flex" : "none";
    });

    topBtn?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll("section").forEach(section => {
        section.classList.add("hidden");
        observer.observe(section);
    });
});
