import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null,
  });

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.USER.PROFILE, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const user = await response.json();
          setAuthState({
            user,
            token,
            loading: false,
            error: null,
          });
        } else {
          localStorage.removeItem('token');
          setAuthState({
            user: null,
            token: null,
            loading: false,
            error: 'Сессия истекла. Пожалуйста, войдите снова.',
          });
        }
      } catch (error) {
        console.error('Auth error:', error);
        setAuthState({
          user: null,
          token: null,
          loading: false,
          error: 'Ошибка подключения к серверу. Пожалуйста, проверьте соединение.',
        });
      }
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        setAuthState({
          user: data.user,
          token: data.token,
          loading: false,
          error: null,
        });
        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.message || 'Неверный email или пароль',
        }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Ошибка подключения к серверу. Пожалуйста, проверьте соединение.',
      }));
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        setAuthState({
          user: data.user,
          token: data.token,
          loading: false,
          error: null,
        });
        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.message || 'Ошибка при регистрации',
        }));
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Ошибка подключения к серверу. Пожалуйста, проверьте соединение.',
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  };

  return {
    ...authState,
    login,
    register,
    logout,
  };
};
