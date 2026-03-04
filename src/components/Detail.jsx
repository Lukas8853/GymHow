import React, { useContext, useState } from "react";
import { Typography, Stack, Button } from "@mui/material";
import { AppContext } from "../AppContext";

import BodyPartImage from "../assets/icons/body-part.png";
import TargetImage from "../assets/icons/target.png";
import EquipmentImage from "../assets/icons/equipment.png";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useTranslation, Trans } from "react-i18next";
const Detail = ({ exerciseDetail }) => {
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
      name: isFavorite ? t("detail.removeFromFavorite") : t("detail.addToFavorite"),
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

export default Detail;
