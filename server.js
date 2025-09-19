// server.js

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const evaluationRoutes = require('./api/routes/evaluationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ limit: '5mb' })); // To parse JSON request bodies (increased limit for code)

// API Routes
app.use('/api', evaluationRoutes);

// Simple root route to check if server is running
app.get('/', (req, res) => {
    res.send('Code Evaluator API is running! 🚀');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});