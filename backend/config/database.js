/**
 * Database Configuration
 * Sets up Sequelize connection to MySQL database
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

const cleanEnv = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed === '' ? fallback : trimmed;
};

// Create Sequelize instance with MySQL connection
const sequelize = new Sequelize(
  cleanEnv(process.env.DB_NAME, 'travel_buddy'),
  cleanEnv(process.env.DB_USER, 'root'),
  cleanEnv(process.env.DB_PASSWORD, ''),
  {
    host: cleanEnv(process.env.DB_HOST, 'localhost'),
    port: Number(cleanEnv(process.env.DB_PORT, '3306')),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,      // Maximum number of connections in pool
      min: 0,      // Minimum number of connections in pool
      acquire: 30000, // Maximum time (ms) to try getting a connection
      idle: 10000     // Maximum time (ms) a connection can be idle
    },
    define: {
      timestamps: true,  // Adds createdAt and updatedAt to all models
      underscored: true  // Uses snake_case for auto-generated fields
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
