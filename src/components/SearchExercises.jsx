import React, { useEffect, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

import { exerciseOptions, fetchData } from "../utils/fetchData.jsx";
import HorizontalScrollbar from "./HorizontalScrollbar.jsx";
import { useTranslation, Trans } from "react-i18next";

const SearchExercises = ({ setExercises, bodyPart, setBodyPart }) => {
  const [search, setSearch] = useState("");
  const [bodyParts, setBodyParts] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchExercisesData = async () => {
      const bodyPartsData = await fetchData(
        "https://exercisedb.p.rapidapi.com/exercises/bodyPartList",
        exerciseOptions,
      );
      setBodyParts(["all", ...bodyPartsData]);
    };

    fetchExercisesData();
  }, []);
  
  const handleSearch = async () => {
    if (search) {
      const exercisesData = await fetchData(
        /*`https://wger.de/api/v2/exercise/search/?term=${search}&language=english&format=json`,
        {},*/ //ovo radi i izbacuje sve rezultate, ali onda moramo mijenjati više stvari jer ne vraća bodypart i name nego value i data. Moramo prilagoditi da funkcionira
        `https://exercisedb.p.rapidapi.com/exercises/name/${search}?limit=100&offset=0`,
        exerciseOptions,
      );

      //console.log("exercisesData", exercisesData); // dodaj ovo
      const searchedExercises = exercisesData.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(search) ||
          exercise.target.toLowerCase().includes(search) ||
          exercise.equipment.toLowerCase().includes(search) ||
          exercise.bodyPart.toLowerCase().includes(search),
      );
      //console.log("searchedExercises", searchedExercises); // i ovo
      setSearch("");
      setExercises(exercisesData);
    }
  };

  return (
    <Stack alignItems="center" mt="37px" justifyContent="center" padding="20px">
      <Typography
        fontWeight={700}
        sx={{ fontSize: { lg: "44px", xs: "30px" } }}
        mb="50px"
        textAlign="center"
      >
        <Trans i18nKey="searchExercises.title" components={{ br: <br /> }} />
      </Typography>
      <Box position="relative" mb="72px">
        <TextField
          sx={{
            input: { fontWeight: "700", border: "none", borderRadius: "4px" },
            width: { lg: "800px", xs: "350px" },
            backgroundColor: "white",
            borderRadius: "40px",
          }}
          height="76px"
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
          placeholder={t("searchExercises.placeholder")}
          type="text"
        />
        <Button
          className="search-btn"
          sx={{
            backgroundColor: "#FF2625",
            color: "white",
            textTransform: "none",
            width: { lg: "175px", xs: "80px" },
            fontSize: { lg: "20px", xs: "14px" },
            height: "56px",
            position: "absolute",
            right: "0",
          }}
          onClick={handleSearch}
        >
          {t("searchExercises.button")}
        </Button>
      </Box>
      <Box sx={{ position: "relative", width: "100%", padding: "20px" }}>
        <HorizontalScrollbar
          data={bodyParts}
          bodyPart={bodyPart}
          setBodyPart={setBodyPart}
          isBodyParts
        />
      </Box>
    </Stack>
  );
};

export default SearchExercises;

// <TextField /> je isto kao i <TextField></Textfield>
// sx je prop koji se koristi za stiliziranje komponenti u MUI (Material-UI) biblioteci, omogućava nam da direktno primijenimo CSS stilove na komponentu. U ovom slučaju, koristi se za prilagođavanje izgleda TextField komponente, uključujući font, širinu, boju pozadine i border-radius.
