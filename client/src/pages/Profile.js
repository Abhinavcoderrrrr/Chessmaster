import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';

function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    rating: 1200,
  });
  const [recentGames, setRecentGames] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
        setStats(response.data.stats);
        setRecentGames(response.data.recentGames);
      } catch (error) {
        toast({
          title: 'Error fetching profile',
          description: error.response?.data?.message || 'Something went wrong',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchUserData();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <Box maxW="4xl" mx="auto" mt={8} p={6}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" mb={2}>{user.username}</Heading>
          <Text color="gray.600">{user.email}</Text>
        </Box>

        <StatGroup>
          <Stat>
            <StatLabel>Games Played</StatLabel>
            <StatNumber>{stats.gamesPlayed}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Wins</StatLabel>
            <StatNumber color="green.500">{stats.wins}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Losses</StatLabel>
            <StatNumber color="red.500">{stats.losses}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Draws</StatLabel>
            <StatNumber color="yellow.500">{stats.draws}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Rating</StatLabel>
            <StatNumber color="blue.500">{stats.rating}</StatNumber>
          </Stat>
        </StatGroup>

        <Box>
          <Heading size="md" mb={4}>Recent Games</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Opponent</Th>
                <Th>Result</Th>
                <Th>Rating Change</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentGames.map((game) => (
                <Tr key={game._id}>
                  <Td>{new Date(game.date).toLocaleDateString()}</Td>
                  <Td>{game.opponent}</Td>
                  <Td color={game.result === 'win' ? 'green.500' : game.result === 'loss' ? 'red.500' : 'yellow.500'}>
                    {game.result.toUpperCase()}
                  </Td>
                  <Td color={game.ratingChange > 0 ? 'green.500' : 'red.500'}>
                    {game.ratingChange > 0 ? '+' : ''}{game.ratingChange}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
}

export default Profile; 