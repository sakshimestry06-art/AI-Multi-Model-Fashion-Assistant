/* =====================================
        NAVBAR MENU
===================================== */


const menuBtn = document.querySelector(".menu-btn");
const navMenu = document.querySelector(".nav-links");


if(menuBtn){

    menuBtn.addEventListener("click",()=>{

        navMenu.classList.toggle("active");

    });

}





/* =====================================
        SMOOTH SCROLL
===================================== */


document.querySelectorAll("a[href^='#']")
.forEach(link=>{


    link.addEventListener("click",function(e){


        e.preventDefault();


        document
        .querySelector(this.getAttribute("href"))
        .scrollIntoView({

            behavior:"smooth"

        });


    });


});







/* =====================================
        AI CHAT BUTTON
===================================== */


const aiButton =
document.querySelector(".ai-btn");



if(aiButton){


aiButton.addEventListener("click",()=>{


    alert(
    "Hello 👋 I am your AI Fashion Assistant. Tell me your style preference!"
    );


});


}






/* =====================================
        VIRTUAL TRY ON BUTTON
===================================== */


const tryButton =
document.querySelector(".try-btn");



if(tryButton){


tryButton.addEventListener("click",()=>{


    alert(
    "Virtual Try-On feature opening... Upload your photo!"
    );


});


}






/* =====================================
        IMAGE UPLOAD PREVIEW
===================================== */


const imageUpload =
document.querySelector("#uploadImage");


const preview =
document.querySelector("#preview");



if(imageUpload){


imageUpload.addEventListener("change",function(){


    const file=this.files[0];


    if(file){


        const reader =
        new FileReader();



        reader.onload=function(e){


            preview.src=e.target.result;


        }



        reader.readAsDataURL(file);


    }


});


}






/* =====================================
        PRODUCT CARD HOVER EFFECT
===================================== */


const cards =
document.querySelectorAll(".product-card");



cards.forEach(card=>{


    card.addEventListener(
    "mouseenter",
    ()=>{


        card.style.transform=
        "translateY(-10px)";


    });



    card.addEventListener(
    "mouseleave",
    ()=>{


        card.style.transform=
        "translateY(0)";


    });



});






/* =====================================
        WISHLIST SYSTEM
===================================== */


const wishlistButtons =
document.querySelectorAll(".wishlist");



wishlistButtons.forEach(btn=>{


btn.addEventListener("click",()=>{


    btn.classList.toggle("active");



    if(btn.classList.contains("active")){


        btn.innerHTML="❤️";


    }

    else{


        btn.innerHTML="♡";


    }



});


});






/* =====================================
        CART COUNTER
===================================== */


let cartCount = 0;



const cartButtons =
document.querySelectorAll(".add-cart");



const cartNumber =
document.querySelector(".cart-count");



cartButtons.forEach(button=>{


button.addEventListener("click",()=>{


    cartCount++;


    if(cartNumber){


        cartNumber.innerHTML=
        cartCount;


    }


    alert(
    "Product added to cart 🛒"
    );


});


});






/* =====================================
        LOGIN POPUP
===================================== */


const loginBtn =
document.querySelector(".login-btn");


const loginBox =
document.querySelector(".login-box");



if(loginBtn){


loginBtn.onclick=()=>{


    loginBox.style.display="flex";


}


}





const closeLogin =
document.querySelector(".close-login");



if(closeLogin){


closeLogin.onclick=()=>{


    loginBox.style.display="none";


}


}






/* =====================================
        FORM VALIDATION
===================================== */


const form =
document.querySelector(".contact-form");



if(form){


form.addEventListener("submit",(e)=>{


e.preventDefault();



let inputs =
form.querySelectorAll("input");



let empty=false;



inputs.forEach(input=>{


    if(input.value===""){


        empty=true;


    }


});



if(empty){


alert(
"Please fill all fields"
);


}

else{


alert(
"Message sent successfully ✅"
);


form.reset();


}



});


}







/* =====================================
        SCROLL ANIMATION
===================================== */


const animateElements =
document.querySelectorAll(
".feature-card,.step-card,.why-card,.testimonial-card"
);



window.addEventListener(
"scroll",
()=>{


animateElements.forEach(element=>{


let position =
element.getBoundingClientRect()
.top;



if(position <
window.innerHeight-100){


element.style.opacity="1";


element.style.transform=
"translateY(0)";


}



});


});







/* =====================================
        PAGE LOAD EFFECT
===================================== */


window.onload=()=>{


document.body.style.opacity="1";


};
