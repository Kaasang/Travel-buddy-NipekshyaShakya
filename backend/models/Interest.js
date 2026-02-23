/**
 * Interest Model
 * Predefined travel interests for matching users
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Interest = sequelize.define('Interest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    category: {
        type: DataTypes.STRING(50),
        defaultValue: 'general'
    },
    icon: {
        type: DataTypes.STRING(50),
        defaultValue: '🌍'
    }
}, {
    tableName: 'interests',
    timestamps: true,
    underscored: true
});

module.exports = Interest;
