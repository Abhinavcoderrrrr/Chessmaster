const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create a new game
router.post('/', auth, async (req, res) => {
  try {
    const { timeControl } = req.body;
    const user = await User.findById(req.user.userId);
    
    // Find an opponent with similar rating
    const opponent = await User.findOne({
      _id: { $ne: user._id },
      rating: { $gte: user.rating - 200, $lte: user.rating + 200 },
    });

    if (!opponent) {
      return res.status(404).json({ message: 'No suitable opponent found' });
    }

    // Randomly assign colors
    const isWhite = Math.random() < 0.5;
    const game = new Game({
      white: isWhite ? user._id : opponent._id,
      black: isWhite ? opponent._id : user._id,
      timeControl,
    });

    await game.save();

    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error creating game', error: error.message });
  }
});

// Get game by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('white', 'username rating')
      .populate('black', 'username rating');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game', error: error.message });
  }
});

// Update game status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, result } = req.body;
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if user is part of the game
    if (!game.white.equals(req.user.userId) && !game.black.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to update this game' });
    }

    game.status = status;
    game.result = result;
    game.endTime = new Date();

    if (status === 'completed' && result) {
      // Calculate rating changes using ELO system
      const whitePlayer = await User.findById(game.white);
      const blackPlayer = await User.findById(game.black);
      
      const K = 32; // ELO K-factor
      const expectedWhite = 1 / (1 + Math.pow(10, (blackPlayer.rating - whitePlayer.rating) / 400));
      const expectedBlack = 1 - expectedWhite;

      if (result === 'white') {
        game.ratingChanges = {
          white: Math.round(K * (1 - expectedWhite)),
          black: Math.round(K * (0 - expectedBlack)),
        };
      } else if (result === 'black') {
        game.ratingChanges = {
          white: Math.round(K * (0 - expectedWhite)),
          black: Math.round(K * (1 - expectedBlack)),
        };
      } else {
        game.ratingChanges = {
          white: Math.round(K * (0.5 - expectedWhite)),
          black: Math.round(K * (0.5 - expectedBlack)),
        };
      }

      // Update player statistics
      await game.updatePlayerStats();
    }

    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error updating game', error: error.message });
  }
});

// Get active games for a user
router.get('/user/active', auth, async (req, res) => {
  try {
    const games = await Game.find({
      $or: [{ white: req.user.userId }, { black: req.user.userId }],
      status: 'active',
    })
      .populate('white', 'username rating')
      .populate('black', 'username rating');

    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active games', error: error.message });
  }
});

module.exports = router; 