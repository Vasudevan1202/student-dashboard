// ui.js

// =======================
// 🌗 THEME TOGGLE
// =======================

export function toggleTheme() {
    document.body.classList.toggle("light");

    const mode = document.body.classList.contains("light") ? "light" : "dark";
    localStorage.setItem("theme", mode);

    document.getElementById("themeBtn").textContent =
        mode === "light" ? "☀️ Light Mode" : "🌙 Dark Mode";
}


// load saved theme
export function loadTheme() {
    const saved = localStorage.getItem("theme");

    if (saved === "light") {
        document.body.classList.add("light");
        document.getElementById("themeBtn").textContent = "☀️ Light Mode";
    }
}


// =======================
// ⏱️ POMODORO TIMER
// =======================

let time = 1500;
let interval = null;

export function startTimer() {
    if (interval) return;

    interval = setInterval(() => {
        if (time <= 0) {
            clearInterval(interval);
            interval = null;
            showNotification("Time’s up! ⏰");
        } else {
            time--;
            updateTimer();
        }
    }, 1000);
}


export function resetTimer() {
    clearInterval(interval);
    interval = null;
    time = 1500;
    updateTimer();
}


function updateTimer() {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    document.getElementById("timer").textContent =
        `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}


// =======================
// 🔔 NOTIFICATIONS
// =======================

export function requestNotification() {
    Notification.requestPermission();
}

export function showNotification(message = "Study Reminder 📚") {
    if (Notification.permission === "granted") {
        new Notification(message);
    }
}


// =======================
// 👤 USER PROFILE
// =======================

export function showUserProfile(user) {
    const name = user.displayName || "Student";
    const email = user.email;

    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");

    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;
}