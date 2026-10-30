/*==================================================
            FASHION AI ASSISTANT
==================================================*/

document.addEventListener("DOMContentLoaded", () => {
    const chatBody = document.getElementById("chatBody");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const voiceBtn = document.getElementById("voiceBtn");
    const imageUpload = document.getElementById("imageUpload");
    const topBtn = document.getElementById("topBtn");

    function scrollBottom(){
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addUserMessage(text){
        const div = document.createElement("div");
        div.className = "user-message";
        div.innerText = text;
        chatBody.appendChild(div);
        scrollBottom();
    }

    function addBotMessage(html){
        const div = document.createElement("div");
        div.className = "bot-message";
        div.innerHTML = html;
        chatBody.appendChild(div);
        scrollBottom();
    }

    function showTyping(){
        const div = document.createElement("div");
        div.className = "bot-message typing-message";
        div.innerHTML = "<span></span><span></span><span></span>";
        chatBody.appendChild(div);
        scrollBottom();
        return div;
    }

    function formatPrice(price){
        return "Rs. " + Number(price).toLocaleString("en-IN");
    }

    function escapeAttr(value){
        return String(value).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    }

    function buildAssistantReply(result){
        let html = `<div class="assistant-answer"><p>${result.reply}</p>`;

        if(result.products && result.products.length){
            html += `<div class="assistant-product-grid">`;

            result.products.slice(0, 4).forEach(product => {
                html += `
                    <article class="assistant-product-card">
                        <img src="${product.image_path}" alt="${escapeAttr(product.name)}">
                        <div>
                            <strong>${product.name}</strong>
                            <small>${product.category} | ${product.rating_label || "Recommended"}</small>
                            <span>${formatPrice(product.price)}</span>
                            <button type="button" data-add-product='${escapeAttr(JSON.stringify(product))}'>Add to Cart</button>
                        </div>
                    </article>
                `;
            });

            html += `</div>`;
        }

        if(result.tips && result.tips.length){
            html += `<ul class="assistant-tips">`;
            result.tips.forEach(tip => {
                html += `<li>${tip}</li>`;
            });
            html += `</ul>`;
        }

        if(result.actions && result.actions.length){
            html += `<div class="assistant-actions">`;
            result.actions.forEach(action => {
                html += `<a href="${action.href}">${action.label}</a>`;
            });
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    function fallbackResponse(message){
        const msg = message.toLowerCase();

        if(msg.includes("hello") || msg.includes("hi")){
            return {
                reply: "Hi, I can recommend products, build outfits, compare styles, help with try-on, and guide shopping support.",
                tips: ["Try: wedding saree under 3000", "Try: office outfit for men"],
                products: [],
                actions: [{ label: "View Products", href: "products.html" }]
            };
        }

        return {
            reply: "I can help with products, outfits, try-on, cart, wishlist, and support. Mention occasion, item, color, gender, or budget.",
            tips: ["Example: recommend party outfit under 1500", "Example: match jeans with a shirt"],
            products: [],
            actions: [{ label: "View Products", href: "products.html" }]
        };
    }

    async function getAIResponse(message){
        const user = FashionApi.currentUser();

        try {
            return await FashionApi.request("ai-assistant.php", {
                method: "POST",
                body: JSON.stringify({
                    user_id: user?.id || null,
                    message
                })
            });
        } catch (error) {
            console.warn(error.message);
            return fallbackResponse(message);
        }
    }

    async function sendMessage(){
        const message = userInput.value.trim();

        if(message === ""){
            return;
        }

        addUserMessage(message);
        userInput.value = "";
        userInput.focus();

        const typing = showTyping();
        const result = await getAIResponse(message);
        typing.remove();
        addBotMessage(buildAssistantReply(result));
    }

    sendBtn.addEventListener("click", sendMessage);

    userInput.addEventListener("keydown", event => {
        if(event.key === "Enter"){
            event.preventDefault();
            sendMessage();
        }
    });

    chatBody.addEventListener("click", event => {
        const button = event.target.closest("[data-add-product]");

        if(!button){
            return;
        }

        const product = JSON.parse(button.dataset.addProduct);
        const cartProduct = {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image_path,
            quantity: 1
        };
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existing = cart.find(item => String(item.id) === String(cartProduct.id));

        if(existing){
            existing.quantity++;
        } else {
            cart.push(cartProduct);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        FashionApi.saveItems("cart", cart).catch(error => console.warn(error.message));
        addBotMessage(`${cartProduct.name} has been added to your cart.`);
    });

    if("webkitSpeechRecognition" in window){
        const recognition = new webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        voiceBtn.addEventListener("click", () => {
            recognition.start();
        });

        recognition.onresult = event => {
            userInput.value = event.results[0][0].transcript;
            sendMessage();
        };
    }

    imageUpload.addEventListener("change", event => {
        const file = event.target.files[0];

        if(!file){
            return;
        }

        addUserMessage("Uploaded Image: " + file.name);
        addBotMessage(buildAssistantReply({
            reply: "Image received. Tell me the occasion or product you want to match, and I will recommend catalog items. For visual fit, open Virtual Try-On.",
            tips: ["Use a clear front-facing image for try-on.", "Ask: match this with jeans, saree, jacket, or party outfit."],
            products: [],
            actions: [{ label: "Open Virtual Try-On", href: "virtual-tryon.html" }]
        }));
    });

    document.querySelectorAll(".suggestion-btn").forEach(button => {
        button.addEventListener("click", () => {
            userInput.value = button.innerText;
            sendMessage();
        });
    });

    window.addEventListener("scroll", () => {
        topBtn.style.display = window.scrollY > 300 ? "flex" : "none";
    });

    topBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});
