import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, IconButton, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function Sidebar({ topics, selectedTopic, setSelectedTopic }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const drawerContent = (
    <>
      <Toolbar />
      <Typography variant="h6" sx={{ px: 2, py: 1 }}>Topics</Typography>
      <List>
        {(topics || []).map((topic, idx) => (
          <ListItem key={idx} disablePadding>
            <ListItemButton selected={selectedTopic === topic} onClick={() => { setSelectedTopic(topic); setMobileOpen(false); }}>
              <ListItemText primary={topic} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setMobileOpen(true)}
          sx={{ position: 'fixed', top: 72, left: 8, zIndex: 1300 }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: 220,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box', top: 64 },
          display: { xs: isMobile ? 'block' : 'none', sm: 'block' }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
