import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  const basename = process.env.NODE_ENV === 'production' ? '/Chessmaster' : '';

  return (
    <Router basename={basename}>
      <GameProvider>
        <Box minH="100vh" bg="gray.100">
          <Navbar />
          <Box maxW="1200px" mx="auto" p={4}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game/:id" element={<Game />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </GameProvider>
    </Router>
  );
}

export default App; 