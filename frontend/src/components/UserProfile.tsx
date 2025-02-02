import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  TextField,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  status?: 'online' | 'offline' | 'away';
}

interface UserProfileProps {
  user: UserData;
  onUpdateProfile: (userData: Partial<UserData>) => Promise<void>;
}

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 600,
  margin: 'auto',
}));

const AvatarInput = styled('input')({
  display: 'none',
});

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    setEditData({
      username: user.username,
      email: user.email,
      bio: user.bio,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UserData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditData({ ...editData, [field]: event.target.value });
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      // Здесь можно добавить логику загрузки аватара
      console.log('Avatar file:', event.target.files[0]);
    }
  };

  return (
    <ProfilePaper elevation={2}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            src={user.avatar}
            sx={{ width: 120, height: 120, mb: 2 }}
          >
            {user.username[0].toUpperCase()}
          </Avatar>
          <label htmlFor="avatar-input">
            <AvatarInput
              accept="image/*"
              id="avatar-input"
              type="file"
              onChange={handleAvatarChange}
            />
            <IconButton
              color="primary"
              component="span"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 0,
                backgroundColor: 'background.paper',
              }}
            >
              <PhotoCameraIcon />
            </IconButton>
          </label>
        </Box>
        <Typography
          variant="caption"
          component="div"
          sx={{
            color: user.status === 'online' ? 'success.main' : 'text.secondary',
          }}
        >
          {user.status === 'online' ? 'В сети' : 'Не в сети'}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        {isEditing ? (
          <>
            <TextField
              fullWidth
              label="Имя пользователя"
              value={editData.username}
              onChange={handleChange('username')}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={editData.email}
              onChange={handleChange('email')}
              margin="normal"
            />
            <TextField
              fullWidth
              label="О себе"
              value={editData.bio}
              onChange={handleChange('bio')}
              margin="normal"
              multiline
              rows={3}
            />
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              {user.username}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            {user.bio && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                {user.bio}
              </Typography>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {isEditing ? (
          <>
            <Button
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
            >
              Сохранить
            </Button>
          </>
        ) : (
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            onClick={handleEdit}
          >
            Редактировать
          </Button>
        )}
      </Box>
    </ProfilePaper>
  );
};

export default UserProfile;
