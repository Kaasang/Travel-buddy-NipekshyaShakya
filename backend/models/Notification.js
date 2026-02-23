/**
 * Notification Model
 * Stores user notifications for matches, messages, and trips
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('match', 'message', 'trip_request', 'trip_update', 'rating', 'system'),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING(500)
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        field: 'is_read',
        defaultValue: false
    },
    readAt: {
        type: DataTypes.DATE,
        field: 'read_at'
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true
});

module.exports = Notification;
