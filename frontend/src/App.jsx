import { useState } from 'react';
import axios from 'axios';
import ResultsDisplay from './ResultsDisplay'; // Import the new component
import ScreenshotUpload from './ScreenshotUpload'; // Import screenshot upload component
import './App.css';

function App() {
  const [enrollmentInput, setEnrollmentInput] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [controllerFile, setControllerFile] = useState(null);
  const [modelCode, setModelCode] = useState('');
  const [controllerCode, setControllerCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(false);

  // Function to check if student has already submitted
  const checkExistingSubmission = async (enrollmentNumber) => {
    try {
      setCheckingSubmission(true);
      
      // First check localStorage for quick response
      const localSubmissions = JSON.parse(localStorage.getItem('submittedStudents') || '[]');
      if (localSubmissions.includes(enrollmentNumber)) {
        setHasSubmitted(true);
        setCheckingSubmission(false);
        return;
      }
      
      // Then check with backend for authoritative answer
      const response = await axios.get(`http://localhost:3000/api/evaluations/student/${enrollmentNumber}`);
      
      // If we get evaluations data, student has already submitted
      if (response.data.success && response.data.data.evaluations.length > 0) {
        setHasSubmitted(true);
        // Store in localStorage for future quick checks
        const updatedSubmissions = [...localSubmissions, enrollmentNumber];
        localStorage.setItem('submittedStudents', JSON.stringify(updatedSubmissions));
      } else {
        setHasSubmitted(false);
      }
    } catch (err) {
      // If 404, student hasn't submitted yet
      if (err.response && err.response.status === 404) {
        setHasSubmitted(false);
      } else {
        console.error('Error checking submission:', err);
        setHasSubmitted(false);
      }
    } finally {
      setCheckingSubmission(false);
    }
  };

  const handleEnrollmentInput = async (e) => {
    const enrollmentNumber = e.target.value.trim();
    setEnrollmentInput(enrollmentNumber);
    
    // Clear previous selection and errors
    setSelectedEnrollment(null);
    setError('');
    setResults(null);
    setModelFile(null);
    setControllerFile(null);
    setModelCode('');
    setControllerCode('');
    setHasSubmitted(false);

    if (enrollmentNumber) {
      setFetchingStudent(true);
      try {
        // Try to fetch student data from the API
        const response = await axios.get(`http://localhost:3000/api/students/${enrollmentNumber}`);
        const studentInfo = response.data.data.student;
        setSelectedEnrollment({
          enrollmentNumber: studentInfo.enrollmentNumber,
          question: studentInfo.assignedQuestion
        });
        
        // Check if student has already submitted
        await checkExistingSubmission(enrollmentNumber);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError(`Enrollment number "${enrollmentNumber}" not found. Please check and try again.`);
        } else {
          setError('Failed to fetch student information. Please try again.');
        }
        console.error('Error fetching student:', err);
      } finally {
        setFetchingStudent(false);
      }
    }
  };

  const handleFileChange = (file, type) => {
    if (!file) return;

    if (!file.name.endsWith('.js')) {
        setError(`Invalid file type for ${type}. Please upload a .js file.`);
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'model') {
        setModelFile(file);
        setModelCode(e.target.result);
      } else {
        setControllerFile(file);
        setControllerCode(e.target.result);
      }
      setError('');
    };
    reader.readAsText(file);
  };
  
  const handleAnalyze = async () => {
    if (hasSubmitted) {
      setError('Assessment has already been submitted. Only one submission is allowed per student.');
      return;
    }

    if (!modelCode || !controllerCode) {
      setError('Please upload both model and controller files before analyzing.');
      return;
    }
    setIsLoading(true);
    setResults(null);
    setError('');

    const payload = {
        enrollmentNumber: selectedEnrollment.enrollmentNumber,
        question: selectedEnrollment.question,
        submission: {
            modelCode,
            controllerCode,
        }
    };

    try {
        const response = await axios.post('http://localhost:3000/api/evaluate', payload);
        setResults(response.data);
        setHasSubmitted(true); // Mark as submitted after successful evaluation
        
        // Store in localStorage for persistence across page refreshes
        const localSubmissions = JSON.parse(localStorage.getItem('submittedStudents') || '[]');
        if (!localSubmissions.includes(selectedEnrollment.enrollmentNumber)) {
          localSubmissions.push(selectedEnrollment.enrollmentNumber);
          localStorage.setItem('submittedStudents', JSON.stringify(localSubmissions));
        }
    } catch (err) {
        console.error("API Error:", err);
        if (err.response && err.response.data && err.response.data.error) {
          setError(`Error: ${err.response.data.error}`);
        } else {
          setError('Failed to analyze the code. The server might be down or an error occurred.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Code Assessment AI</h1>
        <div className="enrollment-selector">
          <label htmlFor="enrollment">Enter Enrollment Number:</label>
          <input
            type="text"
            id="enrollment"
            placeholder="e.g., 210801301"
            value={enrollmentInput}
            onChange={handleEnrollmentInput}
            className="enrollment-input"
          />
          {fetchingStudent && <span className="loading-indicator">🔍 Looking up student...</span>}
          {selectedEnrollment && (
            <span className="student-found">✅ Student found: {selectedEnrollment.enrollmentNumber}</span>
          )}
        </div>
      </header>

      <main className="main-content">
        <div className="left-panel">
          {/* ---- THIS IS THE UPDATED SECTION ---- */}
          {!isLoading && !results && (
            <div className="initial-state-placeholder">
              <h2>Analysis Dashboard</h2>
              <p>Your analysis results will appear here after you upload files and click "Analyze".</p>
            </div>
          )}

          {isLoading && (
            <div className="loading-state">
              <h2>Analyzing...</h2>
              <p>The AI is reviewing the code. Please wait a moment.</p>
            </div>
          )}

          {results && <ResultsDisplay results={results} />}
          {/* ---- END OF UPDATED SECTION ---- */}
        </div>

        <div className="right-panel">
          {selectedEnrollment && (
            <div className="question-box">
                <h3>Your Question</h3>
                <p>Create a Mongoose model named <strong>{selectedEnrollment.question.modelName}</strong> with the following fields: <strong>{selectedEnrollment.question.fields.join(', ')}</strong>.</p>
            </div>
          )}
          <FileDropzone type="model" onFileChange={handleFileChange} fileName={modelFile?.name}/>
          <FileDropzone type="controller" onFileChange={handleFileChange} fileName={controllerFile?.name}/>
          
          {/* Screenshot Upload Section */}
          {selectedEnrollment && (
            <ScreenshotUpload enrollmentNumber={selectedEnrollment.enrollmentNumber} />
          )}
          
          <button 
            className="analyze-button" 
            onClick={handleAnalyze} 
            disabled={!modelFile || !controllerFile || isLoading || !selectedEnrollment || hasSubmitted || checkingSubmission}
          >
            {isLoading ? 'Analyzing...' : 
             checkingSubmission ? 'Checking...' :
             hasSubmitted ? 'Assessment Already Submitted' : 'Analyze'}
          </button>
          {hasSubmitted && (
            <div className="submission-notice">
              <p>✅ Assessment has already been submitted for this student. Only one submission is allowed per student.</p>
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
        </div>
      </main>
    </div>
  );
}

function FileDropzone({ type, onFileChange, fileName }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        onFileChange(file, type);
    };
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        onFileChange(file, type);
    };

    return (
        <div 
            className={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                id={`${type}-file-input`}
                style={{ display: 'none' }}
                accept=".js"
                onChange={handleFileSelect}
            />
            {fileName ? (
                <p>File loaded: <strong>{fileName}</strong></p>
            ) : (
                <>
                    <p>Drop <strong>{type}</strong> file here</p>
                    <p className="or-text">or</p>
                    <button 
                        className="choose-file-button"
                        onClick={() => document.getElementById(`${type}-file-input`).click()}
                    >
                        Choose File
                    </button>
                </>
            )}
        </div>
    );
}

export default App;