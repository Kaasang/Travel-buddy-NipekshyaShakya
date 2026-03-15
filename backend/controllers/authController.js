/**
 * Authentication Controller
 * Handles user registration, login, and token management
 */

const jwt = require('jsonwebtoken');
const { User, Profile } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * Generate JWT Token
 * @param {number} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new ApiError('Email already registered', 400);
    }

    // Create user
    const user = await User.create({
        email,
        password
    });

    // Create empty profile with fullName
    await Profile.create({
        userId: user.id,
        fullName: fullName || 'New User'
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: user.toSafeObject(),
            token
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with profile
    const user = await User.findOne({
        where: { email },
        include: [{ model: Profile, as: 'profile' }]
    });

    if (!user) {
        throw new ApiError('Invalid email or password', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError('Invalid email or password', 401);
    }

    // Check if suspended
    if (user.isSuspended) {
        throw new ApiError('Your account has been suspended. Please contact support.', 403);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    // Debug: log what is being stored/returned on login
    console.log(`[AUTH LOGIN] User ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Token issued (Bearer in localStorage)`);

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                ...user.toSafeObject(),
                profile: user.profile
            },
            token
        }
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        include: [{ model: Profile, as: 'profile' }],
        attributes: { exclude: ['password'] }
    });

    res.json({
        success: true,
        data: user
    });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new ApiError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user.id);

    res.json({
        success: true,
        message: 'Password updated successfully',
        data: { token }
    });
});

/**
 * @desc    Logout user (invalidate token on client side)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    // Debug: confirm server-side logout processed
    console.log(`[AUTH LOGOUT] User ID: ${req.user?.id}, Email: ${req.user?.email} — token will be discarded client-side`);

    // Token invalidation is handled client-side (localStorage cleared).
    // In a production app, you would add the token to a blacklist/revocation list here.
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = {
    register,
    login,
    getMe,
    updatePassword,
    logout
};
