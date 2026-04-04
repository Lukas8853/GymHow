import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDxBMyrKyzHoP78HRqQPq7Yqj6FX5BiGmM",
  authDomain: "gymhow-zavrsni.firebaseapp.com",
  projectId: "gymhow-zavrsni",
  storageBucket: "gymhow-zavrsni.firebasestorage.app",
  messagingSenderId: "460005855586",
  appId: "1:460005855586:web:273ff224f13f3ffc0edc3b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();