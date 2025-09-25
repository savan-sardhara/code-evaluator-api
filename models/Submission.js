// models/Submission.js

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    enrollmentNumber: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    question: {
        modelName: {
            type: String,
            required: true
        },
        fields: [{
            type: String,
            required: true
        }]
    },
    submission: {
        modelCode: {
            type: String,
            required: false, // Changed to false to allow screenshot-only submissions
            default: ''
        },
        controllerCode: {
            type: String,
            required: false, // Changed to false to allow screenshot-only submissions
            default: ''
        },
        // Screenshots for CRUD operations
        screenshots: {
            insert: {
                filename: String,
                path: String,
                uploadedAt: { type: Date, default: Date.now }
            },
            readAll: {
                filename: String,
                path: String,
                uploadedAt: { type: Date, default: Date.now }
            },
            readById: {
                filename: String,
                path: String,
                uploadedAt: { type: Date, default: Date.now }
            },
            update: {
                filename: String,
                path: String,
                uploadedAt: { type: Date, default: Date.now }
            },
            delete: {
                filename: String,
                path: String,
                uploadedAt: { type: Date, default: Date.now }
            }
        }
    },
    submissionTimestamp: {
        type: Date,
        default: Date.now
    },
    // Track if this submission has been evaluated
    isEvaluated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create compound indexes for efficient queries
submissionSchema.index({ enrollmentNumber: 1, submissionTimestamp: -1 });
submissionSchema.index({ student: 1, createdAt: -1 });
submissionSchema.index({ isEvaluated: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);