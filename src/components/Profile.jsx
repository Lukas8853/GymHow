import React, { useContext, useState } from "react";
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
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { AppContext } from "../AppContext";
import { useTranslation } from "react-i18next";
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
  const { refreshUserProfile } = useContext(AppContext);

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
      const result = await createUserWithEmailAndPassword(auth, email, password);
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
    border: "1.5px solid #e0e0e0",
    backgroundColor: "#fff",
    color: "#333",
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography sx={{ fontSize: "22px", fontWeight: 800 }}>
            {mode === "login" ? "Prijava" : "Registracija"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Google gumb */}
        <button style={btnGoogle} onClick={handleGoogleLogin} disabled={loading}>
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
              <Typography sx={{ fontSize: "12px", color: "#888", mb: 0.5, ml: 0.5 }}>
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
            <Typography sx={{ color: "#e53935", fontSize: "13px", textAlign: "center" }}>
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
        <Typography sx={{ textAlign: "center", mt: 2.5, fontSize: "14px", color: "#666" }}>
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

// ─── Main Profile Component ───────────────────────────────────────────────────
const Profile = () => {
  const { user, userProfile, authLoading, favorites, exercises } =
    useContext(AppContext);
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const favoriteExercises =
    exercises?.filter((ex) => favorites.includes(ex.id)) || [];

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

          <Typography sx={{ fontSize: "24px", fontWeight: 800, textAlign: "center" }}>
            Moj profil
          </Typography>

          <Typography
            sx={{ color: "#888", textAlign: "center", maxWidth: "280px", lineHeight: 1.5 }}
          >
            Prijavi se kako bi pratio svoje omiljene vježbe i personalizirao aplikaciju.
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
  const displayName = userProfile?.displayName || user.displayName || "Korisnik";
  const email = userProfile?.email || user.email;
  const birthDate = userProfile?.birthDate;
  // Google korisnici imaju photoURL, email/pass korisnici nemaju
  const photoURL = user.photoURL || null;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <Box sx={{ padding: "20px 20px 40px" }}>
      {/* Profil kartica */}
      <Box
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
            <Typography sx={{ fontSize: "20px", fontWeight: 800, lineHeight: 1.2 }}>
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#888", mt: 0.5 }}>
              {email}
            </Typography>
            {birthDate && (
              <Typography sx={{ fontSize: "12px", color: "#aaa", mt: 0.3 }}>
                🎂 {new Date(birthDate).toLocaleDateString("hr-HR")}
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
            <Typography sx={{ fontSize: "28px", fontWeight: 800, color: "#5ebb4c" }}>
              {favoriteExercises.length}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#888" }}>
              Omiljenih vježbi
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Omiljene vježbe */}
      <Typography sx={{ fontSize: "20px", fontWeight: 800, mb: 2 }}>
        Omiljene vježbe ({favoriteExercises.length})
      </Typography>

      {favoriteExercises.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#bbb" }}>
          <Typography sx={{ fontSize: "40px", mb: 1 }}>🤍</Typography>
          <Typography sx={{ fontSize: "15px" }}>
            Nemate omiljene vježbe još.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {favoriteExercises.map((exercise) => (
            <Box
              key={exercise.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                backgroundColor: "#f9f9f9",
                borderRadius: "16px",
                padding: "12px",
                border: "1px solid #f0f0f0",
              }}
            >
              <Box
                component="img"
                src={exercise.gifUrl}
                alt={exercise.name}
                loading="lazy"
                sx={{ width: 70, height: 70, borderRadius: "10px", objectFit: "cover" }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{ fontWeight: 700, fontSize: "15px", textTransform: "capitalize" }}
                >
                  {exercise.name}
                </Typography>
                <Typography
                  sx={{ fontSize: "12px", color: "#888", textTransform: "capitalize" }}
                >
                  {exercise.target} · {exercise.equipment}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Profile;