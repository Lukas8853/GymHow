import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [username, setUsername] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    const storedFavorite = localStorage.getItem("favorites");
    console.log("AppContext > useState > storedFavorite:", storedFavorite);
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

  const [isDarkModeStored, setIsDarkModeStored] = useState(() => {
    const storedIsDarkMode = localStorage.getItem("isDarkMode");
    console.log("AppContext > useState > storedIsDarkMode:", storedIsDarkMode);
    return storedIsDarkMode;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return isDarkModeStored === null
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : isDarkModeStored === "true";
  });

  // Change dark mode when the user changes their preference in the OS settings
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode,
        username,
        setUsername,
        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
