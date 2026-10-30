/*==================================================
            HOME PAGE JAVASCRIPT
==================================================*/

document.addEventListener("DOMContentLoaded", function () {

    console.log("FashionAI Home Loaded Successfully");

    /*==============================================
            SCROLL TO TOP BUTTON
    ==============================================*/

    const topBtn = document.getElementById("topBtn");

    window.addEventListener("scroll", function () {

        if (window.scrollY > 300) {

            topBtn.style.display = "flex";

        } else {

            topBtn.style.display = "none";

        }

    });

    topBtn.addEventListener("click", function () {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

    /*==============================================
            NAVBAR SCROLL EFFECT
    ==============================================*/

    const header = document.querySelector("header");

    window.addEventListener("scroll", function () {

        if (window.scrollY > 60) {

            header.style.background = "rgba(255,255,255,0.96)";
            header.style.boxShadow = "0 10px 25px rgba(0,0,0,.08)";

        } else {

            header.style.background = "rgba(255,255,255,.85)";
            header.style.boxShadow = "0 8px 25px rgba(0,0,0,.05)";

        }

    });

    /*==============================================
            SEARCH FUNCTION
    ==============================================*/

    const searchInput = document.querySelector(".search-box input");

    const searchButton = document.querySelector(".search-box button");

    searchButton.addEventListener("click", function () {

        const keyword = searchInput.value.trim();

        if (keyword === "") {

            alert("Please enter a product name.");

            return;

        }

        alert("Searching for: " + keyword);

        // Future:
        // window.location.href="products.html?search="+keyword;

    });

    searchInput.addEventListener("keypress", function (e) {

        if (e.key === "Enter") {

            searchButton.click();

        }

    });

    /*==============================================
            CATEGORY CLICK
    ==============================================*/

    const categories = document.querySelectorAll(".category-card");

    categories.forEach(function (card) {

        card.addEventListener("click", function () {

            const category = this.innerText;

            alert(category + " Selected");

            // Future:
            // window.location.href="products.html";

        });

    });

    /*==============================================
            PRODUCT BUTTONS
    ==============================================*/

    const addButtons = document.querySelectorAll(".price-row button");

    addButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const productName = this.parentElement.parentElement.querySelector("h3").innerText;

            alert(productName + " added to Cart.");

        });

    });

    /*==============================================
            PRODUCT CARD HOVER
    ==============================================*/

    const cards = document.querySelectorAll(".product-card");

    cards.forEach(function (card) {

        card.addEventListener("mouseenter", function () {

            card.style.transform = "translateY(-12px)";

        });

        card.addEventListener("mouseleave", function () {

            card.style.transform = "translateY(0px)";

        });

    });

    /*==============================================
            NEWSLETTER
    ==============================================*/

    const newsletterForm = document.querySelector(".newsletter form");

    newsletterForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = newsletterForm.querySelector("input").value.trim();

        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!pattern.test(email)) {

            alert("Please enter a valid Email Address.");

            return;

        }

        alert("Thank you for subscribing!");

        newsletterForm.reset();

    });

    /*==============================================
            BUTTON RIPPLE EFFECT
    ==============================================*/

    const buttons = document.querySelectorAll("button");

    buttons.forEach(function (button) {

        button.addEventListener("click", function (e) {

            const circle = document.createElement("span");

            const diameter = Math.max(button.clientWidth, button.clientHeight);

            circle.style.width = diameter + "px";
            circle.style.height = diameter + "px";

            circle.style.left = e.offsetX - diameter / 2 + "px";
            circle.style.top = e.offsetY - diameter / 2 + "px";

            circle.classList.add("ripple");

            const ripple = button.getElementsByClassName("ripple")[0];

            if (ripple) {

                ripple.remove();

            }

            button.appendChild(circle);

        });

    });

    /*==============================================
            FADE IN ANIMATION
    ==============================================*/

    const observer = new IntersectionObserver(function (entries) {

        entries.forEach(function (entry) {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {

        threshold: 0.15

    });

    document.querySelectorAll("section").forEach(function (section) {

        section.classList.add("hidden");

        observer.observe(section);

    });

    /*==============================================
            SOCIAL ICONS
    ==============================================*/

    const socialIcons = document.querySelectorAll(".social-icons a");

    socialIcons.forEach(function (icon) {

        icon.addEventListener("click", function (e) {

            e.preventDefault();

            alert("Social media page will be connected later.");

        });

    });

    /*==============================================
            FOOTER LINKS
    ==============================================*/

    const footerLinks = document.querySelectorAll("footer a");

    footerLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            console.log("Opening: " + this.innerText);

        });

    });

    /*==============================================
            AI BUTTONS
    ==============================================*/

    const heroButtons = document.querySelectorAll(".primary-btn, .secondary-btn");

    heroButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            console.log(this.innerText);

        });

    });

});