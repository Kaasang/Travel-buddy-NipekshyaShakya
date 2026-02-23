/**
 * Message Controller
 * Handles messaging between users and group chats
 */

const { Message, User, Profile, Trip, TripMember, Notification } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Send a direct message to a user
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, content, tripId } = req.body;

    if (!content || content.trim() === '') {
        throw new ApiError('Message content is required', 400);
    }

    // If it's a group message (tripId provided)
    if (tripId) {
        // Verify user is a member of the trip
        const membership = await TripMember.findOne({
            where: { tripId, userId: req.user.id, status: 'active' }
        });

        if (!membership) {
            throw new ApiError('You are not a member of this trip', 403);
        }

        const message = await Message.create({
            senderId: req.user.id,
            tripId,
            content: content.trim(),
            messageType: 'text'
        });

        // Fetch with sender info
        const messageWithSender = await Message.findByPk(message.id, {
            include: [{
                model: User,
                as: 'sender',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id']
            }]
        });

        return res.status(201).json({
            success: true,
            data: messageWithSender
        });
    }

    // Direct message
    if (!receiverId) {
        throw new ApiError('Receiver ID is required for direct messages', 400);
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
        throw new ApiError('Receiver not found', 404);
    }

    const message = await Message.create({
        senderId: req.user.id,
        receiverId,
        content: content.trim(),
        messageType: 'text'
    });

    // Create notification for receiver
    await Notification.create({
        userId: receiverId,
        type: 'message',
        title: 'New Message',
        message: `You have a new message`,
        link: `/messages/${req.user.id}`
    });

    // Fetch with sender info
    const messageWithSender = await Message.findByPk(message.id, {
        include: [{
            model: User,
            as: 'sender',
            include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
            attributes: ['id']
        }]
    });

    res.status(201).json({
        success: true,
        data: messageWithSender
    });
});

/**
 * @desc    Get conversation with a user
 * @route   GET /api/messages/conversation/:userId
 * @access  Private
 */
const getConversation = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const otherUserId = req.params.userId;

    const { count, rows: messages } = await Message.findAndCountAll({
        where: {
            [Op.or]: [
                { senderId: req.user.id, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: req.user.id }
            ],
            isDeleted: false
        },
        include: [
            {
                model: User,
                as: 'sender',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id']
            }
        ],
        order: [['createdAt', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    // Mark messages from other user as read
    await Message.update(
        { isRead: true, readAt: new Date() },
        {
            where: {
                senderId: otherUserId,
                receiverId: req.user.id,
                isRead: false
            }
        }
    );

    // Get other user info
    const otherUser = await User.findByPk(otherUserId, {
        include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
        attributes: ['id', 'isVerified']
    });

    res.json({
        success: true,
        data: {
            messages,
            otherUser,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        }
    });
});

/**
 * @desc    Get trip group chat messages
 * @route   GET /api/messages/trip/:tripId
 * @access  Private
 */
const getTripMessages = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const { tripId } = req.params;

    // Verify user is a member
    const membership = await TripMember.findOne({
        where: { tripId, userId: req.user.id, status: 'active' }
    });

    if (!membership) {
        throw new ApiError('You are not a member of this trip', 403);
    }

    const { count, rows: messages } = await Message.findAndCountAll({
        where: { tripId, isDeleted: false },
        include: [{
            model: User,
            as: 'sender',
            include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
            attributes: ['id']
        }],
        order: [['createdAt', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    // Get trip info
    const trip = await Trip.findByPk(tripId, {
        attributes: ['id', 'title', 'destination']
    });

    res.json({
        success: true,
        data: {
            messages,
            trip,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        }
    });
});

/**
 * @desc    Get all conversations (inbox)
 * @route   GET /api/messages/inbox
 * @access  Private
 */
const getInbox = asyncHandler(async (req, res) => {
    // Get latest message from each conversation
    const sentMessages = await Message.findAll({
        where: { senderId: req.user.id, tripId: null, isDeleted: false },
        include: [{
            model: User,
            as: 'receiver',
            include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
            attributes: ['id']
        }],
        order: [['createdAt', 'DESC']]
    });

    const receivedMessages = await Message.findAll({
        where: { receiverId: req.user.id, tripId: null, isDeleted: false },
        include: [{
            model: User,
            as: 'sender',
            include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
            attributes: ['id']
        }],
        order: [['createdAt', 'DESC']]
    });

    // Build conversations from messages
    const conversationsMap = new Map();

    [...sentMessages, ...receivedMessages].forEach(msg => {
        const otherUserId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
        const otherUser = msg.senderId === req.user.id ? msg.receiver : msg.sender;

        if (!conversationsMap.has(otherUserId) ||
            new Date(msg.createdAt) > new Date(conversationsMap.get(otherUserId).lastMessage.createdAt)) {
            conversationsMap.set(otherUserId, {
                userId: otherUserId,
                user: otherUser,
                lastMessage: {
                    content: msg.content,
                    createdAt: msg.createdAt,
                    isRead: msg.isRead,
                    isSentByMe: msg.senderId === req.user.id
                }
            });
        }
    });

    // Get unread count for each conversation
    for (const [userId, convo] of conversationsMap) {
        const unreadCount = await Message.count({
            where: {
                senderId: userId,
                receiverId: req.user.id,
                isRead: false
            }
        });
        convo.unreadCount = unreadCount;
    }

    const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json({
        success: true,
        data: conversations
    });
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
const deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
        throw new ApiError('Message not found', 404);
    }

    if (message.senderId !== req.user.id) {
        throw new ApiError('Not authorized to delete this message', 403);
    }

    await message.update({ isDeleted: true });

    res.json({
        success: true,
        message: 'Message deleted'
    });
});

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread/count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Message.count({
        where: {
            receiverId: req.user.id,
            isRead: false,
            isDeleted: false
        }
    });

    res.json({
        success: true,
        data: { count }
    });
});

module.exports = {
    sendMessage,
    getConversation,
    getTripMessages,
    getInbox,
    deleteMessage,
    getUnreadCount
};
