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
              </Box>
              <Typography variant="h4" gutterBottom align="center">Trending News</Typography>
              <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
                {(allResults[selectedTopic] || []).map((item, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx} sx={{ p: 0 }}>
                    {item.url ? (
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e0e0e0', boxShadow: 'none', borderRadius: 0 }}>
                        <CardActionArea component="a" href={item.url} target="_blank" rel="noopener noreferrer" sx={{ height: '100%' }}>
                          <Box sx={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', mb: 1 }}>
                            {item.image && (
                              <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            )}
                            <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', px: 2, py: 1 }}>
                              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>{item.title}</Typography>
                            </Box>
                          </Box>
                          <CardContent sx={{ pt: 2 }}>
                            <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>{item.description}</Typography>
                          </CardContent>
                        </CardActionArea>
                        <CardContent sx={{ pt: 0 }}>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', wordBreak: 'break-all' }}>
                              {item.url}
                            </a>
                          </Typography>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e0e0e0', boxShadow: 'none', borderRadius: 0 }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Grid>
                ))}
              </Grid>
              {(!allResults[selectedTopic] || allResults[selectedTopic].length === 0) && (
                <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                  No news found for this topic.
                </Typography>
              )}
            </>
          } />
          <Route path="/topics" element={
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
          } />
        </Routes>
      </Box>
    </>
  );
}

export default App
