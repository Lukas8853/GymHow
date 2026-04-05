import React, { useState, useContext } from "react";
import { Box } from "@mui/material";

import { AppContext } from "../AppContext";
import HeroBanner from "../components/HeroBanner";
import SearchExercises from "../components/SearchExercises";
import Exercises from "../components/Exercises";

const Home = () => {
  const [bodyPart, setBodyPart] = useState("all");
  const { exercises, setExercises } = useContext(AppContext);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1488px",
        mx: "auto",
        px: { xs: 2, sm: 4, lg: 6 },
      }}
    >
      <HeroBanner />
      <SearchExercises
        setExercises={setExercises}
        bodyPart={bodyPart}
        setBodyPart={setBodyPart}
      />
      <Exercises
        exercises={exercises}
        setExercises={setExercises}
        bodyPart={bodyPart}
      />
    </Box>
  );
};

export default Home;
