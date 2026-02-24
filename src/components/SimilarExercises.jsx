import React from "react";
import { Box, Stack, Typography } from "@mui/material";

import HorizontalScrollbar from "./HorizontalScrollbar";
import Loader from "./Loader";

const SimilarExercises = ({
  targetMuscleExercises,
  equipmentMuscleExercises,
}) => {
  return (
    <Box sx={{ marginTop: { lg: "100px", xs: "0" } }}>
      <Typography variant="h3" marginBottom={5}>
        Exercises that target the same muscle group
      </Typography>
      <Stack direction="row" sx={{ padding: "2", position: "relative" }}>
        {targetMuscleExercises.length ? 
          <HorizontalScrollbar data={targetMuscleExercises} />
         :
          <Loader />
        }
      </Stack>
      <Typography variant="h3" marginBottom={5} marginTop={5}>
        Exercises that use the same equipment
      </Typography>
      <Stack direction="row" sx={{ padding: "2", position: "relative" }}>
        {equipmentMuscleExercises.length ? 
          <HorizontalScrollbar data={equipmentMuscleExercises} />
         :
          <Loader />
        }
      </Stack>
    </Box>
  );
};

export default SimilarExercises;
