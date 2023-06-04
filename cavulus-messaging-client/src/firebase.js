import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBBBR5pvPk-AmcfTyFniYnhxPpJPZxA2XY",
    authDomain: "cavulus-messaging-app.firebaseapp.com",
    projectId: "cavulus-messaging-app",
    storageBucket: "cavulus-messaging-app.appspot.com",
    messagingSenderId: "1002970794771",
    appId: "1:1002970794771:web:d64226095ce2003fd328e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

import { getAuth } from 'firebase/auth';
export const auth = getAuth(app);