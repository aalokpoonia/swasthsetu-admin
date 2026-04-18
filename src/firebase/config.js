import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXxUIJ_r-QwbcLs7ty0eXoWpydvN324ZY",
  authDomain: "swasthsetu-admin.firebaseapp.com",
  projectId: "swasthsetu-admin",
  storageBucket: "swasthsetu-admin.firebasestorage.app",
  messagingSenderId: "769856858254",
  appId: "1:769856858254:web:e2df6e7d23a8b98a1401df"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);