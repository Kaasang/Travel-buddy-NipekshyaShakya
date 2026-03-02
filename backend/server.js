/**
 * Travel Buddy - Backend Server
 * Main entry point for the Express application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database configuration
const { sequelize, testConnection } = require('./config/database');

// Import models (to register associations)
require('./models');

// Import routes
const routes = require('./routes');

// Import error handlers
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import seed data utility
const { seedDatabase } = require('./utils/seedData');

// Initialize Express app
const app = express();

// ==========================================
// Middleware Configuration
// ==========================================

// Enable CORS for frontend
const allowedOrigins = new Set([
    (process.env.FRONTEND_URL || '').trim(),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
].filter(Boolean));

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser clients and same-origin requests with no Origin header.
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// ==========================================
// API Routes
// ==========================================

// Mount all API routes under /api
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Travel Buddy API',
        version: '1.0.0',
        documentation: '/api/health'
    });
});

// ==========================================
// Error Handling
// ==========================================

// Handle 404 - Route not found
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ==========================================
// Server Startup
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database models (creates tables if not exist)
        // In production, use migrations instead
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('✅ Database synced successfully');

        // Seed database with initial data (only in development)
        if (process.env.NODE_ENV === 'development') {
            try {
                await seedDatabase();
            } catch (seedError) {
                console.log('ℹ️  Seed data may already exist:', seedError.message);
            }
        }

        // Start server
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Travel Buddy Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API URL: http://localhost:${PORT}/api`);
            console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err.message);
    // Close server & exit process
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
