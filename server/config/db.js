const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/messenger';
        
        // Настройка mongoose
        mongoose.set('strictQuery', false);
        
        // Подключение с обработкой ошибок
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Таймаут подключения
            socketTimeoutMS: 45000, // Таймаут сокета
        });

        console.log(`MongoDB успешно подключена: ${conn.connection.host}`);

        // Обработка ошибок после подключения
        mongoose.connection.on('error', err => {
            console.error('MongoDB error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB отключена');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB соединение закрыто через app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during MongoDB shutdown:', err);
                process.exit(1);
            }
        });

        return conn;
    } catch (error) {
        console.error('Ошибка подключения к MongoDB:', error);
        throw error; // Пробрасываем ошибку для обработки в server.js
    }
};

module.exports = connectDB;
