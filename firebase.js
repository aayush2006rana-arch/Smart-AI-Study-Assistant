// FIREBASE IMPORTS

import { initializeApp }

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

    getAuth,

    GoogleAuthProvider,

    signInWithPopup,

    createUserWithEmailAndPassword,

    signInWithEmailAndPassword,

    sendPasswordResetEmail,

    RecaptchaVerifier,

    signInWithPhoneNumber

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// FIREBASE CONFIG

const firebaseConfig = {

    apiKey: "AIzaSyCV4wwpZx4B551njVP2qdmZEPMn-29nZ94",

    authDomain: "smartai-9769b.firebaseapp.com",

    projectId: "smartai-9769b",

    storageBucket: "smartai-9769b.firebasestorage.app",

    messagingSenderId: "554231355958",

    appId: "1:554231355958:web:2b0ebdaa210e169aff1697",

    measurementId: "G-YJ3FQ11XWR"
};

// INITIALIZE FIREBASE

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// EXPORTS

export {

    auth,

    provider,

    signInWithPopup,

    createUserWithEmailAndPassword,

    signInWithEmailAndPassword,

    sendPasswordResetEmail,

    RecaptchaVerifier,

    signInWithPhoneNumber
};

