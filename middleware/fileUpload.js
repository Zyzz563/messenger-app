const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем временную директорию, если её нет
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка хранилища
const storage = multer.memoryStorage();

// Фильтр файлов
const fileFilter = (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
    
    if (!allowedTypes.includes(file.mimetype)) {
        cb(new Error('Неподдерживаемый тип файла'), false);
        return;
    }

    cb(null, true);
};

// Настройка загрузки
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) // Максимальный размер файла
    }
});

// Middleware для обработки ошибок загрузки
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Файл слишком большой'
            });
        }
    }
    
    if (err.message === 'Неподдерживаемый тип файла') {
        return res.status(400).json({
            message: err.message
        });
    }

    next(err);
};

module.exports = {
    upload,
    handleUploadError
};
