// auth.js

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// 🌐 GOOGLE PROVIDER
const provider = new GoogleAuthProvider();


// 📝 REGISTER — saves full profile to Firestore after Auth creation
export function register() {
    const email     = document.getElementById("regUser")?.value?.trim();
    const password  = document.getElementById("regPass")?.value;
    const fullName  = document.getElementById("regFullName")?.value?.trim();
    const nickName  = document.getElementById("regNickName")?.value?.trim() || "";
    const className = document.getElementById("regClass")?.value?.trim();
    const school    = document.getElementById("regSchool")?.value?.trim();
    const gender    = document.getElementById("regGender")?.value || "";

    // Validate required fields
    if (!fullName)  { alert("Full name is required.");  return; }
    if (!className) { alert("Class is required.");      return; }
    if (!school)    { alert("School name is required."); return; }
    if (!email || !password) { alert("Email and password are required."); return; }

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (cred) => {
            const uid = cred.user.uid;

            // Save profile data to Firestore
            await setDoc(doc(db, "users", uid, "profile", "data"), {
                fullName,
                nickName,
                class:  className,
                school,
                gender,
                email
            });

            console.log("[register] profile saved for uid:", uid);
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
    const email    = document.getElementById("loginUser")?.value?.trim();
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
                alert("Popup was blocked. Please allow popups for this site and try again.");
            } else if (error.code !== "auth/cancelled-popup-request") {
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
export function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        const path = window.location.pathname;
        const isLoginPage    = path.includes("login.html");
        const isRegisterPage = path.includes("register.html");
        const isDashboard    = !isLoginPage && !isRegisterPage;

        console.log("[checkAuth] path:", path, "| user:", user?.email || "none");

        if (!user && isDashboard)              window.location.href = "login.html";
        if (user  && (isLoginPage || isRegisterPage)) window.location.href = "index.html";
    });
}
