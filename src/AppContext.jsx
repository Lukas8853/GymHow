import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [user, setUser] = useState(null);         // Firebase Auth user
  const [userProfile, setUserProfile] = useState(null); // Firestore profil
  const [authLoading, setAuthLoading] = useState(true);

  const [exercises, setExercises] = useState([]);
  const [exerciseSortOrder, setExerciseSortOrder] = useState(() => {
    return localStorage.getItem("exerciseSortOrder") || "az";
  });

  const [favorites, setFavorites] = useState(() => {
    const storedFavorite = localStorage.getItem("favorites");
    return storedFavorite ? JSON.parse(storedFavorite) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (exerciseID) => {
    setFavorites((previous) =>
      previous.includes(exerciseID)
        ? previous.filter((id) => id !== exerciseID)
        : [...previous, exerciseID],
    );
  };

  const [isDarkModeStored] = useState(() => {
    return localStorage.getItem("isDarkMode");
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("isDarkMode");
    return stored === null
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : stored === "true";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("exerciseSortOrder", exerciseSortOrder);
  }, [exerciseSortOrder]);

  // Slušaj Firebase Auth promjene
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Dohvati Firestore profil
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Osvježi profil iz Firestorea (poziva se nakon promjena)
  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode,
        user,
        userProfile,
        authLoading,
        refreshUserProfile,
        favorites,
        toggleFavorite,
        exercises,
        setExercises,
        exerciseSortOrder,
        setExerciseSortOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}