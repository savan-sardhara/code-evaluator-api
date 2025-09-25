// api/routes/evaluationHistoryRoutes.js

const express = require('express');
const router = express.Router();
const evaluationHistoryController = require('../controllers/evaluationHistoryController');

// GET /api/evaluations - Get all evaluations with optional filtering and pagination
router.get('/', evaluationHistoryController.getAllEvaluations);

// GET /api/evaluations/stats - Get evaluation statistics
router.get('/stats', evaluationHistoryController.getEvaluationStats);

// GET /api/evaluations/:id - Get evaluation by ID
router.get('/:id', evaluationHistoryController.getEvaluationById);

// GET /api/evaluations/student/:enrollmentNumber - Get evaluations for a specific student
router.get('/student/:enrollmentNumber', evaluationHistoryController.getEvaluationsByStudent);

module.exports = router;