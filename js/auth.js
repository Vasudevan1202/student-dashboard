// auth.js

import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// 🌐 GOOGLE PROVIDER
const provider = new GoogleAuthProvider();


// 📝 REGISTER
export function register() {
    const email = document.getElementById("regUser")?.value?.trim();
    const password = document.getElementById("regPass")?.value;

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("Account created! Please log in.");
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.error("[register] error:", error);
            alert("Register failed: " + error.message);
        });
}


// 🔑 LOGIN
export function login() {
    const email = document.getElementById("loginUser")?.value?.trim();
    const password = document.getElementById("loginPass")?.value;

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            console.log("[login] success, redirecting...");
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("[login] error:", error);
            alert("Login failed: " + error.message);
        });
}


// 🔵 GOOGLE SIGN-IN
export function googleLogin() {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("[googleLogin] success:", result.user.email);
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("[googleLogin] error:", error);
            if (error.code === "auth/popup-blocked") {
                alert("Popup was blocked by your browser. Please allow popups for this site and try again.");
            } else if (error.code === "auth/cancelled-popup-request") {
                // user closed popup — do nothing
            } else {
                alert("Google sign-in failed: " + error.message);
            }
        });
}


// 🚪 LOGOUT
export function logout() {
    signOut(auth).then(() => {
        console.log("[logout] signed out");
        window.location.href = "login.html";
    });
}


// 🔒 PROTECT PAGES
// Handles root path "/" as well as "/index.html"
export function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        const path = window.location.pathname;

        const isLoginPage    = path.includes("login.html");
        const isRegisterPage = path.includes("register.html");
        const isDashboard    = !isLoginPage && !isRegisterPage; // root "/" or "/index.html"

        console.log("[checkAuth] path:", path, "| user:", user?.email || "none");

        if (!user && isDashboard) {
            // Not logged in and on dashboard → send to login
            window.location.href = "login.html";
        }

        if (user && (isLoginPage || isRegisterPage)) {
            // Already logged in and on login/register → send to dashboard
            window.location.href = "index.html";
        }
    });
}
