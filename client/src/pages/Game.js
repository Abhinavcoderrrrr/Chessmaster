import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  useColorModeValue,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { Chess } from 'chess.js';
import { useGame } from '../context/GameContext';
import ChessBoard from '../components/ChessBoard';
import GameAnalysis from '../components/GameAnalysis';
import GameChat from '../components/GameChat';
import GameStats from '../components/GameStats';

function Game() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentGame, isConnected, joinGame, makeMove, updateGameStatus, leaveGame } = useGame();
  const [game, setGame] = useState(new Chess());
  const [timeLeft, setTimeLeft] = useState({ white: 600, black: 600 }); // 10 minutes in seconds
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [playerColor, setPlayerColor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [moves, setMoves] = useState([]);
  const [username, setUsername] = useState('');
  const [playerRating, setPlayerRating] = useState(1500); // Default rating
  const [opponentRating, setOpponentRating] = useState(1500);
  const [ratingChange, setRatingChange] = useState(0);
  const boardRef = useRef(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUsername(user.username);
      setPlayerRating(user.rating || 1500);
    }
  }, []);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        const gameData = await joinGame(gameId);
        setPlayerColor(gameData.white === localStorage.getItem('userId') ? 'white' : 'black');
        setOpponentRating(gameData.opponentRating || 1500);
        setIsLoading(false);
      } catch (error) {
        toast({
          title: 'Error joining game',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      }
    };

    initializeGame();
  }, [gameId]);

  useEffect(() => {
    if (!currentGame) return;

    // Set up socket listeners
    const socket = currentGame.socket;
    socket.on('move-made', (data) => {
      const { from, to, piece } = data;
      const newGame = new Chess(game.fen());
      const move = newGame.move({ from, to, piece });
      if (move) {
        setMoves(prev => [...prev, move]);
      }
      setGame(newGame);
      setIsWhiteTurn(!isWhiteTurn);
    });

    return () => {
      socket.off('move-made');
    };
  }, [currentGame, game, isWhiteTurn]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = { ...prev };
        if (isWhiteTurn) {
          newTime.white = Math.max(0, prev.white - 1);
          if (newTime.white === 0) {
            handleGameEnd('black');
          }
        } else {
          newTime.black = Math.max(0, prev.black - 1);
          if (newTime.black === 0) {
            handleGameEnd('white');
          }
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWhiteTurn]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateRatingChange = (winner) => {
    const K = 32; // K-factor for rating calculation
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const actualScore = winner === playerColor ? 1 : 0;
    const ratingDiff = Math.round(K * (actualScore - expectedScore));
    setRatingChange(ratingDiff);
    return ratingDiff;
  };

  const handleMove = (from, to) => {
    if (!isConnected || (playerColor === 'white' && !isWhiteTurn) || (playerColor === 'black' && isWhiteTurn)) {
      return;
    }

    try {
      const move = game.move({ from, to });
      if (move) {
        makeMove(from, to, move.piece);
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
  };

  const handleGameEnd = async (winner) => {
    try {
      const ratingChange = calculateRatingChange(winner);
      await updateGameStatus(gameId, 'completed', winner, ratingChange);
      toast({
        title: 'Game Over',
        description: `${winner === 'white' ? 'White' : 'Black'} wins! Rating change: ${ratingChange >= 0 ? '+' : ''}${ratingChange}`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating game status:', error);
    }
  };

  const handleLeaveGame = () => {
    leaveGame();
    navigate('/');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  const renderGameBoard = () => (
    <VStack spacing={4}>
      <Text fontSize="xl" fontWeight="bold">
        {isWhiteTurn ? 'White to move' : 'Black to move'}
      </Text>
      <Box
        ref={boardRef}
        w="100%"
        maxW="600px"
        aspectRatio="1"
        bg={bgColor}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        p={4}
      >
        <ChessBoard
          game={game}
          onMove={handleMove}
          isWhiteTurn={isWhiteTurn}
          playerColor={playerColor}
        />
      </Box>
      <HStack spacing={4}>
        <Text>White: {formatTime(timeLeft.white)}</Text>
        <Text>Black: {formatTime(timeLeft.black)}</Text>
      </HStack>
    </VStack>
  );

  const renderGameInfo = () => (
    <Box
      bg={bgColor}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      p={4}
      h="100%"
    >
      <VStack spacing={4} align="stretch" h="100%">
        <Text fontSize="xl" fontWeight="bold">
          Game Info
        </Text>
        <Text>Game ID: {gameId}</Text>
        <Text>Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
        <Text>Your Color: {playerColor || 'Not assigned'}</Text>
        <Button colorScheme="red" onClick={handleLeaveGame}>
          Leave Game
        </Button>
        <Box flex="1" minH="300px">
          <GameChat
            socket={currentGame?.socket}
            gameId={gameId}
            username={username}
          />
        </Box>
      </VStack>
    </Box>
  );

  const renderGameStats = () => (
    <Box>
      <GameStats
        game={game}
        playerColor={playerColor}
        opponentColor={playerColor === 'white' ? 'black' : 'white'}
        playerRating={playerRating}
        opponentRating={opponentRating}
        ratingChange={ratingChange}
      />
    </Box>
  );

  return (
    <Tabs>
      <TabList>
        <Tab>Game</Tab>
        {currentGame?.status === 'completed' && <Tab>Analysis</Tab>}
      </TabList>
      <TabPanels>
        <TabPanel>
          <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap={6}>
            <Box>{renderGameBoard()}</Box>
            <Box>{renderGameInfo()}</Box>
          </Grid>
          <Box mt={6}>
            {renderGameStats()}
          </Box>
        </TabPanel>
        {currentGame?.status === 'completed' && (
          <TabPanel>
            <GameAnalysis
              moves={moves}
              initialFen={game.fen()}
            />
          </TabPanel>
        )}
      </TabPanels>
    </Tabs>
  );
}

export default Game; 