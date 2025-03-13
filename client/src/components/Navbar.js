import React from 'react';
import { Box, Flex, Button, Heading, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box bg={bgColor} borderBottom="1px" borderColor={borderColor} px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto">
        <Heading as={RouterLink} to="/" size="md" cursor="pointer">
          ChessByAI
        </Heading>
        
        <Flex gap={4}>
          <Button as={RouterLink} to="/" variant="ghost">
            Home
          </Button>
          <Button as={RouterLink} to="/profile" variant="ghost">
            Profile
          </Button>
          <Button as={RouterLink} to="/login" colorScheme="blue" variant="outline">
            Login
          </Button>
          <Button as={RouterLink} to="/register" colorScheme="blue">
            Register
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Navbar; 