import React, { useContext } from "react";
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
  const { bodyPart, name, target, equipment, id, instructions } =
    exerciseDetail;
  const { favorites, toggleFavorite } = useContext(AppContext);
  const isFavorite = favorites.includes(id);
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
      name,
      target,
      equipment,
      bodyPart,
      defaultValue: t("detail.description", { name, target }),
    },
  );

  const exerciseDescription = instructionDescription
    ? t("detail.instructionsPrefix", {
        name,
        instructions: instructionDescription,
      })
    : dynamicDescription;

  const extraDetail = [
    { icon: BodyPartImage, name: bodyPart },
    { icon: TargetImage, name: target },
    { icon: EquipmentImage, name: equipment },
    {
      icon: FavoriteIcon,
      iconSize: 42,
      iconColor: isFavorite ? "#e53935" : "#9e9e9e",
      name: isFavorite
        ? t("detail.removeFromFavorite")
        : t("detail.addToFavorite"),
      onClick: () => {
        toggleFavorite(id);
      },
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
        alt={name}
        className="detail-image"
      />
      <Stack sx={{ gap: { lg: "35px", xs: "20px" } }}>
        <Typography variant="h3">{name}</Typography>
        <Typography variant="h6">{exerciseDescription}</Typography>
        {extraDetail.map((item) => (
          <Stack key={item.name} direction="row" gap="24px" alignItems="center">
            <Button
              onClick={item.onClick}
              sx={{
                background: "#fff2db",
                borderRadius: "50%",
                width: "100px",
                height: "100px",
                minWidth: "100px",
                padding: 0,
                flex: "0 0 100px",
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
            <Typography textTransform="capitalize" variant="h5">
              {item.name}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default Detail;
