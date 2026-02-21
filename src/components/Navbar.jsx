import React from "react";
import { Link } from "react-router-dom";
import { Stack } from "@mui/material"; //služi za organizaciju elemenata u stacku, može biti horizontalno ili vertikalno

import Logo from "../assets/images/Logo.png";

const Navbar = () => {
  return (
    <Stack
      direction="row"
      justifyContent="space-around"
      sx={{
        gap: { sm: "122px", xs: "40px" },
        marginTop: { sm: "32px", xs: "20px" },
        justifyContent: "none",
      }}
      px="20px"
    >
      <Link to="/">
        <img
          src={Logo}
          alt="logo"
          style={{ width: "48px", height: "48px", margin: "0 20px" }}
        />
      </Link>
      <Stack direction="row" gap="40px" fontSize="24px" alignItems="flex-end">
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#3A1212",
            borderBottom: "3px solid #FF2625",
          }}
        >
          Home
        </Link>
        <a
          href="#exercises"
          style={{ textDecoration: "none", color: "#3A1212" }}
        >
          Exercises
        </a>
      </Stack>
    </Stack>
  );
};

export default Navbar;

//9.linija -> Stack se koristi za organizaciju elemenata u horizontalnom smjeru (direction="row") i postavlja razmak između elemenata (gap) te marginu na vrhu (marginTop) ovisno o veličini ekrana (sm i xs)
//         -> px je padding horizontalno, gap je razmak između elemenata, marginTop je razmak od vrha, justifyContent je poravnanje elemenata
