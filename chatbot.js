let currentChat = [];

function getChatKey(){
    const userEmail =
    localStorage.getItem("userEmail") || "guest";

    return `smartAI_chats_${userEmail}`;
}

function saveCurrentChat(){
    if(currentChat.length === 0) return;

    const chatKey = getChatKey();

    let allChats =
    JSON.parse(localStorage.getItem(chatKey)) || [];

    allChats.push({
        title: currentChat[0].message.slice(0, 30),
        messages: currentChat,
        date: new Date().toLocaleString()
    });

    localStorage.setItem(
        chatKey,
        JSON.stringify(allChats)
    );
}

async function newChat(){

    saveCurrentChat();

    currentChat = [];

    document.getElementById("chatMessages").innerHTML = "";

    document.querySelector(".welcome-box").style.display = "block";

    try{
        await fetch("http://127.0.0.1:5000/clear-chat-context", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userEmail: localStorage.getItem("userEmail") || "guest"
            })
        });
    }catch(error){
        console.log("Context clear failed");
    }

    showToast("New chat started successfully");
}

function showChatHistory(){
    const historyList = document.getElementById("historyList");
    const chatKey = getChatKey();

    let allChats = JSON.parse(localStorage.getItem(chatKey)) || [];

    historyList.innerHTML = "";

    if(allChats.length === 0){
        historyList.innerHTML = `<p class="history-empty">No chat history yet</p>`;
        return;
    }

    allChats.forEach((chat, index) => {
        historyList.innerHTML += `
            <div class="history-chat-row">
                <button class="history-item" onclick="loadChat(${index})">
                    ${chat.title}
                    <small>${chat.date}</small>
                </button>

                <button class="chat-delete-btn" onclick="deleteChat(${index})">
                    ×
                </button>
            </div>
        `;
    });
}

function deleteChat(index){
    const chatKey = getChatKey();

    let allChats = JSON.parse(localStorage.getItem(chatKey)) || [];

    allChats.splice(index, 1);

    localStorage.setItem(chatKey, JSON.stringify(allChats));

    showChatHistory();
}

function loadChat(index){
    const chatKey = getChatKey();

    let allChats =
    JSON.parse(localStorage.getItem(chatKey)) || [];

    const selectedChat =
    allChats[index];

    if(!selectedChat) return;

    currentChat = selectedChat.messages;

    const chatMessages =
    document.getElementById("chatMessages");

    chatMessages.innerHTML = "";

    document.querySelector(".welcome-box").style.display = "none";

    currentChat.forEach(msg => {
        chatMessages.innerHTML += `
            <div class="${msg.sender === 'user' ? 'user-message' : 'bot-message'}">
                <pre>${msg.message}</pre>
            </div>
        `;
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
    autoScrollChat();
}

async function sendMessage() {

    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (!message) return;

    const chatMessages =
    document.getElementById("chatMessages");

    document.querySelector(".welcome-box").style.display = "none";

    chatMessages.innerHTML += `
    <div class="user-message user-msg-box">
        <span class="user-msg-text">${message}</span>

        <div class="msg-actions">

        <button onclick="copyUserMessage(this)" title="Copy">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">

        <rect x="9" y="9" width="13" height="13" rx="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>

        </svg>

        </button>

        <button onclick="editUserMessage(this)" title="Edit">

            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">

            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>

        </svg>

        </button>

        </div>
    </div>
`;

    currentChat.push({
        sender: "user",
        message: message
    });

    input.value = "";

    chatMessages.scrollTop =chatMessages.scrollHeight;
    autoScrollChat();

    chatMessages.innerHTML += `
        <div class="bot-message" id="typing">
            Thinking...
        </div>
    `;

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                    "application/json"
                },
                    body: JSON.stringify({
                    message: message,
                    userEmail: localStorage.getItem("userEmail") || "guest"
                })
            }
        );

        const data =
        await response.json();

        document
        .getElementById("typing")
        .remove();

        chatMessages.innerHTML += `
            <div class="bot-message bot-code-output">
            <pre>${data.reply}</pre>
            </div>
        `;

        currentChat.push({
            sender: "bot",
            message: data.reply
        });

    } catch(error){

        document
        .getElementById("typing")
        .remove();

        chatMessages.innerHTML += `
            <div class="bot-message">
                Error connecting to server.
            </div>
        `;
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
    autoScrollChat();

}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
        document.getElementById(
            "userInput"
        );

        input.addEventListener(
            "keydown",
            function(event){

                if(
                    event.key === "Enter"
                ){

                    event.preventDefault();

                    sendMessage();
                }

            }
        );

    }
);

