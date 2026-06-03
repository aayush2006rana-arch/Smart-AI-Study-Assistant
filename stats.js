function getStatsKey(){

    const userEmail =
    localStorage.getItem("userEmail") || "guest";

    return `smartAI_stats_${userEmail}`;
}

function getStats(){

    return JSON.parse(
        localStorage.getItem(getStatsKey())
    ) || {
        notesSummarized: 0,
        questionsGenerated: 0,
        studyHours: 0,
        weeklyGoal: 0,
        studyStreak: 0,
        productivityScore: 0
    };
}

function saveStats(stats){

    localStorage.setItem(
        getStatsKey(),
        JSON.stringify(stats)
    );
}