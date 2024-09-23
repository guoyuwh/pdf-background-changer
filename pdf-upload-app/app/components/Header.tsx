// app/components/Header.tsx
'use client';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">PDF Upload App</Typography>
      </Toolbar>
    </AppBar>
  );
}
