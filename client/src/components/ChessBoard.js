import React, { useState, useEffect } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Chess } from 'chess.js';
import { playMoveSound } from '../utils/soundEffects';

const BOARD_COLORS = {
  light: '#F0D9B5', // chess.com light square color
  dark: '#B58863',  // chess.com dark square color
  highlight: 'rgba(155, 199, 0, 0.41)',
  lastMove: 'rgba(155, 199, 0, 0.41)',
  check: 'rgba(255, 0, 0, 0.2)',
};

const PIECES = {
  'p': '/images/pieces/bP.png',
  'r': '/images/pieces/bR.png',
  'n': '/images/pieces/bN.png',
  'b': '/images/pieces/bB.png',
  'q': '/images/pieces/bQ.png',
  'k': '/images/pieces/bK.png',
  'P': '/images/pieces/wP.png',
  'R': '/images/pieces/wR.png',
  'N': '/images/pieces/wN.png',
  'B': '/images/pieces/wB.png',
  'Q': '/images/pieces/wQ.png',
  'K': '/images/pieces/wK.png'
};

function ChessBoard({ game, onMove, isWhiteTurn, playerColor, isAnalysis = false }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPiece, setDragPiece] = useState(null);
  const [dragSquare, setDragSquare] = useState(null);
  const [isCheck, setIsCheck] = useState(false);
  const [boardSize, setBoardSize] = useState(0);

  useEffect(() => {
    const updateBoardSize = () => {
      const vw = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
      setBoardSize(Math.min(vw, 600)); // Max size of 600px
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  useEffect(() => {
    const history = game.history({ verbose: true });
    if (history.length > 0) {
      const lastMove = history[history.length - 1];
      setLastMove({
        from: lastMove.from,
        to: lastMove.to
      });
    }
    setIsCheck(game.isCheck());
  }, [game]);

  const getSquareColor = (square) => {
    const isLight = (square.charCodeAt(0) + square.charCodeAt(1)) % 2 === 0;
    const baseColor = isLight ? BOARD_COLORS.light : BOARD_COLORS.dark;

    if (selectedSquare === square) {
      return BOARD_COLORS.highlight;
    }

    if (lastMove && (lastMove.from === square || lastMove.to === square)) {
      return BOARD_COLORS.lastMove;
    }

    if (isCheck && game.get(square)?.type === 'k' && game.get(square)?.color === game.turn()) {
      return BOARD_COLORS.check;
    }

    return baseColor;
  };

  const handleSquareClick = (square) => {
    if (isAnalysis) return;

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === (isWhiteTurn ? 'w' : 'b')) {
        setSelectedSquare(square);
      }
    } else {
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q'
        });

        if (move) {
          playMoveSound(move, game.isCheck(), game.isCheckmate());
          onMove(selectedSquare, square);
        }
      } catch (error) {
        // Invalid move
      }
      setSelectedSquare(null);
    }
  };

  const handleDragStart = (square, piece) => {
    if (isAnalysis) return;
    
    const pieceObj = game.get(square);
    if (pieceObj && pieceObj.color === (isWhiteTurn ? 'w' : 'b')) {
      setIsDragging(true);
      setDragPiece(piece);
      setDragSquare(square);
    }
  };

  const handleDragEnd = (square) => {
    if (!isDragging || !dragSquare) return;

    try {
      const move = game.move({
        from: dragSquare,
        to: square,
        promotion: 'q'
      });

      if (move) {
        playMoveSound(move, game.isCheck(), game.isCheckmate());
        onMove(dragSquare, square);
      }
    } catch (error) {
      // Invalid move
    } finally {
      setIsDragging(false);
      setDragPiece(null);
      setDragSquare(null);
    }
  };

  const renderSquare = (square) => {
    const piece = game.get(square);
    const isSelected = selectedSquare === square;
    const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
    const isCheckSquare = isCheck && piece?.type === 'k' && piece?.color === game.turn();

    return (
      <Box
        key={square}
        position="relative"
        width="12.5%"
        paddingBottom="12.5%"
        bg={getSquareColor(square)}
        cursor={isAnalysis ? 'default' : 'pointer'}
        onClick={() => handleSquareClick(square)}
        onDragStart={() => handleDragStart(square, piece)}
        onDragEnd={() => handleDragEnd(square)}
        draggable={!isAnalysis && piece && piece.color === (isWhiteTurn ? 'w' : 'b')}
        transition="background-color 0.2s"
        _hover={{
          bg: isAnalysis ? getSquareColor(square) : BOARD_COLORS.highlight
        }}
      >
        {piece && (
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            userSelect="none"
            transition="transform 0.2s"
            transform={isDragging && dragSquare === square ? 'scale(1.1)' : 'scale(1)'}
            zIndex={isDragging && dragSquare === square ? 2 : 1}
          >
            <img
              src={PIECES[piece.type + (piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase())]}
              alt={`${piece.color}${piece.type}`}
              style={{
                width: '90%',
                height: '90%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  const renderBoard = () => {
    const squares = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    // Flip the board if playing as black
    const displayRanks = playerColor === 'b' ? ranks.slice().reverse() : ranks;
    const displayFiles = playerColor === 'b' ? files.slice().reverse() : files;

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = displayFiles[file] + displayRanks[rank];
        squares.push(renderSquare(square));
      }
    }

    return squares;
  };

  return (
    <Box
      position="relative"
      width={`${boardSize}px`}
      height={`${boardSize}px`}
      margin="0 auto"
      display="grid"
      gridTemplateColumns="repeat(8, 1fr)"
      gridTemplateRows="repeat(8, 1fr)"
      border="2px solid #8B4513"
      borderRadius="4px"
      boxShadow="0 4px 8px rgba(0,0,0,0.1)"
    >
      {renderBoard()}
    </Box>
  );
}

export default ChessBoard; 