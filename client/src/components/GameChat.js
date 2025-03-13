import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useColorModeValue,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { SendIcon } from '@chakra-ui/icons';

function GameChat({ socket, gameId, username }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('chat-message', (data) => {
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    });

    return () => {
      socket.off('chat-message');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      gameId,
      username,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit('chat-message', messageData);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      p={4}
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <VStack spacing={4} h="100%" align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Game Chat
        </Text>

        <Box
          flex="1"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.300',
              borderRadius: '24px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'gray.400',
            },
          }}
        >
          <VStack spacing={2} align="stretch">
            {messages.map((msg, index) => (
              <Box key={index}>
                <HStack spacing={2}>
                  <Text fontWeight="bold" color="blue.500">
                    {msg.username}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {formatTime(msg.timestamp)}
                  </Text>
                </HStack>
                <Text>{msg.message}</Text>
                <Divider mt={2} />
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        <form onSubmit={handleSendMessage}>
          <HStack>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              size="sm"
            />
            <Tooltip label="Send message">
              <IconButton
                type="submit"
                icon={<SendIcon />}
                colorScheme="blue"
                size="sm"
                isDisabled={!newMessage.trim()}
              />
            </Tooltip>
          </HStack>
        </form>
      </VStack>
    </Box>
  );
}

export default GameChat; 