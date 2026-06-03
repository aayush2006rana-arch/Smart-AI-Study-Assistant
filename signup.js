import {

    auth,

    provider,

    signInWithPopup,

    createUserWithEmailAndPassword

} from "./firebase.js";

// MANUAL SIGNUP

window.signup = async function(){

    const name =
    document.getElementById("name").value;

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    const confirm =
    document.getElementById("confirm").value;

    // VALIDATION

    if(
        !name ||
        !email ||
        !password ||
        !confirm
    ){
        alert("Please fill all fields");
        return;
    }

    if(password !== confirm){

        alert("Passwords do not match");
        return;
    }

    try{

        // FIREBASE SIGNUP

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        // SAVE USER

        localStorage.setItem(
            "userName",
            name
        );

        localStorage.setItem(
            "userEmail",
            email
        );

        alert("Account Created Successfully");

        window.location.href =
        "dashboard.html";

    }catch(error){

        alert(error.message);
    }
}

// GOOGLE LOGIN

window.googleLogin = async function(){

    try{

        // DISABLE MULTIPLE CLICKS

        const googleButtons =
        document.querySelectorAll(".google-btn");

        googleButtons.forEach(btn => {
            btn.disabled = true;
        });

        // OPEN GOOGLE POPUP

        const result =
        await signInWithPopup(
            auth,
            provider
        );

        // SAVE USER DATA

        localStorage.setItem(
            "userName",
            result.user.displayName
        );

        localStorage.setItem(
            "userEmail",
            result.user.email
        );

        // REDIRECT

        window.location.href =
        "dashboard.html";

    }catch(error){

        console.log(error);

        // IGNORE POPUP CANCEL ERROR

        if(
            error.code !==
            "auth/cancelled-popup-request"
        ){

            alert(error.message);
        }

    }finally{

        // ENABLE BUTTON AGAIN

        const googleButtons =
        document.querySelectorAll(".google-btn");

        googleButtons.forEach(btn => {
            btn.disabled = false;
        });
    }
}
