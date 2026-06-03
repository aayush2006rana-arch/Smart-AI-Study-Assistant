const questionPdf = document.getElementById("questionPdf");
const questionFileName = document.getElementById("questionFileName");

const userEmail = localStorage.getItem("userEmail") || "guest";
const questionHistoryKey = `question_history_${userEmail}`;

if(questionPdf){
    questionPdf.addEventListener("change", () => {
        questionFileName.innerText =
        questionPdf.files.length > 0
        ? questionPdf.files[0].name
        : "No PDF selected";
    });
}

async function generateQuestions(){

    const text = document.getElementById("questionText").value.trim();
    const pdf = questionPdf.files[0];

    const types = Array.from(
        document.querySelectorAll(".question-types input:checked")
    ).map(item => item.value);

    if(!text && !pdf){
        alert("Please paste notes or upload a PDF");
        return;
    }

    if(types.length === 0){
        alert("Please select at least one question type");
        return;
    }

    const output = document.getElementById("questionOutput");

    output.innerHTML = `
        <div class="feature-card glass">
            Generating questions...
        </div>
    `;

    const formData = new FormData();
    formData.append("text", text);
    formData.append("types", JSON.stringify(types));

    if(pdf){
        formData.append("pdf", pdf);
    }

    try{
        const response = await fetch("http://127.0.0.1:5000/generate-questions", {
            method:"POST",
            body:formData
        });

        const data = await response.json();

        output.innerHTML = `
            <div class="feature-card glass">
                <pre>${data.questions}</pre>
            </div>
        `;

        saveQuestionHistory(types, data.questions);

    }catch(error){
        output.innerHTML = `
            <div class="feature-card glass">
                Backend error. Start Flask using python app.py
            </div>
        `;
    }
}

function saveQuestionHistory(types, questions){

    let history =
    JSON.parse(localStorage.getItem(questionHistoryKey)) || [];

    history.unshift({
        types: types.join(", "),
        questions: questions,
        date: new Date().toLocaleString()
    });

    localStorage.setItem(
        questionHistoryKey,
        JSON.stringify(history)
    );

    loadQuestionHistory();
}

function loadQuestionHistory(){

    const historyBox = document.getElementById("questionHistory");
    if(!historyBox) return;

    let history =
    JSON.parse(localStorage.getItem(questionHistoryKey)) || [];

    historyBox.innerHTML = "";

    if(history.length === 0){
        historyBox.innerHTML = `
            <p class="history-empty">No question history yet</p>
        `;
        return;
    }

    history.forEach((item, index) => {
        historyBox.innerHTML += `
            <div class="history-card">
                <div class="history-info">
                    <h4>${item.types}</h4>
                    <p>${item.date}</p>
                </div>

                <div>
                    <button class="planner-small-btn" onclick="viewQuestionHistory(${index})">
                        View
                    </button>

                    <button class="delete-history" onclick="deleteQuestionHistory(${index})">
                        ✕
                    </button>
                </div>
            </div>
        `;
    });
}

function viewQuestionHistory(index){

    let history =
    JSON.parse(localStorage.getItem(questionHistoryKey)) || [];

    document.getElementById("questionOutput").innerHTML = `
        <div class="feature-card glass">
            <pre>${history[index].questions}</pre>
        </div>
    `;
}

function deleteQuestionHistory(index){

    let history =
    JSON.parse(localStorage.getItem(questionHistoryKey)) || [];

    history.splice(index, 1);

    localStorage.setItem(
        questionHistoryKey,
        JSON.stringify(history)
    );

    loadQuestionHistory();
}

loadQuestionHistory();