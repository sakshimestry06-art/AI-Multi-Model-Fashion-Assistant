/*==================================================
        PRODUCT DETAILS PAGE JAVASCRIPT
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    console.log("Product Details Page Loaded");

    /*==============================================
            THUMBNAIL IMAGE CHANGE
    ==============================================*/

    const mainImage = document.getElementById("mainImage");

    const thumbnails = document.querySelectorAll(".thumb");

    thumbnails.forEach((thumb) => {

        thumb.addEventListener("click", () => {

            mainImage.src = thumb.src;

            thumbnails.forEach(img => img.classList.remove("active"));

            thumb.classList.add("active");

        });

    });



    /*==============================================
            IMAGE ZOOM
    ==============================================*/

    if(mainImage){

        mainImage.addEventListener("mouseenter",()=>{

            mainImage.style.transform="scale(1.08)";

        });

        mainImage.addEventListener("mouseleave",()=>{

            mainImage.style.transform="scale(1)";

        });

    }



    /*==============================================
            SIZE SELECTION
    ==============================================*/

    const sizeButtons = document.querySelectorAll(".size-btn");

    sizeButtons.forEach(button=>{

        button.addEventListener("click",()=>{

            sizeButtons.forEach(btn=>btn.classList.remove("active"));

            button.classList.add("active");

        });

    });



    /*==============================================
            COLOR SELECTION
    ==============================================*/

    const colors = document.querySelectorAll(".color");

    colors.forEach(color=>{

        color.addEventListener("click",()=>{

            colors.forEach(c=>c.classList.remove("active"));

            color.classList.add("active");

        });

    });



    /*==============================================
            QUANTITY
    ==============================================*/

    const minus = document.getElementById("minus");

    const plus = document.getElementById("plus");

    const quantity = document.getElementById("quantity");

    if(minus && plus && quantity){

        minus.addEventListener("click",()=>{

            let value=parseInt(quantity.value);

            if(value>1){

                quantity.value=value-1;

            }

        });

        plus.addEventListener("click",()=>{

            let value=parseInt(quantity.value);

            quantity.value=value+1;

        });

    }



    /*==============================================
            ADD TO CART
    ==============================================*/

    const cartBtn = document.querySelector(".cart-btn");

    if(cartBtn){

        cartBtn.addEventListener("click",()=>{

            const productName=document.querySelector(".product-info h2").innerText;

            alert(productName+" added to Cart successfully.");

        });

    }



    /*==============================================
            BUY NOW
    ==============================================*/

    const buyBtn=document.querySelector(".buy-btn");

    if(buyBtn){

        buyBtn.addEventListener("click",()=>{

            alert("Proceeding to Checkout...");

        });

    }



    /*==============================================
            WISHLIST
    ==============================================*/

    const wishlistBtn=document.querySelector(".wishlist-btn");

    if(wishlistBtn){

        wishlistBtn.addEventListener("click",()=>{

            const icon=wishlistBtn.querySelector("i");

            if(icon.classList.contains("fa-regular")){

                icon.classList.remove("fa-regular");

                icon.classList.add("fa-solid");

                wishlistBtn.style.background="#EF4444";

                wishlistBtn.style.color="#ffffff";

                alert("Added to Wishlist ❤️");

            }

            else{

                icon.classList.remove("fa-solid");

                icon.classList.add("fa-regular");

                wishlistBtn.style.background="#EEF2FF";

                wishlistBtn.style.color="#7C3AED";

                alert("Removed from Wishlist");

            }

        });

    }



    /*==============================================
            SHARE PRODUCT
    ==============================================*/

    const shareBtn=document.querySelector(".share-btn");

    if(shareBtn){

        shareBtn.addEventListener("click",()=>{

            if(navigator.share){

                navigator.share({

                    title:document.title,

                    text:"Check out this amazing product!",

                    url:window.location.href

                });

            }

            else{

                navigator.clipboard.writeText(window.location.href);

                alert("Product link copied to clipboard.");

            }

        });

    }



    /*==============================================
            REVIEW FORM
    ==============================================*/

    const reviewForm=document.querySelector(".write-review form");

    if(reviewForm){

        reviewForm.addEventListener("submit",(e)=>{

            e.preventDefault();

            alert("Thank you! Your review has been submitted.");

            reviewForm.reset();

        });

    }



    /*==============================================
            VIEW SIMILAR PRODUCTS
    ==============================================*/

    const productButtons=document.querySelectorAll(".product-card button");

    productButtons.forEach(button=>{

        button.addEventListener("click",()=>{

            alert("Opening Product Details...");

        });

    });



    /*==============================================
            SCROLL TO TOP
    ==============================================*/

    const topBtn=document.getElementById("topBtn");

    window.addEventListener("scroll",()=>{

        if(window.scrollY>300){

            topBtn.style.display="flex";

        }

        else{

            topBtn.style.display="none";

        }

    });

    if(topBtn){

        topBtn.addEventListener("click",()=>{

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        });

    }



    /*==============================================
            FADE ANIMATION
    ==============================================*/

    const observer=new IntersectionObserver((entries)=>{

        entries.forEach(entry=>{

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

    const buttons=document.querySelectorAll("button");

    buttons.forEach(button=>{

        button.addEventListener("click",(e)=>{

            const circle=document.createElement("span");

            circle.classList.add("ripple");

            const diameter=Math.max(button.clientWidth,button.clientHeight);

            circle.style.width=diameter+"px";

            circle.style.height=diameter+"px";

            circle.style.left=(e.offsetX-diameter/2)+"px";

            circle.style.top=(e.offsetY-diameter/2)+"px";

            const ripple=button.querySelector(".ripple");

            if(ripple){

                ripple.remove();

            }

            button.appendChild(circle);

        });

    });



    /*==============================================
            SOCIAL LINKS
    ==============================================*/

    const socialLinks=document.querySelectorAll(".social-icons a");

    socialLinks.forEach(link=>{

        link.addEventListener("click",(e)=>{

            e.preventDefault();

            alert("Social media link will be connected later.");

        });

    });



    console.log("All Product Detail Components Initialized Successfully.");

});