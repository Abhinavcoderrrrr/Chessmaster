const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://chessmaster-lkd8.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type']
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/build', 'index.html'));
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if cannot connect to database
});

const games = new Map();
const stockfishInstances = new Map();

const initializeStockfish = (gameId) => {
  const stockfish = spawn('stockfish');
  stockfishInstances.set(gameId, stockfish);

  stockfish.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('bestmove')) {
      const move = output.split('bestmove ')[1].split(' ')[0];
      io.to(gameId).emit('computer-move', { move });
    }
  });

  stockfish.stdin.write('uci\n');
  stockfish.stdin.write('setoption name MultiPV value 1\n');
  stockfish.stdin.write('isready\n');
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-game', (gameId) => {
    try {
      if (!gameId) {
        console.error('No game ID provided for join-game event');
        return;
      }

      socket.join(gameId);
      if (!games.has(gameId)) {
        games.set(gameId, {
          players: [],
          moves: [],
          currentTurn: 'w',
          isComputer: false,
          computerDifficulty: 5,
          playerColor: 'w'
        });
      }
      const game = games.get(gameId);
      if (!game.players.includes(socket.id)) {
        game.players.push(socket.id);
      }
      socket.emit('game-state', game);

      // Initialize Stockfish for computer games
      if (game.isComputer && !stockfishInstances.has(gameId)) {
        try {
          initializeStockfish(gameId);
        } catch (error) {
          console.error('Error initializing Stockfish:', error);
          socket.emit('error', { message: 'Failed to initialize computer opponent' });
        }
      }
    } catch (error) {
      console.error('Error in join-game handler:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  socket.on('make-move', ({ gameId, from, to, piece }) => {
    try {
      if (!gameId || !from || !to) {
        console.error('Invalid move data received');
        return;
      }

      const game = games.get(gameId);
      if (!game) {
        console.error('Game not found:', gameId);
        return;
      }

      game.moves.push({ from, to, piece });
      game.currentTurn = game.currentTurn === 'w' ? 'b' : 'w';
      io.to(gameId).emit('move-made', { from, to, piece, currentTurn: game.currentTurn });

      // If it's a computer game and it's the computer's turn, calculate the move
      if (game.isComputer && game.currentTurn !== game.playerColor) {
        const stockfish = stockfishInstances.get(gameId);
        if (stockfish) {
          const fen = generateFEN(game.moves);
          stockfish.stdin.write(`position fen ${fen}\n`);
          stockfish.stdin.write(`go depth ${game.computerDifficulty}\n`);
        } else {
          console.error('Stockfish instance not found for game:', gameId);
        }
      }
    } catch (error) {
      console.error('Error in make-move handler:', error);
      socket.emit('error', { message: 'Failed to process move' });
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    socket.emit('error', { message: 'An error occurred' });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up Stockfish instances
    for (const [gameId, stockfish] of stockfishInstances.entries()) {
      if (games.get(gameId)?.players.includes(socket.id)) {
        try {
          stockfish.kill();
          stockfishInstances.delete(gameId);
        } catch (error) {
          console.error('Error cleaning up Stockfish instance:', error);
        }
      }
    }
  });
});

const generateFEN = (moves) => {
  // This is a simplified FEN generation
  // In a real implementation, you would need to properly track the board state
  return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 