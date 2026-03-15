/**
 * Verification Controller
 * Handles user KYC submissions and Admin review processes
 */

const { User, VerificationRequest } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Submit KYC Verification Request
 * @route   POST /api/verification/submit
 * @access  Private
 */
const submitVerification = asyncHandler(async (req, res) => {
    const { personalDetails, idDocType, idDocNumber, idFrontUrl, idBackUrl, selfieUrl } = req.body;
    const userId = req.user.id;

    // Check if user already has a pending or approved request
    const existing = await VerificationRequest.findOne({
        where: { userId, status: ['pending_review', 'approved'] }
    });

    if (existing) {
        throw new ApiError('You already have a pending or approved verification request', 400);
    }

    // Create the verification request
    const verification = await VerificationRequest.create({
        userId,
        personalDetails: typeof personalDetails === 'string' ? JSON.parse(personalDetails) : personalDetails,
        idDocType,
        idDocNumber,
        idFrontUrl: idFrontUrl || '/mock-path/front.jpg', // Fallback for testing
        idBackUrl: idBackUrl || null,
        selfieUrl: selfieUrl || '/mock-path/selfie.jpg' // Fallback for testing
    });

    // Update User status to pending_review
    await User.update(
        { verificationStatus: 'pending_review', rejectionReason: null },
        { where: { id: userId } }
    );

    res.status(201).json({
        success: true,
        data: verification,
        message: 'Verification submitted successfully'
    });
});

/**
 * @desc    Get current user's Verification Status & Request Details
 * @route   GET /api/verification/me
 * @access  Private
 */
const getMyVerification = asyncHandler(async (req, res) => {
    const verification = await VerificationRequest.findOne({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        data: verification
    });
});

/**
 * @desc    Admin: Get all pending Verification Requests
 * @route   GET /api/admin/verifications
 * @access  Private/Admin
 */
const getAllVerifications = asyncHandler(async (req, res) => {
    const { status = 'pending_review' } = req.query;

    const verifications = await VerificationRequest.findAll({
        where: { status },
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'verificationStatus']
        }],
        order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
        success: true,
        count: verifications.length,
        data: verifications
    });
});

/**
 * @desc    Admin: Approve a verification request
 * @route   POST /api/admin/verifications/:id/approve
 * @access  Private/Admin
 */
const approveVerification = asyncHandler(async (req, res) => {
    const requestId = req.params.id;
    const adminId = req.user.id;

    const verification = await VerificationRequest.findByPk(requestId);
    if (!verification) {
        throw new ApiError('Verification request not found', 404);
    }

    // Update request
    verification.status = 'approved';
    verification.reviewedBy = adminId;
    verification.reviewedAt = new Date();
    await verification.save();

    // Update user
    await User.update(
        { verificationStatus: 'approved' },
        { where: { id: verification.userId } }
    );

    res.status(200).json({
        success: true,
        message: 'Verification approved successfully'
    });
});

/**
 * @desc    Admin: Reject a verification request
 * @route   POST /api/admin/verifications/:id/reject
 * @access  Private/Admin
 */
const rejectVerification = asyncHandler(async (req, res) => {
    const requestId = req.params.id;
    const adminId = req.user.id;
    const { reason } = req.body;

    if (!reason) {
        throw new ApiError('Rejection reason is required', 400);
    }

    const verification = await VerificationRequest.findByPk(requestId);
    if (!verification) {
        throw new ApiError('Verification request not found', 404);
    }

    // Update request
    verification.status = 'rejected';
    verification.rejectionReason = reason;
    verification.reviewedBy = adminId;
    verification.reviewedAt = new Date();
    await verification.save();

    // Update user
    await User.update(
        { verificationStatus: 'rejected', rejectionReason: reason },
        { where: { id: verification.userId } }
    );

    res.status(200).json({
        success: true,
        message: 'Verification rejected successfully'
    });
});

module.exports = {
    submitVerification,
    getMyVerification,
    getAllVerifications,
    approveVerification,
    rejectVerification
};
