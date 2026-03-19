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
    loadProfile,
    saveProfile,
    subjectsCache
} from "./firestore.js";

import {
    toggleTheme,
    loadTheme,
    toggleEditProfile,
    startTimer,
    resetTimer,
    requestNotification
} from "./ui.js";

import { initChart } from "./chart.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =======================
// 🌍 GLOBAL FUNCTIONS
// =======================

window.login               = login;
window.register            = register;
window.googleLogin         = googleLogin;
window.logout              = logout;

window.addTask             = addTask;
window.addSubject          = addSubject;
window.deleteSubject       = deleteSubject;
window.completeLesson      = completeLesson;

window.saveProfile         = saveProfile;
window.toggleEditProfile   = toggleEditProfile;

window.toggleTheme         = toggleTheme;
window.startTimer          = startTimer;
window.resetTimer          = resetTimer;
window.requestNotification = requestNotification;
window.checkReminders      = checkReminders;


// =======================
// 🔔 REMINDER CHECKER
// =======================

function checkReminders() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const now  = new Date();
    const hh   = String(now.getHours()).padStart(2, "0");
    const mm   = String(now.getMinutes()).padStart(2, "0");
    const time = `${hh}:${mm}`;

    subjectsCache.forEach((subject) => {
        if (subject.reminderTime && subject.reminderTime === time) {
            const remaining = subject.totalLessons - subject.completedLessons;
            const body = remaining > 0
                ? `${remaining} lesson${remaining !== 1 ? "s" : ""} remaining — keep going! 💪`
                : "All lessons complete! 🎉";
            new Notification(`📚 Time to study ${subject.name}!`, { body });
        }
    });
}

setInterval(checkReminders, 60000);


// =======================
// 🚀 APP INIT
// =======================

loadTheme();
initChart();
checkAuth();

if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}


// =======================
// 🔐 USER STATE HANDLING
// =======================

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("[app] logged in:", user.email);
        loadProfile();
        listenTasks();
        listenSubjects();
    } else {
        console.log("[app] no user — handled by checkAuth()");
    }
});
