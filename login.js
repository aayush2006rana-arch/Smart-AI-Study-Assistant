import {

    auth,
    provider,

    signInWithPopup,
    signInWithEmailAndPassword,

    RecaptchaVerifier,
    signInWithPhoneNumber

} from "./firebase.js";

let confirmationResult;

// =====================
// EMAIL LOGIN
// =====================

window.login = async function(){

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    try{

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

const displayName =
email.split("@")[0];

const formattedName =
displayName.charAt(0).toUpperCase() +
displayName.slice(1);

localStorage.setItem(
    "userName",
    formattedName
);

        localStorage.setItem(
            "userEmail",
            email
        );

        alert("Login Successful");

        window.location.href =
        "dashboard.html";

    }catch(error){

        alert(error.message);
    }
};

// =====================
// GOOGLE LOGIN
// =====================

window.googleLogin = async function(){

    try{

        const result =
        await signInWithPopup(
            auth,
            provider
        );

        localStorage.setItem(
            "userName",
            result.user.displayName
        );

        localStorage.setItem(
            "userEmail",
            result.user.email
        );

        window.location.href =
        "dashboard.html";

    }catch(error){

        console.log(error);
        alert(error.message);
    }
};

// =====================
// SHOW PHONE BOX
// =====================

window.showPhoneLogin = function(){

    document.getElementById(
        "phoneSection"
    ).style.display = "block";
};

// =====================
// SEND OTP
// =====================

window.sendOTP = async function(){

    const phoneNumber =
    document.getElementById(
        "phoneNumber"
    ).value.trim();

    try{

        if(!window.recaptchaVerifier){

            window.recaptchaVerifier =
            new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "normal"
                }
            );

            await window
            .recaptchaVerifier
            .render();
        }

        confirmationResult =
        await signInWithPhoneNumber(
            auth,
            phoneNumber,
            window.recaptchaVerifier
        );

        alert(
            "OTP Sent Successfully"
        );

    }catch(error){

        console.error(error);

        alert(
            error.message
        );
    }
};

// =====================
// VERIFY OTP
// =====================

window.verifyOTP = async function(){

    const otp =
    document.getElementById(
        "otpCode"
    ).value;

    try{

        const result =
        await confirmationResult.confirm(
            otp
        );

        localStorage.setItem(
            "userName",
            result.user.phoneNumber
        );

        localStorage.setItem(
            "userPhone",
            result.user.phoneNumber
        );

        alert(
            "Phone Login Successful"
        );

        window.location.href =
        "dashboard.html";

    }catch(error){

        console.error(error);

        alert(
            "Invalid OTP"
        );
    }
};