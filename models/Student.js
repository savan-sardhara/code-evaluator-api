// models/Student.js

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    enrollmentNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    // Store the assigned question for this student
    assignedQuestion: {
        modelName: {
            type: String,
            required: true
        },
        fields: [{
            type: String,
            required: true
        }]
    }
}, {
    timestamps: true
});

// Create compound index for efficient queries
studentSchema.index({ enrollmentNumber: 1, createdAt: -1 });

module.exports = mongoose.model('Student', studentSchema);