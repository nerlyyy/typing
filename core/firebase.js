// core/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Isi Config sesuai proyekmu nanti
const firebaseConfig = {
    // apiKey: "API_KEY_ANDA",
    // authDomain: "...",
    // projectId: "...",
};

let db = null;
let isFirebaseReady = false;

export const initFirebase = () => {
    try {
        if (firebaseConfig.apiKey) {
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            const auth = getAuth(app);
            
            signInAnonymously(auth).then(() => {
                console.log("🔥 Firebase Connected (Anonymous)");
                isFirebaseReady = true;
            }).catch((error) => console.error("Firebase Auth Error:", error));
        } else {
            console.log("⚠️ Firebase Config missing. Offline Mode.");
        }
    } catch (e) {
        console.error("Firebase Init Error:", e);
    }
};

export const submitScore = async (name, score) => {
    if (!isFirebaseReady || !db) return false;
    try {
        await addDoc(collection(db, "leaderboard"), {
            name: name.toUpperCase(),
            score: parseInt(score),
            timestamp: new Date()
        });
        return true;
    } catch (e) {
        console.error("Submit Score Error:", e);
        return false;
    }
};

export const getLeaderboard = async () => {
    if (!isFirebaseReady || !db) return [];
    try {
        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (e) {
        console.error("Get Leaderboard Error:", e);
        return [];
    }
};