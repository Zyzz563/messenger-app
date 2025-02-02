const express = require('express');
const router = express.Router();
const { validateRegistration } = require('../middleware/validationMiddleware');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Аутентификация и регистрация
router.post('/register', validateRegistration, userController.register);
router.post('/login', userController.login);

// Профиль пользователя
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

// Контакты
router.get('/contacts', protect, userController.getContacts);
router.post('/contacts/:userId', protect, userController.addContact);
router.delete('/contacts/:userId', protect, userController.removeContact);

// Отладочные маршруты (только для разработки)
if (process.env.NODE_ENV === 'development') {
    router.get('/debug/all', userController.getAllUsers);
    router.delete('/debug/clear', userController.clearAll);
}

module.exports = router;