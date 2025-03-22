import React, { useState } from 'react';
import { 
  Button, 
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Box,
  Chip,
  Stack
} from '@mui/material';
import { 
  Extension as ExtensionIcon,
  EmojiEvents as RatingIcon,
  Label as ThemeIcon
} from '@mui/icons-material';

function PuzzleLoader({ onPuzzleLoad }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);

  const getRatingDescription = (rating) => {
    if (rating < 1200) return 'Beginner Level';
    if (rating < 1500) return 'Intermediate Level';
    if (rating < 1800) return 'Advanced Level';
    return 'Expert Level';
  };

  const handleLoadPuzzle = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setCurrentPuzzle(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/puzzle', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const puzzleData = await response.json();
      console.log('Loaded puzzle:', puzzleData);
      
      onPuzzleLoad({
        position: puzzleData.fen,
        moves: [],
        puzzleMoves: puzzleData.moves,
        puzzleId: puzzleData.id,
        puzzleRating: puzzleData.rating,
        puzzleThemes: puzzleData.themes
      });

      setCurrentPuzzle(puzzleData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to load puzzle:', error);
      setError('Failed to load puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack direction="column" spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="Load a random chess puzzle">
          <span>
            <Button
              variant="contained"
              onClick={handleLoadPuzzle}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ExtensionIcon />}
              sx={{
                backgroundColor: '#6a1b9a',
                '&:hover': {
                  backgroundColor: '#4a148c'
                },
                '&.Mui-disabled': {
                  backgroundColor: '#9c27b0',
                  opacity: 0.7
                },
                minWidth: '160px'
              }}
            >
              {loading ? 'Loading...' : 'Daily Puzzle'}
            </Button>
          </span>
        </Tooltip>

        {currentPuzzle && (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={`Puzzle Difficulty: ${getRatingDescription(currentPuzzle.rating)}`}>
              <Chip
                icon={<RatingIcon fontSize="small" />}
                label={currentPuzzle.rating}
                size="small"
                sx={{ 
                  backgroundColor: '#e1bee7',
                  '& .MuiChip-icon': { color: '#4a148c' },
                  '& .MuiChip-label': { color: '#4a148c', fontWeight: 500 }
                }}
              />
            </Tooltip>
            {currentPuzzle.themes.map((theme, index) => (
              <Tooltip key={index} title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}>
                <Chip
                  icon={<ThemeIcon fontSize="small" />}
                  label={theme}
                  size="small"
                  sx={{ 
                    backgroundColor: '#f3e5f5',
                    '& .MuiChip-icon': { color: '#6a1b9a' },
                    '& .MuiChip-label': { color: '#6a1b9a' }
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        )}
      </Stack>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Puzzle loaded successfully!
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default PuzzleLoader;