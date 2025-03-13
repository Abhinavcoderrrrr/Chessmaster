import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import ComputerGameSettings from '../components/ComputerGameSettings';

const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [gameMode, setGameMode] = useState(null);
  const navigate = useNavigate();
  const { createGame } = useGame();
  const toast = useToast();

  const handleCreateGame = async (timeControl) => {
    try {
      const game = await createGame({ timeControl });
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

  const renderGameModeContent = () => {
    switch (gameMode) {
      case 'computer':
        return <ComputerGameSettings />;
      case 'online':
        return (
          <VStack spacing={4}>
            <Button
              colorScheme="blue"
              onClick={() => handleCreateGame('10+0')}
              width="full"
            >
              Quick Match (10+0)
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleCreateGame('15+10')}
              width="full"
            >
              Rapid (15+10)
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleCreateGame('5+0')}
              width="full"
            >
              Blitz (5+0)
            </Button>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Text fontSize="4xl" fontWeight="bold" textAlign="center">
          Welcome to Chess Master
        </Text>

        <HStack spacing={4} justify="center">
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => {
              setGameMode('online');
              onOpen();
            }}
          >
            Play Online
          </Button>
          <Button
            colorScheme="green"
            size="lg"
            onClick={() => {
              setGameMode('computer');
              onOpen();
            }}
          >
            Play vs Computer
          </Button>
        </HStack>

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Features
          </Text>
          <VStack align="start" spacing={2}>
            <Text>• Real-time multiplayer gameplay</Text>
            <Text>• Play against computer with adjustable difficulty</Text>
            <Text>• Multiple time controls</Text>
            <Text>• Sound effects and visual feedback</Text>
            <Text>• Game analysis and statistics</Text>
          </VStack>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {gameMode === 'computer' ? 'Play vs Computer' : 'Create New Game'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {renderGameModeContent()}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default Home; 