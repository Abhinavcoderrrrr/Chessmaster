import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderRadius="lg" boxShadow="lg">
      <VStack spacing={6}>
        <Heading>Login</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isLoading}
            >
              Login
            </Button>
          </VStack>
        </form>

        <Text>
          Don't have an account?{' '}
          <ChakraLink as={RouterLink} to="/register" color="blue.500">
            Register here
          </ChakraLink>
        </Text>
      </VStack>
    </Box>
  );
}

export default Login; 