/**
 * Verification Routes
 */

const express = require('express');
const router = express.Router();
const {
    submitVerification,
    getMyVerification,
    getAllVerifications,
    approveVerification,
    rejectVerification
} = require('../controllers/verificationController');
const { protect, adminOnly } = require('../middleware/auth');

// User Routes
router.post('/submit', protect, submitVerification);
router.get('/me', protect, getMyVerification);

// Admin Routes (Can be prefixed differently in index.js, but grouped here for now)
router.get('/admin', protect, adminOnly, getAllVerifications);
router.post('/admin/:id/approve', protect, adminOnly, approveVerification);
router.post('/admin/:id/reject', protect, adminOnly, rejectVerification);

module.exports = router;
