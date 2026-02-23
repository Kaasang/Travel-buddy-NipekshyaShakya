/**
 * Centralized Error Handler Middleware
 * Handles all errors in a consistent format
 */

// Custom error class for API errors
class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;  // Distinguishes from programming errors
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handler middleware
 * Catches all errors and returns consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = null;

    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', err);
    }

    // Handle Sequelize Validation Errors
    if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));
    }

    // Handle Sequelize Unique Constraint Errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        const field = err.errors[0]?.path || 'field';
        message = `${field} already exists`;
    }

    // Handle Sequelize Foreign Key Errors
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        message = 'Invalid reference to related record';
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
    }

    // Handle Multer Errors (file upload)
    if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large. Maximum size is 5MB.';
        } else {
            message = err.message;
        }
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Not Found handler
 * Catches 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
    const error = new ApiError(`Route not found: ${req.originalUrl}`, 404);
    next(error);
};

/**
 * Async handler wrapper
 * Eliminates need for try-catch in async controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { ApiError, errorHandler, notFound, asyncHandler };
