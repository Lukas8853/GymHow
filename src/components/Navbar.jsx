import { useRef, useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Box, Stack, Typography } from "@mui/material"; //služi za organizaciju elemenata u stacku, može biti horizontalno ili vertikalno
import { useTranslation } from "react-i18next"; //služi za prevođenje teksta na različite jezike
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";

import { AppContext } from "../AppContext";
import {
  EXERCISES_CACHE_KEY,
  fetchAllExercises,
  filterExercisesByQuery,
  readCachedJson,
  writeCachedJson,
} from "../utils/fetchData";

const Navbar = () => {
  const dropDownMenuRef = useRef(null);
  const [isDropDownMenuOpen, setIsDropDownMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const {
    isDarkMode,
    setIsDarkMode,
    setExercises,
    exerciseSortOrder,
    setExerciseSortOrder,
  } = useContext(AppContext);
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";
  const isProfilePage = location.pathname === "/Profile";
  const isExercisesPage =
    location.pathname === "/Exercises" ||
    location.pathname.startsWith("/exercise/");

  const pageTitle = isProfilePage
    ? "Profile"
    : isExercisesPage
      ? "Exercises"
      : "Home";

  const navBackground = isProfilePage
    ? isDarkMode
      ? "linear-gradient(180deg, #3f8b31 0%, #111111 100%)"
      : "linear-gradient(180deg, #5ebb4c 0%, #ffffff 100%)"
    : isExercisesPage
      ? isDarkMode
        ? "linear-gradient(180deg, #8f571d 0%, #111111 100%)"
        : "linear-gradient(180deg, #c77829 0%, #ffffff 100%)"
      : isDarkMode
        ? "linear-gradient(180deg, #6e131a 0%, #111111 100%)"
        : "linear-gradient(180deg, #a81b27 0%, #ffffff 100%)";

  function toggleDropDownMenu() {
    setIsDropDownMenuOpen((prevState) => !prevState);
  }

  function changeLanguage() {
    if (i18n.language === "hr") {
      i18n.changeLanguage("en");
    } else {
      i18n.changeLanguage("hr");
    }
  }

  function toggleDarkMode() {
    setIsDarkMode((prevMode) => !prevMode);
    localStorage.setItem("isDarkMode", !isDarkMode);
  }

  const clearSearch = () => {
    if (isExercisesPage) {
      navigate("/Exercises");
    } else {
      const cachedExercises = readCachedJson(EXERCISES_CACHE_KEY, []);
      if (Array.isArray(cachedExercises) && cachedExercises.length > 0) {
        setExercises(cachedExercises);
      }
      navigate("/");
    }

    setSearchInput("");
    setIsSearchOpen(false);
    setIsSortMenuOpen(false);
  };

  const handleSearch = async () => {
    const normalizedSearch = searchInput.trim().toLowerCase();

    if (!normalizedSearch) {
      clearSearch();
      return;
    }

    if (isExercisesPage) {
      navigate(`/Exercises?q=${encodeURIComponent(normalizedSearch)}`);
      setSearchInput("");
      setIsSearchOpen(false);
      setIsSortMenuOpen(false);
      return;
    }

    const cachedExercises = readCachedJson(EXERCISES_CACHE_KEY, []);

    if (Array.isArray(cachedExercises) && cachedExercises.length > 0) {
      const searchedExercises = filterExercisesByQuery(
        cachedExercises,
        normalizedSearch,
      );

      setExercises(searchedExercises);
      setSearchInput("");
      setIsSearchOpen(false);
      navigate("/");
      setTimeout(() => {
        const exercisesSection = document.getElementById("exercises");
        if (exercisesSection) {
          exercisesSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return;
    }

    try {
      const exercisesData = await fetchAllExercises();
      if (Array.isArray(exercisesData) && exercisesData.length > 0) {
        writeCachedJson(EXERCISES_CACHE_KEY, exercisesData);
      }
      const searchedExercises = filterExercisesByQuery(
        exercisesData,
        normalizedSearch,
      );

      setExercises(searchedExercises);
      setSearchInput("");
      setIsSearchOpen(false);
      navigate("/");
      setTimeout(() => {
        const exercisesSection = document.getElementById("exercises");
        if (exercisesSection) {
          exercisesSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropDownMenuRef.current &&
        !dropDownMenuRef.current.contains(event.target)
      ) {
        setIsDropDownMenuOpen(false);
        setIsSearchOpen(false);
        setIsSortMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box position="relative" ref={dropDownMenuRef}>
      <Stack
        direction="row"
        sx={{
          gap: { sm: "40px", xs: "16px" },
          justifyContent: "space-between",
          alignItems: "center",
          px: { sm: 3, xs: 2 },
          py: 1,
          borderRadius: "16px",
          background: navBackground,
        }}
      >
        <Stack direction="column" spacing={0.1} alignItems="flex-start">
          <Typography
            sx={{ fontSize: { xs: "20px", sm: "24px" }, fontWeight: 800 }}
          >
            {pageTitle}
          </Typography>
        </Stack>
        <Box
          sx={{
            position: "relative",
            marginLeft: "auto",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
          }}
        >
          {(isHomePage || isExercisesPage) && (
            <Stack direction="row" spacing={1} alignItems="center">
              {isExercisesPage && (
                <Box sx={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      setIsSortMenuOpen((prev) => !prev);
                      setIsSearchOpen(false);
                    }}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "none",
                      borderRadius: "10px",
                      backgroundColor: "#020202",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label="Sort exercises"
                    title={`Sort: ${exerciseSortOrder === "az" ? "A-Z" : "Z-A"}`}
                  >
                    <FilterListOutlinedIcon fontSize="small" />
                  </button>

                  {isSortMenuOpen && (
                    <Stack
                      direction="column"
                      sx={{
                        position: "absolute",
                        top: "46px",
                        right: 0,
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.15)",
                        p: "6px",
                        minWidth: "150px",
                        zIndex: 10000,
                      }}
                    >
                      <button
                        onClick={() => {
                          setExerciseSortOrder("az");
                          setIsSortMenuOpen(false);
                        }}
                        style={{
                          height: "34px",
                          border: "none",
                          borderRadius: "8px",
                          backgroundColor:
                            exerciseSortOrder === "az" ? "#ffe9e9" : "#fff",
                          color: "#1f1f1f",
                          cursor: "pointer",
                          textAlign: "left",
                          padding: "0 10px",
                        }}
                      >
                        Silazno (A-Z)
                      </button>
                      <button
                        onClick={() => {
                          setExerciseSortOrder("za");
                          setIsSortMenuOpen(false);
                        }}
                        style={{
                          height: "34px",
                          border: "none",
                          borderRadius: "8px",
                          backgroundColor:
                            exerciseSortOrder === "za" ? "#ffe9e9" : "#fff",
                          color: "#1f1f1f",
                          cursor: "pointer",
                          textAlign: "left",
                          padding: "0 10px",
                        }}
                      >
                        Uzlazno (Z-A)
                      </button>
                    </Stack>
                  )}
                </Box>
              )}

              <button
                onClick={() => {
                  setIsSearchOpen((prev) => !prev);
                  setIsSortMenuOpen(false);
                }}
                style={{
                  width: "48px",
                  height: "48px",
                  border: "none",
                  borderRadius: "12px",
                  backgroundColor: "#020202",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <SearchOutlinedIcon />
              </button>
            </Stack>
          )}

          {isProfilePage && (
            <button
              onClick={toggleDropDownMenu}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <SettingsIcon
                sx={{ fontSize: "48px", verticalAlign: "middle" }}
              />
            </button>
          )}
          {isProfilePage && isDropDownMenuOpen && (
            <Stack
              className="profile-menu-surface"
              direction="column"
              sx={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                padding: "8px 0",
                minWidth: "180px",
                zIndex: 1000,
              }}
            >
              <button
                onClick={toggleDarkMode}
                style={{
                  margin: "4px 12px",
                  height: "40px",
                  width: "calc(100% - 24px)",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#020202",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {isDarkMode ? (
                  <DarkModeOutlinedIcon />
                ) : (
                  <LightModeOutlinedIcon />
                )}
                {isDarkMode ? "Dark" : "Light"}
              </button>
              <button
                onClick={changeLanguage}
                style={{
                  margin: "4px 12px",
                  height: "40px",
                  width: "calc(100% - 24px)",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#020202",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {i18n.language === "hr" ? "EN" : "HR"}
              </button>
              <button
                onClick={() => {
                  navigate("/Profile?edit=1");
                  setIsDropDownMenuOpen(false);
                }}
                style={{
                  margin: "4px 12px",
                  height: "40px",
                  width: "calc(100% - 24px)",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#020202",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Edit profile
              </button>
            </Stack>
          )}
        </Box>
      </Stack>

      {isSearchOpen && (
        <Box
          className="search-panel"
          sx={{
            position: "absolute",
            top: "70px",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            autoFocus
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value.toLowerCase())}
            onKeyPress={handleKeyPress}
            placeholder="Search exercises..."
            style={{
              width: "100%",
              padding: "12px",
              paddingRight: searchInput ? "44px" : "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: "26px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "28px",
                height: "28px",
                border: "none",
                borderRadius: "999px",
                backgroundColor: "#020202",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </Box>
      )}
    </Box>
  );
};
export default Navbar;

//9.linija -> Stack se koristi za organizaciju elemenata u horizontalnom smjeru (direction="row") i postavlja razmak između elemenata (gap) te marginu na vrhu (marginTop) ovisno o veličini ekrana (sm i xs)
//         -> px je padding horizontalno, gap je razmak između elemenata, marginTop je razmak od vrha, justifyContent je poravnanje elemenata
