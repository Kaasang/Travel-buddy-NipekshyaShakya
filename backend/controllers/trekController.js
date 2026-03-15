/**
 * Trek Controller
 * Handles CRUD operations for Trek posts in the Find Buddies feed
 */

const { User, Trek } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Get all active trek posts (Find Buddies Feed)
 * @route   GET /api/treks
 * @access  Public (or semi-private depending on preference, currently treating as public read)
 */
const getTreks = asyncHandler(async (req, res) => {
    // Optional filtering
    const { region, difficulty } = req.query;
    let whereClause = { status: 'active' };

    if (region) whereClause.region = region;
    if (difficulty) whereClause.difficulty = difficulty;

    const treks = await Trek.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        include: [{
            model: User,
            as: 'poster',
            attributes: ['id', 'email', 'verificationStatus']
        }]
    });

    res.status(200).json({
        success: true,
        count: treks.length,
        data: treks
    });
});

/**
 * @desc    Get a single trek post by ID
 * @route   GET /api/treks/:id
 * @access  Public
 */
const getTrekById = asyncHandler(async (req, res) => {
    const trek = await Trek.findByPk(req.params.id, {
        include: [{
            model: User,
            as: 'poster',
            attributes: ['id', 'email', 'verificationStatus'] // Fetch poster info
        }]
    });

    if (!trek) {
        throw new ApiError('Trek not found', 404);
    }

    res.status(200).json({
        success: true,
        data: trek
    });
});

/**
 * @desc    Create a new trek post
 * @route   POST /api/treks
 * @access  Private (Must be verified)
 */
const createTrek = asyncHandler(async (req, res) => {
    // 1. Double check the user is actually verified
    const user = await User.findByPk(req.user.id);
    if (!user || user.verificationStatus !== 'approved') {
        throw new ApiError('You must be fully verified to post a trek.', 403);
    }

    // 2. Add poster ID to the body payload
    const trekData = {
        ...req.body,
        userId: req.user.id,
        posterName: req.body.posterName || 'Verified Trekker' // Real app would pull from Profile model
    };

    // 3. Ensure JSON fields are parsed if they come as strings
    ['dates', 'groupSize', 'budgetRange', 'itinerary', 'inclusions', 'exclusions', 'requirements', 'images'].forEach(field => {
        if (typeof trekData[field] === 'string') {
            try {
                trekData[field] = JSON.parse(trekData[field]);
            } catch (e) {
                // Ignore parse errors, validation will catch bad shapes
            }
        }
    });

    const trek = await Trek.create(trekData);

    res.status(201).json({
        success: true,
        message: 'Trek post created successfully',
        data: trek
    });
});

/**
 * @desc    Update a trek post
 * @route   PUT /api/treks/:id
 * @access  Private (Owner or Admin)
 */
const updateTrek = asyncHandler(async (req, res) => {
    const trek = await Trek.findByPk(req.params.id);

    if (!trek) {
        throw new ApiError('Trek not found', 404);
    }

    // Only owner or admin can update
    if (trek.userId !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError('Not authorized to update this trek', 403);
    }

    // Parse JSON fields if they come as strings
    const updateData = { ...req.body };
    ['dates', 'groupSize', 'budgetRange', 'itinerary', 'inclusions', 'exclusions', 'requirements', 'images'].forEach(field => {
        if (typeof updateData[field] === 'string') {
            try { updateData[field] = JSON.parse(updateData[field]); } catch (e) { /* ignore */ }
        }
    });

    delete updateData.userId; // Prevent changing ownership

    await trek.update(updateData);

    res.status(200).json({
        success: true,
        message: 'Trek updated successfully',
        data: trek
    });
});

/**
 * @desc    Delete a trek post
 * @route   DELETE /api/treks/:id
 * @access  Private (Owner or Admin)
 */
const deleteTrek = asyncHandler(async (req, res) => {
    const trek = await Trek.findByPk(req.params.id);

    if (!trek) {
        throw new ApiError('Trek not found', 404);
    }

    // Checking ownership or admin role
    if (trek.userId !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError('Not authorized to delete this trek', 403);
    }

    await trek.destroy();

    res.status(200).json({
        success: true,
        message: 'Trek deleted successfully'
    });
});

module.exports = {
    getTreks,
    getTrekById,
    createTrek,
    updateTrek,
    deleteTrek
};
