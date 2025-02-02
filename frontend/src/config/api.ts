export const API_BASE_URL = 'http://localhost:5002/api';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/users/login`,
    REGISTER: `${API_BASE_URL}/users/register`,
    MESSAGES: {
        SEND: `${API_BASE_URL}/messages/send`,
        GET_CHATS: `${API_BASE_URL}/messages/chats`,
        GET_CHAT: (userId: string) => `${API_BASE_URL}/messages/chat/${userId}`,
        READ: `${API_BASE_URL}/messages/read`,
        TYPING: `${API_BASE_URL}/messages/typing`,
        GET_TYPING: (userId: string) => `${API_BASE_URL}/messages/typing/${userId}`,
    },
    USER: {
        PROFILE: `${API_BASE_URL}/users/profile`,
        STATUS: `${API_BASE_URL}/users/status`,
        CONTACTS: `${API_BASE_URL}/users/contacts`,
    }
};
