import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArlEPCb0J42gwRtVgfD44S4atOV43Z4js",
  authDomain: "swasthsetu-admin-d8802.firebaseapp.com",
  projectId: "swasthsetu-admin-d8802",
  storageBucket: "swasthsetu-admin-d8802.firebasestorage.app",
  messagingSenderId: "312019653035",
  appId: "1:312019653035:web:f117a03cfd92dc5845c2ee",
  measurementId: "G-Y1261LVQVD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);