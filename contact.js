var contactForm = document.getElementById("contactForm");

if(contactForm){

    contactForm.addEventListener("submit", async function(e){

        e.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        if(!name || !email || !message){
            alert("Please fill all fields");
            return;
        }

        try{
            const response = await fetch("http://127.0.0.1:5000/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });

            const data = await response.json();

            alert(data.message);

            if(data.success){
                contactForm.reset();
            }

        }catch(error){
            alert("Backend is not running");
        }
    });
}