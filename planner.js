const userEmail =
localStorage.getItem("userEmail") || "guest";

const plannerKey =
`planner_history_${userEmail}`;

function createPlanner(){

    const subjectsInput =
    document.getElementById("subjects").value.trim();

    const examDateValue =
    document.getElementById("examDate").value;

    const hours =
    document.getElementById("hours").value;

    if(!subjectsInput || !examDateValue || !hours){
        alert("Please fill all fields");
        return;
    }

    const subjects =
    subjectsInput.split(",");

    const examDate =
    new Date(examDateValue);

    const today =
    new Date();

    const daysLeft =
    Math.ceil((examDate - today)/(1000*60*60*24));

    if(daysLeft <= 0){
        alert("Please select a future exam date");
        return;
    }

    let html = "";

    for(let i = 0; i < daysLeft; i++){

        const subject =
        subjects[i % subjects.length].trim();

        html += `
            <div class="feature-card">
                <h3>Day ${i + 1}</h3>
                <p>Study Subject: ${subject}</p>
                <p>Study Hours: ${hours}</p>
                <p>Break Time: 15 Minutes Every Hour</p>
            </div>
        `;
    }

    document.getElementById("plannerOutput").innerHTML = html;

    savePlannerHistory(
        subjects,
        examDateValue,
        hours,
        html
    );
}

function savePlannerHistory(subjects, examDate, hours, html){

    let history =
    JSON.parse(localStorage.getItem(plannerKey)) || [];

    history.unshift({
        date: new Date().toLocaleString(),
        subjects: subjects.join(", "),
        examDate: examDate,
        hours: hours,
        html: html
    });

    localStorage.setItem(
        plannerKey,
        JSON.stringify(history)
    );

    loadPlannerHistory();
}

function loadPlannerHistory(){

    const historyContainer =
    document.getElementById("plannerHistory");

    if(!historyContainer) return;

    let history =
    JSON.parse(localStorage.getItem(plannerKey)) || [];

    historyContainer.innerHTML = "";

    if(history.length === 0){
        historyContainer.innerHTML = `
            <p class="history-empty">
                No planner history yet
            </p>
        `;
        return;
    }

    history.forEach((item, index) => {

        historyContainer.innerHTML += `
            <div class="history-card">

                <div class="history-info">
                    <h4>${item.subjects}</h4>
                    <p>${item.date}</p>
                    <p>Exam Date: ${item.examDate} | Hours: ${item.hours}</p>
                </div>

                <div>
                    <button
                    class="planner-small-btn"
                    onclick="viewPlanner(${index})">
                        View
                    </button>

                    <button
                    class="delete-history"
                    onclick="deletePlanner(${index})">
                        ✕
                    </button>
                </div>

            </div>
        `;
    });
}

function viewPlanner(index){

    let history =
    JSON.parse(localStorage.getItem(plannerKey)) || [];

    document.getElementById("plannerOutput").innerHTML =
    history[index].html;
}

function deletePlanner(index){

    let history =
    JSON.parse(localStorage.getItem(plannerKey)) || [];

    history.splice(index, 1);

    localStorage.setItem(
        plannerKey,
        JSON.stringify(history)
    );

    loadPlannerHistory();
}

function newPlanner(){

    document.getElementById("plannerOutput").innerHTML = "";
    document.getElementById("subjects").value = "";
    document.getElementById("examDate").value = "";
    document.getElementById("hours").value = "";
}

loadPlannerHistory();