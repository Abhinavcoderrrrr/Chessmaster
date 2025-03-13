const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  white: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  black: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  result: {
    type: String,
    enum: ['white', 'black', 'draw'],
    default: null
  },
  timeControl: {
    type: String,
    required: true,
    default: '10+0'
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
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
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

// Method to update player statistics when game is completed
gameSchema.methods.updatePlayerStats = async function() {
  const User = mongoose.model('User');
  
  // Update white player stats
  await User.findByIdAndUpdate(this.white, {
    $inc: {
      'stats.gamesPlayed': 1,
      'stats.wins': this.result === 'white' ? 1 : 0,
      'stats.losses': this.result === 'black' ? 1 : 0,
      'stats.draws': this.result === 'draw' ? 1 : 0,
      'rating': this.ratingChanges.white
    }
  });

  // Update black player stats
  await User.findByIdAndUpdate(this.black, {
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