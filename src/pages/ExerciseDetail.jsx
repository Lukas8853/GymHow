import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";

import {
  exerciseOptions,
  fetchData,
  readCachedJson,
  youtubeOptions,
} from "../utils/fetchData";
import Detail from "../components/Detail";
import ExerciseVideos from "../components/ExerciseVideos";
import SimilarExercises from "../components/SimilarExercises";

const ExerciseDetail = () => {
  const [exerciseDetail, setExerciseDetail] = useState({}); //prazno polje/objekt
  const [exerciseVideos, setExerciseVideos] = useState([]); //prazan niz
  const [targetMuscleExercises, setTargetMuscleExercises] = useState([]);
  const [equipmentMuscleExercises, setEquipmentMuscleExercises] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchExercisesData = async () => {
      const exerciseDbUrl = "https://exercisedb.p.rapidapi.com";
      const youtubeSearchUrl =
        "https://youtube-search-and-download.p.rapidapi.com";

      const cachedExercises = readCachedJson("exercises_all_alphabet_v4", []);
      const cachedExerciseDetail = Array.isArray(cachedExercises)
        ? cachedExercises.find((exercise) => String(exercise.id) === String(id))
        : null;

      if (cachedExerciseDetail) {
        setExerciseDetail(cachedExerciseDetail);
      }

      const exerciseDetailData = cachedExerciseDetail
        ? cachedExerciseDetail
        : await fetchData(
            `${exerciseDbUrl}/exercises/exercise/${id}`,
            exerciseOptions,
          );

      if (!exerciseDetailData) {
        setExerciseVideos([]);
        setTargetMuscleExercises([]);
        setEquipmentMuscleExercises([]);
        return;
      }

      setExerciseDetail(exerciseDetailData);

      const exerciseVideosData = await fetchData(
        `${youtubeSearchUrl}/search?query=${exerciseDetailData.name}`,
        youtubeOptions,
      );
      setExerciseVideos(
        Array.isArray(exerciseVideosData?.contents)
          ? exerciseVideosData.contents
          : [],
      );

      const targetMuscleExercisesData = await fetchData(
        `${exerciseDbUrl}/exercises/target/${exerciseDetailData.target}`,
        exerciseOptions,
      );
      setTargetMuscleExercises(
        Array.isArray(targetMuscleExercisesData)
          ? targetMuscleExercisesData
          : [],
      );

      const equipmentMuscleExercisesData = await fetchData(
        `${exerciseDbUrl}/exercises/equipment/${exerciseDetailData.equipment}`,
        exerciseOptions,
      );
      setEquipmentMuscleExercises(
        Array.isArray(equipmentMuscleExercisesData)
          ? equipmentMuscleExercisesData
          : [],
      );
    };

    fetchExercisesData();
  }, [id]);

  return (
    <Box>
      <Detail exerciseDetail={exerciseDetail} />
      <ExerciseVideos
        exerciseVideos={exerciseVideos}
        name={exerciseDetail.name}
      />
      <SimilarExercises
        targetMuscleExercises={targetMuscleExercises}
        equipmentMuscleExercises={equipmentMuscleExercises}
      />
    </Box>
  );
};

export default ExerciseDetail;
