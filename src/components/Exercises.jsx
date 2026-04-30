import React, { useContext, useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { Box, Stack, Typography, Button } from "@mui/material/";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  EXERCISES_CACHE_KEY,
  fetchAllExercises,
  getExerciseBodyParts,
  filterExercisesByQuery,
  normalizeExercisesResponse,
  readCachedJson,
  writeCachedJson,
} from "../utils/fetchData";
import { AppContext } from "../AppContext";
import ExerciseCard from "./ExerciseCard";
import { useTranslation } from "react-i18next";

const Exercises = ({ exercises, setExercises, bodyPart, detailFilter, setDetailFilter }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const isFullscreen = useMediaQuery("(min-width:1200px)");
  const exercisesPerPage = isFullscreen ? 6 : 4;
  const { t } = useTranslation();
  const { isDarkMode } = useContext(AppContext);

  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = Array.isArray(exercises)
    ? exercises.slice(indexOfFirstExercise, indexOfLastExercise)
    : [];

  const paginate = (e, value) => {
    setCurrentPage(value);
    const el = document.getElementById("exercises");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = async () => {
    // reset to all
    setDetailFilter?.({ type: "bodyPart", value: "all" });

    const cachedExercises = readCachedJson(EXERCISES_CACHE_KEY, []);
    if (Array.isArray(cachedExercises) && cachedExercises.length > 0) {
      setExercises(cachedExercises);
      const el = document.getElementById("exercises");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const allExercises = await fetchAllExercises();
    if (Array.isArray(allExercises) && allExercises.length > 0) {
      writeCachedJson(EXERCISES_CACHE_KEY, allExercises);
      setExercises(allExercises);
    } else {
      setExercises([]);
    }

    const el = document.getElementById("exercises");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [bodyPart, detailFilter]);

  useEffect(() => {
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
          : filterType === "search"
            ? filterExercisesByQuery(allExercises, filterValue)
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
  }, [bodyPart, detailFilter]);

  // Određuje label koji se prikazuje u naslovu
  const getResultsLabel = () => {
    if (detailFilter?.value) {
      return detailFilter.value;
    }
    if (bodyPart && bodyPart !== "all") {
      return bodyPart;
    }
    return t("exercises.all");
  };

  return (
    <Box id="exercises" sx={{ mt: { lg: "110px" } }} mt="50px" p="20px">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "46px" }}>
        <Typography variant="h3" sx={{ fontSize: { xs: "24px", sm: "32px" } }}>
          {t("exercises.showingResults")} {" "}
          <span style={{ textTransform: "capitalize", fontSize: "inherit" }}>
            "{getResultsLabel()}"
          </span>
        </Typography>

        <Button
          onClick={handleReset}
          variant={isDarkMode ? "outlined" : "contained"}
          sx={{
            ml: 2,
            height: "40px",
            textTransform: "none",
            backgroundColor: isDarkMode ? "transparent" : "#FF2625",
            color: isDarkMode ? "#fff" : "#fff",
            borderColor: isDarkMode ? "rgba(255,255,255,0.12)" : undefined,
            '&:hover': {
              backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : undefined,
            }
          }}
        >
          {t('searchExercises.reset', 'Reset')}
        </Button>
      </Box>
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