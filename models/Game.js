const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  whitePlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  blackPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timeControl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'abandoned'],
    default: 'waiting'
  },
  result: {
    type: String,
    enum: ['white', 'black', 'draw'],
    default: null
  },
  moves: [{
    from: String,
    to: String,
    piece: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isComputer: {
    type: Boolean,
    default: false
  },
  computerDifficulty: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  playerColor: {
    type: String,
    enum: ['w', 'b', 'random'],
    default: 'w'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  ratingChanges: {
    white: {
      type: Number,
      default: 0
    },
    black: {
      type: Number,
      default: 0
    }
  }
});

// Add indexes for better query performance
gameSchema.index({ whitePlayer: 1, status: 1 });
gameSchema.index({ blackPlayer: 1, status: 1 });
gameSchema.index({ status: 1, timeControl: 1 });

// Method to update player statistics when game is completed
gameSchema.methods.updatePlayerStats = async function() {
  const User = mongoose.model('User');
  
  // Update white player stats
  await User.findByIdAndUpdate(this.whitePlayer, {
    $inc: {
      'stats.gamesPlayed': 1,
      'stats.wins': this.result === 'white' ? 1 : 0,
      'stats.losses': this.result === 'black' ? 1 : 0,
      'stats.draws': this.result === 'draw' ? 1 : 0,
      'rating': this.ratingChanges.white
    }
  });

  // Update black player stats
  await User.findByIdAndUpdate(this.blackPlayer, {
    $inc: {
      'stats.gamesPlayed': 1,
      'stats.wins': this.result === 'black' ? 1 : 0,
      'stats.losses': this.result === 'white' ? 1 : 0,
      'stats.draws': this.result === 'draw' ? 1 : 0,
      'rating': this.ratingChanges.black
    }
  });
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game; 