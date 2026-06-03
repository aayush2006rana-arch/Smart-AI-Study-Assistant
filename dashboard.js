const stats = getStats();

document.getElementById("notesCount").innerText =
stats.notesSummarized;

document.getElementById("questionsCount").innerText =
stats.questionsGenerated;

document.getElementById("studyHours").innerText =
stats.studyHours + " Hours";

document.getElementById("weeklyGoal").innerText =
stats.weeklyGoal + "%";

document.getElementById("studyStreak").innerText =
stats.studyStreak + " Days";

document.getElementById("productivityScore").innerText =
stats.productivityScore + "%";