const https = require('https');
const fs = require('fs');
const path = require('path');

// Chess.com official sound URLs
const sounds = {
  'move.mp3': 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3',
  'capture.mp3': 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
  'check.mp3': 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3',
  'checkmate.mp3': 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3',
  'castle.mp3': 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/castle.mp3',
  'game-start.mp3': 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-start.mp3',
  'game-end.mp3': 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3',
  'illegal.mp3': 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/illegal.mp3'
};

// Chess.com piece image URLs (using the default piece set)
const pieces = {
  'wP.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wp.png',
  'wN.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wn.png',
  'wB.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wb.png',
  'wR.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wr.png',
  'wQ.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wq.png',
  'wK.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wk.png',
  'bP.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bp.png',
  'bN.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bn.png',
  'bB.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bb.png',
  'bR.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/br.png',
  'bQ.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bq.png',
  'bK.png': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bk.png'
};

// Create directories if they don't exist
const soundsDir = path.join(__dirname, 'client', 'public', 'sounds');
const piecesDir = path.join(__dirname, 'client', 'public', 'images', 'pieces');

[soundsDir, piecesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Download function
const download = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded: ${filepath}`);
          resolve();
        });
      } else {
        console.error(`Failed to download ${filepath}: ${response.statusCode}`);
        reject(new Error(`HTTP Status: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${filepath}:`, err);
      reject(err);
    });
  });
};

// Download sounds
Object.entries(sounds).forEach(([filename, url]) => {
  const filepath = path.join(soundsDir, filename);
  download(url, filepath);
});

// Download piece images
Object.entries(pieces).forEach(([filename, url]) => {
  const filepath = path.join(piecesDir, filename);
  download(url, filepath);
}); 