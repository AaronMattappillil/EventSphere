// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWy3yTn5cD0osZ2zbLZSl_U_AjbDejE_Y",
    authDomain: "eventsphere-eb8b2.firebaseapp.com",
    projectId: "eventsphere-eb8b2",
    storageBucket: "eventsphere-eb8b2.firebasestorage.app",
    messagingSenderId: "201930734610",
    appId: "1:201930734610:web:f74dd3b514e9fad64e2ccb",
    measurementId: "G-3EGCPFBED7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
