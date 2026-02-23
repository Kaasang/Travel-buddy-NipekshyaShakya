/**
 * Matching Controller
 * Implements the travel buddy matching algorithm
 */

const { User, Profile, Interest, UserInterest, sequelize } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Calculate matching score between two users
 * @param {Object} currentUser - Current user's profile and interests
 * @param {Object} otherUser - Other user's profile and interests
 * @returns {number} Match percentage (0-100)
 */
const calculateMatchScore = (currentUser, otherUser) => {
    let score = 0;
    const weights = {
        interests: 0.30,      // 30% weight
        destination: 0.25,    // 25% weight
        dateOverlap: 0.20,    // 20% weight
        travelStyle: 0.15,    // 15% weight
        groupSize: 0.10       // 10% weight
    };

    // 1. Interest Overlap (30%)
    const currentInterests = currentUser.interests?.map(i => i.id) || [];
    const otherInterests = otherUser.interests?.map(i => i.id) || [];

    if (currentInterests.length > 0 && otherInterests.length > 0) {
        const commonInterests = currentInterests.filter(i => otherInterests.includes(i));
        const totalUniqueInterests = new Set([...currentInterests, ...otherInterests]).size;
        score += (commonInterests.length / totalUniqueInterests) * weights.interests * 100;
    }

    // 2. Destination Match (25%)
    const currentDests = currentUser.profile?.preferredDestinations || [];
    const otherDests = otherUser.profile?.preferredDestinations || [];

    if (currentDests.length > 0 && otherDests.length > 0) {
        const currentDestsLower = currentDests.map(d => d.toLowerCase());
        const otherDestsLower = otherDests.map(d => d.toLowerCase());
        const commonDests = currentDestsLower.filter(d => otherDestsLower.includes(d));
        const totalUniqueDests = new Set([...currentDestsLower, ...otherDestsLower]).size;
        score += (commonDests.length / totalUniqueDests) * weights.destination * 100;
    }

    // 3. Date Overlap (20%)
    if (currentUser.profile?.availabilityStart && currentUser.profile?.availabilityEnd &&
        otherUser.profile?.availabilityStart && otherUser.profile?.availabilityEnd) {

        const currentStart = new Date(currentUser.profile.availabilityStart);
        const currentEnd = new Date(currentUser.profile.availabilityEnd);
        const otherStart = new Date(otherUser.profile.availabilityStart);
        const otherEnd = new Date(otherUser.profile.availabilityEnd);

        // Calculate overlap
        const overlapStart = new Date(Math.max(currentStart, otherStart));
        const overlapEnd = new Date(Math.min(currentEnd, otherEnd));

        if (overlapStart <= overlapEnd) {
            const overlapDays = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
            const maxDays = 30; // Max days for full score
            const dateScore = Math.min(overlapDays / maxDays, 1);
            score += dateScore * weights.dateOverlap * 100;
        }
    }

    // 4. Travel Style Match (15%)
    if (currentUser.profile?.travelStyle && otherUser.profile?.travelStyle) {
        if (currentUser.profile.travelStyle === otherUser.profile.travelStyle) {
            score += weights.travelStyle * 100;
        } else {
            // Partial match for similar styles
            const styleGroups = {
                budget: ['budget', 'backpacker'],
                luxury: ['luxury', 'moderate'],
                adventure: ['adventure', 'backpacker']
            };

            for (const group of Object.values(styleGroups)) {
                if (group.includes(currentUser.profile.travelStyle) &&
                    group.includes(otherUser.profile.travelStyle)) {
                    score += weights.travelStyle * 50;
                    break;
                }
            }
        }
    }

    // 5. Group Size Compatibility (10%)
    if (currentUser.profile?.groupSizePreference && otherUser.profile?.groupSizePreference) {
        const sizeDiff = Math.abs(
            currentUser.profile.groupSizePreference - otherUser.profile.groupSizePreference
        );
        const maxDiff = 10;
        const sizeScore = Math.max(0, 1 - (sizeDiff / maxDiff));
        score += sizeScore * weights.groupSize * 100;
    }

    return Math.round(score);
};

/**
 * @desc    Get matched travel buddies
 * @route   GET /api/matches
 * @access  Private
 */
