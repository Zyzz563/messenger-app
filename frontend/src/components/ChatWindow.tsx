import React, { useRef, useEffect } from 'react';
import { Box, Paper, Typography, Avatar, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  isCurrentUser: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  currentChat?: {
    id: string;
    name: string;
    avatar?: string;
    status?: string;
  };
}

const ChatHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  borderRadius: 0,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  overflowY: 'auto',
  height: 'calc(100vh - 180px)', // Adjust based on your layout
}));

const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser',
})<{ isCurrentUser: boolean }>(({ theme, isCurrentUser }) => ({
  padding: theme.spacing(1.5),
  maxWidth: '70%',
  borderRadius: theme.spacing(2),
  backgroundColor: isCurrentUser ? theme.palette.primary.main : theme.palette.grey[100],
  color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
}));

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, currentChat }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!currentChat) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h6" color="text.secondary">
          Выберите чат для начала общения
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChatHeader elevation={1}>
        <Avatar src={currentChat.avatar} sx={{ mr: 2 }}>
          {currentChat.name[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" component="div">
            {currentChat.name}
          </Typography>
          {currentChat.status && (
            <Typography variant="caption" color="text.secondary">
              {currentChat.status}
            </Typography>
          )}
        </Box>
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </ChatHeader>

      <MessageContainer>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.isCurrentUser ? 'flex-end' : 'flex-start',
            }}
          >
            <MessageBubble isCurrentUser={message.isCurrentUser}>
              <Typography variant="body1">{message.content}</Typography>
              <Typography variant="caption" color={message.isCurrentUser ? 'inherit' : 'text.secondary'}>
                {message.timestamp}
              </Typography>
            </MessageBubble>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </MessageContainer>
    </Box>
  );
};

export default ChatWindow;
