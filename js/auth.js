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
    const email = document.getElementById("regUser")?.value;
    const password = document.getElementById("regPass")?.value;

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("Account created!");
            window.location.href = "login.html";
        })
        .catch((error) => {
            alert(error.message);
        });
}


// 🔑 LOGIN
export function login() {
    const email = document.getElementById("loginUser")?.value;
    const password = document.getElementById("loginPass")?.value;

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "index.html";
        })
        .catch((error) => {
            alert(error.message);
        });
}


// 🔵 GOOGLE SIGN-IN
export function googleLogin() {
    signInWithPopup(auth, provider)
        .then(() => {
            window.location.href = "index.html";
        })
        .catch((error) => {
            alert(error.message);
        });
}


// 🚪 LOGOUT
export function logout() {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
}


// 🔒 PROTECT PAGES
export function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        const currentPage = window.location.pathname;

        if (!user && currentPage.includes("index.html")) {
            window.location.href = "login.html";
        }

        if (user && (currentPage.includes("login.html") || currentPage.includes("register.html"))) {
            window.location.href = "index.html";
        }
    });
}