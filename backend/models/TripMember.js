/**
 * TripMember Model
 * Tracks users who have joined trips
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TripMember = sequelize.define('TripMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tripId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'trip_id',
        references: {
            model: 'trips',
            key: 'id'
        }
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
    role: {
        type: DataTypes.ENUM('creator', 'member', 'pending'),
        defaultValue: 'member'
    },
    joinedAt: {
        type: DataTypes.DATE,
        field: 'joined_at',
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('active', 'left', 'removed'),
        defaultValue: 'active'
    }
}, {
    tableName: 'trip_members',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['trip_id', 'user_id']
        }
    ]
});

module.exports = TripMember;
