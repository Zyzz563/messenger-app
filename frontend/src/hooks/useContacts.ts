import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface Contact {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export const useContacts = (token: string | null) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка контактов
  const loadContacts = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.USER.CONTACTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        throw new Error('Failed to load contacts');
      }
    } catch (error) {
      setError('Error loading contacts');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Добавление нового контакта
  const addContact = useCallback(async (email: string) => {
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.USER.CONTACTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const newContact = await response.json();
        setContacts(prev => [...prev, newContact]);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add contact');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error adding contact');
      }
      return false;
    }
  }, [token]);

  // Удаление контакта
  const removeContact = useCallback(async (contactId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.USER.CONTACTS}/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setContacts(prev => prev.filter(contact => contact.id !== contactId));
        return true;
      } else {
        throw new Error('Failed to remove contact');
      }
    } catch (error) {
      setError('Error removing contact');
      return false;
    }
  }, [token]);

  // Обновление статуса контакта
  const updateContactStatus = useCallback((contactId: string, status: Contact['status']) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === contactId
          ? { ...contact, status }
          : contact
      )
    );
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return {
    contacts,
    loading,
    error,
    addContact,
    removeContact,
    updateContactStatus,
  };
};
