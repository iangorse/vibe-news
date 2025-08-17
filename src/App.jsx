import { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  IconButton,
  TextField,
  Button,
  Card,
  CardContent
} from '@mui/material';
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
  const [selectedTopic, setSelectedTopic] = useState('');
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
          return data.articles.map(a => ({ title: a.title, description: a.description || '' }));
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>Vibe News</Typography>
      <Typography variant="h6" gutterBottom>Edit topics:</Typography>
      <List sx={{ mb: 2 }}>
        {topics.map((topic, idx) => (
          <ListItem key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }} disableGutters>
            <TextField
              value={topic}
              onChange={e => handleTopicChange(idx, e.target.value)}
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
            />
            <IconButton color={selectedTopic === topic ? 'primary' : 'default'} onClick={() => handleTopicSelect(topic)}>
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
          placeholder="Add new topic..."
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleAddTopic}>Add</Button>
      </Box>
      <Typography variant="h6" gutterBottom>News Results</Typography>
      {topics.map((topic) => (
        <Box key={topic} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{topic}</Typography>
          <List>
            {(allResults[topic] || []).map((item, idx) => (
              <ListItem key={idx} disableGutters>
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold">{item.title}</Typography>
                    <Typography variant="body2">{item.description}</Typography>
                  </CardContent>
                </Card>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Container>
  );
}

export default App
