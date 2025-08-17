import { useState, useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Container, Typography, List, ListItem, IconButton, TextField, Button, Card, CardContent, CardActionArea, Box, Tabs, Tab, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [topics, setTopics] = useState([
    'Trump',
    'Steelers',
    'AI',
  ]);
  const [selectedTopic, setSelectedTopic] = useState('Trump');
  // Ensure selectedTopic is always valid when topics change
  useEffect(() => {
    if (!topics.includes(selectedTopic)) {
      setSelectedTopic(topics[0] || '');
    }
  }, [topics]);
  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState({});
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
          return data.articles.map(a => ({ title: a.title, description: a.description || '', url: a.url }));
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
  const [newTopic, setNewTopic] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const rateLimitTimeout = useRef(null);
  const [cache, setCache] = useState(() => {
    try {
      const stored = localStorage.getItem('newsCache');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist cache to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('newsCache', JSON.stringify(cache));
    } catch {}
  }, [cache]);

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
  <Box sx={{ pt: 8, px: 0, width: '100%' }}>
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
                  {topics.map((topic) => (
                    <Tab key={topic} label={topic} value={topic} />
                  ))}
                </Tabs>
              </Box>
              <Typography variant="h4" gutterBottom align="center">Trending News</Typography>
              <Grid container spacing={0} sx={{ width: '100%', margin: 0 }}>
                {(allResults[selectedTopic] || []).map((item, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx} sx={{ p: 0 }}>
                    {item.url ? (
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e0e0e0', boxShadow: 'none', borderRadius: 0 }}>
                        <CardActionArea component="a" href={item.url} target="_blank" rel="noopener noreferrer" sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">{item.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{item.description}</Typography>
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
            <Box sx={{ maxWidth: 600, mx: 'auto', pt: 2, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>Manage Topics</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 4 }}>
                {topics.map((topic, idx) => (
                  <Chip
                    key={topic}
                    label={topic}
                    color={selectedTopic === topic ? 'primary' : 'default'}
                    onClick={() => setSelectedTopic(topic)}
                    onDelete={() => handleRemoveTopic(idx)}
                    deleteIcon={<DeleteIcon />}
                    sx={{ fontSize: '1rem', px: 2 }}
                  />
                ))}
              </Box>
              <Button variant="contained" onClick={() => setAddDialogOpen(true)} sx={{ mb: 2 }}>Add Topic</Button>
              <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                <DialogTitle>Add New Topic</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Topic Name"
                    type="text"
                    fullWidth
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => { handleAddTopic(); setAddDialogOpen(false); }}>Add</Button>
                </DialogActions>
              </Dialog>
            </Box>
          } />
        </Routes>
      </Box>
    </>
  );
}

export default App
