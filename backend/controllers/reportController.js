/**
 * Report Controller
 * Handles user reporting functionality
 */

const { Report, User, Message, Profile } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Create a report
 * @route   POST /api/reports
 * @access  Private
 */
const createReport = asyncHandler(async (req, res) => {
    const { reportedUserId, reportedMessageId, reportType, description } = req.body;

    if (!reportedUserId && !reportedMessageId) {
        throw new ApiError('Please specify a user or message to report', 400);
    }

    if (!reportType) {
        throw new ApiError('Report type is required', 400);
    }

    // Prevent self-reporting
    if (reportedUserId && parseInt(reportedUserId) === req.user.id) {
        throw new ApiError('You cannot report yourself', 400);
    }

    // Check if already reported recently
    const existingReport = await Report.findOne({
        where: {
            reporterId: req.user.id,
            reportedUserId: reportedUserId || null,
            reportedMessageId: reportedMessageId || null,
            status: 'pending'
        }
    });

    if (existingReport) {
        throw new ApiError('You have already submitted a report for this. It is being reviewed.', 400);
    }

    const report = await Report.create({
        reporterId: req.user.id,
        reportedUserId: reportedUserId || null,
        reportedMessageId: reportedMessageId || null,
        reportType,
        description
    });

    res.status(201).json({
        success: true,
        message: 'Report submitted successfully. Our team will review it shortly.',
        data: report
    });
});

/**
 * @desc    Get my reports
 * @route   GET /api/reports/my
 * @access  Private
 */
const getMyReports = asyncHandler(async (req, res) => {
    const reports = await Report.findAll({
        where: { reporterId: req.user.id },
        include: [
            {
                model: User,
                as: 'reportedUser',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
                attributes: ['id', 'email']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: reports
    });
});

module.exports = {
    createReport,
    getMyReports
};
