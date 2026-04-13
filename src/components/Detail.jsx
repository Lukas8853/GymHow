import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Stack, Button } from "@mui/material";
import { AppContext } from "../AppContext";

import BodyPartImage from "../assets/icons/body-part.png";
import TargetImage from "../assets/icons/target.png";
import EquipmentImage from "../assets/icons/equipment.png";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useTranslation } from "react-i18next";
import placeholder from "../assets/images/placeholder.png";
import ExerciseImage from "./ExerciseImage";

const Detail = ({ exerciseDetail }) => {
  const navigate = useNavigate();
  const { bodyPart, name, target, equipment, id, instructions } =
    exerciseDetail;
  const displayName =
    typeof name === "string" && name.length > 0
      ? name.charAt(0).toUpperCase() + name.slice(1)
      : name;
  const { favorites, toggleFavorite, user } = useContext(AppContext);
  const isUserLoggedIn = user !== null;
  const isFavorite = isUserLoggedIn && favorites.includes(id);
  const { t } = useTranslation();

  const instructionDescription = Array.isArray(instructions)
    ? instructions
        .filter((item) => typeof item === "string" && item.trim())
        .slice(0, 2)
        .join(" ")
    : "";

  const descriptionVariantIndex =
    Array.from(String(id || "")).reduce(
      (sum, character) => sum + character.charCodeAt(0),
      0,
    ) % 4;

  const dynamicDescription = t(
    `detail.dynamicDescriptions.${descriptionVariantIndex}`,
    {
      name: displayName,
      target,
      equipment,
      bodyPart,
      defaultValue: t("detail.description", { name: displayName, target }),
    },
  );

  const exerciseDescription = instructionDescription
    ? t("detail.instructionsPrefix", {
        name: displayName,
        instructions: instructionDescription,
      })
    : dynamicDescription;

  const extraDetail = [
    {
      icon: BodyPartImage,
      name: bodyPart,
      onClick: () => {
        navigate(`/?bodyPart=${encodeURIComponent(bodyPart)}`);
      },
    },
    {
      icon: TargetImage,
      name: target,
      onClick: () => {
        navigate(`/?target=${encodeURIComponent(target)}`);
      },
    },
    {
      icon: EquipmentImage,
      name: equipment,
      onClick: () => {
        navigate(`/?equipment=${encodeURIComponent(equipment)}`);
      },
    },
    {
      icon: FavoriteIcon,
      iconSize: 42,
      iconColor: !isUserLoggedIn
        ? "#cccccc"
        : isFavorite
          ? "#e53935"
          : "#9e9e9e",
      name: isFavorite
        ? t("detail.removeFromFavorite")
        : t("detail.addToFavorite"),
      onClick: () => {
        if (isUserLoggedIn) {
          toggleFavorite(id);
        }
      },
      disabled: !isUserLoggedIn,
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
      <ExerciseImage
        exercise={exerciseDetail}
        fallbackSrc={placeholder}
        alt={displayName}
        className="detail-image"
      />
      <Stack sx={{ gap: { lg: "35px", xs: "20px" } }}>
        <Typography variant="h3">{displayName}</Typography>
        <Typography variant="h6">{exerciseDescription}</Typography>
        {extraDetail.map((item) => (
          <Stack key={item.name} direction="row" gap="24px" alignItems="center">
            <Button
              onClick={item.onClick}
              disabled={item.disabled || false}
              sx={{
                background: item.disabled ? "#f0f0f0" : "#fff2db",
                borderRadius: "50%",
                width: "100px",
                height: "100px",
                minWidth: "100px",
                padding: 0,
                flex: "0 0 100px",
                cursor: item.disabled ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: item.disabled ? 0.6 : 1,
                "&:hover": !item.disabled
                  ? {
                      transform: "scale(1.08)",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                    }
                  : {},
              }}
            >
              {typeof item.icon === "string" ? (
                <img
                  src={item.icon}
                  alt={bodyPart}
                  style={{ width: "50px", height: "50px" }}
                />
              ) : (
                <item.icon
                  sx={{
                    fontSize: item.iconSize || 50,
                    width: item.iconSize || 50,
                    height: item.iconSize || 50,
                    lineHeight: 1,
                    color: item.iconColor || "inherit",
                  }}
                />
              )}
            </Button>
            <Typography
              textTransform="capitalize"
              variant="h5"
              sx={{
                color: item.disabled ? "#999999" : "inherit",
                opacity: item.disabled ? 0.7 : 1,
              }}
            >
              {item.name}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default Detail;
