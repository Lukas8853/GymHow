import React from "react";
import { Stack, Typography } from "@mui/material";

import Icon from "../assets/icons/gym.png";
import All from "../assets/icons/bodyParts/FullBody.png";
import Back from "../assets/icons/bodyParts/back.png";
import Chest from "../assets/icons/bodyParts/chest.png";
import LowerArms from "../assets/icons/bodyParts/lowerArms.png";
import LowerLegs from "../assets/icons/bodyParts/lowerLegs.png";
import Neck from "../assets/icons/bodyParts/neck.png";
import Shoulders from "../assets/icons/bodyParts/shoulders.png";
import UpperArms from "../assets/icons/bodyParts/upperArms.png";
import UpperLegs from "../assets/icons/bodyParts/upperLegs.png";
import Waist from "../assets/icons/bodyParts/waist.png";

const BodyPart = ({ item, setBodyPart, bodyPart }) => {
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
        width: "270px",
        height: "280px",
        cursor: "pointer",
        gap: "47px",
      }}
      onClick={() => {
        setBodyPart(item);
        window.scrollTo({ top: 1800, left: 100, behavior: "smooth" });
      }}
    >
      <img
        src={
          item === "all"
            ? All
            : item === "back"
              ? Back
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
        style={{ width: "40px", height: "40px" }}
      />
      <Typography
        fontSize="24px"
        fontWeight="bold"
        color="#3A1212"
        textTransform="capitalize"
      >
        {item}
      </Typography>
    </Stack>
  );
};

export default BodyPart;
