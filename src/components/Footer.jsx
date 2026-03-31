import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import SportsGymnasticsOutlinedIcon from "@mui/icons-material/SportsGymnasticsOutlined";

const Footer = () => {
  const location = useLocation();

  const tabs = [
    {
      label: "Profile",
      path: "/Profile",
      isActive: location.pathname === "/Profile",
      icon: PersonOutlineOutlinedIcon,
    },
    /*{
      label: "History",
      path: "/History",
      isActive: location.pathname === "/History",
      icon: HistoryOutlinedIcon,
    },*/
    {
      label: "Home",
      path: "/",
      isActive: location.pathname === "/",
      icon: FitnessCenterOutlinedIcon,
    },
    {
      label: "Exercises",
      path: "/Exercises",
      isActive: location.pathname === "/Exercises",
      icon: SportsGymnasticsOutlinedIcon,
    },
  ];

  return (
    <>
      <Box sx={{ height: "84px" }} />
      <Stack
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "84px",
          px: 1,
          pb: "max(8px, env(safe-area-inset-bottom))",
          background: "linear-gradient(180deg, #ffffff 0%, #fff3f4 100%)",
          borderTop: "1px solid #f3d7da",
          boxShadow: "0 -8px 20px rgba(255, 38, 37, 0.08)",
          zIndex: 1200,
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <Link
              key={tab.label}
              to={tab.path}
              style={{ textDecoration: "none", color: "inherit", flex: 1 }}
            >
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={0.4}
                sx={{
                  color: tab.isActive ? "#FF2625" : "#6f5d5d",
                  minHeight: "60px",
                  borderRadius: "14px",
                  transition: "all 0.2s ease",
                  backgroundColor: tab.isActive
                    ? "rgba(255, 38, 37, 0.1)"
                    : "transparent",
                }}
              >
                <Icon sx={{ fontSize: "24px" }} />
                <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>
                  {tab.label}
                </Typography>
              </Stack>
            </Link>
          );
        })}
      </Stack>
    </>
  );
};

export default Footer;
