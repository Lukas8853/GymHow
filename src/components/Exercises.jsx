import React, { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { Box, Stack, Typography } from "@mui/material/";

import { exerciseOptions, fetchData } from "../utils/fetchData";
import ExerciseCard from "./ExerciseCard";

const Exercises = ({ exercises, setExercises, bodyPart }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 4; //broj vježbi koje se prikazuju na jednoj stranici

  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = Array.isArray(exercises)
    ? exercises.slice(indexOfFirstExercise, indexOfLastExercise)
    : []; //računa se do koje vježbe se pokazuje na jednoj stranici i na kojoj vježbi krenut na drugoj stranici
  //ako možemo povući vježbe, onda se slice-aju, a ako ne možemo onda se currentExercises postavlja kao prazno polje kako ne bi doslo do errora

  const paginate = (e, value) => {
    //event = e, value = page number
    setCurrentPage(value);
    window.scrollTo({ top: 1800, behavior: "smooth" }); //vraća nas na vrh stranice
  };

  useEffect(() => {
    //funkcija za dohvaćanje vježbi, ovisno o tome koji bodyPart je odabran
    const fetchExercisesData = async () => {
      const cachedExercises = localStorage.getItem(`exercises_${bodyPart}`);
      if (cachedExercises) {
        setExercises(JSON.parse(cachedExercises));
        return;
      } //ako su vježbe već dohvaćene i spremljene u localStorage, onda se one koriste umjesto da se ponovo dohvaćaju s API-ja
      // tako možemo smanjiti broj API poziva i ubrzati učitavanje vježbi

      let exercisesData = [];

      if (bodyPart === "all") {
        exercisesData = await fetchData(
          "https://exercisedb.p.rapidapi.com/exercises",
          exerciseOptions,
        ); //ako je bodyPart all onda se sve ispise
      } else {
        exercisesData = await fetchData(
          `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`,
          exerciseOptions,
        ); //ako nije all onda se ispise samo taj bodyPart
      }

      localStorage.setItem(
        `exercises_${bodyPart}`,
        JSON.stringify(exercisesData),
      );
      setExercises(exercisesData);
    };
    fetchExercisesData();
  }, [bodyPart]); //ako se promjeni bodyPart, onda se poziva useEffect i mijenja se currentPage na 1

  //console.log(exercises);
  return (
    <Box id="exercises" sx={{ mt: { lg: "110px" } }} mt="50px" p="20px">
      <Typography variant="h3" mb="46px">
        Showing Results
      </Typography>
      <Stack
        direction={{ lg: "row", xs: "column" }}
        sx={{ gap: { lg: "110px", xs: "50px" } }}
        flex="wrap"
        justifyContent="center"
      >
        {currentExercises.map((exercise, index) => (
          <ExerciseCard key={index} exercise={exercise} />
        ))}
      </Stack>
      <Stack mt="100px" alignItems="center">
        {exercises.length > 9 && (
          <Pagination
            color="standard"
            shape="rounded"
            defaultPage={1}
            count={Math.ceil(exercises.length / exercisesPerPage)}
            page={currentPage}
            onChange={paginate}
            size="large"
          />
        )}
      </Stack>
    </Box>
  );
};

export default Exercises;

//pagination kod mijenjaj u 27. liniji
