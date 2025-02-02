const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Регистрация
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Проверяем существование пользователя
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            if (userExists.email === email) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }
            return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
        }

        // Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Создаем пользователя
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Генерируем токен
        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Ошибка сервера при регистрации', error: error.message });
    }
};

// Вход в систему
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Ошибка сервера при входе', error: error.message });
    }
};

// Получение профиля
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Ошибка при получении профиля' });
    }
};

// Обновление профиля
const updateProfile = async (req, res) => {
    try {
        const updates = {
            username: req.body.username,
            email: req.body.email,
            bio: req.body.bio
        };

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Ошибка при обновлении профиля' });
    }
};

// Получение контактов
const getContacts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('contacts', 'username email status')
            .select('contacts');
        res.json(user.contacts);
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ message: 'Ошибка при получении контактов' });
    }
};

// Добавление контакта
const addContact = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { contacts: req.params.userId } },
            { new: true }
        ).populate('contacts', 'username email status');

        res.json(user.contacts);
    } catch (error) {
        console.error('Add contact error:', error);
        res.status(500).json({ message: 'Ошибка при добавлении контакта' });
    }
};

// Удаление контакта
const removeContact = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { contacts: req.params.userId } },
            { new: true }
        ).populate('contacts', 'username email status');

        res.json(user.contacts);
    } catch (error) {
        console.error('Remove contact error:', error);
        res.status(500).json({ message: 'Ошибка при удалении контакта' });
    }
};

// Отладочные функции
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Ошибка при получении пользователей' });
    }
};

const clearAll = async (req, res) => {
    try {
        await User.deleteMany({});
        res.json({ message: 'Все пользователи удалены' });
    } catch (error) {
        console.error('Clear all users error:', error);
        res.status(500).json({ message: 'Ошибка при удалении пользователей' });
    }
};

// Вспомогательные функции
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getContacts,
    addContact,
    removeContact,
    getAllUsers,
    clearAll
};