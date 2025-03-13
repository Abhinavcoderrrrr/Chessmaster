const express = require('express');
const http = require('http');
const Server = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
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
      ? 'https://chess-by-ai.onrender.com' 
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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-game', (gameId) => {
    socket.join(gameId);
    if (!games.has(gameId)) {
      games.set(gameId, {
        players: [],
        moves: [],
        currentTurn: 'w'
      });
    }
    const game = games.get(gameId);
    if (!game.players.includes(socket.id)) {
      game.players.push(socket.id);
    }
    socket.emit('game-state', game);
  });

  socket.on('make-move', ({ gameId, from, to }) => {
    const game = games.get(gameId);
    if (game) {
      game.moves.push({ from, to });
      game.currentTurn = game.currentTurn === 'w' ? 'b' : 'w';
      io.to(gameId).emit('move-made', { from, to, currentTurn: game.currentTurn });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 