const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const connectDB = require('./config/db');

// Проверка обязательных переменных окружения
if (!process.env.JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET is not defined');
    process.exit(1);
}

const app = express();
const server = http.createServer(app);

// Настройка CORS - важно поставить до всех маршрутов
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Парсинг JSON
app.use(express.json());

// Обработка ошибок JSON парсинга
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Некорректный JSON' });
    }
    next();
});

// Routes
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ 
            message: 'Ошибка валидации', 
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: 'Некорректный формат данных' });
    }
    
    if (err.code === 11000) {
        return res.status(400).json({ 
            message: 'Такой пользователь уже существует',
            field: Object.keys(err.keyPattern)[0]
        });
    }

    res.status(500).json({ 
        message: 'Ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// WebSocket настройка
const io = socketIo(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// WebSocket аутентификация
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

// WebSocket обработчики
io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    
    socket.on('private_message', async (data) => {
        try {
            // Сохраняем сообщение в БД
            const message = new Message({
                sender: socket.userId,
                receiver: data.receiver,
                content: data.content
            });
            await message.save();
            
            // Отправляем получателю
            io.to(data.receiver).emit('private_message', {
                id: message._id,
                sender: socket.userId,
                content: data.content,
                createdAt: message.createdAt
            });
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId);
    });
});

// Подключение к базе данных и запуск сервера
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5001;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });