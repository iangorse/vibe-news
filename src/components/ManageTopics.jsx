import React from 'react';
import { Box, Typography, List, ListItem, TextField, IconButton, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ManageTopics({ topics, selectedTopic, setSelectedTopic, handleTopicChange, handleRemoveTopic, newTopic, setNewTopic, handleAddTopic }) {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', pt: 0 }}>
      <Typography variant="h4" gutterBottom>Manage Topics</Typography>
      <List sx={{ mb: 2 }}>
        {(topics || []).map((topic, idx) => (
          <ListItem key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }} disableGutters>
            <TextField
              value={topic}
              onChange={e => handleTopicChange(idx, e.target.value)}
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
            />
            <IconButton color={selectedTopic === topic ? 'primary' : 'default'} onClick={() => setSelectedTopic(topic)}>
              <CheckIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleRemoveTopic(idx)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          value={newTopic}
          onChange={e => setNewTopic(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleAddTopic();
            }
          }}
          placeholder="Add new topic..."
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleAddTopic}>Add</Button>
      </Box>
    </Box>
  );
}
