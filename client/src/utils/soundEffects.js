// Sound effects for chess moves
const moveSound = new Audio('/sounds/move.mp3');
const captureSound = new Audio('/sounds/capture.mp3');
const checkSound = new Audio('/sounds/check.mp3');
const checkmateSound = new Audio('/sounds/checkmate.mp3');
const castleSound = new Audio('/sounds/castle.mp3');

// Preload sounds
moveSound.load();
captureSound.load();
checkSound.load();
checkmateSound.load();
castleSound.load();

// Set volume levels
moveSound.volume = 0.5;
captureSound.volume = 0.6;
checkSound.volume = 0.7;
checkmateSound.volume = 0.8;
castleSound.volume = 0.6;

export const playMoveSound = (move, isCheck, isCheckmate) => {
  if (isCheckmate) {
    checkmateSound.currentTime = 0;
    checkmateSound.play();
  } else if (move.captured) {
    captureSound.currentTime = 0;
    captureSound.play();
  } else if (move.flags.includes('k') || move.flags.includes('q')) {
    castleSound.currentTime = 0;
    castleSound.play();
  } else if (isCheck) {
    checkSound.currentTime = 0;
    checkSound.play();
  } else {
    moveSound.currentTime = 0;
    moveSound.play();
  }
}; 