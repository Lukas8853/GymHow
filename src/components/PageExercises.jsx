import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Stack, Typography } from "@mui/material";

import { exerciseOptions, fetchData } from "../utils/fetchData";
import placeholder from "../assets/images/placeholder.png";
import Loader from "./Loader";
import { AppContext } from "../AppContext";

const PAGE_LIMIT = 100;
const MAX_OFFSET = 2000;
const MIN_EXPECTED_CACHED_ITEMS = 200;
const MIN_EXPECTED_FETCHED_ITEMS = 500;

const PageExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { exerciseSortOrder } = useContext(AppContext);

  useEffect(() => {
    const fetchAllExercises = async () => {
      setIsLoading(true);

      try {
        const cacheKey = "exercises_all_alphabet_v4";
        const cachedExercises = localStorage.getItem(cacheKey);

        if (cachedExercises) {
          const parsedCache = JSON.parse(cachedExercises);
          if (
            Array.isArray(parsedCache) &&
            parsedCache.length >= MIN_EXPECTED_CACHED_ITEMS
          ) {
            setExercises(parsedCache);
            return;
          }
        }

        const allExercises = [];
        const seenIds = new Set();

        for (let offset = 0; offset <= MAX_OFFSET; offset += PAGE_LIMIT) {
          const pageData = await fetchData(
            `https://exercisedb.p.rapidapi.com/exercises?limit=${PAGE_LIMIT}&offset=${offset}`,
            exerciseOptions,
          );

          if (!Array.isArray(pageData) || pageData.length === 0) {
            break;
          }

          let addedInThisPage = 0;

          pageData.forEach((exercise) => {
            if (!exercise?.id || seenIds.has(exercise.id)) {
              return;
            }

            seenIds.add(exercise.id);
            allExercises.push(exercise);
            addedInThisPage += 1;
          });

          if (pageData.length < PAGE_LIMIT || addedInThisPage === 0) {
            break;
          }
        }

        // Fallback: neki planovi/kljucevi vracaju premalo na globalnom endpointu,
        // pa dodatno skupljamo po bodyPart endpointima i spajamo bez duplikata.
        if (allExercises.length < MIN_EXPECTED_FETCHED_ITEMS) {
          const bodyParts = await fetchData(
            "https://exercisedb.p.rapidapi.com/exercises/bodyPartList",
            exerciseOptions,
          );

          if (Array.isArray(bodyParts)) {
            for (const bodyPart of bodyParts) {
              const bodyPartData = await fetchData(
                `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}?limit=500&offset=0`,
                exerciseOptions,
              );

              if (!Array.isArray(bodyPartData)) {
                continue;
              }

              bodyPartData.forEach((exercise) => {
                if (!exercise?.id || seenIds.has(exercise.id)) {
                  return;
                }

                seenIds.add(exercise.id);
                allExercises.push(exercise);
              });
            }
          }
        }

        localStorage.setItem(cacheKey, JSON.stringify(allExercises));
        setExercises(allExercises);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllExercises();
  }, []);

  const groupedExercises = useMemo(() => {
    if (!Array.isArray(exercises)) {
      return [];
    }

    const sortedExercises = [...exercises].sort((a, b) =>
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

    return orderedLetters
      .map((letter) => ({ letter, items: grouped[letter] }));
  }, [exercises, exerciseSortOrder]);

  return (
    <Box mt="50px" p="20px" pb="120px">
      <Typography variant="h3" mb="30px">
        Exercises {exerciseSortOrder === "za" ? "Z-A" : "A-Z"}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb="20px">
        Total exercises: {exercises.length}
      </Typography>

      {isLoading ? (
        <Loader />
      ) : (
        <Stack gap="28px">
          {groupedExercises.map((group) => (
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
                        "&:hover": { backgroundColor: "#f7f7f7" },
                      }}
                    >
                      <Box
                        component="img"
                        src={exercise.gifUrl || placeholder}
                        alt={exercise.name}
                        loading="lazy"
                        sx={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid #e7e7e7",
                        }}
                      />
                      <Typography fontSize="18px" textTransform="capitalize">
                        {exercise.name}
                      </Typography>
                    </Stack>
                  </Link>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default PageExercises;