async function uploadChatImage(event){

    const file = event.target.files[0];
    if(!file) return;

    const chatMessages =
    document.getElementById("chatMessages");

    document.querySelector(".welcome-box").style.display = "none";

    chatMessages.innerHTML += `
        <div class="user-message">
            🖼️ Uploaded Image: ${file.name}
        </div>
    `;

    const formData = new FormData();

    formData.append("image", file);

    formData.append(
        "userEmail",
        localStorage.getItem("userEmail") || "guest"
    );

    try{

        const response = await fetch(
            "http://127.0.0.1:5000/chat-upload-image",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        chatMessages.innerHTML += `
            <div class="bot-message">
                ${data.message}. Now ask me anything about this image.
            </div>
        `;

    }catch(error){

        chatMessages.innerHTML += `
            <div class="bot-message">
                Image upload failed. Please check backend.
            </div>
        `;
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
    autoScrollChat();
}

async function uploadChatPDF(event){

    const file = event.target.files[0];

    if(!file){
        alert("No PDF selected");
        return;
    }

    const chatMessages =
    document.getElementById("chatMessages");

    document.querySelector(".welcome-box").style.display = "none";

    chatMessages.innerHTML += `
        <div class="user-message">
            📄 Uploaded PDF: ${file.name}
        </div>
    `;

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append(
        "userEmail",
        localStorage.getItem("userEmail") || "guest"
    );

    try{

        const response = await fetch(
            "http://127.0.0.1:5000/chat-upload-pdf",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        chatMessages.innerHTML += `
            <div class="bot-message">
                ${data.message}. Now ask me anything about this PDF.
            </div>
        `;

    }catch(error){

        chatMessages.innerHTML += `
            <div class="bot-message">
                PDF upload failed: ${error.message}
            </div>
        `;
    }

    event.target.value = "";

    chatMessages.scrollTop = chatMessages.scrollHeight;
    autoScrollChat();
}

function showToast(message){

    let toast =
    document.createElement("div");

    toast.className = "smart-toast";
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 400);

    }, 2500);
}

function autoScrollChat(){
    const chatMessages = document.getElementById("chatMessages");

    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function copyUserMessage(button){
    const messageText =
    button.closest(".user-message")
    .querySelector(".user-msg-text")
    .innerText;

    navigator.clipboard.writeText(messageText);

    showToast("Message copied");
}

async function editUserMessage(button){

    const messageBox =
    button.closest(".user-message");

    const textSpan =
    messageBox.querySelector(".user-msg-text");

    const oldText =
    textSpan.innerText;

    const modal =
    document.createElement("div");

    modal.className = "edit-modal-overlay";

    modal.innerHTML = `
        <div class="edit-modal glass">
            <h3>Edit message</h3>

            <textarea id="editMessageInput">${oldText}</textarea>

            <div class="edit-modal-actions">
                <button class="cancel-edit">Cancel</button>
                <button class="save-edit">Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".cancel-edit").onclick = function(){
        modal.remove();
    };

    modal.querySelector(".save-edit").onclick = async function(){

        const newText =
        modal.querySelector("#editMessageInput").value.trim();

        if(newText === "") return;

        textSpan.innerText = newText;

        modal.remove();

        let nextBot =
        messageBox.nextElementSibling;

        if(nextBot && nextBot.classList.contains("bot-message")){
            nextBot.innerHTML = "Thinking...";
        }

        try{

            const response =
            await fetch("http://127.0.0.1:5000/chat", {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    message:newText,
                    userEmail:
                    localStorage.getItem("userEmail") || "guest"
                })
            });

            const data =
            await response.json();

            if(nextBot && nextBot.classList.contains("bot-message")){
                nextBot.innerHTML =
                `<pre>${data.reply}</pre>`;
            }

            showToast("Message updated");

        }catch(error){

            if(nextBot && nextBot.classList.contains("bot-message")){
                nextBot.innerHTML =
                "Error connecting to server.";
            }
        }

        autoScrollChat();
    };
}

document.addEventListener("DOMContentLoaded", function(){

    const input = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");

    if(sendBtn){
        sendBtn.addEventListener("click", function(){
            sendMessage();
        });
    }

    if(input){
        input.addEventListener("keydown", function(event){
            if(event.key === "Enter"){
                event.preventDefault();
                sendMessage();
            }
        });
    }

});