const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const auth = require('../middleware/auth');

// Create a new game
router.post('/', auth, async (req, res) => {
  try {
    const { timeControl, isComputer, computerDifficulty, playerColor } = req.body;
    
    let game;
    if (isComputer) {
      // For computer games, create a new game immediately
      game = new Game({
        timeControl,
        isComputer,
        computerDifficulty: computerDifficulty || 5,
        playerColor: playerColor || 'w',
        whitePlayer: playerColor === 'w' ? req.user._id : null,
        blackPlayer: playerColor === 'b' ? req.user._id : null,
        status: 'active'
      });
    } else {
      // For online games, try to find an opponent
      game = await Game.findOne({
        status: 'waiting',
        timeControl,
        whitePlayer: { $ne: req.user._id }
      });

      if (!game) {
        game = new Game({
          timeControl,
          whitePlayer: req.user._id,
          status: 'waiting'
        });
      } else {
        game.blackPlayer = req.user._id;
        game.status = 'active';
      }
    }

    await game.save();
    res.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ message: 'Error creating game' });
  }
});

// Get game details
router.get('/:id', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('whitePlayer', 'username rating')
      .populate('blackPlayer', 'username rating');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if user is part of the game
    if (game.whitePlayer?._id.toString() !== req.user._id.toString() &&
        game.blackPlayer?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this game' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ message: 'Error fetching game' });
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
    if (game.whitePlayer?.toString() !== req.user._id.toString() &&
        game.blackPlayer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this game' });
    }

    game.status = status;
    if (result) {
      game.result = result;
    }

    await game.save();
    res.json(game);
  } catch (error) {
    console.error('Error updating game status:', error);
    res.status(500).json({ message: 'Error updating game status' });
  }
});

// Get active games for user
router.get('/user/active', auth, async (req, res) => {
  try {
    const games = await Game.find({
      $or: [
        { whitePlayer: req.user._id },
        { blackPlayer: req.user._id }
      ],
      status: 'active'
    })
    .populate('whitePlayer', 'username rating')
    .populate('blackPlayer', 'username rating');

    res.json(games);
  } catch (error) {
    console.error('Error fetching active games:', error);
    res.status(500).json({ message: 'Error fetching active games' });
  }
});

module.exports = router; 