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

  useEffect(() => {
    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
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
      }
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create game. Please try again.');
    }
  };

  const joinGame = async (gameId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/games/${gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentGame(response.data);
      socket.emit('join-game', gameId);
      return response.data;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  };

  const makeMove = (from, to, piece) => {
    if (currentGame && socket) {
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
    }
  };

  const calculateComputerMove = () => {
    if (!stockfish || !currentGame) return;

    const fen = currentGame.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const depth = Math.min(currentGame.computerDifficulty, 20);
    
    stockfish.postMessage(`position fen ${fen}`);
    stockfish.postMessage(`go depth ${depth}`);
  };

  const updateGameStatus = async (gameId, status, result) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/games/${gameId}/status`,
        { status, result },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentGame(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating game status:', error);
      throw error;
    }
  };

  const leaveGame = () => {
    if (currentGame && socket) {
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