import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Paper,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  ExitToApp as ExitToAppIcon,
  Info as InfoIcon 
} from '@mui/icons-material';
import ChessBoard from './components/ChessBoard';
import MovesHistory from './components/MovesHistory';
import PuzzleLoader from './components/PuzzleLoader';
import PGNLoader from './components/PGNLoader';
import SessionManager from './components/SessionManager';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [role, setRole] = useState(null);
  const [gameState, setGameState] = useState({
    position: 'start',
    moves: [],
    puzzleMoves: null
  });

  const handleSessionStart = (newSessionId, selectedRole) => {
    setSessionId(newSessionId);
    setRole(selectedRole);
  };

  const handleGameStateUpdate = (newState) => {
    setGameState(prevState => ({
      ...prevState,
      ...newState
    }));
  };

  const handleExitSession = () => {
    setSessionId(null);
    setRole(null);
    setGameState({
      position: 'start',
      moves: [],
      puzzleMoves: null
    });
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <AppBar position="static" sx={{ backgroundColor: '#2c3e50' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Chess Tutor
          </Typography>
          {sessionId && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1">
                Session: {sessionId} | Role: {role}
              </Typography>
              <Tooltip title="Exit Session">
                <IconButton color="inherit" onClick={handleExitSession}>
                  <ExitToAppIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {!sessionId ? (
          <SessionManager onSessionStart={handleSessionStart} />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            gap: 4,
            flexDirection: { xs: 'column', md: 'row' }
          }}>
            <Box sx={{ 
              flex: { xs: '1', md: '1 1 70%' },
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {role === 'tutor' && (
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 2,
                    backgroundColor: '#fff',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 1
                  }}>
                    <Typography variant="h6" sx={{ color: '#1a237e' }}>
                      Practice Tools
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <PuzzleLoader onPuzzleLoad={handleGameStateUpdate} />
                    <PGNLoader onPGNLoad={handleGameStateUpdate} />
                  </Box>
                </Paper>
              )}

              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3,
                  backgroundColor: '#fff',
                  borderRadius: 2
                }}
              >
                <ChessBoard
                  sessionId={sessionId}
                  role={role}
                  position={gameState.position}
                  onGameStateUpdate={handleGameStateUpdate}
                />
              </Paper>
            </Box>

            <Box sx={{ 
              flex: { xs: '1', md: '1 1 30%' },
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3,
                  backgroundColor: '#fff',
                  borderRadius: 2
                }}
              >
                <MovesHistory moves={gameState.moves} />
              </Paper>

              {role === 'tutor' && (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2,
                    backgroundColor: '#fff',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <InfoIcon color="info" fontSize="small" />
                    <Typography variant="subtitle2">
                      Tutor Controls
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    As a tutor, you can:
                    • Load daily puzzles for practice
                    • Import games via PGN
                    • Guide students through moves
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;