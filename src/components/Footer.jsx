import React from "react";
import { Box, Stack, Typography } from "@mui/material";

import Logo from "../assets/images/Logo-1.png";

const Footer = () => {
  return (
    <Box marginTop="80px" bgcolor="#fff3f4">
      <Stack gap="40px" alignItems="center" paddingX="40px" paddingTop="24px">
        <img src={Logo} alt="logo" width="200px" height="40px" />
        <Typography variant="h5" paddingBottom="40px" marginTop="20px">
          Trud ulozio Mislav Serdar i Lukas Rigo
        </Typography>
      </Stack>
    </Box>
  );
};

export default Footer;
