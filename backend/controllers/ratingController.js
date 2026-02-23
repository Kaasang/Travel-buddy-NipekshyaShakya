/**
 * Rating Controller
 * Handles user ratings after trips
 */

const { Rating, User, Profile, Trip, TripMember } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { sequelize } = require('../config/database');

/**
 * @desc    Rate a user after a trip
 * @route   POST /api/ratings
 * @access  Private
 */
const rateUser = asyncHandler(async (req, res) => {
    const { ratedUserId, tripId, rating, review } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError('Rating must be between 1 and 5', 400);
    }

    // Can't rate yourself
    if (parseInt(ratedUserId) === req.user.id) {
        throw new ApiError('You cannot rate yourself', 400);
    }

    // Check if trip exists and is completed
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    // Both users must have been members of the trip
    const [raterMembership, ratedMembership] = await Promise.all([
        TripMember.findOne({ where: { tripId, userId: req.user.id } }),
        TripMember.findOne({ where: { tripId, userId: ratedUserId } })
    ]);

    if (!raterMembership || !ratedMembership) {
        throw new ApiError('Both users must be members of this trip to leave a rating', 400);
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
        where: { raterId: req.user.id, ratedUserId, tripId }
    });

    if (existingRating) {
        throw new ApiError('You have already rated this user for this trip', 400);
    }

    // Create rating
    const newRating = await Rating.create({
        raterId: req.user.id,
        ratedUserId,
        tripId,
        rating,
        review: review || null
    });

    // Update user's average rating
    const ratings = await Rating.findAll({
        where: { ratedUserId },
        attributes: ['rating']
    });

    const totalRatings = ratings.length;
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await Profile.update(
        { averageRating: avgRating.toFixed(2), totalRatings },
        { where: { userId: ratedUserId } }
    );

    res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: newRating
    });
});

/**
 * @desc    Get ratings for a user
 * @route   GET /api/ratings/user/:userId
 * @access  Private
 */
const getUserRatings = asyncHandler(async (req, res) => {
    const ratings = await Rating.findAll({
        where: { ratedUserId: req.params.userId },
        include: [
            {
                model: User,
                as: 'rater',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id']
            },
            {
                model: Trip,
                attributes: ['id', 'title', 'destination']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    // Calculate stats
    const stats = {
        total: ratings.length,
        average: ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
            : 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    ratings.forEach(r => {
        stats.distribution[r.rating]++;
    });

    res.json({
        success: true,
        data: { ratings, stats }
    });
});

/**
 * @desc    Get my ratings (given and received)
 * @route   GET /api/ratings/my
 * @access  Private
 */
const getMyRatings = asyncHandler(async (req, res) => {
    const [given, received] = await Promise.all([
        Rating.findAll({
            where: { raterId: req.user.id },
            include: [
                {
                    model: User,
                    as: 'ratedUser',
                    include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                    attributes: ['id']
                },
                { model: Trip, attributes: ['id', 'title'] }
            ],
            order: [['createdAt', 'DESC']]
        }),
        Rating.findAll({
            where: { ratedUserId: req.user.id },
            include: [
                {
                    model: User,
                    as: 'rater',
                    include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                    attributes: ['id']
                },
                { model: Trip, attributes: ['id', 'title'] }
            ],
            order: [['createdAt', 'DESC']]
        })
    ]);

    res.json({
        success: true,
        data: { given, received }
    });
});

module.exports = {
    rateUser,
    getUserRatings,
    getMyRatings
};
