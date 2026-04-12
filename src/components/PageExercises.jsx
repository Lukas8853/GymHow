import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Stack, Typography } from "@mui/material";
import Pagination from "@mui/material/Pagination";

import {
  BODYPARTS_CACHE_KEY,
  EXERCISES_CACHE_KEY,
  fetchAllExercises,
  filterExercisesByQuery,
  getBodyPartsFromExercises,
  readCachedJson,
  writeCachedJson,
} from "../utils/fetchData";
import placeholder from "../assets/images/placeholder.png";
import Loader from "./Loader";
import { AppContext } from "../AppContext";
import ExerciseImage from "./ExerciseImage";

const MIN_EXPECTED_CACHED_ITEMS = 200;
const EXERCISES_PER_PAGE = 25;

const PageExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { exerciseSortOrder, isDarkMode } = useContext(AppContext);
  const location = useLocation();

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("q") || "").trim().toLowerCase();
  }, [location.search]);

  const selectedBodyParts = useMemo(() => {
    const params = new URLSearchParams(location.search);

    const multiValue = (params.get("bodyParts") || "").trim().toLowerCase();
    if (multiValue) {
      return Array.from(
        new Set(
          multiValue
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      );
    }

    const legacyValue = (params.get("bodyPart") || "").trim().toLowerCase();
    if (legacyValue && legacyValue !== "all") {
      return [legacyValue];
    }

    return [];
  }, [location.search]);

  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);

      try {
        const cachedExercises = readCachedJson(EXERCISES_CACHE_KEY, null);

        if (
          Array.isArray(cachedExercises) &&
          cachedExercises.length >= MIN_EXPECTED_CACHED_ITEMS
        ) {
          setExercises(cachedExercises);
          return;
        }

        const allExercises = await fetchAllExercises();
        if (!Array.isArray(allExercises)) {
          setExercises([]);
          return;
        }

        writeCachedJson(EXERCISES_CACHE_KEY, allExercises);
        writeCachedJson(
          BODYPARTS_CACHE_KEY,
          getBodyPartsFromExercises(allExercises),
        );
        setExercises(allExercises);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    if (!Array.isArray(exercises)) {
      return [];
    }

    const queryFiltered = searchQuery
      ? filterExercisesByQuery(exercises, searchQuery)
      : exercises;

    if (selectedBodyParts.length === 0) {
      return queryFiltered;
    }

    return queryFiltered.filter((exercise) =>
      selectedBodyParts.includes(
        (exercise?.bodyPart || "").trim().toLowerCase(),
      ),
    );
  }, [exercises, searchQuery, selectedBodyParts]);

  const groupedExercises = useMemo(() => {
    if (!Array.isArray(filteredExercises)) {
      return [];
    }

    const sortedExercises = [...filteredExercises].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, {
        sensitivity: "base",
      }),
    );

    if (exerciseSortOrder === "za") {
      sortedExercises.reverse();
    }

    const grouped = sortedExercises.reduce((accumulator, exercise) => {
      const firstCharacter = (exercise.name || "")
        .trim()
        .charAt(0)
        .toUpperCase();
      const letter = /^[A-Z]$/.test(firstCharacter) ? firstCharacter : "#";

      if (!accumulator[letter]) {
        accumulator[letter] = [];
      }

      accumulator[letter].push(exercise);
      return accumulator;
    }, {});

    const orderedLetters = Object.keys(grouped).sort((a, b) =>
      exerciseSortOrder === "za" ? b.localeCompare(a) : a.localeCompare(b),
    );

    return orderedLetters.map((letter) => ({ letter, items: grouped[letter] }));
  }, [filteredExercises, exerciseSortOrder]);

  const groupedExercisePages = useMemo(() => {
    const pages = [];
    let currentPageGroups = [];
    let remainingSlots = EXERCISES_PER_PAGE;

    groupedExercises.forEach((group) => {
      let groupItems = Array.isArray(group.items) ? [...group.items] : [];

      while (groupItems.length > 0) {
        if (remainingSlots === 0) {
          pages.push(currentPageGroups);
          currentPageGroups = [];
          remainingSlots = EXERCISES_PER_PAGE;
        }

        const itemsToTake = Math.min(groupItems.length, remainingSlots);
        const itemChunk = groupItems.slice(0, itemsToTake);
        groupItems = groupItems.slice(itemsToTake);

        currentPageGroups.push({
          letter: group.letter,
          items: itemChunk,
        });

        remainingSlots -= itemsToTake;
      }
    });

    if (currentPageGroups.length > 0) {
      pages.push(currentPageGroups);
    }

    return pages.length > 0 ? pages : [[]];
  }, [groupedExercises]);

  const totalPages = groupedExercisePages.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [exerciseSortOrder, searchQuery, selectedBodyParts]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedGroups = groupedExercisePages[currentPage - 1] || [];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box mt="50px" p="20px" pb="120px">
      <Typography variant="h3" mb="30px">
        Exercises {exerciseSortOrder === "za" ? "Z-A" : "A-Z"}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb="20px">
        Total exercises: {filteredExercises.length}
      </Typography>

      {isLoading ? (
        <Loader />
      ) : (
        <Stack gap="28px">
          {paginatedGroups.map((group) => (
            <Box key={group.letter}>
              <Typography variant="h4" fontWeight={700} mb="14px">
                {group.letter}
              </Typography>

              <Stack gap="10px">
                {group.items.map((exercise) => (
                  <Link
                    key={exercise.id}
                    to={`/exercise/${exercise.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: "8px 12px",
                        borderRadius: "10px",
                        backgroundColor: isDarkMode ? "#f1f1f1" : "transparent",
                        color: "#111",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#e9e9e9" : "#f7f7f7",
                        },
                      }}
                    >
                      <ExerciseImage
                        exercise={exercise}
                        fallbackSrc={placeholder}
                        alt={exercise.name}
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid #e7e7e7",
                        }}
                      />
                      <Typography
                        className="exercise-name-text"
                        fontSize="18px"
                        textTransform="capitalize"
                        sx={{ color: "#111 !important" }}
                      >
                        {exercise.name}
                      </Typography>
                    </Stack>
                  </Link>
                ))}
              </Stack>
            </Box>
          ))}

          {totalPages > 1 && (
            <Stack mt="24px" alignItems="center">
              <Pagination
                color="standard"
                shape="rounded"
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
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
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default PageExercises;
