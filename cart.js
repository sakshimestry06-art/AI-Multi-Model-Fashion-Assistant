/*==================================================
                FASHIONAI CART JS
==================================================*/


document.addEventListener("DOMContentLoaded",()=>{


console.log("Cart Module Loaded Successfully 🛒");



/*==================================================
            CART PRODUCT DATA
==================================================*/


let cart = JSON.parse(localStorage.getItem("cart")) || [

{

id:1,

name:"Elegant Floral Dress",

price:1299,

quantity:1

},


{

id:2,

name:"Trendy Casual Top",

price:799,

quantity:1

},


{

id:3,

name:"Premium Men's Shirt",

price:999,

quantity:1

}

];





/*==================================================
            UPDATE LOCAL STORAGE
==================================================*/


function saveCart(){


localStorage.setItem(

"cart",

JSON.stringify(cart)

);

FashionApi.saveItems("cart", cart).catch(error => {
console.warn(error.message);
});


}





/*==================================================
            UPDATE TOTAL PRICE
==================================================*/


function updateTotal(){


let subtotal = 0;


cart.forEach(item=>{


subtotal += item.price * item.quantity;


});



let discount = 0;



let delivery = 0;



if(subtotal > 0){

delivery = 0;

}



let total =
subtotal - discount + delivery;



const subtotalElement =
document.getElementById("subtotal");


const totalElement =
document.getElementById("total");



if(subtotalElement){

subtotalElement.innerText =
"₹"+subtotal;

}



if(totalElement){

totalElement.innerText =
"₹"+total;

}



saveCart();



}






/*==================================================
            QUANTITY INCREASE
==================================================*/


const plusButtons =
document.querySelectorAll(".plus");



plusButtons.forEach((button,index)=>{


button.addEventListener("click",()=>{


cart[index].quantity++;


button
.parentElement
.querySelector(".quantity")
.value =
cart[index].quantity;



updateTotal();



});


});





/*==================================================
            QUANTITY DECREASE
==================================================*/


const minusButtons =
document.querySelectorAll(".minus");



minusButtons.forEach((button,index)=>{


button.addEventListener("click",()=>{


if(cart[index].quantity > 1){


cart[index].quantity--;


button
.parentElement
.querySelector(".quantity")
.value =
cart[index].quantity;



updateTotal();



}



});


});







/*==================================================
                REMOVE PRODUCT
==================================================*/


const removeButtons =
document.querySelectorAll(".remove-btn");



removeButtons.forEach((button,index)=>{


button.addEventListener("click",()=>{


cart.splice(index,1);



button
.closest(".cart-card")
.remove();



updateTotal();



showMessage(

"Product removed from cart"

);



});


});







/*==================================================
                COUPON SYSTEM
==================================================*/


const couponButton =
document.getElementById("applyCoupon");



if(couponButton){


couponButton.addEventListener("click",()=>{


const coupon =
document.getElementById("coupon")
.value;



const message =
document.getElementById("couponMessage");



if(coupon==="FASHION10"){


message.innerText =
"🎉 Coupon Applied Successfully!";



message.style.color =
"#10B981";



applyDiscount();



}

else{


message.innerText =
"❌ Invalid Coupon Code";



message.style.color =
"#EF4444";



}



});


}





/*==================================================
            APPLY DISCOUNT
==================================================*/


function applyDiscount(){


let subtotal = 0;


cart.forEach(item=>{


subtotal += item.price * item.quantity;


});



let discount =
subtotal * 0.10;



let total =
subtotal-discount;



document.getElementById("total")
.innerText =
"₹"+total;



}





/*==================================================
            CHECKOUT BUTTON
==================================================*/


const checkout =
document.querySelector(".checkout-btn");



if(checkout){


checkout.addEventListener("click", async ()=>{


if(cart.length===0){


const user = FashionApi.currentUser();
const subtotal = cart.reduce((sum,item)=>sum + item.price * item.quantity,0);
const payment = document.querySelector('input[name="payment"]:checked')?.parentElement?.innerText.trim() || "UPI Payment";

if(user && user.id){

try {

await FashionApi.request("order.php", {
method:"POST",
body:JSON.stringify({
user_id:user.id,
items:cart,
subtotal:subtotal,
discount:0,
delivery:0,
total:subtotal,
payment_method:payment
})
});

} catch(error) {

alert(error.message);
return;

}

}

alert(

"Your cart is empty!"

);


return;


}



alert(

"🎉 Order placed successfully!"

);



localStorage.removeItem("cart");
cart = [];
FashionApi.saveItems("cart", cart).catch(error => console.warn(error.message));



});



}





/*==================================================
            SCROLL TO TOP
==================================================*/


const topBtn =
document.getElementById("topBtn");



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





/*==================================================
            MESSAGE POPUP
==================================================*/


function showMessage(text){


let msg =
document.createElement("div");



msg.className =
"success-message";



msg.innerHTML=text;



document.body.appendChild(msg);



setTimeout(()=>{


msg.remove();



},2000);



}





/*==================================================
            INITIAL LOAD
==================================================*/


updateTotal();



});
