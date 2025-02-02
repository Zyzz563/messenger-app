const Message = require('../models/Message');
const mongoose = require('mongoose');
const TypingStatus = require('../models/TypingStatus');

// Получаем доступ к io из server.js
let io;
exports.setIo = (_io) => {
    io = _io;
};

// Отправка сообщения
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Необходимо указать получателя и текст сообщения' });
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username avatar')
            .populate('receiver', 'username avatar');

        // Отправляем уведомление через WebSocket
        const receiverSocketId = Array.from(io.sockets.sockets.values())
            .find(socket => socket.userId === receiverId)?.id;

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('new_message', populatedMessage);
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        res.status(500).json({ message: error.message });
    }
};

// Получение истории чата с пользователем
exports.getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUser, receiver: userId },
                { sender: userId, receiver: currentUser }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'username avatar')
        .populate('receiver', 'username avatar')
        .limit(50);

        res.json(messages.reverse());
    } catch (error) {
        console.error('Ошибка при получении истории чата:', error);
        res.status(500).json({ message: error.message });
    }
};

// Получение списка чатов
exports.getChats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Находим все сообщения, где пользователь является отправителем или получателем
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'username avatar')
        .populate('receiver', 'username avatar');

        // Создаем Map для хранения последних сообщений для каждого чата
        const chatsMap = new Map();

        messages.forEach(message => {
            const chatPartnerId = message.sender._id.toString() === userId.toString()
                ? message.receiver._id.toString()
                : message.sender._id.toString();

            if (!chatsMap.has(chatPartnerId)) {
                chatsMap.set(chatPartnerId, {
                    user: message.sender._id.toString() === userId.toString()
                        ? message.receiver
                        : message.sender,
                    lastMessage: message
                });
            }
        });

        const chats = Array.from(chatsMap.values());
        res.json(chats);
    } catch (error) {
        console.error('Ошибка при получении списка чатов:', error);
        res.status(500).json({ message: error.message });
    }
};

// Отметить сообщения как прочитанные
exports.markAsRead = async (req, res) => {
    try {
        const { messageIds } = req.body;
        const userId = req.user._id;

        const result = await Message.updateMany(
            {
                _id: { $in: messageIds },
                receiver: userId,
                read: false
            },
            { $set: { read: true } }
        );

        if (result.modifiedCount > 0) {
            // Уведомляем отправителей через WebSocket
            const messages = await Message.find({ _id: { $in: messageIds } })
                .populate('sender', 'username');

            messages.forEach(message => {
                const senderSocketId = Array.from(io.sockets.sockets.values())
                    .find(socket => socket.userId === message.sender._id.toString())?.id;

                if (senderSocketId) {
                    io.to(senderSocketId).emit('messages_read', {
                        messageIds: [message._id],
                        readBy: userId
                    });
                }
            });
        }

        res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Ошибка при отметке сообщений как прочитанных:', error);
        res.status(500).json({ message: error.message });
    }
};

// Обработка статуса печати
exports.setTypingStatus = async (req, res) => {
    try {
        const { receiverId, isTyping } = req.body;
        const senderId = req.user._id;

        const receiverSocketId = Array.from(io.sockets.sockets.values())
            .find(socket => socket.userId === receiverId)?.id;

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing_status', {
                userId: senderId,
                isTyping
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка при установке статуса печати:', error);
        res.status(500).json({ message: error.message });
    }
};

// Получение статуса печати
exports.getTypingStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user._id;

        const typingStatus = await TypingStatus.findOne({
            $or: [
                { sender: currentUser, receiver: userId },
                { sender: userId, receiver: currentUser }
            ]
        });

        res.json({ isTyping: typingStatus?.isTyping || false });
    } catch (error) {
        console.error('Ошибка при получении статуса печати:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    setIo: exports.setIo,
    sendMessage: exports.sendMessage,
    getChatHistory: exports.getChatHistory,
    getChats: exports.getChats,
    markAsRead: exports.markAsRead,
    setTypingStatus: exports.setTypingStatus,
    getTypingStatus: exports.getTypingStatus
};