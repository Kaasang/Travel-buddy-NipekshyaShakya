/**
 * Rating Model
 * Handles user ratings after trips
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rating = sequelize.define('Rating', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    raterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rater_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    ratedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rated_user_id',
        references: {
            model: 'users',
            key: 'id'
        }
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
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Rating must be at least 1'
            },
            max: {
                args: [5],
                msg: 'Rating cannot exceed 5'
            }
        }
    },
    review: {
        type: DataTypes.TEXT,
        validate: {
            len: {
                args: [0, 500],
                msg: 'Review must be under 500 characters'
            }
        }
    }
}, {
    tableName: 'ratings',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['rater_id', 'rated_user_id', 'trip_id']
        }
    ]
});

module.exports = Rating;
