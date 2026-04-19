import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyDxBMyrKyzHoP78HRqQPq7Yqj6FX5BiGmM",
  authDomain: "gymhow-zavrsni.firebaseapp.com",
  projectId: "gymhow-zavrsni",
  storageBucket: "gymhow-zavrsni.firebasestorage.app",
  messagingSenderId: "460005855586",
  appId: "1:460005855586:web:273ff224f13f3ffc0edc3b",
};

const app = initializeApp(firebaseConfig);

// In development, prefer App Check debug mode so localhost does not depend on
// reCAPTCHA/browser privacy behavior.
const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
if (import.meta.env.DEV) {
  globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN =
    debugToken || "5DD58803-3368-4CF0-B078-D710480335E6";
}

// Initialize App Check with reCAPTCHA v3 for production traffic.
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LfauKYsAAAAAAGKqZZU4-0dGlXclEM8v57DQodi"),
  isTokenAutoRefreshEnabled: true,
});

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
