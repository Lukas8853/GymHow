import React from "react";
import { Link } from "react-router-dom";
import { Button, Stack, Typography } from "@mui/material/";

const ExerciseCard = ({ exercise }) => {
  console.log(exercise);
  return (
    <Link className="exercise-card" to={`/exercise/${exercise.id}`}>
      <img src={exercise.gifUrl} alt={exercise.name} loading="lazy" />
      <Stack direction="row">
        <Button
          sx={{
            ml: "21px",
            color: "#fff",
            background: "#ffa9a9",
            fontSize: "14px",
            borderRadius: "20px",
            textTransform: "capitalize",
          }}
        >
          {exercise.bodyPart}
        </Button>
        <Button
          sx={{
            ml: "21px",
            color: "#fff",
            background: "#fcc757",
            fontSize: "14px",
            borderRadius: "20px",
            textTransform: "capitalize",
          }}
        >
          {exercise.target}
        </Button>
      </Stack>
      <Typography
        marginLeft="21px"
        color="#000"
        fontWeight="bold"
        mt="11px"
        pb="10px"
        textTransform="capitalize"
        fontSize="22px"
      >
        {exercise.name}
      </Typography>
    </Link>
  );
};

export default ExerciseCard;

// možemo platiti 12€ mjesečno da otključamo GIF-ove
// to možemo tipa u 5.mjesecu ili 6.mjesecu platit, ali dotad možemo kao placeholder staviti slike neke
// ono in case of failure dode placeholder
// onError={(e) => { e.target.src = '/placeholder.png' }}
//   <img src={exercise.gifUrl} alt={exercise.name} loading="lazy" onError={(e) => { e.target.src = '/placeholder.png' }} />
// naravno slike moramo onda dodati u neki folder mozemo ga nazvat "placeholder" u "assets"
