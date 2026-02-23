/**
 * Database Setup Script
 * Run this script to initialize the database with all tables
 * Usage: node setup-database.js
 */

const { sequelize } = require('./config/database');
const { seedDatabase } = require('./utils/seedData');

// Import all models to register them
require('./models');

const setupDatabase = async () => {
    try {
        console.log('🔄 Starting database setup...\n');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.\n');

        // Drop all tables (be careful with this in production!)
        console.log('🗑️  Dropping existing tables...');
        await sequelize.drop();
        console.log('✅ Tables dropped.\n');

        // Create all tables from models
        console.log('📋 Creating new tables...');
        await sequelize.sync({ force: true });
        console.log('✅ All tables created successfully.\n');

        // Seed initial data
        console.log('🌱 Seeding initial data...');
        await seedDatabase();
        console.log('✅ Database seeded with initial data.\n');

        console.log('✨ Database setup completed successfully!');
        console.log('🚀 You can now start the server with: npm run dev\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Run setup
setupDatabase();
