// app.js

import { auth } from "./firebase.js";

import {
    login,
    register,
    googleLogin,
    logout,
    checkAuth
} from "./auth.js";

import {
    listenTasks,
    addTask,
    addSubject,
    deleteSubject,
    completeLesson,
    listenSubjects,
    subjectsCache
} from "./firestore.js";

import {
    toggleTheme,
    loadTheme,
    startTimer,
    resetTimer,
    requestNotification,
    showUserProfile
} from "./ui.js";

import { initChart } from "./chart.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =======================
// 🌍 GLOBAL FUNCTIONS
// =======================

window.login                 = login;
window.register              = register;
window.googleLogin           = googleLogin;
window.logout                = logout;

window.addTask               = addTask;
window.addSubject            = addSubject;
window.deleteSubject         = deleteSubject;
window.completeLesson        = completeLesson;

window.toggleTheme           = toggleTheme;
window.startTimer            = startTimer;
window.resetTimer            = resetTimer;
window.requestNotification   = requestNotification;
window.checkReminders        = checkReminders;


// =======================
// 🔔 REMINDER CHECKER
// Runs every 60 s — fires a notification when current HH:MM
// matches a subject's reminderTime
// =======================

function checkReminders() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const now  = new Date();
    const hh   = String(now.getHours()).padStart(2, "0");
    const mm   = String(now.getMinutes()).padStart(2, "0");
    const time = `${hh}:${mm}`;

    // subjectsCache is a live ES-module export — always reflects the latest snapshot
    subjectsCache.forEach((subject) => {
        if (subject.reminderTime && subject.reminderTime === time) {
            const remaining = subject.totalLessons - subject.completedLessons;
            const body = remaining > 0
                ? `${remaining} lesson${remaining !== 1 ? "s" : ""} remaining — keep going! 💪`
                : "All lessons complete! 🎉";

            new Notification(`📚 Time to study ${subject.name}!`, { body });
            console.log("[checkReminders] fired for", subject.name, "at", time);
        }
    });
}

// Kick off the 60-second reminder loop
setInterval(checkReminders, 60000);


// =======================
// 🚀 APP INIT
// =======================

loadTheme();
initChart();
checkAuth();

// Silently request notification permission on load so reminders can fire
if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().then((p) => {
        console.log("[app] notification permission:", p);
    });
}


// =======================
// 🔐 USER STATE HANDLING
// =======================

onAuthStateChanged(auth, (user) => {

    if (user) {
        console.log("[app] logged in:", user.email);
        showUserProfile(user);
        listenTasks();
        listenSubjects();
    } else {
        console.log("[app] no user — handled by checkAuth()");
    }

});
