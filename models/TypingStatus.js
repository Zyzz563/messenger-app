const mongoose = require('mongoose');

const typingStatusSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isTyping: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Автоматически удалять статус через 5 секунд после последнего обновления
typingStatusSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 5 });

const TypingStatus = mongoose.model('TypingStatus', typingStatusSchema);

module.exports = TypingStatus;