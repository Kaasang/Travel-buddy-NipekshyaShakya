const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('bus', 'hotel', 'trek', 'recommended'),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    overview: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    // Common fields that might not be used by all
    duration: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // JSON field to hold type-specific data
    // Bus: route, departureTime, busType, amenities, cancellation, pickup, drop, seatsAvailable
    // Hotel: city, starRating, roomTypes, amenities, checkIn, checkOut, policies, nearbyHighlights
    // Trek: region, difficulty, maxAltitude, bestSeason, groupSize, itinerary, inclusions, exclusions, packingList, budgetBreakdown
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
    }
}, {
    timestamps: true,
    tableName: 'services'
});

module.exports = Service;
