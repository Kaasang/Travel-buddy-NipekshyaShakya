/**
 * VerificationRequest Model
 * Handles user KYC (Know Your Customer) submissions
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VerificationRequest = sequelize.define('VerificationRequest', {
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
    personalDetails: {
        type: DataTypes.JSON, // Stores: fullName, dob, nationality, phone, address
        allowNull: false,
        field: 'personal_details'
    },
    idDocType: {
        type: DataTypes.ENUM('passport', 'national_id', 'drivers_license'),
        allowNull: false,
        field: 'id_doc_type'
    },
    idDocNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'id_doc_number'
    },
    idFrontUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'id_front_url'
    },
    idBackUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'id_back_url'
    },
    selfieUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'selfie_url'
    },
    status: {
        type: DataTypes.ENUM('pending_review', 'approved', 'rejected'),
        defaultValue: 'pending_review'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reviewed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reviewed_at'
    }
}, {
    tableName: 'verification_requests',
    timestamps: true,
    underscored: true
});

module.exports = VerificationRequest;
