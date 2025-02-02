import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; sender: string; timestamp: Date }>>([]);
  const [contacts, setContacts] = useState<Array<{ id: string; username: string; status: string }>>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Здесь будем загружать контакты
    // TODO: Добавить загрузку контактов с сервера
  }, [navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedContact) {
      // TODO: Отправка сообщения на сервер
      setMessages(prev => [...prev, {
        text: message,
        sender: 'me',
        timestamp: new Date()
      }]);
      setMessage('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Messenger
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flexGrow: 1, mt: 2, mb: 2 }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Список контактов */}
          <Grid item xs={3}>
            <Paper sx={{ height: '100%', overflow: 'auto' }}>
              <List>
                {contacts.map(contact => (
                  <ListItem
                    button
                    key={contact.id}
                    selected={selectedContact === contact.id}
                    onClick={() => setSelectedContact(contact.id)}
                  >
                    <ListItemAvatar>
                      <Avatar>{contact.username[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={contact.username}
                      secondary={contact.status}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Область чата */}
          <Grid item xs={9}>
            <Paper sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              bgcolor: 'grey.100'
            }}>
              {selectedContact ? (
                <>
                  {/* Сообщения */}
                  <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                    {messages.map((msg, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: msg.sender === 'me' ? 'primary.main' : 'white',
                            color: msg.sender === 'me' ? 'white' : 'text.primary',
                            maxWidth: '70%'
                          }}
                        >
                          <Typography variant="body1">{msg.text}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                  </Box>

                  {/* Форма отправки сообщения */}
                  <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Введите сообщение..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </Grid>
                      <Grid item>
                        <IconButton 
                          type="submit" 
                          color="primary" 
                          sx={{ height: '100%' }}
                          disabled={!message.trim()}
                        >
                          <SendIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Выберите контакт для начала общения
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Chat;
