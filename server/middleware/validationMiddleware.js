const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Некорректный email адрес' });
    }

    // Валидация имени пользователя
    if (!username || username.length < 3 || username.length > 20) {
        return res.status(400).json({ 
            message: 'Имя пользователя должно содержать от 3 до 20 символов' 
        });
    }

    // Валидация пароля (минимум 6 символов)
    if (!password || password.length < 6) {
        return res.status(400).json({ 
            message: 'Пароль должен содержать минимум 6 символов' 
        });
    }

    next();
};

module.exports = {
    validateRegistration
};
