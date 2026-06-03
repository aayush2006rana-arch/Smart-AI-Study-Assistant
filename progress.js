const userEmail =
localStorage.getItem("userEmail") || "guest";

const statsKey =
`smartAI_stats_${userEmail}`;

const stats =
JSON.parse(
localStorage.getItem(statsKey)
) || {
    notesSummarized: 0,
    questionsGenerated: 0,
    studyHours: 0,
    weeklyGoal: 0
};

const stats = getStats();

document.getElementById("progressStudyHours").innerText = stats.studyHours + " Hours";
document.getElementById("progressQuestions").innerText = stats.questionsGenerated;
document.getElementById("progressNotes").innerText = stats.notesSummarized;
document.getElementById("progressGoal").innerText = stats.weeklyGoal + "%";
document.getElementById("progressStreak").innerText = stats.studyStreak + " Days";
document.getElementById("progressScore").innerText = stats.productivityScore + "%";