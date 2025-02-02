import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface Contact {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

interface ContactListProps {
  contacts: Contact[];
  onStartChat: (contactId: string) => void;
  onAddContact?: (email: string) => void;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const SearchField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(2),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 2),
}));

const StatusDot = styled('span')<{ status: Contact['status'] }>(({ theme, status }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  display: 'inline-block',
  marginRight: theme.spacing(1),
  backgroundColor:
    status === 'online'
      ? theme.palette.success.main
      : status === 'away'
      ? theme.palette.warning.main
      : theme.palette.grey[400],
}));

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onStartChat,
  onAddContact,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <StyledPaper elevation={0}>
      <SearchField
        fullWidth
        placeholder="Поиск контактов..."
        value={searchTerm}
        onChange={handleSearch}
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: onAddContact && (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => onAddContact(searchTerm)}
                disabled={!searchTerm.includes('@')}
                title="Добавить контакт"
              >
                <PersonAddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {filteredContacts.map((contact) => (
          <StyledListItem
            key={contact.id}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => onStartChat(contact.id)}
                title="Начать чат"
              >
                <MessageIcon />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar src={contact.avatar} alt={contact.username}>
                {contact.username[0].toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="subtitle2" component="div">
                  <StatusDot status={contact.status} />
                  {contact.username}
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {contact.status === 'online'
                    ? 'В сети'
                    : contact.lastSeen
                    ? `Был(а) в сети ${contact.lastSeen}`
                    : 'Не в сети'}
                </Typography>
              }
            />
          </StyledListItem>
        ))}
      </List>
    </StyledPaper>
  );
};

export default ContactList;
