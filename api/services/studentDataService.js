// api/services/studentDataService.js

const { Student } = require('../../models');
const studentData = require('../../frontend/src/assets/studentData.json');

const initializeStudentData = async () => {
    try {
        console.log('Checking if student data needs to be initialized...');
        
        const existingStudentsCount = await Student.countDocuments();
        
        if (existingStudentsCount === 0) {
            console.log('No students found in database. Initializing from studentData.json...');
            
            const studentsToCreate = studentData.map(student => ({
                enrollmentNumber: student.enrollmentNumber,
                assignedQuestion: student.question
            }));

            const createdStudents = await Student.insertMany(studentsToCreate);
            console.log(`Successfully initialized ${createdStudents.length} students in the database.`);
            
            return createdStudents;
        } else {
            console.log(`Database already contains ${existingStudentsCount} students. Skipping initialization.`);
            return null;
        }
    } catch (error) {
        console.error('Error initializing student data:', error);
        throw error;
    }
};

const syncStudentData = async () => {
    try {
        console.log('Syncing student data with latest questions...');
        
        for (const studentInfo of studentData) {
            await Student.findOneAndUpdate(
                { enrollmentNumber: studentInfo.enrollmentNumber },
                { 
                    enrollmentNumber: studentInfo.enrollmentNumber,
                    assignedQuestion: studentInfo.question
                },
                { upsert: true, new: true }
            );
        }
        
        console.log('Student data sync completed successfully.');
    } catch (error) {
        console.error('Error syncing student data:', error);
        throw error;
    }
};

module.exports = {
    initializeStudentData,
    syncStudentData
};