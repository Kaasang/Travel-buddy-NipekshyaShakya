/**
 * Trek Model
 * Represents trek posts created by verified users (distinct from general Trip model)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trek = sequelize.define('Trek', {
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
    posterName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'poster_name'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    region: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    dates: {
        type: DataTypes.JSON, // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', flexible: boolean }
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    difficulty: {
        type: DataTypes.ENUM('Easy', 'Moderate', 'Challenging', 'Strenuous'),
        allowNull: false
    },
    maxAltitude: {
        type: DataTypes.STRING(100),
        field: 'max_altitude'
    },
    groupSize: {
        type: DataTypes.JSON, // { min: number, max: number }
        allowNull: false,
        field: 'group_size'
    },
    budgetRange: {
        type: DataTypes.JSON, // { min: number, max: number }
        allowNull: false,
        field: 'budget_range'
    },
    itinerary: {
        type: DataTypes.JSON, // [{ day: number, title: string, description: string }]
        allowNull: false
    },
    inclusions: {
        type: DataTypes.JSON, // Array of strings
        defaultValue: []
    },
    exclusions: {
        type: DataTypes.JSON, // Array of strings
        defaultValue: []
    },
    requirements: {
        type: DataTypes.JSON, // Array of strings
        defaultValue: []
    },
    meetingPoint: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'meeting_point'
    },
    status: {
        type: DataTypes.ENUM('active', 'closed', 'completed'),
        defaultValue: 'active'
    },
    images: {
        type: DataTypes.JSON, // Array of URLs
        defaultValue: []
    }
}, {
    tableName: 'treks',
    timestamps: true,
    underscored: true
});

module.exports = Trek;
