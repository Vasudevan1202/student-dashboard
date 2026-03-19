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
// 🌍 GLOBAL FUNCTIONS (HTML access)
// =======================

window.login = login;
window.register = register;
window.googleLogin = googleLogin;
window.logout = logout;

window.addTask = addTask;
window.saveTimetable = saveTimetable;
window.saveProgress = saveProgress;

window.toggleTheme = toggleTheme;
window.startTimer = startTimer;
window.resetTimer = resetTimer;
window.requestNotification = requestNotification;


// =======================
// 🚀 APP INIT
// =======================

// theme
loadTheme();

// chart
initChart();

// auth protection
checkAuth();


// =======================
// 🔐 USER STATE HANDLING
// =======================

onAuthStateChanged(auth, (user) => {

    if (user) {
        // 👤 show user
        showUserProfile(user);

        // 🔄 real-time tasks
        listenTasks();

        // 📅 timetable
        loadTimetable();

        // 📊 progress (manual override)
        loadProgress();

    } else {
        // redirect handled in auth.js
    }

});