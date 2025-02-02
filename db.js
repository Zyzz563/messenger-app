const mongoose = require('mongoose');

const connectDB = async () => {
    try {
<<<<<<< HEAD
        await mongoose.connect('mongodb://localhost:27017/messenger', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
=======
        await mongoose.connect('mongodb://localhost:27017/messenger');
>>>>>>> 05d09618f74bc7041ebd22d3424882a5b3fe11cc
        console.log('MongoDB успешно подключена');
    } catch (error) {
        console.error('Ошибка подключения к MongoDB:', error.message);
        process.exit(1);
    }
};

<<<<<<< HEAD
module.exports = connectDB;
=======
module.exports = connectDB; 
>>>>>>> 05d09618f74bc7041ebd22d3424882a5b3fe11cc
