import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
} from '@chakra-ui/react';

function GameStats({ game, playerColor, opponentColor, playerRating, opponentRating, ratingChange }) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const calculateMaterialAdvantage = () => {
    const pieceValues = {
      'p': 1,
      'n': 3,
      'b': 3,
      'r': 5,
      'q': 9,
      'k': 0
    };

    let advantage = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + i) + (8 - j);
        const piece = game.get(square);
        if (piece) {
          const value = pieceValues[piece.type.toLowerCase()];
          advantage += piece.color === playerColor ? value : -value;
        }
      }
    }
    return advantage;
  };

  const materialAdvantage = calculateMaterialAdvantage();
  const maxAdvantage = 39; // Maximum possible material advantage (all pieces)

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      p={4}
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Game Statistics
        </Text>

        <HStack spacing={4} justify="space-between">
          <Stat>
            <StatLabel>Your Rating</StatLabel>
            <StatNumber>{playerRating}</StatNumber>
            <StatHelpText>
              <StatArrow type={ratingChange >= 0 ? 'increase' : 'decrease'} />
              {Math.abs(ratingChange)} points
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Opponent Rating</StatLabel>
            <StatNumber>{opponentRating}</StatNumber>
          </Stat>
        </HStack>

        <Box>
          <Text mb={2}>Material Advantage</Text>
          <Progress
            value={(materialAdvantage + maxAdvantage) / (2 * maxAdvantage) * 100}
            colorScheme={materialAdvantage > 0 ? 'green' : materialAdvantage < 0 ? 'red' : 'gray'}
            size="sm"
            borderRadius="full"
          />
          <Text fontSize="sm" mt={1}>
            {materialAdvantage > 0 ? '+' : ''}{materialAdvantage}
          </Text>
        </Box>

        <Box>
          <Text mb={2}>Time Control</Text>
          <HStack spacing={4}>
            <Text>{playerColor === 'white' ? 'White' : 'Black'}: {game.timeLeft[playerColor]}s</Text>
            <Text>{opponentColor === 'white' ? 'White' : 'Black'}: {game.timeLeft[opponentColor]}s</Text>
          </HStack>
        </Box>

        <Box>
          <Text mb={2}>Move Count</Text>
          <Text>{game.history().length} moves</Text>
        </Box>
      </VStack>
    </Box>
  );
}

export default GameStats; 