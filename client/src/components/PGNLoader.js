import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography,
  Snackbar,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { Chess } from 'chess.js';

function PGNLoader({ onPGNLoad }) {
  const [pgnInput, setPgnInput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoadPGN = async () => {
    if (!pgnInput.trim()) {
      setError('Please enter a PGN string');
      return;
    }

    setLoading(true);
    try {
      const chess = new Chess();
      const success = chess.load_pgn(pgnInput.trim());

      if (!success) {
        setError('Invalid PGN format');
        return;
      }

      // Get all moves in verbose format
      const moves = chess.history({ verbose: true }).map(move => ({
        from: move.from,
        to: move.to,
        piece: move.piece,
        san: move.san,
        timestamp: Date.now()
      }));

      // Update the game state with the loaded PGN
      onPGNLoad({
        position: chess.fen(),
        moves: moves
      });

      // Clear the input after successful load
      setPgnInput('');
      setError(null);
    } catch (error) {
      console.error('Error loading PGN:', error);
      setError('Failed to load PGN. Please check the format and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setPgnInput(event.target.value);
    if (error) setError(null);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2,
        backgroundColor: '#fff',
        borderRadius: 2,
        height: '100%'
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        Load Game from PGN
      </Typography>
      
      <TextField
        multiline
        rows={3}
        value={pgnInput}
        onChange={handleInputChange}
        placeholder="Paste PGN notation here..."
        fullWidth
        variant="outlined"
        size="small"
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#f8f9fa'
          }
        }}
      />
      
      <Button
        variant="contained"
        onClick={handleLoadPGN}
        disabled={loading || !pgnInput.trim()}
        startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
        sx={{
          backgroundColor: '#1a237e',
          '&:hover': {
            backgroundColor: '#283593'
          },
          '&.Mui-disabled': {
            backgroundColor: '#3f51b5',
            opacity: 0.7
          }
        }}
      >
        {loading ? 'Loading Game...' : 'Load PGN'}
      </Button>

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
    </Paper>
  );
}

export default PGNLoader;