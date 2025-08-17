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
function App() {
  const [topics, setTopics] = useState();
  const [selectedTopic, setSelectedTopic] = useState('Trump');
  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState({});
  const [newTopic, setNewTopic] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const rateLimitTimeout = useRef(null);
  const [cache, setCache] = useState({});

  // Load topics from IndexedDB on mount
  useEffect(() => {
    get('topics').then(stored => {
      if (Array.isArray(stored)) {
        setTopics(stored);
      } else {
        setTopics(['Trump', 'Steelers', 'AI']);
      }
    });
  }, []);
  // Persist topics to IndexedDB whenever they change
  useEffect(() => {
    set('topics', topics);
  }, [topics]);
  // Ensure selectedTopic is always valid when topics change
  useEffect(() => {
    if (!((topics || []).includes(selectedTopic))) {
      setSelectedTopic((topics && topics[0]) || '');
    }
  }, [topics]);

  // Load news cache from IndexedDB on mount
  useEffect(() => {
    get('newsCache').then(stored => {
      if (stored && typeof stored === 'object') setCache(stored);
    });
  }, []);
  // Persist news cache to IndexedDB whenever it changes
  useEffect(() => {
    set('newsCache', cache);
  }, [cache]);

  // Helper to fetch news for a topic
  const fetchNewsForTopic = async (topic) => {
    const API_KEY = import.meta.env.VITE_NEWSAPI_KEY;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&apiKey=${API_KEY}&pageSize=5`;
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

  // On initial load, fetch news for all topics (if not cached)
  useEffect(() => {
    const fetchAll = async () => {
      let updatedAllResults = {};
      let updatedCache = { ...cache };
      for (const topic of topics) {
        if (updatedCache[topic]) {
          updatedAllResults[topic] = updatedCache[topic];
        } else {
          const news = await fetchNewsForTopic(topic);
          updatedAllResults[topic] = news;
          updatedCache[topic] = news;
        }
      }
      setAllResults(updatedAllResults);
      setCache(updatedCache);
    };
    fetchAll();
    // eslint-disable-next-line
  }, [topics]);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setResults(allResults[topic] || []);
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
    <>
      <Navbar />
      <Box sx={{ pt: 12, px: 0, width: '100%' }}>
        <Routes>
          <Route path="/" element={
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt: -4 }}>
                <TopicsTabs topics={topics} selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic} />
              </Box>
              <Typography variant="h4" gutterBottom align="center">Trending News</Typography>
              <NewsGrid articles={allResults[selectedTopic] || []} />
              {(!allResults[selectedTopic] || allResults[selectedTopic].length === 0) && (
                <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                  No news found for this topic.
                </Typography>
              )}
            </>
          } />
          <Route path="/topics" element={
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
          } />
        </Routes>
      </Box>
    </>
  );
}

export default App
