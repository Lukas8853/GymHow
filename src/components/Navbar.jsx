import React from "react";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Stack } from "@mui/material"; //služi za organizaciju elemenata u stacku, može biti horizontalno ili vertikalno
import SettingsIcon from "@mui/icons-material/Settings";

import Logo from "../assets/images/Logo.png";
import zIndex from "@mui/material/styles/zIndex";

const Navbar = () => {
  const dropDownMenuRef = useRef(null);
  const [isDropDownMenuOpen, setIsDropDownMenuOpen] = useState(false);

  function toggleDropDownMenu() {
    setIsDropDownMenuOpen((prevState) => !prevState);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropDownMenuRef.current &&
        !dropDownMenuRef.current.contains(event.target)
      ) {
        setIsDropDownMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      ref={dropDownMenuRef}
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
      <Box sx={{ position: "relative", marginLeft: "auto", zIndex: 9999 }}>
        <button
          onClick={toggleDropDownMenu}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <SettingsIcon sx={{fontSize:"30px"}} />
        </button>
        {isDropDownMenuOpen && (
          <Stack
            direction="column"
            sx={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "8px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
              padding: "8px 0",
              minWidth: "180px",
              zIndex: 1000,
            }}
          >
            <Link
              to="/profile"
              style={{
                textDecoration: "none",
                color: "#3A1212",
                padding: "10px 20px",
              }}
            >
              Profile
            </Link>
            <Link
              to="/settings"
              style={{
                textDecoration: "none",
                color: "#3A1212",
                padding: "10px 20px",
              }}
            >
              Settings
            </Link>
            <Link
              to="/logout"
              style={{
                textDecoration: "none",
                color: "#3A1212",
                padding: "10px 20px",
              }}
            >
              Login
            </Link>
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

export default Navbar;

//9.linija -> Stack se koristi za organizaciju elemenata u horizontalnom smjeru (direction="row") i postavlja razmak između elemenata (gap) te marginu na vrhu (marginTop) ovisno o veličini ekrana (sm i xs)
//         -> px je padding horizontalno, gap je razmak između elemenata, marginTop je razmak od vrha, justifyContent je poravnanje elemenata
