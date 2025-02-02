import React from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
}

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.selected': {
    backgroundColor: theme.palette.action.selected,
  },
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
}));

const ChatList: React.FC<ChatListProps> = ({ chats, onChatSelect, selectedChatId }) => {
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 2 }}>
      {chats.map((chat) => (
        <StyledListItem
          key={chat.id}
          onClick={() => onChatSelect(chat.id)}
          className={selectedChatId === chat.id ? 'selected' : ''}
        >
          <ListItemAvatar>
            <Badge
              color="primary"
              badgeContent={chat.unreadCount}
              invisible={chat.unreadCount === 0}
            >
              <Avatar src={chat.avatar} alt={chat.name}>
                {chat.name[0].toUpperCase()}
              </Avatar>
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={chat.name}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{ display: 'inline', mr: 1 }}
                >
                  {chat.lastMessage}
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  {chat.timestamp}
                </Typography>
              </React.Fragment>
            }
          />
        </StyledListItem>
      ))}
    </List>
  );
};

export default ChatList;
