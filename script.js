const toggleBtn = document.getElementById("themeToggle");

if(toggleBtn){
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
  });
}