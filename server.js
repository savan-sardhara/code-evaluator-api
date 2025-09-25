// server.js

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const evaluationRoutes = require('./api/routes/evaluationRoutes');
const studentRoutes = require('./api/routes/studentRoutes');
const evaluationHistoryRoutes = require('./api/routes/evaluationHistoryRoutes');
const screenshotRoutes = require('./api/routes/screenshotRoutes');
const { initializeStudentData } = require('./api/services/studentDataService');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the application
const initializeApp = async () => {
    try {
        // Connect to MongoDB Atlas
        await connectDB();
        
        // Initialize student data from JSON file if database is empty
        await initializeStudentData();
        
        console.log('Application initialization completed successfully.');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

// Initialize the app
initializeApp();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ limit: '5mb' })); // To parse JSON request bodies (increased limit for code)

// API Routes
app.use('/api', evaluationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/evaluations', evaluationHistoryRoutes);
app.use('/api/screenshots', screenshotRoutes);

// Simple root route to check if server is running
app.get('/', (req, res) => {
    res.send('Code Evaluator API is running! 🚀');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: 'Connected'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});