import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { 
  Box, 
  Typography, 
  Snackbar, 
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

function ChessBoard({ sessionId, role, position, onGameStateUpdate }) {
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState('white');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

  // Initialize game state when position changes
  useEffect(() => {
    if (position && position !== game.fen()) {
      const newGame = new Chess();
      if (position !== 'start') {
        try {
          newGame.load(position);
          setGame(newGame);
        } catch (error) {
          console.error('Invalid position:', error);
          setError('Invalid board position received');
        }
      }
    }
  }, [position]);

  // Handle session connection
  useEffect(() => {
    if (sessionId && role) {
      setLoading(true);
      socket.emit('joinSession', { sessionId, role });

      socket.on('sessionState', (state) => {
        const newGame = new Chess();
        if (state.position !== 'start') {
          try {
            newGame.load(state.position);
            setGame(newGame);
            onGameStateUpdate(state);
          } catch (error) {
            console.error('Invalid session state:', error);
            setError('Failed to load game state');
          }
        }
        setLoading(false);
      });

      socket.on('moveMade', (moveData) => {
        const newGame = new Chess(game.fen());
        try {
          const move = newGame.move({
            from: moveData.from,
            to: moveData.to,
            promotion: moveData.promotion,
          });
          
          if (move) {
            setGame(newGame);
            onGameStateUpdate({
              position: newGame.fen(),
              moves: [...(position.moves || []), { ...moveData, san: move.san }],
            });
          }
        } catch (error) {
          console.error('Invalid move:', error);
          setError('Invalid move received');
        }
      });

      socket.on('error', (errorMsg) => {
        setError(errorMsg);
        setLoading(false);
      });
    }

    return () => {
      socket.off('sessionState');
      socket.off('moveMade');
      socket.off('error');
    };
  }, [sessionId, role]);

  // Set board orientation based on role
  useEffect(() => {
    if (role === 'student') {
      setOrientation('black');
    } else {
      setOrientation('white');
    }
  }, [role]);

  const makeMove = useCallback((from, to, promotion = 'q') => {
    const moves = game.moves({ verbose: true });
    for (let move of moves) {
      if (move.from === from && move.to === to) {
        const newGame = new Chess(game.fen());
        try {
          const result = newGame.move({ from, to, promotion });
          setGame(newGame);
          return result;
        } catch (error) {
          console.error('Move error:', error);
          setError('Invalid move');
          return null;
        }
      }
    }
    return null;
  }, [game]);

  function onDrop(sourceSquare, targetSquare) {
    // Validate turn
    if (role === 'student' && game.turn() === 'w') {
      setError('Students can only move black pieces');
      return false;
    }
    if (role === 'tutor' && game.turn() === 'b') {
      setError('Tutor can only move white pieces');
      return false;
    }

    const move = makeMove(sourceSquare, targetSquare);
    if (move) {
      socket.emit('move', {
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
        piece: move.piece,
        san: move.san,
        fen: game.fen(),
      });
      return true;
    }
    return false;
  }

  function onPieceDragBegin(piece, sourceSquare) {
    // Validate piece color
    if (role === 'student' && piece[0] === 'w') {
      setError('Students can only move black pieces');
      return false;
    }
    if (role === 'tutor' && piece[0] === 'b') {
      setError('Tutor can only move white pieces');
      return false;
    }
    return true;
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '400px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          textAlign: 'center',
          color: role === 'tutor' ? '#1976d2' : '#2e7d32'
        }}
      >
        {role === 'tutor' ? 'Teaching Board' : 'Learning Board'}
        {game.turn() === 'w' ? ' - White to move' : ' - Black to move'}
      </Typography>

      <Paper 
        elevation={2}
        sx={{
          p: 2,
          backgroundColor: '#fff',
          borderRadius: 2,
          '& .chess-board': {
            transition: 'all 0.3s ease'
          }
        }}
      >
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          onPieceDragBegin={onPieceDragBegin}
          boardOrientation={orientation}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
          customDarkSquareStyle={{ backgroundColor: '#769656' }}
          customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
          animationDuration={200}
        />
      </Paper>

      {game.isGameOver() && (
        <Typography 
          variant="h6" 
          sx={{ 
            mt: 2, 
            textAlign: 'center',
            color: game.isCheckmate() ? 'error.main' : 'warning.main',
            fontWeight: 500
          }}
        >
          Game Over - {game.isCheckmate() ? 'Checkmate!' : 'Draw!'}
        </Typography>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
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
    </Box>
  );
}

export default ChessBoard;