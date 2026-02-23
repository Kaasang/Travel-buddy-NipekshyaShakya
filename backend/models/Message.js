/**
 * Message Model
 * Stores chat messages between users
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sender_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Null for group messages
        field: 'receiver_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    tripId: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Set for group trip messages
        field: 'trip_id',
        references: {
            model: 'trips',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: {
                args: [1, 5000],
                msg: 'Message must be between 1 and 5000 characters'
            }
        }
    },
    messageType: {
        type: DataTypes.ENUM('text', 'image', 'file', 'system'),
        field: 'message_type',
        defaultValue: 'text'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        field: 'is_read',
        defaultValue: false
    },
    readAt: {
        type: DataTypes.DATE,
        field: 'read_at'
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        field: 'is_deleted',
        defaultValue: false
    }
}, {
    tableName: 'messages',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['sender_id', 'receiver_id']
        },
        {
            fields: ['trip_id']
        }
    ]
});

module.exports = Message;
