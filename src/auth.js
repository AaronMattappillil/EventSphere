import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";

export const handleSignup = async (email, password, role) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user role in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: role,
            createdAt: new Date().toISOString()
        });

        return { user, role };
    } catch (error) {
        throw error;
    }
};

export const handleLogin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch role
        const role = await getUserRole(user.uid);
        return { user, role };
    } catch (error) {
        throw error;
    }
};

export const handleLogout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout error", error);
    }
};

export const getUserRole = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data().role;
    } else {
        return 'participant'; // Default
    }
};

export const initAuthListener = (callback) => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const role = await getUserRole(user.uid);
            callback(user, role);
        } else {
            callback(null, null);
        }
    });
};
