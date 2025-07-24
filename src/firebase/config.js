// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCPhPbubzWs6rA_zDkSpiPPsczzIbci8SQ",
  authDomain: "ripple-83a69.firebaseapp.com",
  projectId: "ripple-83a69",
  storageBucket: "ripple-83a69.firebasestorage.app",
  messagingSenderId: "944753064875",
  appId: "1:944753064875:web:c7abf6e44bed2f1520b0ee",
  measurementId: "G-RWVR0V8842"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;