// firestore.js

import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { updateChart } from "./chart.js";


// =======================
// 🔄 REAL-TIME TASKS
// =======================

let unsubscribeTasks = null;

export function listenTasks() {
    const user = auth.currentUser;
    if (!user) {
        console.warn("[listenTasks] no user logged in");
        return;
    }

    const list = document.getElementById("taskList");
    if (!list) return;

    if (unsubscribeTasks) unsubscribeTasks();

    unsubscribeTasks = onSnapshot(
        collection(db, "users", user.uid, "tasks"),
        (snapshot) => {
            list.innerHTML = "";

            snapshot.forEach((docSnap) => {
                const li = document.createElement("li");
                li.textContent = docSnap.data().text;

                li.onclick = async () => {
                    li.classList.add("done");
                    setTimeout(async () => {
                        await deleteDoc(doc(db, "users", user.uid, "tasks", docSnap.id));
                    }, 400);
                };

                list.appendChild(li);
            });
        },
        (error) => {
            console.error("[listenTasks] error:", error);
        }
    );
}


// ➕ ADD TASK
export async function addTask() {
    const input = document.getElementById("taskInput");
    const user  = auth.currentUser;

    if (!user) {
        alert("Please log in to add tasks.");
        return;
    }

    if (!input || input.value.trim() === "") return;

    await addDoc(
        collection(db, "users", user.uid, "tasks"),
        { text: input.value.trim(), created: Date.now() }
    );

    input.value = "";
    input.focus();
}


// =======================
// 📚 SUBJECTS
// =======================

let unsubscribeSubjects = null;

// ➕ ADD SUBJECT
export async function addSubject() {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to add subjects.");
        return;
    }

    const nameEl    = document.getElementById("subjectName");
    const lessonsEl = document.getElementById("subjectLessons");

    const name         = nameEl?.value.trim();
    const totalLessons = parseInt(lessonsEl?.value) || 0;

    if (!name) {
        alert("Please enter a subject name.");
        return;
    }

    if (totalLessons <= 0) {
        alert("Please enter a valid number of lessons (greater than 0).");
        return;
    }

    console.log("[addSubject] adding:", name, totalLessons);

    try {
        await addDoc(collection(db, "users", user.uid, "subjects"), {
            name,
            totalLessons,
            completedLessons: 0
        });

        nameEl.value    = "";
        lessonsEl.value = "";
        nameEl.focus();

        console.log("[addSubject] added successfully ✅");
    } catch (err) {
        console.error("[addSubject] error:", err);
        alert("Failed to add subject: " + err.message);
    }
}


// 🗑️ DELETE SUBJECT
export async function deleteSubject(subjectId) {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm("Delete this subject? This cannot be undone.")) return;

    try {
        await deleteDoc(doc(db, "users", user.uid, "subjects", subjectId));
        console.log("[deleteSubject] deleted:", subjectId);
    } catch (err) {
        console.error("[deleteSubject] error:", err);
        alert("Failed to delete subject: " + err.message);
    }
}


// ✅ MARK LESSON COMPLETE
export async function updateLessonProgress(subjectId) {
    const user = auth.currentUser;
    if (!user) return;

    console.log("[updateLessonProgress] subjectId:", subjectId);

    try {
        await updateDoc(doc(db, "users", user.uid, "subjects", subjectId), {
            completedLessons: increment(1)
        });
        console.log("[updateLessonProgress] incremented ✅");
    } catch (err) {
        console.error("[updateLessonProgress] error:", err);
        alert("Failed to update lesson: " + err.message);
    }
}


// 🔄 REAL-TIME SUBJECTS LISTENER
export function listenSubjects() {
    const user = auth.currentUser;
    if (!user) {
        console.warn("[listenSubjects] no user logged in");
        return;
    }

    if (unsubscribeSubjects) unsubscribeSubjects();

    unsubscribeSubjects = onSnapshot(
        collection(db, "users", user.uid, "subjects"),
        (snapshot) => {
            const container = document.getElementById("subjectsList");
            if (!container) return;

            container.innerHTML = "";

            const chartLabels = [];
            const chartValues = [];

            if (snapshot.empty) {
                container.innerHTML =
                    '<p class="empty-msg">No subjects yet. Add one above to get started!</p>';
                updateChart([], []);
                return;
            }

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const id   = docSnap.id;

                const completed = data.completedLessons || 0;
                const total     = data.totalLessons     || 1;
                const pct       = Math.min(100, Math.round((completed / total) * 100));
                const finished  = completed >= total;

                chartLabels.push(data.name);
                chartValues.push(pct);

                const div = document.createElement("div");
                div.className = "subject-item";
                div.innerHTML = `
                    <div class="subject-item-header">
                        <div class="subject-name-row">
                            <span class="subject-item-name">${data.name}</span>
                            <button class="btn-delete-subject" onclick="deleteSubject('${id}')" title="Delete subject">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                            </button>
                        </div>
                        <span class="subject-item-pct ${finished ? 'done' : ''}">${pct}%</span>
                    </div>
                    <div class="subject-progress-row">
                        <progress value="${pct}" max="100"></progress>
                    </div>
                    <div class="subject-item-meta">
                        <span>${completed} of ${total} lessons completed</span>
                        ${finished ? '<span class="badge-done">✓ Complete</span>' : ''}
                    </div>
                    <button
                        class="btn-complete ${finished ? 'btn-done' : ''}"
                        onclick="updateLessonProgress('${id}')"
                        ${finished ? 'disabled' : ''}>
                        ${finished ? '🎉 All done!' : '✅ Mark Lesson Complete'}
                    </button>
                `;
                container.appendChild(div);
            });

            updateChart(chartLabels, chartValues);
        },
        (err) => {
            console.error("[listenSubjects] error:", err);
        }
    );
}
