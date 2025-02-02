const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/messenger', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB успешно подключена');
    } catch (error) {
        console.error('Ошибка подключения к MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
