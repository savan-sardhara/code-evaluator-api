// api/routes/evaluationRoutes.js

const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

// Define the POST route for evaluation
router.post('/evaluate', evaluationController.evaluateStudentCode);

module.exports = router;