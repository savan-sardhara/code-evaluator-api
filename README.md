# Code Evaluator API with MongoDB Atlas

A comprehensive code evaluation system that uses MongoDB Atlas for data persistence and AI-powered code analysis.

## 🗄️ Database Structure

### Collections Created in MongoDB Atlas:
- **students**: Student information and assigned questions
- **submissions**: Student code submissions (model and controller files)
- **evaluations**: AI evaluation results and scoring

## 🚀 Quick Setup

### 1. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string from the Atlas dashboard

### 2. Environment Configuration

Update your `.env` file with your MongoDB Atlas connection string:

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority
```

**Example:**
```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abcdef.mongodb.net/code-evaluator?retryWrites=true&w=majority
```

### 3. Install Dependencies & Start

```bash
# Install backend dependencies
npm install

# Start the server
npm start

# In another terminal, start the frontend
cd frontend
npm install
npm run dev
```

## 📚 API Endpoints

### Code Evaluation
- `POST /api/evaluate` - Submit code for evaluation and save to MongoDB

### Student Management
- `GET /api/students` - Get all students
- `GET /api/students/:enrollmentNumber` - Get specific student with stats
- `PUT /api/students/:enrollmentNumber` - Update student information

### Evaluation History
- `GET /api/evaluations` - Get all evaluations (with pagination and filtering)
- `GET /api/evaluations/stats` - Get evaluation statistics
- `GET /api/evaluations/:id` - Get specific evaluation
- `GET /api/evaluations/student/:enrollmentNumber` - Get all evaluations for a student

### Health Check
- `GET /api/health` - Check API and database status

## 🔍 API Usage Examples

### Submit Code for Evaluation
```javascript
POST /api/evaluate
{
  "enrollmentNumber": "210801301",
  "question": {
    "modelName": "Product",
    "fields": ["name", "price", "category", "inStock"]
  },
  "submission": {
    "modelCode": "const mongoose = require('mongoose')...",
    "controllerCode": "const Product = require('./model')..."
  }
}
```

### Get Student Statistics
```javascript
GET /api/students/210801301
```

### Get Evaluation History with Filters
```javascript
GET /api/evaluations?enrollmentNumber=210801301&minScore=80&page=1&limit=10
```

## 🗃️ Data Models

### Student Schema
```javascript
{
  enrollmentNumber: String (required, unique),
  name: String,
  email: String,
  assignedQuestion: {
    modelName: String,
    fields: [String]
  },
  timestamps: true
}
```

### Submission Schema
```javascript
{
  enrollmentNumber: String (required),
  student: ObjectId (ref: Student),
  question: Object,
  submission: {
    modelCode: String,
    controllerCode: String
  },
  isEvaluated: Boolean,
  timestamps: true
}
```

### Evaluation Schema
```javascript
{
  enrollmentNumber: String (required),
  student: ObjectId (ref: Student),
  submission: ObjectId (ref: Submission),
  overallScore: Number (0-100),
  summary: String,
  modelEvaluation: {
    score: Number,
    maxScore: Number,
    feedback: [{ type: String, message: String }]
  },
  controllerEvaluation: {
    score: Number,
    maxScore: Number, 
    feedback: [{ type: String, message: String }]
  },
  aiModel: String,
  timestamps: true
}
```

## 🔧 Features

### Automatic Data Initialization
- Student data from `frontend/src/studentData.json` is automatically imported into MongoDB on first startup
- No manual data entry required

### Advanced Analytics
- Grade calculation (A+, A, B, C, D, F)
- Score distribution analysis
- Student performance tracking
- Evaluation history

### Robust Error Handling
- Database connection monitoring
- Graceful error responses
- Input validation

## 🧪 Testing the Integration

1. **Start the server** - Check console for "MongoDB Atlas Connected" message
2. **Open frontend** - Verify students load from database
3. **Submit evaluation** - Upload files and click "Analyze"
4. **Check database** - Data should be saved in MongoDB Atlas
5. **Test API endpoints** - Use tools like Postman to test endpoints

## 📊 MongoDB Atlas Dashboard

You can view your data directly in the MongoDB Atlas dashboard:
1. Go to your cluster in Atlas
2. Click "Browse Collections"
3. Explore the `students`, `submissions`, and `evaluations` collections

## 🎯 Benefits of MongoDB Integration

- **Persistent Storage**: All evaluations and submissions are saved
- **Analytics**: Track student progress over time
- **Scalability**: MongoDB Atlas handles scaling automatically
- **Search**: Query evaluations by score, date, student, etc.
- **Backup**: Atlas provides automatic backups
- **Security**: Enterprise-grade security features

## 🛠️ Troubleshooting

### Connection Issues
- Verify your MongoDB Atlas connection string
- Check if your IP is whitelisted in Atlas
- Ensure database user has proper permissions

### Data Not Appearing
- Check server console for error messages
- Verify API endpoints are working via health check
- Check MongoDB Atlas logs

### Performance
- Database indexes are automatically created for optimal query performance
- Connection pooling is configured for high concurrency

Ready to start using your MongoDB-powered code evaluator! 🎉