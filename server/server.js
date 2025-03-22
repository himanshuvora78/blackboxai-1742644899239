const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Enable CORS for Socket.IO
io.use((socket, next) => {
  const handshakeData = socket.request;
  if (handshakeData.headers.origin === 'http://localhost:3000') {
    next();
  } else {
    next(new Error('Not allowed by CORS'));
  }
});

// Store active sessions
const sessions = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join session
  socket.on('joinSession', ({ sessionId, role }) => {
    console.log(`Client ${socket.id} joining session ${sessionId} as ${role}`);
    
    if (!sessions.has(sessionId)) {
      socket.emit('error', 'Session not found');
      return;
    }

    socket.join(sessionId);
    socket.sessionId = sessionId;
    socket.role = role;
    
    const session = sessions.get(sessionId);
    socket.emit('sessionState', {
      position: session.position,
      moves: session.moves
    });
    
    io.to(sessionId).emit('userJoined', { role, socketId: socket.id });
    console.log(`Client ${socket.id} joined session ${sessionId}`);
  });

  // Handle moves
  socket.on('move', (moveData) => {
    if (!socket.sessionId || !sessions.has(socket.sessionId)) {
      socket.emit('error', 'Invalid session');
      return;
    }

    const session = sessions.get(socket.sessionId);
    const move = {
      ...moveData,
      timestamp: Date.now(),
      role: socket.role
    };

    session.moves.push(move);
    session.position = moveData.fen;
    
    io.to(socket.sessionId).emit('moveMade', move);
    console.log(`Move made in session ${socket.sessionId}:`, move);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.sessionId) {
      io.to(socket.sessionId).emit('userLeft', { 
        role: socket.role,
        socketId: socket.id 
      });
      console.log(`Client ${socket.id} disconnected from session ${socket.sessionId}`);
    }
  });
});

// API Routes

// Create new session
app.post('/api/session', (req, res) => {
  try {
    const sessionId = Math.random().toString(36).substring(2, 15);
    sessions.set(sessionId, {
      moves: [],
      position: 'start',
      createdAt: Date.now()
    });
    console.log('New session created:', sessionId);
    res.json({ sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get session state
app.get('/api/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(sessions.get(sessionId));
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Load puzzle endpoint
app.get('/api/puzzle', (req, res) => {
  try {
    console.log('Generating puzzle...');
    
    // Sample puzzles array
    const puzzles = [
      {
        id: 'puzzle1',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        moves: ['d2d4', 'f8c5', 'c2c3'],
        rating: 1500,
        themes: ['opening', 'middlegame']
      },
      {
        id: 'puzzle2',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        moves: ['e7e5', 'g1f3', 'b8c6'],
        rating: 1200,
        themes: ['opening']
      },
      {
        id: 'puzzle3',
        fen: 'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2',
        moves: ['e4e5', 'f6d5', 'd2d4'],
        rating: 1600,
        themes: ['opening', 'attack']
      }
    ];
    
    // Select a random puzzle
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    console.log('Selected puzzle:', randomPuzzle);
    
    res.json(randomPuzzle);
  } catch (error) {
    console.error('Error generating puzzle:', error);
    res.status(500).json({ 
      error: 'Failed to generate puzzle',
      details: error.message 
    });
  }
});

// Session cleanup (run every hour)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    // Remove sessions older than 24 hours
    if (now - session.createdAt > 24 * 60 * 60 * 1000) {
      sessions.delete(sessionId);
      console.log('Cleaned up expired session:', sessionId);
    }
  }
}, 60 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Gracefully shutdown in case of critical errors
  process.exit(1);
});