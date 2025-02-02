import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_ENDPOINTS } from '../config/api';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
  chatId: string;
  isRead: boolean;
}

interface Chat {
  id: string;
  participants: Array<{
    id: string;
    username: string;
    avatar?: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
}

export const useChat = (token: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Инициализация WebSocket соединения
  useEffect(() => {
    if (!token) return;

    const newSocket = io(API_ENDPOINTS.API_BASE_URL, {
      auth: {
        token,
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    newSocket.on('error', (error: string) => {
      setError(error);
    });

    newSocket.on('message', (message: Message) => {
      if (message.chatId === currentChat) {
        setMessages(prev => [...prev, message]);
      }
      updateChatLastMessage(message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  // Загрузка списка чатов
  const loadChats = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.MESSAGES.GET_CHATS, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data);
      } else {
        throw new Error('Failed to load chats');
      }
    } catch (error) {
      setError('Error loading chats');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Загрузка сообщений для текущего чата
  const loadMessages = useCallback(async (chatId: string) => {
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.MESSAGES.GET_CHAT(chatId), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        throw new Error('Failed to load messages');
      }
    } catch (error) {
      setError('Error loading messages');
    }
  }, [token]);

  // Отправка сообщения
  const sendMessage = useCallback(async (content: string) => {
    if (!socket || !currentChat) return;

    try {
      socket.emit('message', {
        chatId: currentChat,
        content,
      });
    } catch (error) {
      setError('Error sending message');
    }
  }, [socket, currentChat]);

  // Обновление последнего сообщения в чате
  const updateChatLastMessage = (message: Message) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === message.chatId) {
          return {
            ...chat,
            lastMessage: message,
            unreadCount: chat.id !== currentChat ? chat.unreadCount + 1 : chat.unreadCount,
          };
        }
        return chat;
      })
    );
  };

  // Выбор текущего чата
  const selectChat = useCallback((chatId: string) => {
    setCurrentChat(chatId);
    loadMessages(chatId);
    
    // Сбрасываем счетчик непрочитанных сообщений
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  }, [loadMessages]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    messages,
    currentChat,
    loading,
    error,
    sendMessage,
    selectChat,
  };
};
