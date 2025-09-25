// api/controllers/evaluationController.js

const geminiService = require('../services/geminiService');
const { Student, Submission, Evaluation } = require('../../models');

const evaluateStudentCode = async (req, res) => {
    try {
        const { enrollmentNumber, question, submission } = req.body;

        // Basic validation to ensure we have the data we need
        if (!enrollmentNumber || !question || !submission || !submission.modelCode || !submission.controllerCode) {
            return res.status(400).json({ error: "Missing required fields in the request body." });
        }

        console.log(`Starting evaluation for enrollment: ${enrollmentNumber}...`);

        // Step 1: Find or create student record
        let student = await Student.findOne({ enrollmentNumber });
        if (!student) {
            student = new Student({
                enrollmentNumber,
                assignedQuestion: question
            });
            await student.save();
            console.log(`Created new student record for: ${enrollmentNumber}`);
        }

        // Step 2: Save the submission
        const submissionRecord = new Submission({
            enrollmentNumber,
            student: student._id,
            question,
            submission
        });
        await submissionRecord.save();
        console.log(`Saved submission for: ${enrollmentNumber}`);

        // Step 3: Call the service to get the evaluation from Gemini
        const evaluationResult = await geminiService.evaluateCode(req.body);

        // Step 4: Save the evaluation results
        const evaluationRecord = new Evaluation({
            enrollmentNumber,
            student: student._id,
            submission: submissionRecord._id,
            overallScore: evaluationResult.overallScore,
            summary: evaluationResult.summary,
            modelEvaluation: evaluationResult.modelEvaluation,
            controllerEvaluation: evaluationResult.controllerEvaluation
        });
        await evaluationRecord.save();

        // Step 5: Mark submission as evaluated
        submissionRecord.isEvaluated = true;
        await submissionRecord.save();

        // Prepare final response with database IDs
        const finalResponse = {
            enrollmentNumber: enrollmentNumber,
            evaluationTimestamp: evaluationRecord.evaluationTimestamp,
            evaluationId: evaluationRecord._id,
            submissionId: submissionRecord._id,
            studentId: student._id,
            grade: evaluationRecord.grade, // Virtual field
            ...evaluationResult
        };

        console.log(`Evaluation complete and saved for: ${enrollmentNumber}`);
        res.status(200).json(finalResponse);

    } catch (error) {
        console.error("Error in evaluation controller:", error);
        
        // Provide more specific error messages
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Data validation failed", 
                details: error.message 
            });
        }
        
        if (error.name === 'MongoError' || error.name === 'MongooseError') {
            return res.status(500).json({ 
                error: "Database operation failed", 
                details: error.message 
            });
        }

        res.status(500).json({ 
            error: "An internal server error occurred during evaluation.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    evaluateStudentCode,
};