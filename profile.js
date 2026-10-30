/*==================================================
                FASHIONAI PROFILE JS
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    console.log("Profile Module Loaded 👤");

    /*==============================================
                ELEMENTS
    ==============================================*/

    const editBtn = document.querySelector(".edit-btn");
    const saveBtn = document.querySelector(".save-btn");
    const logoutBtn = document.querySelector(".logout-btn");
    const darkBtn = document.querySelectorAll(".setting-btn")[2];
    const topBtn = document.getElementById("topBtn");

    const inputs = document.querySelectorAll(".profile-details input");

    /*==============================================
                LOAD USER DATA
    ==============================================*/

    async function loadProfile(){

        const profile =
            JSON.parse(localStorage.getItem("profile"));
        const user = FashionApi.currentUser();

        if(user && user.id){

            try {

                const result = await FashionApi.request(`profile.php?user_id=${user.id}`);

                if(result.profile){

                    localStorage.setItem("profile", JSON.stringify(result.profile));
                    inputs[0].value = result.profile.name || "";
                    inputs[1].value = result.profile.email || "";
                    inputs[2].value = result.profile.phone || "";
                    inputs[3].value = result.profile.location || "";
                    return;

                }

            } catch (error) {

                console.warn(error.message);

            }

        }

        if(profile){

            inputs[0].value = profile.name;
            inputs[1].value = profile.email;
            inputs[2].value = profile.phone;
            inputs[3].value = profile.location;

        }

    }

    loadProfile();

    /*==============================================
                ENABLE EDIT
    ==============================================*/

    if(editBtn){

        editBtn.addEventListener("click",()=>{

            inputs.forEach(input=>{

                input.removeAttribute("readonly");

            });

            showMessage("✏️ Edit Mode Enabled");

        });

    }

    /*==============================================
                SAVE PROFILE
    ==============================================*/

    if(saveBtn){

        saveBtn.addEventListener("click", async ()=>{

            const profile = {

                name:inputs[0].value,
                email:inputs[1].value,
                phone:inputs[2].value,
                location:inputs[3].value

            };

            localStorage.setItem(
                "profile",
                JSON.stringify(profile)
            );

            const user = FashionApi.currentUser();

            if(user && user.id){

                try {

                    await FashionApi.request("profile.php", {
                        method: "POST",
                        body: JSON.stringify({
                            user_id: user.id,
                            ...profile
                        })
                    });

                } catch (error) {

                    alert(error.message);
                    return;

                }

            }

            showMessage("✅ Profile Saved Successfully");

        });

    }

    /*==============================================
                DARK MODE
    ==============================================*/

    if(darkBtn){

        darkBtn.addEventListener("click",()=>{

            document.body.classList.toggle("dark-mode");

            localStorage.setItem(
                "darkMode",
                document.body.classList.contains("dark-mode")
            );

        });

    }

    if(localStorage.getItem("darkMode")==="true"){

        document.body.classList.add("dark-mode");

    }

    /*==============================================
                LOGOUT
    ==============================================*/

    if(logoutBtn){

        logoutBtn.addEventListener("click",()=>{

            if(confirm("Are you sure you want to logout?")){

                localStorage.removeItem("profile");
                localStorage.removeItem("currentUser");

                showMessage("👋 Logged Out Successfully");

                setTimeout(()=>{

                    window.location.href="login.html";

                },1500);

            }

        });

    }

    /*==============================================
                SCROLL TO TOP
    ==============================================*/

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

        msg.style.position = "fixed";
        msg.style.top = "20px";
        msg.style.right = "20px";
        msg.style.background = "#10B981";
        msg.style.color = "#fff";
        msg.style.padding = "15px 20px";
        msg.style.borderRadius = "10px";
        msg.style.boxShadow = "0 10px 20px rgba(0,0,0,.2)";
        msg.style.zIndex = "9999";

        document.body.appendChild(msg);

        setTimeout(()=>{

            msg.remove();

        },2000);

    }

});
