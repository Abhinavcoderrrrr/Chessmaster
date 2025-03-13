import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Select,
  RadioGroup,
  Radio,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const ComputerGameSettings = () => {
  const [difficulty, setDifficulty] = useState('5');
  const [color, setColor] = useState('white');
  const [timeControl, setTimeControl] = useState('10+0');
  const navigate = useNavigate();
  const { createGame } = useGame();
  const toast = useToast();

  const handleStartGame = async () => {
    try {
      const game = await createGame({
        timeControl,
        isComputer: true,
        computerDifficulty: parseInt(difficulty),
        playerColor: color,
      });
      navigate(`/game/${game._id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create game. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" maxW="md" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="xl" fontWeight="bold">Computer Game Settings</Text>
        
        <Box>
          <Text mb={2}>Difficulty Level</Text>
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </Select>
        </Box>

        <Box>
          <Text mb={2}>Time Control</Text>
          <Select value={timeControl} onChange={(e) => setTimeControl(e.target.value)}>
            <option value="10+0">Quick (10+0)</option>
            <option value="15+10">Rapid (15+10)</option>
            <option value="5+0">Blitz (5+0)</option>
          </Select>
        </Box>

        <Box>
          <Text mb={2}>Choose Your Color</Text>
          <RadioGroup value={color} onChange={setColor}>
            <HStack spacing={4}>
              <Radio value="white">White</Radio>
              <Radio value="black">Black</Radio>
              <Radio value="random">Random</Radio>
            </HStack>
          </RadioGroup>
        </Box>

        <Button colorScheme="blue" onClick={handleStartGame}>
          Start Game
        </Button>
      </VStack>
    </Box>
  );
};

export default ComputerGameSettings; 