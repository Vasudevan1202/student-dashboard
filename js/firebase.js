// firebase.js

// IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDilf2geHM57gl4u-piwGTizrWAz-g_mZo",
  authDomain: "studentdashboard-2b2be.firebaseapp.com",
  projectId: "studentdashboard-2b2be",
  storageBucket: "studentdashboard-2b2be.firebasestorage.app",
  messagingSenderId: "287316566989",
  appId: "1:287316566989:web:964becb269209322c41a84"
};


// INITIALIZE
const app = initializeApp(firebaseConfig);

// SERVICES
const auth = getAuth(app);
const db = getFirestore(app);


// EXPORTS (VERY IMPORTANT)
export { auth, db };