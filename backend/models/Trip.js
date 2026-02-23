/**
 * Trip Model
 * Stores trip details and group travel information
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trip = sequelize.define('Trip', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'creator_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            len: {
                args: [5, 200],
                msg: 'Title must be between 5 and 200 characters'
            }
        }
    },
    destination: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'start_date'
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'end_date'
    },
    budget: {
        type: DataTypes.DECIMAL(10, 2),
        validate: {
            min: 0
        }
    },
    budgetType: {
        type: DataTypes.ENUM('budget', 'moderate', 'luxury'),
        field: 'budget_type',
        defaultValue: 'moderate'
    },
    maxGroupSize: {
        type: DataTypes.INTEGER,
        field: 'max_group_size',
        defaultValue: 5,
        validate: {
            min: 2,
            max: 50
        }
    },
    currentMembers: {
        type: DataTypes.INTEGER,
        field: 'current_members',
        defaultValue: 1
    },
    description: {
        type: DataTypes.TEXT,
        validate: {
            len: {
                args: [0, 2000],
                msg: 'Description must be under 2000 characters'
            }
        }
    },
    status: {
        type: DataTypes.ENUM('planning', 'open', 'full', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'open'
    },
    coverImage: {
        type: DataTypes.STRING(500),
        field: 'cover_image',
        defaultValue: '/uploads/default-trip.jpg'
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        field: 'is_public',
        defaultValue: true
    }
}, {
    tableName: 'trips',
    timestamps: true,
    underscored: true
});

/**
 * Check if trip has available spots
 * @returns {boolean}
 */
Trip.prototype.hasAvailableSpots = function () {
    return this.currentMembers < this.maxGroupSize;
};

/**
 * Get days until trip starts
 * @returns {number} Days until trip (negative if already started)
 */
Trip.prototype.getDaysUntilStart = function () {
    const today = new Date();
    const start = new Date(this.startDate);
    const diffTime = start - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = Trip;
