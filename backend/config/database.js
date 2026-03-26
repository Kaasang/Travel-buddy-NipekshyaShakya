/**
 * Database Configuration
 * Sets up Sequelize connection to MySQL
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'travel_buddy',
    process.env.DB_USER || 'root',
<<<<<<< HEAD
    process.env.DB_PASSWORD || '1234',
=======
    process.env.DB_PASSWORD || '',
>>>>>>> 68e4e4e5796a16bd1d003e2b47c8c150f553dcda
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Database connected successfully');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
