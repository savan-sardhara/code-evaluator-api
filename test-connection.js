// test-connection.js
// Simple test script to verify our MongoDB connection setup

require('dotenv').config();
const connectDB = require('./config/database');
const { Student } = require('./models');

const testConnection = async () => {
    try {
        console.log('Testing MongoDB connection...');
        
        // Check if MongoDB URI is configured
        if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<username>')) {
            console.log('⚠️  MongoDB URI not configured properly in .env file');
            console.log('Please update MONGODB_URI with your actual MongoDB Atlas connection string');
            console.log('Example: MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.abcdef.mongodb.net/code-evaluator?retryWrites=true&w=majority');
            return;
        }

        // Attempt to connect
        await connectDB();
        console.log('✅ MongoDB connection successful!');
        
        // Test basic database operations
        const studentCount = await Student.countDocuments();
        console.log(`📊 Current students in database: ${studentCount}`);
        
        console.log('🎉 All tests passed! Your MongoDB integration is ready.');
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Check your MongoDB Atlas connection string');
        console.log('2. Ensure your IP is whitelisted in Atlas');
        console.log('3. Verify database user credentials');
        console.log('4. Make sure your cluster is running');
    } finally {
        process.exit(0);
    }
};

testConnection();