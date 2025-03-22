import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

function SessionManager({ onSessionStart }) {
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [sessionId, setSessionId] = useState('');
  const [role, setRole] = useState('tutor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/session');
      const { sessionId: newSessionId } = response.data;
      onSessionStart(newSessionId, role);
    } catch (error) {
      console.error('Failed to create session:', error);
      setError('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify the session exists
      const response = await axios.get(`http://localhost:5000/api/session/${sessionId}`);
      if (response.data) {
        onSessionStart(sessionId, role);
      }
    } catch (error) {
      console.error('Failed to join session:', error);
      setError(error.response?.status === 404 
        ? 'Session not found. Please check the ID and try again.'
        : 'Failed to join session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 400, 
      mx: 'auto', 
      mt: 4 
    }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          Chess Tutor Session
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">Mode</FormLabel>
          <RadioGroup
            row
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            sx={{ justifyContent: 'center' }}
          >
            <FormControlLabel 
              value="create" 
              control={<Radio />} 
              label="Create Session" 
            />
            <FormControlLabel 
              value="join" 
              control={<Radio />} 
              label="Join Session" 
            />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">Role</FormLabel>
          <RadioGroup
            row
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ justifyContent: 'center' }}
          >
            <FormControlLabel 
              value="tutor" 
              control={<Radio />} 
              label="Tutor" 
            />
            <FormControlLabel 
              value="student" 
              control={<Radio />} 
              label="Student" 
            />
          </RadioGroup>
        </FormControl>

        {mode === 'join' && (
          <TextField
            fullWidth
            label="Session ID"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            margin="normal"
            variant="outlined"
            size="small"
          />
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={mode === 'create' ? handleCreateSession : handleJoinSession}
          disabled={loading || (mode === 'join' && !sessionId.trim())}
          sx={{ 
            mt: 2,
            backgroundColor: '#2e7d32',
            '&:hover': {
              backgroundColor: '#1b5e20'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            mode === 'create' ? 'Create Session' : 'Join Session'
          )}
        </Button>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SessionManager;