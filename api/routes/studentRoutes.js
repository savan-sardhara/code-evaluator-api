// api/routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// GET /api/students - Get all students
router.get('/', studentController.getAllStudents);

// GET /api/students/:enrollmentNumber - Get student by enrollment number
router.get('/:enrollmentNumber', studentController.getStudentByEnrollment);

// PUT /api/students/:enrollmentNumber - Update student information
router.put('/:enrollmentNumber', studentController.updateStudent);

module.exports = router;