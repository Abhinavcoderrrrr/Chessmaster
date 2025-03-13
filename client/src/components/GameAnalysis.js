import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  IconButton,
  Tooltip,
  Grid,
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight, FaPlay, FaPause } from 'react-icons/fa';
import { Chess } from 'chess.js';
import ChessBoard from './ChessBoard';

const PIECES = {
  'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
  'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
};

function GameAnalysis({ moves, initialFen }) {
  const [currentMove, setCurrentMove] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [game, setGame] = useState(new Chess(initialFen));
  const [intervalId, setIntervalId] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleMove = (index) => {
    const newGame = new Chess(initialFen);
    for (let i = 0; i <= index; i++) {
      newGame.move(moves[i]);
    }
    setGame(newGame);
    setCurrentMove(index);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      clearInterval(intervalId);
      setIsPlaying(false);
    } else {
      const id = setInterval(() => {
        if (currentMove < moves.length - 1) {
          handleMove(currentMove + 1);
        } else {
          clearInterval(id);
          setIsPlaying(false);
        }
      }, 1000);
      setIntervalId(id);
      setIsPlaying(true);
    }
  };

  const handleFirstMove = () => handleMove(0);
  const handleLastMove = () => handleMove(moves.length - 1);
  const handlePreviousMove = () => {
    if (currentMove > 0) handleMove(currentMove - 1);
  };
  const handleNextMove = () => {
    if (currentMove < moves.length - 1) handleMove(currentMove + 1);
  };

  const formatMove = (move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const isWhite = index % 2 === 0;
    const piece = PIECES[move.piece.toUpperCase() + (isWhite ? 'P' : 'p')];
    return `${moveNumber}${isWhite ? '.' : '...'} ${piece}${move.from}-${move.to}`;
  };

  return (
    <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
      <Box bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor} p={4}>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            Game Analysis
          </Text>

          <Box
            w="100%"
            aspectRatio="1"
            bg={bgColor}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            p={4}
          >
            <ChessBoard
              game={game}
              onMove={() => {}}
              isWhiteTurn={currentMove % 2 === 0}
              playerColor="white"
              isAnalysis={true}
            />
          </Box>

          <HStack spacing={2} justify="center">
            <Tooltip label="First move">
              <IconButton
                icon={<FaChevronLeft />}
                onClick={handleFirstMove}
                isDisabled={currentMove === 0}
              />
            </Tooltip>
            <Tooltip label="Previous move">
              <IconButton
                icon={<FaChevronLeft />}
                onClick={handlePreviousMove}
                isDisabled={currentMove === 0}
              />
            </Tooltip>
            <Tooltip label={isPlaying ? "Pause" : "Play"}>
              <IconButton
                icon={isPlaying ? <FaPause /> : <FaPlay />}
                onClick={handlePlayPause}
              />
            </Tooltip>
            <Tooltip label="Next move">
              <IconButton
                icon={<FaChevronRight />}
                onClick={handleNextMove}
                isDisabled={currentMove === moves.length - 1}
              />
            </Tooltip>
            <Tooltip label="Last move">
              <IconButton
                icon={<FaChevronRight />}
                onClick={handleLastMove}
                isDisabled={currentMove === moves.length - 1}
              />
            </Tooltip>
          </HStack>
        </VStack>
      </Box>

      <Box
        bg={bgColor}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        p={4}
        maxH="600px"
        overflowY="auto"
      >
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            Move List
          </Text>
          <VStack spacing={1} align="stretch">
            {moves.map((move, index) => (
              <Button
                key={index}
                variant={currentMove === index ? 'solid' : 'ghost'}
                onClick={() => handleMove(index)}
                justifyContent="flex-start"
                size="sm"
              >
                {formatMove(move, index)}
              </Button>
            ))}
          </VStack>
        </VStack>
      </Box>
    </Grid>
  );
}

export default GameAnalysis; 