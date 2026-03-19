// firestore.js

import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { updateChart } from "./chart.js";


// =======================
// 📦 SUBJECTS CACHE
// =======================

export let subjectsCache = [];


// =======================
// 👤 PROFILE
// =======================

// Internal helper — updates all profile DOM elements
function applyProfileToUI(profile) {
    const displayName = profile.nickName || profile.fullName || profile.email?.split("@")[0] || "Student";
    const classSchool = [profile.class, profile.school].filter(Boolean).join(" • ");
    const initial     = (displayName[0] || "S").toUpperCase();

    const get = (id) => document.getElementById(id);

    if (get("profileAvatar"))       get("profileAvatar").textContent      = initial;
    if (get("profileDisplayName"))  get("profileDisplayName").textContent  = displayName;
    if (get("profileClassSchool"))  get("profileClassSchool").textContent  = classSchool;
    if (get("userEmail"))           get("userEmail").textContent           = profile.email || "";
    if (get("profileGenderBadge"))  get("profileGenderBadge").textContent  = profile.gender || "";

    // Pre-fill the edit form fields
    if (get("editFullName"))  get("editFullName").value  = profile.fullName  || "";
    if (get("editNickName"))  get("editNickName").value  = profile.nickName  || "";
    if (get("editClass"))     get("editClass").value     = profile.class     || "";
    if (get("editSchool"))    get("editSchool").value    = profile.school    || "";
    if (get("editGender"))    get("editGender").value    = profile.gender    || "";
}


// Load profile from Firestore and render it
export async function loadProfile() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const snap = await getDoc(doc(db, "users", user.uid, "profile", "data"));
        const profile = snap.exists()
            ? { ...snap.data(), email: user.email }
            : { email: user.email };  // fallback for Google sign-in with no profile yet

        console.log("[loadProfile] data:", profile);
        applyProfileToUI(profile);
    } catch (err) {
        console.error("[loadProfile] error:", err);
    }
}


// Save edited profile and refresh the UI
export async function saveProfile() {
    const user = auth.currentUser;
    if (!user) return;

    const get = (id) => document.getElementById(id);

    const fullName  = get("editFullName")?.value.trim();
    const nickName  = get("editNickName")?.value.trim() || "";
    const className = get("editClass")?.value.trim();
    const school    = get("editSchool")?.value.trim();
    const gender    = get("editGender")?.value || "";

    if (!fullName)  { alert("Full name is required.");   return; }
    if (!className) { alert("Class is required.");       return; }
    if (!school)    { alert("School name is required."); return; }

    try {
        await setDoc(
            doc(db, "users", user.uid, "profile", "data"),
            { fullName, nickName, class: className, school, gender, email: user.email },
            { merge: true }
        );
        console.log("[saveProfile] saved ✅");

        // Refresh view
        await loadProfile();

        // Close edit form
        if (typeof window.toggleEditProfile === "function") {
            window.toggleEditProfile();
        }

        alert("✅ Profile updated!");
    } catch (err) {
        console.error("[saveProfile] error:", err);
        alert("Failed to save profile: " + err.message);
    }
}


// =======================
// 🔄 REAL-TIME TASKS
// =======================

let unsubscribeTasks = null;

export function listenTasks() {
    const user = auth.currentUser;
    if (!user) return;

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
        (err) => console.error("[listenTasks]", err)
    );
}


// ➕ ADD TASK
export async function addTask() {
    const input = document.getElementById("taskInput");
    const user  = auth.currentUser;

    if (!user) { alert("Please log in to add tasks."); return; }
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
    if (!user) { alert("Please log in to add subjects."); return; }

    const nameEl     = document.getElementById("subjectName");
    const lessonsEl  = document.getElementById("subjectLessons");
    const reminderEl = document.getElementById("subjectReminder");

    const name         = nameEl?.value.trim();
    const totalLessons = parseInt(lessonsEl?.value) || 0;
    const reminderTime = reminderEl?.value || "";

    if (!name)           { alert("Please enter a subject name."); return; }
    if (totalLessons<=0) { alert("Please enter a valid number of lessons (greater than 0)."); return; }

    try {
        await addDoc(collection(db, "users", user.uid, "subjects"), {
            name, totalLessons, completedLessons: 0, reminderTime
        });
        nameEl.value    = "";
        lessonsEl.value = "";
        if (reminderEl) reminderEl.value = "";
        nameEl.focus();
    } catch (err) {
        console.error("[addSubject]", err);
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
    } catch (err) {
        console.error("[deleteSubject]", err);
        alert("Failed to delete subject: " + err.message);
    }
}


// ✅ COMPLETE LESSON (capped at totalLessons)
export async function completeLesson(subjectId) {
    const user = auth.currentUser;
    if (!user) return;

    const cached = subjectsCache.find(s => s.id === subjectId);
    if (cached && cached.completedLessons >= cached.totalLessons) return;

    try {
        await updateDoc(doc(db, "users", user.uid, "subjects", subjectId), {
            completedLessons: increment(1)
        });
    } catch (err) {
        console.error("[completeLesson]", err);
        alert("Failed to update lesson: " + err.message);
    }
}


// 🔄 REAL-TIME SUBJECTS LISTENER
export function listenSubjects() {
    const user = auth.currentUser;
    if (!user) return;

    if (unsubscribeSubjects) unsubscribeSubjects();

    unsubscribeSubjects = onSnapshot(
        collection(db, "users", user.uid, "subjects"),
        (snapshot) => {
            const container = document.getElementById("subjectsList");
            if (!container) return;

            container.innerHTML = "";
            const chartLabels = [];
            const chartValues = [];

            subjectsCache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

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

                const reminderBadge = data.reminderTime
                    ? `<span class="reminder-badge">🔔 ${data.reminderTime}</span>`
                    : "";

                const div = document.createElement("div");
                div.className = "subject-item";
                div.innerHTML = `
                    <div class="subject-item-header">
                        <div class="subject-name-row">
                            <span class="subject-item-name">${data.name}</span>
                            <button class="btn-delete-subject" onclick="deleteSubject('${id}')" title="Delete subject">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                    <path d="M10 11v6"/><path d="M14 11v6"/>
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                            </button>
                        </div>
                        <div class="subject-badges">
                            ${reminderBadge}
                            <span class="subject-item-pct ${finished ? "done" : ""}">${pct}%</span>
                        </div>
                    </div>
                    <div class="subject-progress-row">
                        <progress value="${pct}" max="100"></progress>
                    </div>
                    <div class="subject-item-meta">
                        <span>${completed} of ${total} lessons completed</span>
                        ${finished ? '<span class="badge-done">✓ Complete</span>' : ""}
                    </div>
                    <button
                        class="btn-complete ${finished ? "btn-done" : ""}"
                        onclick="completeLesson('${id}')"
                        ${finished ? "disabled" : ""}>
                        ${finished ? "🎉 All done!" : "✅ Complete Lesson"}
                    </button>
                `;
                container.appendChild(div);
            });

            updateChart(chartLabels, chartValues);
        },
        (err) => console.error("[listenSubjects]", err)
    );
}
