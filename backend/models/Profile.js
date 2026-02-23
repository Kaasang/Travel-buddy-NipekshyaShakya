/**
 * Profile Model
 * Stores user profile information and travel preferences
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'full_name',
        validate: {
            len: {
                args: [2, 100],
                msg: 'Full name must be between 2 and 100 characters'
            }
        }
    },
    age: {
        type: DataTypes.INTEGER,
        validate: {
            min: {
                args: [18],
                msg: 'You must be at least 18 years old'
            },
            max: {
                args: [120],
                msg: 'Please enter a valid age'
            }
        }
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        defaultValue: 'prefer_not_to_say'
    },
    nationality: {
        type: DataTypes.STRING(100)
    },
    travelStyle: {
        type: DataTypes.ENUM('budget', 'moderate', 'luxury', 'adventure', 'backpacker'),
        field: 'travel_style',
        defaultValue: 'moderate'
    },
    preferredDestinations: {
        type: DataTypes.TEXT,
        field: 'preferred_destinations',
        get() {
            const rawValue = this.getDataValue('preferredDestinations');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('preferredDestinations', JSON.stringify(value));
        }
    },
    availabilityStart: {
        type: DataTypes.DATEONLY,
        field: 'availability_start'
    },
    availabilityEnd: {
        type: DataTypes.DATEONLY,
        field: 'availability_end'
    },
    groupSizePreference: {
        type: DataTypes.INTEGER,
        field: 'group_size_preference',
        defaultValue: 4,
        validate: {
            min: 2,
            max: 20
        }
    },
    bio: {
        type: DataTypes.TEXT,
        validate: {
            len: {
                args: [0, 1000],
                msg: 'Bio must be under 1000 characters'
            }
        }
    },
    profilePicture: {
        type: DataTypes.STRING(500),
        field: 'profile_picture',
        defaultValue: '/uploads/default-avatar.png'
    },
    averageRating: {
        type: DataTypes.DECIMAL(3, 2),
        field: 'average_rating',
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 5
        }
    },
    totalRatings: {
        type: DataTypes.INTEGER,
        field: 'total_ratings',
        defaultValue: 0
    }
}, {
    tableName: 'profiles',
    timestamps: true,
    underscored: true
});

/**
 * Calculate profile completion percentage
 * @returns {number} - Percentage of profile completed (0-100)
 */
Profile.prototype.getCompletionPercentage = function () {
    const fields = [
        'fullName', 'age', 'gender', 'nationality',
        'travelStyle', 'preferredDestinations', 'availabilityStart',
        'availabilityEnd', 'groupSizePreference', 'bio', 'profilePicture'
    ];

    let filledFields = 0;
    fields.forEach(field => {
        const value = this[field];
        if (value && value !== '' && value !== '/uploads/default-avatar.png') {
            if (Array.isArray(value) && value.length > 0) filledFields++;
            else if (!Array.isArray(value)) filledFields++;
        }
    });

    return Math.round((filledFields / fields.length) * 100);
};

module.exports = Profile;
