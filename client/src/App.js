import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { GameProvider } from './context/GameContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <GameProvider>
      <Box minH="100vh" bg="gray.100">
        <Navbar />
        <Box maxW="1200px" mx="auto" p={4}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/game/:gameId"
              element={
                <ProtectedRoute>
                  <Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </Box>
    </GameProvider>
  );
}

export default App; 