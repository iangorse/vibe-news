import React from 'react';
import { Grid, Card, CardContent, CardActionArea, Typography, Box } from '@mui/material';

export default function NewsGrid({ articles }) {
  return (
    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ maxWidth: { xs: '100%', md: 1200 }, margin: '0 auto', width: '100%' }}>
      {(articles || []).map((item, idx) => (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={idx} sx={{ display: 'flex' }}>
          {item.url ? (
            <Card sx={{ height: '100%', minHeight: 400, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e0e0e0', boxShadow: 'none', borderRadius: 0, flex: 1 }}>
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
  );
}
