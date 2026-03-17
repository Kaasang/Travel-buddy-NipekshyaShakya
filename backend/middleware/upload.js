/**
 * File Upload Middleware
 * Handles profile picture and other file uploads
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/profiles', 'uploads/trips', 'uploads/verification'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        // Determine folder based on field name
        if (file.fieldname === 'profilePicture') {
            uploadPath = 'uploads/profiles/';
        } else if (file.fieldname === 'coverImage') {
            uploadPath = 'uploads/trips/';
        } else if (file.fieldname === 'idFront' || file.fieldname === 'selfie') {
            uploadPath = 'uploads/verification/';
        }

        cb(null, path.join(__dirname, '..', uploadPath));
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024  // 5MB limit
    }
});

module.exports = { upload };
