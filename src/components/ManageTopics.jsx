import React from 'react';
import { Box, Typography, List, ListItem, TextField, IconButton, Button, Paper, Divider, Fade } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ManageTopics({ topics, selectedTopic, setSelectedTopic, handleTopicChange, handleRemoveTopic, newTopic, setNewTopic, handleAddTopic }) {
  return (
    <Box sx={{ pt: '64px', pb: 2 }}>
      <Paper elevation={3} sx={{ maxWidth: 600, width: '100%', mx: 'auto', p: 4, borderRadius: 3, mt: 0 }}>
        <Typography variant="h4" gutterBottom align="center">Manage Topics</Typography>
        <List sx={{ mb: 2 }}>
          {(topics || []).length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              No topics yet. Add your first topic below!
            </Typography>
          )}
          {(topics || []).map((topic, idx) => (
            <Fade in={true} key={idx}>
              <div>
                <ListItem sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }} disableGutters>
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
                {idx < (topics.length - 1) && <Divider />}
              </div>
            </Fade>
          ))}
        </List>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
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
            helperText="Press Enter or click Add to save."
          />
          <Button variant="contained" onClick={handleAddTopic} disabled={!newTopic.trim()}>Add</Button>
        </Box>
      </Paper>
    </Box>
  );
}
