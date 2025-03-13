import React, { useState } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

function Home() {
  const navigate = useNavigate();
  const { createGame } = useGame();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTimeControl, setSelectedTimeControl] = useState('10+0');
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const timeControls = [
    { value: '1+0', label: 'Bullet (1+0)' },
    { value: '3+0', label: 'Blitz (3+0)' },
    { value: '5+0', label: 'Blitz (5+0)' },
    { value: '10+0', label: 'Rapid (10+0)' },
    { value: '15+10', label: 'Rapid (15+10)' },
    { value: '30+0', label: 'Classical (30+0)' },
  ];

  const handleCreateGame = async () => {
    setIsCreatingGame(true);
    try {
      const game = await createGame(selectedTimeControl);
      navigate(`/game/${game._id}`);
    } catch (error) {
      toast({
        title: 'Error creating game',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCreatingGame(false);
      onClose();
    }
  };

  const gameModes = [
    {
      title: 'Quick Match',
      description: 'Find a random opponent for a quick game',
      timeControl: '10+0',
      onClick: () => {
        setSelectedTimeControl('10+0');
        onOpen();
      },
    },
    {
      title: 'Rapid',
      description: 'Classic rapid chess with 15+10 time control',
      timeControl: '15+10',
      onClick: () => {
        setSelectedTimeControl('15+10');
        onOpen();
      },
    },
    {
      title: 'Blitz',
      description: 'Fast-paced blitz chess with 5+0 time control',
      timeControl: '5+0',
      onClick: () => {
        setSelectedTimeControl('5+0');
        onOpen();
      },
    },
  ];

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Welcome to ChessByAI
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Play chess against players from around the world
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          {gameModes.map((mode) => (
            <Box
              key={mode.title}
              p={6}
              bg={bgColor}
              borderRadius="lg"
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
              transition="all 0.2s"
            >
              <VStack spacing={4} align="stretch">
                <Heading size="md">{mode.title}</Heading>
                <Text color="gray.600">{mode.description}</Text>
                <Text fontWeight="bold">Time Control: {mode.timeControl}</Text>
                <Button colorScheme="blue" onClick={mode.onClick}>
                  Play Now
                </Button>
              </VStack>
            </Box>
          ))}
        </Grid>

        <Box mt={8} p={6} bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor}>
          <Heading size="md" mb={4}>
            Features
          </Heading>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <Text>• Real-time multiplayer gameplay</Text>
            <Text>• Multiple time controls</Text>
            <Text>• Player ratings and statistics</Text>
            <Text>• Game history and analysis</Text>
            <Text>• Beautiful and responsive UI</Text>
            <Text>• Sound effects and animations</Text>
          </Grid>
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Game</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Time Control</FormLabel>
                <Select
                  value={selectedTimeControl}
                  onChange={(e) => setSelectedTimeControl(e.target.value)}
                >
                  {timeControls.map((control) => (
                    <option key={control.value} value={control.value}>
                      {control.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Button
                colorScheme="blue"
                width="100%"
                onClick={handleCreateGame}
                isLoading={isCreatingGame}
              >
                Create Game
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Home; 