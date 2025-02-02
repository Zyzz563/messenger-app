import React, { useState } from 'react';
import { Box, Grid, Paper, useTheme, useMediaQuery, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import ContactList from '../components/ContactList';
import { useAuthContext } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import { useContacts } from '../hooks/useContacts';

const Messenger: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showContacts, setShowContacts] = useState(false);

  const { user, token, logout } = useAuthContext();
  const { chats, messages, currentChat, sendMessage, selectChat } = useChat(token);
  const { contacts, addContact } = useContacts(token);

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user || !token) {
    navigate('/login');
    return null;
  }

  const handleSendMessage = (message: string) => {
    if (currentChat) {
      sendMessage(message);
    }
  };

  const handleStartChat = (contactId: string) => {
    // Находим или создаем чат с этим контактом
    const existingChat = chats.find(chat =>
      chat.participants.some(p => p.id === contactId)
    );

    if (existingChat) {
      selectChat(existingChat.id);
    } else {
      // В реальном приложении здесь будет логика создания нового чата
      console.log('Creating new chat with contact:', contactId);
    }

    setShowContacts(false);
  };

  const handleAddContact = async (email: string) => {
    await addContact(email);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatChatsForComponent = () => {
    return chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p.id !== user.id);
      return {
        id: chat.id,
        name: otherParticipant?.username || 'Unknown',
        lastMessage: chat.lastMessage?.content || '',
        timestamp: chat.lastMessage?.timestamp || '',
        unreadCount: chat.unreadCount,
        avatar: otherParticipant?.avatar,
      };
    });
  };

  const formatMessagesForComponent = () => {
    return messages.map(message => ({
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      sender: {
        id: message.sender.id,
        name: message.sender.username,
        avatar: message.sender.avatar,
      },
      isCurrentUser: message.sender.id === user.id,
    }));
  };

  const getCurrentChatInfo = () => {
    if (!currentChat) return undefined;

    const chat = chats.find(c => c.id === currentChat);
    if (!chat) return undefined;

    const otherParticipant = chat.participants.find(p => p.id !== user.id);
    if (!otherParticipant) return undefined;

    return {
      id: chat.id,
      name: otherParticipant.username,
      avatar: otherParticipant.avatar,
      status: contacts.find(c => c.id === otherParticipant.id)?.status || 'offline',
    };
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Button onClick={handleLogout} variant="outlined" color="primary">
          Выйти
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Grid container sx={{ flex: 1 }}>
          {/* Левая панель (список чатов или контактов) */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              height: '100%',
              borderRight: 1,
              borderColor: 'divider',
              display: isMobile && currentChat ? 'none' : 'block',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant={showContacts ? 'outlined' : 'contained'}
                  onClick={() => setShowContacts(false)}
                  fullWidth
                >
                  Чаты
                </Button>
                <Button
                  variant={showContacts ? 'contained' : 'outlined'}
                  onClick={() => setShowContacts(true)}
                  fullWidth
                >
                  Контакты
                </Button>
              </Box>

              {showContacts ? (
                <ContactList
                  contacts={contacts}
                  onStartChat={handleStartChat}
                  onAddContact={handleAddContact}
                />
              ) : (
                <ChatList
                  chats={formatChatsForComponent()}
                  onChatSelect={selectChat}
                  selectedChatId={currentChat || undefined}
                />
              )}
            </Paper>
          </Grid>

          {/* Правая панель (окно чата) */}
          <Grid
            item
            xs={12}
            md={9}
            sx={{
              height: '100%',
              display: isMobile && !currentChat ? 'none' : 'flex',
              flexDirection: 'column',
            }}
          >
            {currentChat ? (
              <>
                <ChatWindow
                  messages={formatMessagesForComponent()}
                  currentChat={getCurrentChatInfo()}
                />
                <MessageInput onSendMessage={handleSendMessage} />
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  bgcolor: 'background.default',
                }}
              >
                Выберите чат для начала общения
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Messenger;
