/*==================================================
                FASHIONAI WISHLIST JS
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    console.log("Wishlist Module Loaded ❤️");

    /*==============================================
                WISHLIST DATA
    ==============================================*/

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [

        {
            id:1,
            name:"Elegant Floral Dress",
            price:1299
        },

        {
            id:2,
            name:"Casual Summer Top",
            price:799
        },

        {
            id:3,
            name:"Premium Men's Shirt",
            price:999
        },

        {
            id:4,
            name:"Traditional Printed Kurti",
            price:1099
        },

        {
            id:5,
            name:"Oversized Hoodie",
            price:1499
        },

        {
            id:6,
            name:"Slim Fit Jeans",
            price:1199
        }

    ];


    /*==============================================
                SAVE WISHLIST
    ==============================================*/

    function saveWishlist(){

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );

        FashionApi.saveItems("wishlist", wishlist).catch(error => {
            console.warn(error.message);
        });

    }


    /*==============================================
                UPDATE SUMMARY
    ==============================================*/

    function updateSummary(){

        const count = document.getElementById("wishlistCount");
        const total = document.getElementById("wishlistTotal");

        let totalPrice = 0;

        wishlist.forEach(item => {
            totalPrice += item.price;
        });

        if(count){
            count.innerText = wishlist.length;
        }

        if(total){
            total.innerText = "₹" + totalPrice;
        }

        saveWishlist();

    }


    /*==============================================
                REMOVE PRODUCT
    ==============================================*/

    const removeButtons = document.querySelectorAll(".remove-btn");

    removeButtons.forEach((button,index)=>{

        button.addEventListener("click",()=>{

            wishlist.splice(index,1);

            button.closest(".wishlist-card").remove();

            updateSummary();

            checkEmptyWishlist();

            showMessage("❤️ Product removed from wishlist");

        });

    });


    /*==============================================
                ADD TO CART
    ==============================================*/

    const cartButtons = document.querySelectorAll(".cart-btn");

    cartButtons.forEach((button,index)=>{

        button.addEventListener("click",()=>{

            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            cart.push(wishlist[index]);

            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );

            FashionApi.saveItems("cart", cart).catch(error => {
                console.warn(error.message);
            });

            showMessage("🛒 Product added to cart");

        });

    });


    /*==============================================
                MOVE ALL TO CART
    ==============================================*/

    const moveAll = document.querySelector(".move-all-btn");

    if(moveAll){

        moveAll.addEventListener("click",()=>{

            if(wishlist.length===0){

                alert("Wishlist is empty!");

                return;

            }

            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            cart = [...cart,...wishlist];

            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );

            FashionApi.saveItems("cart", cart).catch(error => {
                console.warn(error.message);
            });

            wishlist = [];

            localStorage.setItem(
                "wishlist",
                JSON.stringify(wishlist)
            );

            document.querySelectorAll(".wishlist-card").forEach(card=>{

                card.remove();

            });

            updateSummary();

            checkEmptyWishlist();

            alert("🎉 All products moved to Cart!");

        });

    }


    /*==============================================
                EMPTY WISHLIST
    ==============================================*/

    function checkEmptyWishlist(){

        const empty = document.querySelector(".empty-wishlist");

        if(empty){

            if(wishlist.length===0){

                empty.style.display="block";

            }
            else{

                empty.style.display="none";

            }

        }

    }


    /*==============================================
                SCROLL TO TOP
    ==============================================*/

    const topBtn = document.getElementById("topBtn");

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
                SUCCESS MESSAGE
    ==============================================*/

    function showMessage(text){

        const msg = document.createElement("div");

        msg.className = "success-message";

        msg.innerHTML = text;

        document.body.appendChild(msg);

        setTimeout(()=>{

            msg.remove();

        },2000);

    }


    /*==============================================
                INITIAL LOAD
    ==============================================*/

    updateSummary();

    checkEmptyWishlist();

});
