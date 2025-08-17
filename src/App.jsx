import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import { Box } from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import { Typography } from '@mui/material';
import { Grid } from '@mui/material';
import { List, ListItem } from '@mui/material';
import { TextField } from '@mui/material';
import { IconButton } from '@mui/material';
import { Card, CardContent, CardActionArea, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { Routes, Route } from 'react-router-dom';
import { get, set } from 'idb-keyval';
import TopicsTabs from './components/TopicsTabs';
import NewsGrid from './components/NewsGrid';
import ManageTopics from './components/ManageTopics';
import Sidebar from './components/Sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
function App() {
  const queryClient = new QueryClient();

  // All state and handlers remain the same
  const [topics, setTopics] = useState([]);

  // Load topics from IndexedDB on mount
  useEffect(() => {
    get('topics').then(saved => {
      if (Array.isArray(saved) && saved.length > 0) {
        setTopics(saved);
      }
    });
  }, []);

  // Save topics to IndexedDB whenever they change
  useEffect(() => {
    set('topics', topics);
  }, [topics]);
  const [selectedTopic, setSelectedTopic] = useState('Trump');
  const [newTopic, setNewTopic] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const rateLimitTimeout = useRef(null);
  const [cache, setCache] = useState({});

  // (Removed legacy news cache and fetchAll logic; now handled by React Query)

  // Helper to fetch news for a topic
  const fetchNewsForTopic = async (topic) => {
    const API_KEY = import.meta.env.VITE_NEWSAPI_KEY;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&apiKey=${API_KEY}&pageSize=10`;
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        return [{ title: 'Rate limit exceeded', description: 'Please wait before making another request.' }];
      } else {
        const data = await res.json();
        if (data.articles) {
          return data.articles.map(a => ({ title: a.title, description: a.description || '', url: a.url, image: a.urlToImage }));
        } else {
          return [{ title: 'No results', description: 'No news found for this topic.' }];
        }
      }
    } catch (err) {
      return [{ title: 'Error', description: 'Failed to fetch news.' }];
    }
  };

  // Child component for home page, inside QueryClientProvider
  function HomeContent() {
    const { data: newsResults = [], isLoading, isError } = useQuery({
      queryKey: ['news', selectedTopic],
      queryFn: () => fetchNewsForTopic(selectedTopic),
      enabled: !!selectedTopic,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    });
    return (
      <Box sx={{ display: 'flex', pt: 8 }}>
        <Sidebar topics={topics} selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic} />
        <Box sx={{ flex: 1, px: 2, width: '100%', maxWidth: 1200, margin: '0 auto' }}>
          <Typography variant="h4" gutterBottom align="center">Trending News</Typography>
          <Typography variant="h6" align="center" sx={{ mb: 3, color: 'text.secondary' }}>{selectedTopic}</Typography>
          {isLoading ? (
            <Typography variant="body1" align="center" sx={{ mt: 4 }}>
              Loading news...
            </Typography>
          ) : isError ? (
            <Typography variant="body1" align="center" sx={{ mt: 4 }}>
              Error loading news.
            </Typography>
          ) : (
            <>
              <NewsGrid articles={newsResults} />
              {(newsResults.length === 0 || (newsResults[0] && newsResults[0].title === 'No results')) && (
                <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                  No news found for this topic.
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>
    );
  }

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };

  const handleTopicChange = (idx, value) => {
    const updated = [...topics];
    updated[idx] = value;
    setTopics(updated);
  };

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (idx) => {
    const updated = topics.filter((_, i) => i !== idx);
    setTopics(updated);
    if (selectedTopic === topics[idx]) setSelectedTopic('');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeContent />} />
        <Route path="/topics" element={
          <Box sx={{ pt: 8 }}>
            <ManageTopics
              topics={topics}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              handleTopicChange={handleTopicChange}
              handleRemoveTopic={handleRemoveTopic}
              newTopic={newTopic}
              setNewTopic={setNewTopic}
              handleAddTopic={handleAddTopic}
            />
          </Box>
        } />
      </Routes>
    </QueryClientProvider>
  );
}

export default App
