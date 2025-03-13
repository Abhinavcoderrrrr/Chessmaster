import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => newSocket.close();
  }, []);

  const createGame = async (timeControl) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/games',
        { timeControl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentGame(response.data);
      socket.emit('join-game', response.data._id);
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  };

  const joinGame = async (gameId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/games/${gameId}`,
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
    }
  };

  const updateGameStatus = async (gameId, status, result) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/games/${gameId}/status`,
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
        leaveGame
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