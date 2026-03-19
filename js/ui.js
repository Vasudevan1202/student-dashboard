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
        const btn = document.getElementById("themeBtn");
        if (btn) btn.textContent = "☀️ Light Mode";
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
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    document.getElementById("timer").textContent =
        `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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
        // Already granted — show a test notification right away
        new Notification("🔔 Notifications already enabled!", {
            body: "Student Dashboard will remind you to study."
        });
        return;
    }

    if (Notification.permission === "denied") {
        alert("Notifications are blocked. Please enable them in your browser settings (click the lock icon in the address bar).");
        return;
    }

    // Request permission
    Notification.requestPermission().then((permission) => {
        console.log("[requestNotification] permission:", permission);

        if (permission === "granted") {
            new Notification("🔔 Notifications enabled!", {
                body: "Student Dashboard will remind you to study. Good luck! 📚"
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


// =======================
// 👤 USER PROFILE
// =======================

export function showUserProfile(user) {
    const name = user.displayName || user.email?.split("@")[0] || "Student";
    const email = user.email;

    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");

    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;
}
