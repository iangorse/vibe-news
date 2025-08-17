import React from 'react';
import { Tabs, Tab } from '@mui/material';

export default function TopicsTabs({ topics, selectedTopic, setSelectedTopic }) {
  return (
    <Tabs
      value={selectedTopic}
      onChange={(_, val) => setSelectedTopic(val)}
      indicatorColor="primary"
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      sx={{ minHeight: 48 }}
    >
      {(topics || []).map((topic) => (
        <Tab key={topic} label={topic} value={topic} />
      ))}
    </Tabs>
  );
}
