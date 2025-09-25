// api/controllers/studentController.js

const { Student, Submission, Evaluation } = require('../../models');

// Get all students
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .sort({ createdAt: -1 })
            .select('enrollmentNumber name email assignedQuestion createdAt');
        
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch students'
        });
    }
};

// Get student by enrollment number
const getStudentByEnrollment = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;
        
        const student = await Student.findOne({ enrollmentNumber });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        // Get student's submissions and evaluations
        const submissions = await Submission.find({ student: student._id })
            .sort({ createdAt: -1 })
            .populate('student', 'enrollmentNumber name');

        const evaluations = await Evaluation.find({ student: student._id })
            .sort({ createdAt: -1 })
            .populate('submission', 'submissionTimestamp');

        res.status(200).json({
            success: true,
            data: {
                student,
                submissions,
                evaluations,
                stats: {
                    totalSubmissions: submissions.length,
                    totalEvaluations: evaluations.length,
                    averageScore: evaluations.length > 0 
                        ? (evaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / evaluations.length).toFixed(2)
                        : 0,
                    bestScore: evaluations.length > 0 
                        ? Math.max(...evaluations.map(evaluation => evaluation.overallScore))
                        : 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch student data'
        });
    }
};

// Update student information
const updateStudent = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated
        delete updateData._id;
        delete updateData.enrollmentNumber;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const student = await Student.findOneAndUpdate(
            { enrollmentNumber },
            updateData,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update student'
        });
    }
};

module.exports = {
    getAllStudents,
    getStudentByEnrollment,
    updateStudent
};