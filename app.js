/*=========================================
        FASHION AI - APP.JS
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    /*==============================
        Sticky Navbar
    ==============================*/

    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            header.style.background = "rgba(255,255,255,0.95)";
            header.style.boxShadow = "0 10px 25px rgba(0,0,0,.08)";

        }

        else {

            header.style.background = "rgba(255,255,255,.85)";
            header.style.boxShadow = "0 5px 20px rgba(0,0,0,.08)";

        }

    });



    /*==============================
        Scroll To Top Button
    ==============================*/

    const topBtn = document.getElementById("topBtn");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {

            topBtn.style.display = "block";

        }

        else {

            topBtn.style.display = "none";

        }

    });

    topBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });



    /*==============================
        Smooth Scroll
    ==============================*/

    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach(link => {

        link.addEventListener("click", function(e) {

            const href = this.getAttribute("href");

            if (href.startsWith("#")) {

                e.preventDefault();

                const target = document.querySelector(href);

                if (target) {

                    target.scrollIntoView({

                        behavior: "smooth"

                    });

                }

            }

        });

    });



    /*==============================
        Button Hover Animation
    ==============================*/

    const buttons = document.querySelectorAll("button");

    buttons.forEach(btn => {

        btn.addEventListener("mouseenter", () => {

            btn.style.transform = "translateY(-3px)";

        });

        btn.addEventListener("mouseleave", () => {

            btn.style.transform = "translateY(0)";

        });

    });



    /*==============================
        Floating Cards Animation
    ==============================*/

    const cards = document.querySelectorAll(".floating-card");

    cards.forEach((card, index) => {

        card.animate(

            [

                { transform: "translateY(0px)" },

                { transform: "translateY(-15px)" },

                { transform: "translateY(0px)" }

            ],

            {

                duration: 3000 + index * 500,

                iterations: Infinity

            }

        );

    });



    /*==============================
        Fade In Animation
    ==============================*/

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    });

    const hiddenElements = document.querySelectorAll(

        ".feature-card, .step-card, .why-card, .collection-card, .testimonial-card, .faq-item, .stat-card"

    );

    hiddenElements.forEach(el => {

        el.classList.add("hidden");

        observer.observe(el);

    });



    /*==============================
        Counter Animation
    ==============================*/

    const counters = document.querySelectorAll(".stat-card h2");

    const speed = 100;

    counters.forEach(counter => {

        const updateCounter = () => {

            const target = parseInt(counter.innerText);

            let count = +counter.getAttribute("data-count") || 0;

            const increment = target / speed;

            if (count < target) {

                count += increment;

                counter.setAttribute("data-count", count);

                counter.innerText = Math.ceil(count) + "+";

                requestAnimationFrame(updateCounter);

            }

            else {

                counter.innerText = target + "+";

            }

        };

        updateCounter();

    });



    /*==============================
        Newsletter Form
    ==============================*/

    const newsletter = document.querySelector(".newsletter form");

    if (newsletter) {

        newsletter.addEventListener("submit", function(e) {

            e.preventDefault();

            const email = this.querySelector("input").value;

            if (email === "") {

                alert("Please enter your email.");

            }

            else {

                alert("Thank you for subscribing!");

                this.reset();

            }

        });

    }



    /*==============================
        Hero Buttons
    ==============================*/

    const getStarted = document.querySelector(".primary-btn");

    if (getStarted) {

        getStarted.addEventListener("click", () => {

            document.querySelector(".features").scrollIntoView({

                behavior: "smooth"

            });

        });

    }



    const virtualBtn = document.querySelector(".secondary-btn");

    if (virtualBtn) {

        virtualBtn.addEventListener("click", () => {

            alert("Virtual Try-On page will open.");

        });

    }

});