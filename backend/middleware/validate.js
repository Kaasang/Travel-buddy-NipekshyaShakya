/**
 * Input Validation Middleware
 * Uses express-validator for request validation
 */

const { validationResult } = require('express-validator');

/**
 * Validation result handler
 * Checks for validation errors and returns them
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

module.exports = { validate };
