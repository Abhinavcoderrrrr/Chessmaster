const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent games
    const recentGames = await Game.find({
      $or: [{ white: user._id }, { black: user._id }],
    })
      .sort({ startTime: -1 })
      .limit(10)
      .populate('white', 'username')
      .populate('black', 'username');

    // Format recent games for response
    const formattedGames = recentGames.map(game => ({
      _id: game._id,
      date: game.startTime,
      opponent: game.white._id.equals(user._id) ? game.black.username : game.white.username,
      result: game.result === 'draw' ? 'draw' :
        (game.result === 'white' && game.white._id.equals(user._id)) ||
        (game.result === 'black' && game.black._id.equals(user._id)) ? 'win' : 'loss',
      ratingChange: game.white._id.equals(user._id) ? game.ratingChanges.white : game.ratingChanges.black,
    }));

    res.json({
      user,
      stats: user.stats,
      recentGames: formattedGames,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Get user's game history
router.get('/games', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const games = await Game.find({
      $or: [{ white: req.user.userId }, { black: req.user.userId }],
    })
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('white', 'username')
      .populate('black', 'username');

    const total = await Game.countDocuments({
      $or: [{ white: req.user.userId }, { black: req.user.userId }],
    });

    res.json({
      games,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game history', error: error.message });
  }
});

// Get user's statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('stats rating');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      stats: user.stats,
      rating: user.rating,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router; 