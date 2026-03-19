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
    addSubject,
    deleteSubject,
    listenSubjects,
    updateLessonProgress
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

window.login                 = login;
window.register              = register;
window.googleLogin           = googleLogin;
window.logout                = logout;

window.addTask               = addTask;
window.addSubject            = addSubject;
window.deleteSubject         = deleteSubject;
window.updateLessonProgress  = updateLessonProgress;

window.toggleTheme           = toggleTheme;
window.startTimer            = startTimer;
window.resetTimer            = resetTimer;
window.requestNotification   = requestNotification;


// =======================
// 🚀 APP INIT
// =======================

loadTheme();
initChart();
checkAuth();


// =======================
// 🔐 USER STATE HANDLING
// =======================

onAuthStateChanged(auth, (user) => {

    if (user) {
        console.log("[app] user logged in:", user.email);

        showUserProfile(user);
        listenTasks();
        listenSubjects();

    } else {
        console.log("[app] no user — handled by checkAuth()");
    }

});
