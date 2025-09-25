// models/Evaluation.js

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['SUCCESS', 'IMPROVEMENT', 'ERROR', 'SYNTAX'],
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { _id: false });

const evaluationComponentSchema = new mongoose.Schema({
    score: {
        type: Number,
        required: true,
        min: 0
    },
    maxScore: {
        type: Number,
        required: true
    },
    feedback: [feedbackSchema]
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
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
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true
    },
    overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    summary: {
        type: String,
        required: true
    },
    modelEvaluation: evaluationComponentSchema,
    controllerEvaluation: evaluationComponentSchema,
    evaluationTimestamp: {
        type: Date,
        default: Date.now
    },
    // Store the AI model used for evaluation
    aiModel: {
        type: String,
        default: 'gemini-2.0-flash'
    }
}, {
    timestamps: true
});

// Create compound indexes for efficient queries
evaluationSchema.index({ enrollmentNumber: 1, evaluationTimestamp: -1 });
evaluationSchema.index({ student: 1, overallScore: -1 });
evaluationSchema.index({ submission: 1 });
evaluationSchema.index({ overallScore: -1, createdAt: -1 });

// Virtual for grade calculation
evaluationSchema.virtual('grade').get(function() {
    if (this.overallScore >= 90) return 'A+';
    if (this.overallScore >= 80) return 'A';
    if (this.overallScore >= 70) return 'B';
    if (this.overallScore >= 60) return 'C';
    if (this.overallScore >= 50) return 'D';
    return 'F';
});

// Ensure virtual fields are serialized
evaluationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);