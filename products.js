/*==================================================
            PRODUCTS PAGE JAVASCRIPT
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    console.log("Products Page Loaded Successfully");

    /*==============================================
            SCROLL TO TOP BUTTON
    ==============================================*/

    const topBtn = document.getElementById("topBtn");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {

            topBtn.style.display = "flex";

        } else {

            topBtn.style.display = "none";

        }

    });

    topBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });


    /*==============================================
            SEARCH PRODUCTS
    ==============================================*/

    const searchInput = document.getElementById("searchProduct");

    const productCards = document.querySelectorAll(".product-card");

    searchInput.addEventListener("keyup", () => {

        const value = searchInput.value.toLowerCase();
        const user = FashionApi.currentUser();

        productCards.forEach(card => {

            const title = card.querySelector("h3").textContent.toLowerCase();

            if (title.includes(value)) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

        if(value.length >= 3){
            FashionApi.request(`products.php?search=${encodeURIComponent(value)}&user_id=${user?.id || ""}`)
                .catch(error => console.warn(error.message));
        }

    });


    /*==============================================
            SORT PRODUCTS
    ==============================================*/

    const sortSelect = document.getElementById("sortProducts");

    sortSelect.addEventListener("change", () => {

        alert("Sorting Feature will be connected with backend.");

    });


    /*==============================================
            CATEGORY FILTER
    ==============================================*/

   const categoryCheckboxes = document.querySelectorAll(
    ".filter-box input[type='checkbox']"
);

categoryCheckboxes.forEach(box => {

    box.addEventListener("change", filterProducts);

});

function filterProducts() {

    const selected = [];

    categoryCheckboxes.forEach(box => {

        if (box.checked) {

            selected.push(box.value);

        }

    });

    productCards.forEach(card => {

        const category = card.dataset.category;

        if (selected.length === 0 || selected.includes(category)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}

    /*==============================================
            PRICE RANGE
    ==============================================*/

    const priceSlider = document.querySelector("input[type='range']");

    if(priceSlider){

        const priceText = priceSlider.nextElementSibling;

        priceSlider.addEventListener("input", () => {

            priceText.innerHTML = "₹100 - ₹" + priceSlider.value;

        });

    }


    /*==============================================
            WISHLIST
    ==============================================*/

    const wishlistButtons = document.querySelectorAll(".wishlist-btn");

    wishlistButtons.forEach(button => {

        button.addEventListener("click", () => {

            const icon = button.querySelector("i");

            if(icon.classList.contains("fa-regular")){

                icon.classList.remove("fa-regular");

                icon.classList.add("fa-solid");

                button.style.background = "#EF4444";

                icon.style.color = "#fff";

                alert("Added to Wishlist ❤️");

            }else{

                icon.classList.remove("fa-solid");

                icon.classList.add("fa-regular");

                button.style.background = "#fff";

                icon.style.color = "#EF4444";

                alert("Removed from Wishlist");

            }

        });

    });


    /*==============================================
            ADD TO CART
    ==============================================*/

 const cartButtons = document.querySelectorAll(".cart-btn");

cartButtons.forEach(button => {

    button.addEventListener("click", () => {

        const card = button.closest(".product-card");

        const product = {
            id: card.dataset.productId || card.querySelector("h3").innerText.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
            name: card.querySelector("h3").innerText,
            price: Number(card.querySelector(".price").childNodes[0].textContent.replace(/[^0-9.]/g,"")),
            oldPrice: card.querySelector("del").innerText,
            image: card.querySelector("img").getAttribute("src"),
            quantity: 1
        };

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existing = cart.find(item => item.name === product.name);

        if(existing){

            existing.quantity++;

        }else{

            cart.push(product);

        }

        localStorage.setItem("cart", JSON.stringify(cart));
        FashionApi.saveItems("cart", cart).catch(error => console.warn(error.message));

        alert(product.name + " added to Cart 🛒");

    });

});


    /*==============================================
            QUICK VIEW
    ==============================================*/

    const quickButtons = document.querySelectorAll(".view-btn");

    quickButtons.forEach(button => {

        button.addEventListener("click", () => {

            const product = button.closest(".product-card")
                                  .querySelector("h3").innerText;

            alert("Quick View : " + product);

        });

    });


    /*==============================================
            PAGINATION
    ==============================================*/

    const pageButtons = document.querySelectorAll(".page-btn");

    pageButtons.forEach(button => {

        button.addEventListener("click", () => {

            pageButtons.forEach(btn => {

                btn.classList.remove("active");

            });

            button.classList.add("active");

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        });

    });


    /*==============================================
            RECOMMEND BUTTONS
    ==============================================*/

    const recommendButtons = document.querySelectorAll(".recommend-card button");

    recommendButtons.forEach(button => {

        button.addEventListener("click", () => {

            alert("Recommendation page coming soon.");

        });

    });


    /*==============================================
            PRODUCT HOVER
    ==============================================*/

    productCards.forEach(card => {

        card.addEventListener("mouseenter", () => {

            card.style.transform = "translateY(-10px)";

        });

        card.addEventListener("mouseleave", () => {

            card.style.transform = "translateY(0px)";

        });

    });


    /*==============================================
            FADE ANIMATION
    ==============================================*/

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if(entry.isIntersecting){

                entry.target.classList.add("show");

            }

        });

    },{

        threshold:0.2

    });

    document.querySelectorAll("section").forEach(section=>{

        section.classList.add("hidden");

        observer.observe(section);

    });


    /*==============================================
            RIPPLE EFFECT
    ==============================================*/

    const buttons = document.querySelectorAll("button");

    buttons.forEach(button=>{

        button.addEventListener("click",(e)=>{

            const circle=document.createElement("span");

            circle.classList.add("ripple");

            const d=Math.max(button.clientWidth,button.clientHeight);

            circle.style.width=d+"px";

            circle.style.height=d+"px";

            circle.style.left=(e.offsetX-d/2)+"px";

            circle.style.top=(e.offsetY-d/2)+"px";

            const ripple=button.querySelector(".ripple");

            if(ripple){

                ripple.remove();

            }

            button.appendChild(circle);

        });

    });


    /*==============================================
            SOCIAL ICONS
    ==============================================*/

    const socialLinks=document.querySelectorAll(".social-icons a");

    socialLinks.forEach(link=>{

        link.addEventListener("click",(e)=>{

            e.preventDefault();

            alert("Social Media Link will be connected.");

        });

    });


    /*==============================================
            FOOTER LINKS
    ==============================================*/

    const footerLinks=document.querySelectorAll("footer a");

    footerLinks.forEach(link=>{

        link.addEventListener("click",()=>{

            console.log("Opening : "+link.innerText);

        });

    });


    /*==============================================
            PAGE LOADED
    ==============================================*/

    console.log("All Product Page Components Initialized.");

});
