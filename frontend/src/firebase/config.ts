import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Ваша конфігурація з Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDyrsYHX4z3BvvHjPvOxbr1DW_bobyrQfI",
  authDomain: "coffee-shop-8a30a.firebaseapp.com",
  projectId: "coffee-shop-8a30a",
  storageBucket: "coffee-shop-8a30a.firebasestorage.app",
  messagingSenderId: "341857169332",
  appId: "1:341857169332:web:d232f7fb6afd00e29f8ce1"
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);

// Експортуємо сервіси
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;