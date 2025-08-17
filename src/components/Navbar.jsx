import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <AppBar position="fixed" color="primary" elevation={1}>
    <Toolbar>
      <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
        Vibe News
      </Typography>
      <Box>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to="/topics">Topics</Button>
        {/* Add more navigation links here */}
      </Box>
    </Toolbar>
  </AppBar>
);

export default Navbar;