const getMatches = asyncHandler(async (req, res) => {
    const { minScore = 20, limit = 20, destination, travelStyle } = req.query;

    // Get current user with profile and interests
    const currentUser = await User.findByPk(req.user.id, {
        include: [
            { model: Profile, as: 'profile' },
            { model: Interest, as: 'interests', through: { attributes: [] } }
        ]
    });

    // Build filter for other users
    const profileWhere = {};
    if (destination) {
        profileWhere.preferredDestinations = {
            [Op.like]: `%${destination}%`
        };
    }
    if (travelStyle) {
        profileWhere.travelStyle = travelStyle;
    }

    // Get other users
    const otherUsers = await User.findAll({
        where: {
            id: { [Op.ne]: req.user.id },
            isSuspended: false
        },
        include: [
            {
                model: Profile,
                as: 'profile',
                where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
                required: true
            },
            { model: Interest, as: 'interests', through: { attributes: [] } }
        ],
        attributes: { exclude: ['password'] }
    });

    // Calculate match scores
    const matches = otherUsers.map(user => ({
        user: {
            id: user.id,
            email: user.email,
            isVerified: user.isVerified,
            profile: user.profile,
            interests: user.interests
        },
        matchScore: calculateMatchScore(currentUser, user)
    }));

    // Filter by minimum score and sort by score
    const filteredMatches = matches
        .filter(m => m.matchScore >= parseInt(minScore))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, parseInt(limit));

    res.json({
        success: true,
        data: {
            matches: filteredMatches,
            totalMatches: filteredMatches.length
        }
    });
});

/**
 * @desc    Get match score with specific user
 * @route   GET /api/matches/:userId
 * @access  Private
 */
const getMatchWithUser = asyncHandler(async (req, res) => {
    // Get current user
    const currentUser = await User.findByPk(req.user.id, {
        include: [
            { model: Profile, as: 'profile' },
            { model: Interest, as: 'interests', through: { attributes: [] } }
        ]
    });

    // Get other user
    const otherUser = await User.findByPk(req.params.userId, {
        include: [
            { model: Profile, as: 'profile' },
            { model: Interest, as: 'interests', through: { attributes: [] } }
        ],
        attributes: { exclude: ['password'] }
    });

    if (!otherUser) {
        throw new ApiError('User not found', 404);
    }

    const matchScore = calculateMatchScore(currentUser, otherUser);

    // Calculate breakdown of match factors
    const currentInterests = currentUser.interests?.map(i => i.id) || [];
    const otherInterests = otherUser.interests?.map(i => i.id) || [];
    const commonInterests = currentUser.interests?.filter(i =>
        otherInterests.includes(i.id)
    ) || [];

    res.json({
        success: true,
        data: {
            user: otherUser,
            matchScore,
            breakdown: {
                commonInterests: commonInterests.map(i => i.name),
                travelStyleMatch: currentUser.profile?.travelStyle === otherUser.profile?.travelStyle,
                commonDestinations: (currentUser.profile?.preferredDestinations || [])
                    .filter(d => (otherUser.profile?.preferredDestinations || [])
                        .map(od => od.toLowerCase())
                        .includes(d.toLowerCase()))
            }
        }
    });
});

/**
 * @desc    Get matching suggestions based on destinations
 * @route   GET /api/matches/suggestions
 * @access  Private
 */
const getSuggestions = asyncHandler(async (req, res) => {
    const currentUser = await User.findByPk(req.user.id, {
        include: [{ model: Profile, as: 'profile' }]
    });

    const currentDests = currentUser.profile?.preferredDestinations || [];

    // Find users with matching destinations
    const suggestions = await User.findAll({
        where: {
            id: { [Op.ne]: req.user.id },
            isSuspended: false
        },
        include: [
            {
                model: Profile,
                as: 'profile',
                where: currentDests.length > 0 ? {
                    preferredDestinations: {
                        [Op.or]: currentDests.map(d => ({
                            [Op.like]: `%${d}%`
                        }))
                    }
                } : undefined
            }
        ],
        attributes: { exclude: ['password'] },
        limit: 10
    });

    res.json({
        success: true,
        data: suggestions
    });
});

module.exports = {
    getMatches,
    getMatchWithUser,
    getSuggestions,
    calculateMatchScore
};
