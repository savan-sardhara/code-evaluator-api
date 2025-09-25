const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/screenshots';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create filename: enrollmentNo_operation_timestamp.extension
        const enrollmentNo = req.params.enrollmentNo || req.body.enrollmentNo || 'unknown';
        const operation = req.params.operation || req.body.operation || 'screenshot';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        cb(null, `${enrollmentNo}_${operation}_${timestamp}${extension}`);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = { upload };