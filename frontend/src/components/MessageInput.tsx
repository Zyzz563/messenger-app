import React, { useState } from 'react';
import { Box, IconButton, InputBase, Paper } from '@mui/material';
import { Send as SendIcon, AttachFile as AttachFileIcon, EmojiEmotions as EmojiIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  borderRadius: theme.shape.borderRadius * 3,
  margin: theme.spacing(2),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  flex: 1,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 0),
  },
}));

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <StyledPaper elevation={1}>
        <IconButton size="small" color="primary">
          <EmojiIcon />
        </IconButton>
        <IconButton size="small" color="primary">
          <AttachFileIcon />
        </IconButton>
        <StyledInputBase
          placeholder="Введите сообщение..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          multiline
          maxRows={4}
        />
        <IconButton 
          color="primary" 
          type="submit"
          disabled={!message.trim() || disabled}
        >
          <SendIcon />
        </IconButton>
      </StyledPaper>
    </Box>
  );
};

export default MessageInput;
