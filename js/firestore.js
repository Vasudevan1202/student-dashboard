// firestore.js

import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    setDoc,
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { updateChart } from "./chart.js";


// =======================
// 🔄 REAL-TIME TASKS
// =======================

let unsubscribeTasks = null;

export function listenTasks() {
    const user = auth.currentUser;
    if (!user) return;

    const list = document.getElementById("taskList");

    // stop previous listener
    if (unsubscribeTasks) unsubscribeTasks();

    unsubscribeTasks = onSnapshot(
        collection(db, "users", user.uid, "tasks"),
        async (snapshot) => {
            list.innerHTML = "";

            let totalTasks = snapshot.size;

            snapshot.forEach((docSnap) => {
                const li = document.createElement("li");
                li.textContent = docSnap.data().text;

                li.onclick = async () => {
                    await deleteDoc(
                        doc(db, "users", user.uid, "tasks", docSnap.id)
                    );
                };

                list.appendChild(li);
            });

            // =======================
            // 📊 PROGRESS LOGIC
            // =======================

            let autoProgress = Math.min(100, Math.floor(totalTasks * 5));

            // check if manual progress exists
            const snap = await getDoc(
                doc(db, "users", user.uid, "profile", "data")
            );

            let finalMath = autoProgress;
            let finalScience = autoProgress;

            if (snap.exists()) {
                const manual = snap.data().progress;

                if (manual) {
                    finalMath = manual.math ?? autoProgress;
                    finalScience = manual.science ?? autoProgress;
                }
            }

            // update UI
            const mathBar = document.getElementById("mathBar");
            const scienceBar = document.getElementById("scienceBar");

            if (mathBar) mathBar.value = finalMath;
            if (scienceBar) scienceBar.value = finalScience;

            // update chart
            updateChart(finalMath, finalScience);
        }
    );
}


// ➕ ADD TASK
export async function addTask() {
    const input = document.getElementById("taskInput");
    const user = auth.currentUser;

    if (!user || input.value.trim() === "") return;

    await addDoc(
        collection(db, "users", user.uid, "tasks"),
        {
            text: input.value,
            created: Date.now()
        }
    );

    input.value = "";
    input.focus();
}


// =======================
// 📅 TIMETABLE
// =======================

export async function saveTimetable() {
    const user = auth.currentUser;
    if (!user) return;

    const data = document.getElementById("timetable").value;

    await setDoc(
        doc(db, "users", user.uid, "profile", "data"),
        { timetable: data },
        { merge: true }
    );
}


export async function loadTimetable() {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(
        doc(db, "users", user.uid, "profile", "data")
    );

    if (snap.exists()) {
        document.getElementById("timetable").value =
            snap.data().timetable || "";
    }
}


// =======================
// 📊 MANUAL PROGRESS
// =======================

export async function saveProgress() {
    const user = auth.currentUser;
    if (!user) return;

    const math = document.getElementById("mathInput")?.value || 0;
    const science = document.getElementById("scienceInput")?.value || 0;

    await setDoc(
        doc(db, "users", user.uid, "profile", "data"),
        {
            progress: {
                math: Number(math),
                science: Number(science)
            }
        },
        { merge: true }
    );
}


export async function loadProgress() {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(
        doc(db, "users", user.uid, "profile", "data")
    );

    if (snap.exists()) {
        const data = snap.data().progress;

        if (data) {
            const math = data.math || 0;
            const science = data.science || 0;

            document.getElementById("mathBar").value = math;
            document.getElementById("scienceBar").value = science;

            updateChart(math, science);
        }
    }
}