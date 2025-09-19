// api/controllers/evaluationController.js

const geminiService = require('../services/geminiService');

const evaluateStudentCode = async (req, res) => {
    try {
        const { enrollmentNumber, question, submission } = req.body;

        // Basic validation to ensure we have the data we need
        if (!enrollmentNumber || !question || !submission || !submission.modelCode || !submission.controllerCode) {
            return res.status(400).json({ error: "Missing required fields in the request body." });
        }

        console.log(`Starting evaluation for enrollment: ${enrollmentNumber}...`);

        // Call the service to get the evaluation from Gemini
        const evaluationResult = await geminiService.evaluateCode(req.body);

        // Add the enrollment number and a timestamp to the final result
        const finalResponse = {
            enrollmentNumber: enrollmentNumber,
            evaluationTimestamp: new Date().toISOString(),
            ...evaluationResult
        };

        console.log(`Evaluation complete for: ${enrollmentNumber}`);
        res.status(200).json(finalResponse);

    } catch (error) {
        console.error("Error in evaluation controller:", error);
        res.status(500).json({ error: "An internal server error occurred during evaluation." });
    }
};

module.exports = {
    evaluateStudentCode,
};