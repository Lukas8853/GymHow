import React, { useContext, useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { Box, Stack, Typography } from "@mui/material/";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  EXERCISES_CACHE_KEY,
  fetchAllExercises,
  getExerciseBodyParts,
  normalizeExercisesResponse,
  readCachedJson,
  writeCachedJson,
} from "../utils/fetchData";
import { AppContext } from "../AppContext";
import ExerciseCard from "./ExerciseCard";
import { useTranslation } from "react-i18next";

const Exercises = ({ exercises, setExercises, bodyPart, detailFilter }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const isFullscreen = useMediaQuery("(min-width:1200px)");
  const exercisesPerPage = isFullscreen ? 6 : 4; // broj vježbi po stranici ovisno o veličini ekrana
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
    setCurrentPage(1);
  }, [bodyPart, detailFilter]);

  useEffect(() => {
    //funkcija za dohvaćanje vježbi, ovisno o tome koji bodyPart je odabran
    const fetchExercisesData = async () => {
      const cachedAllExercises = readCachedJson(EXERCISES_CACHE_KEY, []);
      const normalizedCachedExercises =
        normalizeExercisesResponse(cachedAllExercises);
      const allExercises =
        normalizedCachedExercises.length > 0
          ? normalizedCachedExercises
          : await fetchAllExercises();

      if (!Array.isArray(allExercises)) {
        setExercises([]);
        return;
      }

      if (allExercises.length > 0) {
        writeCachedJson(EXERCISES_CACHE_KEY, allExercises);
      }

      const filterType = String(detailFilter?.type || "bodyPart").toLowerCase();
      const filterValue = String(
        detailFilter?.value || bodyPart || "all",
      ).toLowerCase();

      const exercisesData =
        filterType === "bodypart"
          ? filterValue === "all"
            ? allExercises
            : allExercises.filter((exercise) =>
                getExerciseBodyParts(exercise).includes(filterValue),
              )
          : filterType === "target"
            ? allExercises.filter(
                (exercise) =>
                  String(exercise?.target || "").toLowerCase() === filterValue,
              )
            : filterType === "equipment"
              ? allExercises.filter(
                  (exercise) =>
                    String(exercise?.equipment || "").toLowerCase() ===
                    filterValue,
                )
              : allExercises;

      setExercises(exercisesData);
    };
    fetchExercisesData();
  }, [bodyPart, detailFilter]); //ako se promjeni filter, onda se dohvaćanje i prikaz osvježe

  //console.log(exercises);
  return (
    <Box id="exercises" sx={{ mt: { lg: "110px" } }} mt="50px" p="20px">
      <Typography variant="h3" mb="46px">
        {t("exercises.showingResults")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
            xl: "repeat(3, minmax(0, 1fr))",
          },
          gap: { xs: "40px", sm: "32px", lg: "48px" },
          justifyItems: "center",
        }}
      >
        {currentExercises.map((exercise, index) => (
          <ExerciseCard key={index} exercise={exercise} />
        ))}
      </Box>
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
