/*==================================================
            REGISTER PAGE JAVASCRIPT
==================================================*/

document.addEventListener("DOMContentLoaded", function () {

    /*==============================================
                PASSWORD TOGGLE
    ==============================================*/

    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    const togglePassword = document.getElementById("togglePassword");
    const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

    if (togglePassword) {

        togglePassword.addEventListener("click", function () {

            if (password.type === "password") {

                password.type = "text";
                this.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';

            } else {

                password.type = "password";
                this.innerHTML = '<i class="fa-solid fa-eye"></i>';

            }

        });

    }

    if (toggleConfirmPassword) {

        toggleConfirmPassword.addEventListener("click", function () {

            if (confirmPassword.type === "password") {

                confirmPassword.type = "text";
                this.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';

            } else {

                confirmPassword.type = "password";
                this.innerHTML = '<i class="fa-solid fa-eye"></i>';

            }

        });

    }

    /*==============================================
                INPUT ANIMATION
    ==============================================*/

    const inputs = document.querySelectorAll(".input-field input, .input-field select");

    inputs.forEach(input => {

        input.addEventListener("focus", function () {

            this.parentElement.classList.add("active");

        });

        input.addEventListener("blur", function () {

            this.parentElement.classList.remove("active");

        });

    });

    /*==============================================
                FORM VALIDATION
    ==============================================*/

    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const fullname = document.getElementById("fullname").value.trim();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const gender = document.getElementById("gender").value;
        const dob = document.getElementById("dob").value;
        const pass = password.value.trim();
        const confirm = confirmPassword.value.trim();
        const terms = document.getElementById("terms").checked;

        if (
            fullname === "" ||
            username === "" ||
            email === "" ||
            phone === "" ||
            gender === "" ||
            dob === "" ||
            pass === "" ||
            confirm === ""
        ) {

            alert("Please fill all the fields.");
            return;

        }

        /* Email Validation */

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            alert("Please enter a valid email address.");
            return;

        }

        /* Mobile Validation */

        const phonePattern = /^[0-9]{10}$/;

        if (!phonePattern.test(phone)) {

            alert("Enter a valid 10-digit mobile number.");
            return;

        }

        /* Username */

        if (username.length < 4) {

            alert("Username must contain at least 4 characters.");
            return;

        }

        /* Password */

        if (pass.length < 8) {

            alert("Password must contain at least 8 characters.");
            return;

        }

        /* Password Match */

        if (pass !== confirm) {

            alert("Passwords do not match.");
            return;

        }

        /* Terms */

        if (!terms) {

            alert("Please accept the Terms & Conditions.");
            return;

        }

      /* Save User */

const user = {
    fullname: fullname,
    username: username,
    email: email,
    phone: phone,
    gender: gender,
    dob: dob,
    password: pass
};

try {
    const result = await FashionApi.request("register.php", {
        method: "POST",
        body: JSON.stringify(user)
    });

    localStorage.setItem("currentUser", JSON.stringify(result.user));
    localStorage.setItem("profile", JSON.stringify({
        name: result.user.fullname,
        email: result.user.email,
        phone: result.user.phone,
        location: ""
    }));
} catch (error) {
    alert(error.message);
    return;
}

alert("Registration Successful!");

registerForm.reset();

setTimeout(() => {

    window.location.href = "login.html";

},1000);

    });

    /*==============================================
            GOOGLE SIGNUP BUTTON
    ==============================================*/

    const googleSignup = document.getElementById("googleSignup");

    if (googleSignup) {

        googleSignup.addEventListener("click", function () {

            alert("Google Sign Up API will be integrated later.");

        });

    }

    /*==============================================
            GITHUB SIGNUP BUTTON
    ==============================================*/

    const githubSignup = document.getElementById("githubSignup");

    if (githubSignup) {

        githubSignup.addEventListener("click", function () {

            alert("GitHub Sign Up API will be integrated later.");

        });

    }

});
