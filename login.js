/*=========================================
        LOGIN PAGE JAVASCRIPT
=========================================*/

document.addEventListener("DOMContentLoaded", function () {

    /*=================================
        SHOW / HIDE PASSWORD
    =================================*/

    const password = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword && password) {

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

    /*=================================
        LOGIN FORM VALIDATION
    =================================*/

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async function (e) {

            e.preventDefault();

            const email =
                document.querySelector('input[type="email"]').value.trim();

            const passwordValue =
                document.getElementById("password").value.trim();

            if (email === "" || passwordValue === "") {

                alert("Please fill in all fields.");
                return;

            }

            const emailPattern =
                /^[^ ]+@[^ ]+\.[a-z]{2,}$/i;

            if (!emailPattern.test(email)) {

                alert("Please enter a valid email address.");
                return;

            }

            if (passwordValue.length < 6) {

                alert("Password must be at least 6 characters.");
                return;

            }

try {
    const result = await FashionApi.request("login.php", {
        method: "POST",
        body: JSON.stringify({
            email: email,
            password: passwordValue
        })
    });

    localStorage.setItem("currentUser", JSON.stringify(result.user));
    localStorage.setItem("profile", JSON.stringify({
        name: result.user.fullname,
        email: result.user.email,
        phone: result.user.phone,
        location: ""
    }));

    alert("Login Successful!");

    window.location.href="index.html";

} catch (error) {
    alert(error.message);
}

        });

    }

    /*=================================
        GOOGLE LOGIN
    =================================*/

    const googleBtn =
        document.getElementById("googleLogin");

    if (googleBtn) {

        googleBtn.addEventListener("click", function () {

            alert("Google Login API will be integrated later.");

        });

    }

    /*=================================
        GITHUB LOGIN
    =================================*/

    const githubBtn =
        document.getElementById("githubLogin");

    if (githubBtn) {

        githubBtn.addEventListener("click", function () {

            alert("GitHub Login API will be integrated later.");

        });

    }

    /*=================================
        REMEMBER ME
    =================================*/

    const remember =
        document.getElementById("remember");

    if (remember) {

        remember.addEventListener("change", function () {

            if (this.checked) {

                console.log("Remember Me Enabled");

            } else {

                console.log("Remember Me Disabled");

            }

        });

    }

    /*=================================
        FORGOT PASSWORD
    =================================*/

    const forgot =
        document.getElementById("forgotPassword");

    if (forgot) {

        forgot.addEventListener("click", function (e) {

            e.preventDefault();

            alert("Forgot Password page will be added.");

        });

    }

    /*=================================
        INPUT ANIMATION
    =================================*/

    const inputs =
        document.querySelectorAll(".input-field input");

    inputs.forEach(input => {

        input.addEventListener("focus", function () {

            this.parentElement.classList.add("active");

        });

        input.addEventListener("blur", function () {

            this.parentElement.classList.remove("active");

        });

    });

});
