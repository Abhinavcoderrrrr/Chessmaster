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
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://chessmaster-lkd8.onrender.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chess-game', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

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
      initializeStockfish(gameId);
    }
  });

  socket.on('make-move', ({ gameId, from, to, piece }) => {
    const game = games.get(gameId);
    if (game) {
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
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up Stockfish instances
    for (const [gameId, stockfish] of stockfishInstances.entries()) {
      if (games.get(gameId)?.players.includes(socket.id)) {
        stockfish.kill();
        stockfishInstances.delete(gameId);
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