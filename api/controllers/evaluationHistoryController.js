// api/controllers/evaluationHistoryController.js

const { Evaluation, Student, Submission } = require('../../models');

// Get all evaluations with pagination
const getAllEvaluations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter based on query parameters
        const filter = {};
        if (req.query.enrollmentNumber) {
            filter.enrollmentNumber = req.query.enrollmentNumber;
        }
        if (req.query.minScore) {
            filter.overallScore = { $gte: parseInt(req.query.minScore) };
        }
        if (req.query.maxScore) {
            filter.overallScore = { ...filter.overallScore, $lte: parseInt(req.query.maxScore) };
        }

        const evaluations = await Evaluation.find(filter)
            .populate('student', 'enrollmentNumber name email')
            .populate('submission', 'submissionTimestamp')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Evaluation.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: evaluations,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch evaluations'
        });
    }
};

// Get evaluation by ID
const getEvaluationById = async (req, res) => {
    try {
        const { id } = req.params;

        const evaluation = await Evaluation.findById(id)
            .populate('student', 'enrollmentNumber name email assignedQuestion')
            .populate({
                path: 'submission',
                select: 'submissionTimestamp question submission'
            });

        if (!evaluation) {
            return res.status(404).json({
                success: false,
                error: 'Evaluation not found'
            });
        }

        res.status(200).json({
            success: true,
            data: evaluation
        });
    } catch (error) {
        console.error('Error fetching evaluation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch evaluation'
        });
    }
};

// Get evaluations for a specific student
const getEvaluationsByStudent = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;

        const evaluations = await Evaluation.find({ enrollmentNumber })
            .populate('submission', 'submissionTimestamp')
            .sort({ createdAt: -1 });

        if (evaluations.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No evaluations found for this student'
            });
        }

        // Calculate statistics
        const scores = evaluations.map(evaluation => evaluation.overallScore);
        const stats = {
            totalEvaluations: evaluations.length,
            averageScore: (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2),
            bestScore: Math.max(...scores),
            worstScore: Math.min(...scores),
            improvement: evaluations.length > 1 
                ? (evaluations[0].overallScore - evaluations[evaluations.length - 1].overallScore).toFixed(2)
                : 0
        };

        res.status(200).json({
            success: true,
            data: {
                evaluations,
                stats
            }
        });
    } catch (error) {
        console.error('Error fetching student evaluations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch student evaluations'
        });
    }
};

// Get evaluation statistics
const getEvaluationStats = async (req, res) => {
    try {
        const totalEvaluations = await Evaluation.countDocuments();
        const totalStudents = await Student.countDocuments();
        const totalSubmissions = await Submission.countDocuments();

        // Get score distribution
        const scoreDistribution = await Evaluation.aggregate([
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $gte: ["$overallScore", 90] }, then: "A+" },
                                { case: { $gte: ["$overallScore", 80] }, then: "A" },
                                { case: { $gte: ["$overallScore", 70] }, then: "B" },
                                { case: { $gte: ["$overallScore", 60] }, then: "C" },
                                { case: { $gte: ["$overallScore", 50] }, then: "D" }
                            ],
                            default: "F"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get average scores
        const averageStats = await Evaluation.aggregate([
            {
                $group: {
                    _id: null,
                    averageOverallScore: { $avg: "$overallScore" },
                    averageModelScore: { $avg: "$modelEvaluation.score" },
                    averageControllerScore: { $avg: "$controllerEvaluation.score" },
                    maxScore: { $max: "$overallScore" },
                    minScore: { $min: "$overallScore" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totals: {
                    evaluations: totalEvaluations,
                    students: totalStudents,
                    submissions: totalSubmissions
                },
                scoreDistribution,
                averages: averageStats[0] || {},
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Error fetching evaluation stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch evaluation statistics'
        });
    }
};

module.exports = {
    getAllEvaluations,
    getEvaluationById,
    getEvaluationsByStudent,
    getEvaluationStats
};