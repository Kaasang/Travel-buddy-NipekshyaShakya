/**
 * User Model
 * Handles user authentication and account management
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'Please provide a valid email address'
            }
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: {
                args: [6, 255],
                msg: 'Password must be at least 6 characters long'
            }
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_verified'
    },
    isSuspended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_suspended'
    },
    lastLogin: {
        type: DataTypes.DATE,
        field: 'last_login'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
        // Hash password before saving
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        // Hash password before updating (if changed)
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

/**
 * Compare entered password with stored hashed password
 * @param {string} enteredPassword - Password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
User.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Return user data without sensitive information
 * @returns {Object} - Safe user object
 */
User.prototype.toSafeObject = function () {
    return {
        id: this.id,
        email: this.email,
        role: this.role,
        isVerified: this.isVerified,
        isSuspended: this.isSuspended,
        createdAt: this.createdAt
    };
};

module.exports = User;
