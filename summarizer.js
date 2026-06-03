const summarizeBtn = document.getElementById("summarizeBtn");
const loader = document.getElementById("loader");
const output = document.getElementById("summaryOutput");
const pdfFile = document.getElementById("pdfFile");
const fileName = document.getElementById("fileName");
const copyBtn = document.getElementById("copyBtn");
const removeFileBtn = document.getElementById("removeFileBtn");

if (pdfFile && fileName && removeFileBtn) {
    pdfFile.addEventListener("change", function () {
        if (this.files.length > 0) {
            fileName.textContent = this.files[0].name;
            removeFileBtn.style.display = "inline-flex";
        } else {
            fileName.textContent = "No file selected";
            removeFileBtn.style.display = "none";
        }
    });

    removeFileBtn.addEventListener("click", function () {
        pdfFile.value = "";
        fileName.textContent = "No file selected";
        removeFileBtn.style.display = "none";
    });
}

if (summarizeBtn) {
    summarizeBtn.addEventListener("click", summarizeNotes);
}

async function summarizeNotes() {
    const text = document.getElementById("notesInput").value.trim();
    const file = pdfFile.files[0];

    if (!text && !file) {
        alert("Please paste notes or upload a PDF.");
        return;
    }

    loader.style.display = "block";
    summarizeBtn.disabled = true;

    output.innerHTML = `<div class="empty-state">Generating summary...</div>`;

    const formData = new FormData();
    formData.append("text", text);

    if (file) {
        formData.append("pdf", file);
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/summarize", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        loader.style.display = "none";
        summarizeBtn.disabled = false;

        output.innerHTML = data.summary;

        updateNotesSummarized();

    } catch (error) {
        loader.style.display = "none";
        summarizeBtn.disabled = false;

        output.innerHTML = `
            <div class="summary-output">
                <h2>❌ Error</h2>
                <p class="summary-paragraph">
                    Backend is not running. Start Flask using: python app.py
                </p>
            </div>
        `;
    }
}

if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
        const text = output.innerText.trim();

        if (!text || text.includes("will appear here")) {
            alert("No summary to copy.");
            return;
        }

        await navigator.clipboard.writeText(text);

        copyBtn.innerHTML = "✓";

        setTimeout(() => {
            copyBtn.innerHTML = `
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                    <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                    <rect x="5" y="5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2" opacity="0.6"/>
                </svg>
            `;
        }, 1500);
    });
}

function updateNotesSummarized(){

    const userEmail =
    localStorage.getItem("userEmail") || "guest";

    const statsKey =
    `smartAI_stats_${userEmail}`;

    let stats =
    JSON.parse(localStorage.getItem(statsKey)) || {
        notesSummarized: 0,
        questionsGenerated: 0,
        studyHours: 0,
        weeklyGoal: 0,
        studyStreak: 0,
        productivityScore: 0
    };

    stats.notesSummarized += 1;

    stats.productivityScore =
    Math.min(100, stats.productivityScore + 5);

    localStorage.setItem(
        statsKey,
        JSON.stringify(stats)
    );
}