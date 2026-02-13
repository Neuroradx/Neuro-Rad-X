// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import getFirestore
import { getAuth } from "firebase/auth";     // Import getAuth
import { getStorage } from "firebase/storage"; // Import getStorage

// Tu configuración de Firebase específica
const firebaseConfig = {
  apiKey: "AIzaSyAcul5J-o83EE4o0FT9jdLvQmApQUoUQ7I",
  authDomain: "neuroradx-jovto.firebaseapp.com",
  projectId: "neuroradx-jovto",
  storageBucket: "neuroradx-jovto.firebasestorage.app",
  messagingSenderId: "930640165466",
  appId: "1:930640165466:web:1ee43d3bcb83c2e2297663"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa servicios de Firestore y Auth
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Initialize Firebase Storage

export { app, db, auth, storage }; // Export storage
