import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Typography,
  Box,
  Avatar,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
} from "@mui/material";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { AppContext } from "../AppContext";
import { useTranslation } from "react-i18next";
import {
  EXERCISES_CACHE_KEY,
  fetchAllExercises,
  findExerciseById,
  readCachedJson,
  writeCachedJson,
} from "../utils/fetchData";
import ExerciseImage from "./ExerciseImage";
import placeholder from "../assets/images/placeholder.png";
import { useLocation, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// ─── Helper: spremi korisnika u Firestore (samo prvi put) ────────────────────
async function saveUserToFirestore(firebaseUser, extraData = {}) {
  const docRef = doc(db, "users", firebaseUser.uid);
  const existing = await getDoc(docRef);
  if (!existing.exists()) {
    await setDoc(docRef, {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || extraData.displayName || "",
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || "",
      birthDate: extraData.birthDate || "",
      favorite: [],
      createdAt: new Date().toISOString(),
    });
  }
}

// ─── Auth Modal (bottom sheet) ───────────────────────────────────────────────
const AuthModal = ({ onClose }) => {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshUserProfile, isDarkMode } = useContext(AppContext);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user);
      await refreshUserProfile();
      onClose();
    } catch (err) {
      setError("Google prijava nije uspjela. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await refreshUserProfile();
      onClose();
    } catch (err) {
      setError("Pogrešan email ili lozinka.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!displayName.trim()) {
      setError("Unesite korisničko ime.");
      return;
    }
    if (password.length < 6) {
      setError("Lozinka mora imati najmanje 6 znakova.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(result.user, { displayName });
      await saveUserToFirestore(result.user, { displayName, birthDate });
      await refreshUserProfile();
      onClose();
    } catch (err) {
      console.log("Register error:", err.code, err.message);
      if (err.code === "auth/email-already-in-use") {
        setError("Email je već u upotrebi.");
      } else {
        setError("Registracija nije uspjela. Pokušaj ponovo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid #e0e0e0",
    fontSize: "15px",
    outline: "none",
    fontFamily: "Josefin Sans, sans-serif",
    boxSizing: "border-box",
  };

  const btnPrimary = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#5ebb4c",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "Josefin Sans, sans-serif",
    opacity: loading ? 0.7 : 1,
  };

  const btnGoogle = {
    width: "100%",
    padding: "13px",
    borderRadius: "12px",
    border: isDarkMode ? "1.5px solid #3a3a3a" : "1.5px solid #e0e0e0",
    backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
    color: isDarkMode ? "#f5f5f5" : "#353535",
    fontSize: "15px",
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "Josefin Sans, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  };

  return (
    // Overlay
    <Box
      onClick={onClose}
      sx={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 2000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Modal panel */}
      <Box
        onClick={(e) => e.stopPropagation()}
        className="light-surface"
        sx={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#fff",
          borderRadius: "24px 24px 0 0",
          padding: "32px 24px 40px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography sx={{ fontSize: "22px", fontWeight: 800 }}>
            {mode === "login" ? "Prijava" : "Registracija"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Google gumb */}
        <button
          style={btnGoogle}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon sx={{ fontSize: "20px", color: "#EA4335" }} />
          Nastavi s Google računom
        </button>

        {/* Separator */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ my: 2.5 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography sx={{ color: "#aaa", fontSize: "13px" }}>ili</Typography>
          <Divider sx={{ flex: 1 }} />
        </Stack>

        {/* Forma */}
        <Stack spacing={1.5}>
          {mode === "register" && (
            <input
              style={inputStyle}
              placeholder="Korisničko ime"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}

          <input
            style={inputStyle}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Lozinka s eye ikonom */}
          <Box sx={{ position: "relative" }}>
            <input
              style={{ ...inputStyle, paddingRight: "48px" }}
              type={showPassword ? "text" : "password"}
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  mode === "login" ? handleEmailLogin() : handleRegister();
                }
              }}
            />
            <IconButton
              onClick={() => setShowPassword((p) => !p)}
              sx={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
              size="small"
            >
              {showPassword ? (
                <VisibilityOffIcon fontSize="small" />
              ) : (
                <VisibilityIcon fontSize="small" />
              )}
            </IconButton>
          </Box>

          {mode === "register" && (
            <Box>
              <Typography
                sx={{ fontSize: "12px", color: "#888", mb: 0.5, ml: 0.5 }}
              >
                Datum rođenja
              </Typography>
              <input
                style={inputStyle}
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </Box>
          )}

          {error && (
            <Typography
              sx={{ color: "#e53935", fontSize: "13px", textAlign: "center" }}
            >
              {error}
            </Typography>
          )}

          <button
            style={btnPrimary}
            onClick={mode === "login" ? handleEmailLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : mode === "login" ? (
              "Prijavi se"
            ) : (
              "Stvori račun"
            )}
          </button>
        </Stack>

        {/* Prebaci mode */}
        <Typography
          sx={{ textAlign: "center", mt: 2.5, fontSize: "14px", color: "#666" }}
        >
          {mode === "login" ? "Nemaš račun? " : "Već imaš račun? "}
          <span
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            style={{ color: "#5ebb4c", fontWeight: 700, cursor: "pointer" }}
          >
            {mode === "login" ? "Registriraj se" : "Prijavi se"}
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

const EditProfileModal = ({ onClose, user, userProfile }) => {
  const { refreshUserProfile, isDarkMode } = useContext(AppContext);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || user?.displayName || "",
  );
  const [email, setEmail] = useState(userProfile?.email || user?.email || "");
  const [photoURL, setPhotoURL] = useState(
    userProfile?.photoURL || user?.photoURL || "",
  );
  const [birthDate, setBirthDate] = useState(userProfile?.birthDate || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSelectedImage = (event) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Možete odabrati samo sliku za profilnu.");
      return;
    }

    const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
    if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Slika je prevelika. Maksimalna veličina je 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoURL(reader.result);
        setError("");
      }
    };
    reader.onerror = () => {
      setError("Učitavanje slike nije uspjelo. Pokušaj ponovo.");
    };
    reader.readAsDataURL(selectedFile);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid #e0e0e0",
    fontSize: "15px",
    outline: "none",
    fontFamily: "Josefin Sans, sans-serif",
    boxSizing: "border-box",
  };

  const handleSave = async () => {
    const normalizedDisplayName = displayName.trim();
    const normalizedEmail = email.trim();
    const normalizedPhotoURL = photoURL.trim();

    if (!normalizedDisplayName) {
      setError("Unesite korisničko ime.");
      return;
    }

    if (!normalizedEmail) {
      setError("Unesite email.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Korisnik nije prijavljen.");
        return;
      }

      if (
        normalizedDisplayName !== (currentUser.displayName || "") ||
        normalizedPhotoURL !== (currentUser.photoURL || "")
      ) {
        await updateProfile(currentUser, {
          displayName: normalizedDisplayName,
          photoURL: normalizedPhotoURL || "",
        });
      }

      if (normalizedEmail !== (currentUser.email || "")) {
        await updateEmail(currentUser, normalizedEmail);
      }

      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          displayName: normalizedDisplayName,
          email: normalizedEmail,
          photoURL: normalizedPhotoURL,
          birthDate,
        },
        { merge: true },
      );

      await refreshUserProfile();
      setSuccess("Profil je uspješno ažuriran.");
      setTimeout(() => onClose(), 650);
    } catch (err) {
      if (err?.code === "auth/requires-recent-login") {
        setError(
          "Za promjenu emaila se morate ponovno prijaviti (odjavite se pa prijavite).",
        );
      } else {
        setError("Spremanje promjena nije uspjelo. Pokušaj ponovo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      onClick={onClose}
      sx={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 2100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        className="light-surface"
        sx={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "#fff",
          borderRadius: "24px 24px 0 0",
          padding: "28px 20px 36px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2.5}
        >
          <Typography sx={{ fontSize: "22px", fontWeight: 800 }}>
            Edit profile
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack spacing={1.4}>
          <input
            style={inputStyle}
            placeholder="Username"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            style={inputStyle}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleSelectedImage}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleSelectedImage}
          />

          <Stack direction="row" spacing={1}>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={{
                width: "50%",
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#020202",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Josefin Sans, sans-serif",
              }}
            >
              Slikaj kamerom
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              style={{
                width: "50%",
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#020202",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Josefin Sans, sans-serif",
              }}
            >
              Galerija / Upload
            </button>
          </Stack>

          {photoURL && (
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar src={photoURL} sx={{ width: 44, height: 44 }} />
              <Typography sx={{ fontSize: "12px", color: "#666" }}>
                Nova profilna je odabrana.
              </Typography>
            </Stack>
          )}

          <Box>
            <Typography
              sx={{ fontSize: "12px", color: "#888", mb: 0.5, ml: 0.5 }}
            >
              Datum rođenja
            </Typography>
            <input
              style={inputStyle}
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </Box>

          {error && (
            <Typography
              sx={{ color: "#e53935", fontSize: "13px", textAlign: "center" }}
            >
              {error}
            </Typography>
          )}

          {success && (
            <Typography
              sx={{
                color: isDarkMode ? "#88d488" : "#2e7d32",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              {success}
            </Typography>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#5ebb4c",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Josefin Sans, sans-serif",
              opacity: loading ? 0.7 : 1,
              marginTop: "6px",
            }}
          >
            {loading ? "Spremam..." : "Spremi promjene"}
          </button>
        </Stack>
      </Box>
    </Box>
  );
};

// ─── Main Profile Component ───────────────────────────────────────────────────
const Profile = () => {
  const { user, userProfile, authLoading, favorites, exercises, isDarkMode } =
    useContext(AppContext);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [favoriteExercises, setFavoriteExercises] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [unresolvedFavoritesCount, setUnresolvedFavoritesCount] = useState(0);
  const lastFetchByIdRef = useRef(new Map());

  const FAVORITE_FETCH_COOLDOWN_MS = 60000;

  const safeExercises = useMemo(
    () => (Array.isArray(exercises) ? exercises : []),
    [exercises],
  );
  const safeFavorites = useMemo(
    () => (Array.isArray(favorites) ? favorites.map((id) => String(id)) : []),
    [favorites],
  );
  const favoriteCount = safeFavorites.length;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("edit") === "1") {
      setShowEditModal(true);
    }
  }, [location.search]);

  const closeEditModal = () => {
    setShowEditModal(false);

    const params = new URLSearchParams(location.search);
    if (params.get("edit") === "1") {
      params.delete("edit");
      const search = params.toString();
      navigate(
        {
          pathname: location.pathname,
          search: search ? `?${search}` : "",
        },
        { replace: true },
      );
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const loadFavoriteExercises = async () => {
      if (!user || safeFavorites.length === 0) {
        setFavoriteExercises([]);
        setLoadingFavorites(false);
        return;
      }

      try {
        const cachedMap = new Map();

        const cachedGlobalExercises = localStorage.getItem(EXERCISES_CACHE_KEY);
        if (cachedGlobalExercises) {
          const parsedGlobal = JSON.parse(cachedGlobalExercises);
          if (Array.isArray(parsedGlobal)) {
            parsedGlobal.forEach((exercise) => {
              if (exercise?.id) {
                cachedMap.set(String(exercise.id), exercise);
              }
            });
          }
        }

        Object.keys(localStorage).forEach((key) => {
          if (!key.startsWith("exercises_")) {
            return;
          }

          const cachedValue = localStorage.getItem(key);
          if (!cachedValue) {
            return;
          }

          const parsedValue = JSON.parse(cachedValue);
          if (!Array.isArray(parsedValue)) {
            return;
          }

          parsedValue.forEach((exercise) => {
            if (exercise?.id && !cachedMap.has(String(exercise.id))) {
              cachedMap.set(String(exercise.id), exercise);
            }
          });
        });

        const favoritesSet = new Set(safeFavorites);
        const localMatches = safeExercises
          .filter((exercise) => favoritesSet.has(String(exercise.id)))
          .concat(
            Array.from(cachedMap.values()).filter((exercise) =>
              favoritesSet.has(String(exercise.id)),
            ),
          );

        const localMap = new Map(
          localMatches.map((exercise) => [String(exercise.id), exercise]),
        );

        const missingIds = safeFavorites.filter((id) => !localMap.has(id));

        if (missingIds.length === 0) {
          const orderedLocalFavorites = safeFavorites
            .map((id) => localMap.get(id))
            .filter(Boolean);

          if (!isCancelled) {
            setFavoriteExercises(orderedLocalFavorites);
            setUnresolvedFavoritesCount(0);
            setLoadingFavorites(false);
          }
          return;
        }

        const now = Date.now();
        const idsToFetch = missingIds.filter((id) => {
          const lastFetchTime = lastFetchByIdRef.current.get(id) || 0;
          return now - lastFetchTime > FAVORITE_FETCH_COOLDOWN_MS;
        });

        if (idsToFetch.length === 0) {
          const orderedLocalFavorites = safeFavorites
            .map((id) => localMap.get(id))
            .filter(Boolean);

          const unresolvedIds = safeFavorites.filter((id) => !localMap.has(id));

          if (!isCancelled) {
            setFavoriteExercises(orderedLocalFavorites);
            setUnresolvedFavoritesCount(unresolvedIds.length);
            setLoadingFavorites(false);
          }
          return;
        }

        idsToFetch.forEach((id) => {
          lastFetchByIdRef.current.set(id, now);
        });
        setLoadingFavorites(true);

        const cachedAllExercises = readCachedJson(EXERCISES_CACHE_KEY, []);
        const allExercises =
          Array.isArray(cachedAllExercises) && cachedAllExercises.length > 0
            ? cachedAllExercises
            : await fetchAllExercises();

        if (Array.isArray(allExercises) && allExercises.length > 0) {
          writeCachedJson(EXERCISES_CACHE_KEY, allExercises);
        }

        const fetchedValid = idsToFetch
          .map((favoriteId) => findExerciseById(allExercises, favoriteId))
          .filter((exercise) => exercise && exercise.id);

        const combinedMap = new Map(localMap);
        fetchedValid.forEach((exercise) => {
          combinedMap.set(String(exercise.id), exercise);
        });

        const orderedFavorites = safeFavorites
          .map((id) => combinedMap.get(id))
          .filter(Boolean);
        const unresolvedIds = safeFavorites.filter(
          (id) => !combinedMap.has(id),
        );

        if (!isCancelled) {
          setFavoriteExercises(orderedFavorites);
          setUnresolvedFavoritesCount(unresolvedIds.length);
        }
      } finally {
        if (!isCancelled) {
          setLoadingFavorites(false);
        }
      }
    };

    loadFavoriteExercises();

    return () => {
      isCancelled = true;
    };
  }, [user, safeFavorites, safeExercises]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Loading dok Firebase inicijalizira
  if (authLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress sx={{ color: "#5ebb4c" }} />
      </Box>
    );
  }

  // Nije prijavljen
  if (!user) {
    return (
      <>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: 3,
            px: 3,
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              backgroundColor: "#f0faf0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "48px" }}>💪</Typography>
          </Box>

          <Typography
            sx={{ fontSize: "24px", fontWeight: 800, textAlign: "center" }}
          >
            Moj profil
          </Typography>

          <Typography
            sx={{
              color: "#888",
              textAlign: "center",
              maxWidth: "280px",
              lineHeight: 1.5,
            }}
          >
            Prijavi se kako bi pratio svoje omiljene vježbe i personalizirao
            aplikaciju.
          </Typography>

          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "16px 48px",
              borderRadius: "16px",
              border: "none",
              backgroundColor: "#5ebb4c",
              color: "#fff",
              fontSize: "17px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Josefin Sans, sans-serif",
              boxShadow: "0 4px 16px rgba(94,187,76,0.35)",
            }}
          >
            Prijavi se
          </button>
        </Box>

        {showModal && <AuthModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // Prijavljen - podaci
  const displayName =
    userProfile?.displayName || user.displayName || user.email || "Korisnik";
  const email = userProfile?.email || user.email;
  const birthDate = userProfile?.birthDate;
  // Google korisnici imaju photoURL, email/pass korisnici nemaju
  const photoURL = user.photoURL || null;
  const initials = String(displayName).charAt(0).toUpperCase();
  const formattedBirthDate = birthDate
    ? (() => {
        const parsed = new Date(birthDate);
        return Number.isNaN(parsed.getTime())
          ? null
          : parsed.toLocaleDateString("hr-HR");
      })()
    : null;

  return (
    <>
      <Box sx={{ padding: "20px 20px 40px" }}>
        {/* Profil kartica */}
        <Box
          className="light-surface"
          sx={{
            backgroundColor: "#f9f9f9",
            borderRadius: "20px",
            padding: "24px 20px",
            mb: 3,
            position: "relative",
          }}
        >
          {/* Logout gumb */}
          <IconButton
            onClick={handleLogout}
            sx={{
              position: "absolute",
              top: "16px",
              right: "16px",
              backgroundColor: "#fff",
              border: "1.5px solid #e0e0e0",
              "&:hover": { backgroundColor: "#fee", borderColor: "#e53935" },
            }}
            title="Odjavi se"
          >
            <LogoutIcon sx={{ fontSize: "18px", color: "#e53935" }} />
          </IconButton>

          {/* Avatar + info */}
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Avatar
              src={photoURL || undefined}
              sx={{
                width: 80,
                height: 80,
                fontSize: "32px",
                backgroundColor: "#5ebb4c",
                border: "3px solid #fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
              }}
            >
              {!photoURL && initials}
            </Avatar>

            <Box>
              <Typography
                sx={{ fontSize: "20px", fontWeight: 800, lineHeight: 1.2 }}
              >
                {displayName}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#888", mt: 0.5 }}>
                {email}
              </Typography>
              {formattedBirthDate && (
                <Typography sx={{ fontSize: "12px", color: "#aaa", mt: 0.3 }}>
                  🎂 {formattedBirthDate}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Statistike */}
          <Stack direction="row" sx={{ mt: 3 }}>
            <Box
              sx={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{ fontSize: "28px", fontWeight: 800, color: "#5ebb4c" }}
              >
                {favoriteCount}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#888" }}>
                Omiljenih vježbi
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Omiljene vježbe */}
        <Typography sx={{ fontSize: "20px", fontWeight: 800, mb: 2 }}>
          Omiljene vježbe ({favoriteCount})
        </Typography>

        {favoriteCount === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "#bbb" }}>
            <Typography sx={{ fontSize: "40px", mb: 1 }}>🤍</Typography>
            <Typography sx={{ fontSize: "15px" }}>
              Nemate omiljene vježbe još.
            </Typography>
          </Box>
        ) : loadingFavorites ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#5ebb4c" }} />
          </Box>
        ) : favoriteExercises.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
            <Typography sx={{ fontSize: "15px" }}>
              Trenutno ne mogu dohvatiti detalje omiljenih vježbi (API limit).
            </Typography>
            <Typography sx={{ fontSize: "13px", mt: 1, color: "#aaa" }}>
              Probajte ponovno za minutu.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {unresolvedFavoritesCount > 0 && (
              <Typography
                className="profile-warning-text"
                sx={{
                  fontSize: "13px",
                }}
              >
                Neke omiljene vježbe ({unresolvedFavoritesCount}) trenutno nisu
                učitane zbog API ograničenja.
              </Typography>
            )}
            {favoriteExercises.map((exercise) => (
              <Box
                key={exercise.id}
                className="light-surface"
                onClick={() => navigate(`/exercise/${exercise.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/exercise/${exercise.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  backgroundColor: "#f2f2f2",
                  borderRadius: "16px",
                  padding: "12px",
                  border: "1px solid #f0f0f0",
                  cursor: "pointer",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                  },
                  "&:focus-visible": {
                    outline: "2px solid #5ebb4c",
                    outlineOffset: "2px",
                  },
                }}
              >
                <ExerciseImage
                  exercise={exercise}
                  fallbackSrc={placeholder}
                  alt={exercise.name}
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "10px",
                    objectFit: "cover",
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "15px",
                      textTransform: "capitalize",
                      color: "#111 !important",
                    }}
                  >
                    {exercise.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#333 !important",
                      textTransform: "capitalize",
                    }}
                  >
                    {exercise.target} · {exercise.equipment}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {showEditModal && user && (
        <EditProfileModal
          onClose={closeEditModal}
          user={user}
          userProfile={userProfile}
        />
      )}
    </>
  );
};

export default Profile;
