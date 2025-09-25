const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { upload } = require('../../config/multerConfig');
const Submission = require('../../models/Submission');

// Test route to verify the router is working
router.get('/test', (req, res) => {
    console.log('Screenshot test route hit');
    res.json({ message: 'Screenshot routes are working!' });
});

// Upload screenshot for a specific CRUD operation
router.post('/upload/:enrollmentNo/:operation', (req, res, next) => {
    console.log('Route hit BEFORE multer:', req.params);
    next();
}, upload.single('screenshot'), async (req, res) => {
    console.log('Screenshot upload endpoint hit AFTER multer:', req.params, req.file);
    try {
        const { enrollmentNo, operation } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No screenshot file uploaded',
                message: 'Please select a screenshot file to upload'
            });
        }

        // Validate operation type
        const validOperations = ['insert', 'readAll', 'readById', 'update', 'delete'];
        if (!validOperations.includes(operation)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid operation type',
                message: `Operation must be one of: ${validOperations.join(', ')}`,
                validOperations: validOperations
            });
        }

        // Find the most recent submission for this student
        let submission = await Submission.findOne({
            enrollmentNumber: enrollmentNo
        }).sort({ createdAt: -1 });

        if (!submission) {
            // If no submission exists, we need a student reference first
            const Student = require('../../models/Student');
            let student = await Student.findOne({ enrollmentNumber: enrollmentNo });
            
            if (!student) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Student not found',
                    message: 'Please ensure student exists before uploading screenshots.',
                    enrollmentNumber: enrollmentNo
                });
            }

            // Create a new submission if none exists
            console.log('Creating new submission for:', enrollmentNo);
            submission = new Submission({
                enrollmentNumber: enrollmentNo,
                student: student._id,
                question: {
                    modelName: student.assignedQuestion ? student.assignedQuestion.modelName : 'DefaultModel',
                    fields: student.assignedQuestion ? student.assignedQuestion.fields : ['id', 'name', 'email']
                },
                submission: {
                    modelCode: '', // Will be filled when actual code is submitted
                    controllerCode: '', // Will be filled when actual code is submitted
                    screenshots: {}
                }
            });
        }

        // Update the screenshot for the specific operation
        if (!submission.submission.screenshots) {
            submission.submission.screenshots = {};
        }

        submission.submission.screenshots[operation] = {
            filename: req.file.filename,
            path: req.file.path,
            uploadedAt: new Date()
        };

        await submission.save();

        res.json({
            success: true,
            message: `Screenshot uploaded successfully for ${operation} operation`,
            data: {
                enrollmentNumber: enrollmentNo,
                operation: operation,
                file: {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                    path: req.file.path,
                    uploadedAt: submission.submission.screenshots[operation].uploadedAt
                },
                submissionId: submission._id,
                viewUrl: `/api/screenshots/view/${req.file.filename}`
            },
            meta: {
                timestamp: new Date().toISOString(),
                uploadId: `upload_${Date.now()}_${enrollmentNo}_${operation}`,
                status: 'completed'
            }
        });

    } catch (error) {
        console.error('Screenshot upload error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to upload screenshot',
            message: 'Internal server error occurred while processing the upload',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Contact administrator if problem persists'
        });
    }
});

// Bulk upload endpoint for multiple Postman screenshots
router.post('/upload-bulk/:enrollmentNo', upload.fields([
    { name: 'insert', maxCount: 1 },
    { name: 'readAll', maxCount: 1 },
    { name: 'readById', maxCount: 1 },
    { name: 'update', maxCount: 1 },
    { name: 'delete', maxCount: 1 }
]), async (req, res) => {
    try {
        const { enrollmentNo } = req.params;
        
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No screenshots uploaded',
                message: 'Please upload at least one screenshot file'
            });
        }

        // Find or create student and submission
        const Student = require('../../models/Student');
        let student = await Student.findOne({ enrollmentNumber: enrollmentNo });
        
        if (!student) {
            return res.status(404).json({ 
                success: false,
                error: 'Student not found',
                message: 'Please ensure student exists before uploading screenshots.',
                enrollmentNumber: enrollmentNo
            });
        }

        let submission = await Submission.findOne({
            enrollmentNumber: enrollmentNo
        }).sort({ createdAt: -1 });

        if (!submission) {
            submission = new Submission({
                enrollmentNumber: enrollmentNo,
                student: student._id,
                question: {
                    modelName: student.assignedQuestion ? student.assignedQuestion.modelName : 'DefaultModel',
                    fields: student.assignedQuestion ? student.assignedQuestion.fields : ['id', 'name', 'email']
                },
                submission: {
                    modelCode: '',
                    controllerCode: '',
                    screenshots: {}
                }
            });
        }

        // Process each uploaded screenshot
        const uploadedFiles = {};
        const validOperations = ['insert', 'readAll', 'readById', 'update', 'delete'];
        
        for (const operation of validOperations) {
            if (req.files[operation] && req.files[operation][0]) {
                const file = req.files[operation][0];
                
                if (!submission.submission.screenshots) {
                    submission.submission.screenshots = {};
                }
                
                submission.submission.screenshots[operation] = {
                    filename: file.filename,
                    path: file.path,
                    uploadedAt: new Date()
                };
                
                uploadedFiles[operation] = {
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype,
                    viewUrl: `/api/screenshots/view/${file.filename}`
                };
            }
        }

        await submission.save();

        res.json({
            success: true,
            message: `Successfully uploaded ${Object.keys(uploadedFiles).length} Postman screenshots`,
            data: {
                enrollmentNumber: enrollmentNo,
                submissionId: submission._id,
                uploadedOperations: Object.keys(uploadedFiles),
                files: uploadedFiles
            },
            meta: {
                timestamp: new Date().toISOString(),
                batchUploadId: `batch_upload_${Date.now()}_${enrollmentNo}`,
                totalFiles: Object.keys(uploadedFiles).length,
                status: 'completed'
            }
        });

    } catch (error) {
        console.error('Bulk screenshot upload error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to upload screenshots',
            message: 'Internal server error occurred while processing the bulk upload',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Contact administrator if problem persists'
        });
    }
});

// Get screenshots for a student
router.get('/:enrollmentNo', async (req, res) => {
    try {
        const { enrollmentNo } = req.params;

        const submission = await Submission.findOne({
            enrollmentNumber: enrollmentNo
        }).sort({ createdAt: -1 });

        if (!submission) {
            return res.status(404).json({ 
                error: 'No submission found for this enrollment number' 
            });
        }

        res.json({
            enrollmentNumber: enrollmentNo,
            screenshots: submission.submission.screenshots || {}
        });

    } catch (error) {
        console.error('Get screenshots error:', error);
        res.status(500).json({ error: 'Failed to retrieve screenshots' });
    }
});

// Serve uploaded screenshots
router.get('/view/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/screenshots', filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(path.resolve(filePath));
    } else {
        res.status(404).json({ error: 'Screenshot not found' });
    }
});

// Error handling middleware for multer
router.use((err, req, res, next) => {
    console.log('Multer error:', err);
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

module.exports = router;