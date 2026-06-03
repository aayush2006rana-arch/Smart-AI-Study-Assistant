function loadUserNavbar(){

    const userName =
    localStorage.getItem("userName");

    const loginBtn =
    document.getElementById("loginBtn");

    const profileSection =
    document.getElementById("profileSection");

    const profileName =
    document.getElementById("profileName");

    if(userName){

        if(loginBtn){
            loginBtn.remove();
        }

        if(profileSection){
            profileSection.style.display =
            "flex";
        }

        if(profileName){
            profileName.innerText =
            userName;
        }

    }else{

        if(profileSection){
            profileSection.remove();
        }
    }
}

window.onload = function(){

    loadUserNavbar();

    loadTheme();

    loadProfileImage();
}

// TOGGLE MENU

function toggleProfileMenu(){

    document
    .getElementById(
        "profileMenu"
    )
    .classList.toggle("show");
}

window.toggleProfileMenu =
toggleProfileMenu;

// OPEN FILE PICKER

function changePhotoClick(){

    document
    .getElementById(
        "profileUpload"
    )
    .click();
}

window.changePhotoClick =
changePhotoClick;

// CHANGE IMAGE

function changeProfileImage(event){

    const file =
    event.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload =
    function(){

        localStorage.setItem(
            "profileImage",
            reader.result
        );

        document.getElementById(
            "profilePic"
        ).src =
        reader.result;
    }

    reader.readAsDataURL(file);
}

window.changeProfileImage =
changeProfileImage;

// THEME

function toggleTheme(){

    document.body.classList.toggle(
        "light-theme"
    );
}

window.toggleTheme =
toggleTheme;

// LOGOUT

function logout(){

    localStorage.removeItem(
        "userName"
    );

    localStorage.removeItem(
        "userEmail"
    );

    localStorage.removeItem(
        "profileImage"
    );

    window.location.href =
    "login.html";
}

window.logout = logout;

function downloadReport(){

    alert(
        "Report download feature coming soon."
    );
}

window.downloadReport =
downloadReport;

function setTheme(theme){

    document.body.classList.remove(
        "theme-default",
        "theme-dark",
        "theme-light"
    );

    document.body.classList.add(theme);

    localStorage.setItem(
        "selectedTheme",
        theme
    );
}

window.setTheme = setTheme;

function loadTheme(){

    const theme =
    localStorage.getItem(
        "selectedTheme"
    ) || "theme-default";

    document.body.classList.remove(
        "theme-default",
        "theme-dark",
        "theme-light"
    );

    document.body.classList.add(theme);
}
function toggleThemeMenu(){

    document
    .getElementById("themeSubMenu")
    .classList.toggle("show-theme");
}

window.toggleThemeMenu =
toggleThemeMenu;

function loadProfileImage(){

    const image =

    localStorage.getItem(
        "profileImage"
    );

    if(
        image &&
        document.getElementById(
            "profilePic"
        )
    ){

        document.getElementById(
            "profilePic"
        ).src = image;
    }
}

// Dashboard Welcome Message

document.addEventListener("DOMContentLoaded", () => {

    const welcomeText =
    document.getElementById("welcomeText");

    if(welcomeText){

        const userName =
        localStorage.getItem("userName");

        if(userName){

        const firstName =
        userName.split(" ")[0];

        welcomeText.innerHTML =
        `Welcome ${firstName} 👋`;

        }

    }

});