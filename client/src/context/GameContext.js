import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://chessmaster-lkd8.onrender.com'
  : 'http://localhost:5000';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stockfish, setStockfish] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setError('Connection error. Please try again.');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message || 'An error occurred');
    });

    // Initialize Stockfish
    if (typeof window !== 'undefined' && window.Stockfish) {
      const engine = new window.Stockfish();
      engine.onmessage = (event) => {
        console.log('Stockfish:', event);
      };
      setStockfish(engine);
    }

    return () => {
      if (newSocket) {
        newSocket.close();
      }
      if (stockfish) {
        stockfish.terminate();
      }
    };
  }, []);

  const createGame = async (gameOptions) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_URL}/api/games`,
        gameOptions,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (!response.data) {
        throw new Error('No game data received from server');
      }

      setCurrentGame(response.data);
      if (socket && socket.connected) {
        socket.emit('join-game', response.data._id);
      } else {
        throw new Error('Socket connection not available');
      }
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create game. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const joinGame = async (gameId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_URL}/api/games/${gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data) {
        throw new Error('No game data received from server');
      }

      setCurrentGame(response.data);
      if (socket && socket.connected) {
        socket.emit('join-game', gameId);
      } else {
        throw new Error('Socket connection not available');
      }
      return response.data;
    } catch (error) {
      console.error('Error joining game:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to join game. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const makeMove = (from, to, piece) => {
    if (!currentGame || !socket || !socket.connected) {
      setError('Game connection not available');
      return;
    }

    try {
      socket.emit('make-move', {
        gameId: currentGame._id,
        from,
        to,
        piece
      });

      // If it's a computer game and it's the computer's turn, calculate and make the move
      if (currentGame.isComputer && currentGame.currentTurn !== currentGame.playerColor) {
        calculateComputerMove();
      }
    } catch (error) {
      console.error('Error making move:', error);
      setError('Failed to make move. Please try again.');
    }
  };

  const calculateComputerMove = () => {
    if (!stockfish || !currentGame) {
      setError('Computer opponent not available');
      return;
    }

    try {
      const fen = currentGame.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const depth = Math.min(currentGame.computerDifficulty, 20);
      
      stockfish.postMessage(`position fen ${fen}`);
      stockfish.postMessage(`go depth ${depth}`);
    } catch (error) {
      console.error('Error calculating computer move:', error);
      setError('Failed to calculate computer move');
    }
  };

  const updateGameStatus = async (gameId, status, result) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.patch(
        `${API_URL}/api/games/${gameId}/status`,
        { status, result },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentGame(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating game status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update game status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const leaveGame = () => {
    if (currentGame && socket && socket.connected) {
      socket.emit('leave-game', currentGame._id);
      setCurrentGame(null);
    }
  };

  return (
    <GameContext.Provider
      value={{
        socket,
        currentGame,
        isConnected,
        error,
        createGame,
        joinGame,
        makeMove,
        updateGameStatus,
        leaveGame,
        stockfish
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 