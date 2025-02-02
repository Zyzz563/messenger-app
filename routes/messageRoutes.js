const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

// Маршруты для сообщений
router.post('/send', protect, messageController.sendMessage);
router.get('/chat/:userId', protect, messageController.getChatHistory);
router.get('/chats', protect, messageController.getChats);
router.post('/read', protect, messageController.markAsRead);

// Маршруты для статуса печати
router.post('/typing', protect, messageController.setTypingStatus);
router.get('/typing/:userId', protect, messageController.getTypingStatus);

module.exports = router;