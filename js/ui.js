// ui.js

// =======================
// 🌗 THEME TOGGLE
// =======================

export function toggleTheme() {
    document.body.classList.toggle("light");
    const mode = document.body.classList.contains("light") ? "light" : "dark";
    localStorage.setItem("theme", mode);
    const btn = document.getElementById("themeBtn");
    if (btn) btn.textContent = mode === "light" ? "☀️ Light" : "🌙 Dark";
}

export function loadTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
        document.body.classList.add("light");
        const btn = document.getElementById("themeBtn");
        if (btn) btn.textContent = "☀️ Light";
    }
}


// =======================
// ✏️ EDIT PROFILE TOGGLE
// =======================

export function toggleEditProfile() {
    const view = document.getElementById("profileView");
    const form = document.getElementById("profileEditForm");
    const btn  = document.getElementById("editProfileBtn");

    if (!view || !form) return;

    const isEditing = form.style.display !== "none";

    if (isEditing) {
        form.style.display = "none";
        view.style.display = "";
        if (btn) btn.textContent = "✏️ Edit";
    } else {
        form.style.display = "";
        view.style.display = "none";
        if (btn) btn.textContent = "✕ Cancel";
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
            showNotification("Time's up! ⏰ Take a break.");
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
    const m = Math.floor(time / 60);
    const s = time % 60;
    const el = document.getElementById("timer");
    if (el) el.textContent = `${m}:${s < 10 ? "0" : ""}${s}`;
}


// =======================
// 🔔 NOTIFICATIONS
// =======================

export function requestNotification() {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications.");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification("🔔 Notifications already enabled!", {
            body: "Student Dashboard will remind you to study."
        });
        return;
    }

    if (Notification.permission === "denied") {
        alert("Notifications are blocked. Please enable them in your browser settings.");
        return;
    }

    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            new Notification("🔔 Notifications enabled!", {
                body: "You'll receive study reminders. Good luck! 📚"
            });
        } else {
            alert("Notification permission denied. You can re-enable it in browser settings.");
        }
    });
}

export function showNotification(message = "Study Reminder 📚") {
    if (Notification.permission === "granted") {
        new Notification(message);
    }
}
