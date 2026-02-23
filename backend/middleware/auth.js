/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken');
const { User, Profile } = require('../models');

/**
 * Protect routes - Verify JWT token
 * Adds user object to request if valid
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please log in.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findByPk(decoded.id, {
                include: [{ model: Profile, as: 'profile' }]
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User no longer exists'
                });
            }

            // Check if user is suspended
            if (user.isSuspended) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been suspended. Please contact support.'
                });
            }

            // Add user to request object
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or has expired'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Admin only middleware
 * Must be used after protect middleware
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

/**
 * Verified user only middleware
 * Must be used after protect middleware
 */
const verifiedOnly = (req, res, next) => {
    if (req.user && req.user.isVerified) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Please verify your account to access this feature.'
        });
    }
};

/**
 * Optional auth middleware
 * Attaches user if token present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findByPk(decoded.id, {
                    include: [{ model: Profile, as: 'profile' }]
                });
            } catch (error) {
                // Token invalid, continue without user
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { protect, adminOnly, verifiedOnly, optionalAuth };
