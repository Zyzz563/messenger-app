const mongoose = require('mongoose');
const crypto = require('crypto');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'contact'],
        default: 'text',
        required: true
    },
    content: {
        text: String,
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        mimeType: String,
        duration: Number, // для аудио/видео
        thumbnail: String,
        location: {
            latitude: Number,
            longitude: Number,
            address: String
        },
        contact: {
            name: String,
            phone: String,
            email: String
        }
    },
    metadata: {
        encryptionType: {
            type: String,
            enum: ['none', 'e2e', 'server'],
            default: 'server'
        },
        iv: String, // Вектор инициализации для шифрования
        encryptedKey: String, // Зашифрованный ключ сообщения (для e2e)
        clientId: String, // ID устройства отправителя
        originalTimestamp: Date // Timestamp на устройстве отправителя
    },
    status: {
        delivered: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        readAt: Date,
        deliveredAt: Date
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    forwardedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    edited: {
        type: Boolean,
        default: false
    },
    editHistory: [{
        content: Object,
        editedAt: Date
    }],
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reaction: String,
        timestamp: Date
    }],
    tags: [String],
    importance: {
        type: String,
        enum: ['normal', 'high', 'urgent'],
        default: 'normal'
    },
    expiresAt: Date, // Для самоуничтожающихся сообщений
    deletedFor: [{ // Для удаления сообщений у конкретных пользователей
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        deletedAt: Date
    }]
}, {
    timestamps: true,
    strict: false // Позволяет добавлять дополнительные поля в будущем
});

// Индексы для оптимизации запросов
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ 'content.text': 'text' }); // Для полнотекстового поиска

// Методы шифрования
messageSchema.methods.encrypt = async function(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
};

messageSchema.methods.decrypt = async function(encryptedData, key, iv, authTag) {
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(key, 'hex'),
        Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Middleware для автоматической обработки сообщений
messageSchema.pre('save', async function(next) {
    if (this.type === 'text' && this.metadata.encryptionType === 'server') {
        // Здесь будет логика шифрования на сервере
        // Ключ шифрования должен храниться безопасно
    }
    next();
});

// Виртуальные поля
messageSchema.virtual('isExpired').get(function() {
    return this.expiresAt && new Date() > this.expiresAt;
});

messageSchema.virtual('age').get(function() {
    return new Date() - this.createdAt;
});

// Настройка toJSON
messageSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.__v;
        if (ret.metadata && ret.metadata.encryptionType === 'e2e') {
            delete ret.content; // Не отправляем зашифрованный контент
        }
        return ret;
    }
});

module.exports = mongoose.model('Message', messageSchema);