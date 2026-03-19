// app.js

// =======================
// 🔗 IMPORTS
// =======================

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
    saveTimetable,
    loadTimetable,
    saveProgress,
    loadProgress
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
// 🌍 GLOBAL FUNCTIONS (accessible from HTML onclick)
// =======================

window.login               = login;
window.register            = register;
window.googleLogin         = googleLogin;
window.logout              = logout;

window.addTask             = addTask;
window.saveTimetable       = saveTimetable;
window.saveProgress        = saveProgress;

window.toggleTheme         = toggleTheme;
window.startTimer          = startTimer;
window.resetTimer          = resetTimer;
window.requestNotification = requestNotification;


// =======================
// 🚀 APP INIT
// =======================

// load saved theme immediately
loadTheme();

// init chart (only runs if canvas#progressChart exists on page)
initChart();

// auth protection (redirect if not logged in)
checkAuth();


// =======================
// 🔐 USER STATE HANDLING
// =======================

onAuthStateChanged(auth, (user) => {

    if (user) {
        console.log("[app] user logged in:", user.email);

        // 👤 show user profile
        showUserProfile(user);

        // 🔄 real-time tasks
        listenTasks();

        // 📅 load timetable
        loadTimetable();

        // 📊 load progress
        loadProgress();

    } else {
        console.log("[app] no user — handled by checkAuth()");
    }

});
