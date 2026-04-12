import React, { useContext } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { AppContext } from "../AppContext";

import Icon from "../assets/icons/gym.png";
import All from "../assets/icons/bodyParts/FullBody.png";
import Back from "../assets/icons/bodyParts/back.png";
import Cardio from "../assets/icons/bodyParts/cardio.png";
import Chest from "../assets/icons/bodyParts/chest.png";
import LowerArms from "../assets/icons/bodyParts/lowerArms.png";
import LowerLegs from "../assets/icons/bodyParts/lowerLegs.png";
import Neck from "../assets/icons/bodyParts/neck.png";
import Shoulders from "../assets/icons/bodyParts/shoulders.png";
import UpperArms from "../assets/icons/bodyParts/upperArms.png";
import UpperLegs from "../assets/icons/bodyParts/upperLegs.png";
import Waist from "../assets/icons/bodyParts/waist.png";
import { useTranslation } from "react-i18next";
const BodyPart = ({ item, setBodyPart, bodyPart }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useContext(AppContext);
  return (
    <Stack
      type="button"
      alignItems="center"
      justifyContent="center"
      className="bodyPart-card"
      sx={{
        borderTop: bodyPart === item ? "4px solid #ff2625" : "",
        background: "#fff",
        borderBottomLeftRadius: "20px",
        width: { xs: "220px", sm: "248px", md: "270px" },
        height: { xs: "230px", sm: "255px", md: "280px" },
        cursor: "pointer",
        gap: { xs: "26px", sm: "34px", md: "47px" },
      }}
      onClick={() => {
        setBodyPart(item);
        window.scrollTo({ top: 1800, left: 100, behavior: "smooth" });
      }}
    >
      <Box
        sx={{
          width: { xs: "78px", sm: "88px", md: "96px" },
          height: { xs: "78px", sm: "88px", md: "96px" },
          borderRadius: "50%",
          backgroundColor: isDarkMode ? "#ffffff" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={
            item === "all"
              ? All
              : item === "back"
                ? Back
                : item === "cardio"
                  ? Cardio
                  : item === "chest"
                    ? Chest
                    : item === "lower arms"
                      ? LowerArms
                      : item === "lower legs"
                        ? LowerLegs
                        : item === "neck"
                          ? Neck
                          : item === "shoulders"
                            ? Shoulders
                            : item === "upper arms"
                              ? UpperArms
                              : item === "upper legs"
                                ? UpperLegs
                                : Waist
          } //ako je item all onda se stavi All, ako je back onda se stavi Back itd.
          alt={item}
          style={{ width: "56px", height: "56px" }}
        />
      </Box>
      <Typography
        fontSize={{ xs: "20px", sm: "22px", md: "24px" }}
        fontWeight="bold"
        color="#3A1212"
        textTransform="capitalize"
      >
        {t(`bodyParts.${item}`, item)}
      </Typography>
    </Stack>
  );
};

export default BodyPart;
