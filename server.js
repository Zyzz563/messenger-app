const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 5002;

// Настройка CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Маршруты
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Тестовый роут
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Что-то пошло не так!' });
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/messenger')
    .then(() => {
        console.log('MongoDB успешно подключена');
        http.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Ошибка подключения к MongoDB:', error);
    });

io.on('connection', (socket) => {
    console.log('Пользователь подключился');
    
    socket.on('disconnect', () => {
        console.log('Пользователь отключился');
    });
});