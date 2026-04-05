import React, { useContext, useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { Box, Stack, Typography } from "@mui/material/";

import {
  EXERCISES_CACHE_KEY,
  fetchAllExercises,
  readCachedJson,
  writeCachedJson,
} from "../utils/fetchData";
import { AppContext } from "../AppContext";
import ExerciseCard from "./ExerciseCard";
import { useTranslation } from "react-i18next";

const Exercises = ({ exercises, setExercises, bodyPart }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 4; //broj vježbi koje se prikazuju na jednoj stranici
  const { t } = useTranslation();
  const { isDarkMode } = useContext(AppContext);

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
      const cachedAllExercises = readCachedJson(EXERCISES_CACHE_KEY, []);
      const allExercises =
        Array.isArray(cachedAllExercises) && cachedAllExercises.length > 0
          ? cachedAllExercises
          : await fetchAllExercises();

      if (!Array.isArray(allExercises)) {
        setExercises([]);
        return;
      }

      if (allExercises.length > 0) {
        writeCachedJson(EXERCISES_CACHE_KEY, allExercises);
      }

      const normalizedBodyPart = String(bodyPart || "").toLowerCase();
      const exercisesData =
        normalizedBodyPart === "all"
          ? allExercises
          : allExercises.filter(
              (exercise) =>
                String(exercise?.bodyPart || "").toLowerCase() ===
                normalizedBodyPart,
            );

      setExercises(exercisesData);
    };
    fetchExercisesData();
  }, [bodyPart]); //ako se promjeni bodyPart, onda se poziva useEffect i mijenja se currentPage na 1

  //console.log(exercises);
  return (
    <Box id="exercises" sx={{ mt: { lg: "110px" } }} mt="50px" p="20px">
      <Typography variant="h3" mb="46px">
        {t("exercises.showingResults")}
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
            sx={{
              "& .MuiPaginationItem-root": {
                color: isDarkMode ? "#ffffff" : "#000000",
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                color: isDarkMode ? "#ffffff" : "#000000",
                backgroundColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.08)",
              },
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export default Exercises;

//pagination kod mijenjaj u 27. liniji
