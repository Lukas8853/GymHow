import React, { useContext } from "react";
import { Typography, Stack, Button, Box, Divider } from "@mui/material";
import { AppContext } from "../AppContext";
import { useTranslation } from "react-i18next";

import BodyPartImage from "../assets/icons/body-part.png";
import TargetImage from "../assets/icons/target.png";
import EquipmentImage from "../assets/icons/equipment.png";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const ExerciseDetail = ({ exerciseDetail }) => {
  const { bodyPart, gifUrl, name, target, equipment, id } = exerciseDetail;
  const { favorites, toggleFavorite } = useContext(AppContext);
  const isFavorite = favorites.includes(id);
  const { t } = useTranslation();

  const extraDetail = [
    { icon: BodyPartImage, name: bodyPart },
    { icon: TargetImage, name: target },
    { icon: EquipmentImage, name: equipment },
    {
      icon: isFavorite ? FavoriteIcon : FavoriteBorderIcon,
      name: isFavorite
        ? t("detail.removeFromFavorite")
        : t("detail.addToFavorite"),
      onClick: () => toggleFavorite(id),
    },
  ];

  return (
    <Stack
      gap="60px"
      sx={{
        flexDirection: { lg: "row" },
        padding: "20px",
        alignItems: "center",
      }}
    >
      <img src={gifUrl} alt={name} loading="lazy" className="detail-image" />
      <Stack sx={{ gap: { lg: "35px", xs: "20px" } }}>
        <Typography variant="h3">{name}</Typography>
        <Typography variant="h6">
          {t("detail.description", { name, target })}
        </Typography>
        {extraDetail.map((item) => (
          <Stack key={item.name} direction="row" gap="24px" alignItems="center">
            <Button
              onClick={item.onClick}
              sx={{
                background: "#fff2db",
                borderRadius: "50%",
                width: "100px",
                height: "100px",
              }}
            >
              {typeof item.icon === "string" ? (
                <img
                  src={item.icon}
                  alt={bodyPart}
                  style={{ width: "50px", height: "50px" }}
                />
              ) : (
                <item.icon style={{ width: "50px", height: "50px" }} />
              )}
            </Button>
            <Typography textTransform="capitalize" variant="h5">
              {item.name}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

const Profile = () => {
  const { favorites, exercises } = useContext(AppContext);
  const { t } = useTranslation();

  // Filtriraj sve vježbe koje su u favoritima
  const favoriteExercises =
    exercises?.filter((ex) => favorites.includes(ex.id)) || [];

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h2" sx={{ mb: 4, textAlign: "center" }}>
        {t("profile.title", "My Profile")}
      </Typography>

      <Typography variant="h4" sx={{ mb: 2 }}>
        {t("profile.favorites", "Favourite Exercises")} (
        {favoriteExercises.length})
      </Typography>

      {favoriteExercises.length === 0 ? (
        <Typography
          variant="h6"
          sx={{ color: "gray", mt: 4, textAlign: "center" }}
        >
          {t("profile.noFavorites", "You have no favourite exercises yet.")}
        </Typography>
      ) : (
        favoriteExercises.map((exercise, index) => (
          <Box key={exercise.id}>
            <ExerciseDetail exerciseDetail={exercise} />
            {index < favoriteExercises.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))
      )}
    </Box>
  );
};

export default Profile;
