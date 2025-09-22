import { useState } from 'react';
import axios from 'axios';
import studentData from './studentData.json';
import ResultsDisplay from './ResultsDisplay'; // Import the new component
import './App.css';

function App() {
  const [selectedEnrollment, setSelectedEnrollment] = useState(studentData[0]);
  const [modelFile, setModelFile] = useState(null);
  const [controllerFile, setControllerFile] = useState(null);
  const [modelCode, setModelCode] = useState('');
  const [controllerCode, setControllerCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleEnrollmentChange = (e) => {
    const enrollment = studentData.find(s => s.enrollmentNumber === e.target.value);
    setSelectedEnrollment(enrollment);
    setModelFile(null);
    setControllerFile(null);
    setModelCode('');
    setControllerCode('');
    setResults(null);
    setError('');
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
    } catch (err) {
        console.error("API Error:", err);
        setError('Failed to analyze the code. The server might be down or an error occurred.');
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Code Assessment AI</h1>
        <div className="enrollment-selector">
          <label htmlFor="enrollment">Select Enrollment:</label>
          <select id="enrollment" onChange={handleEnrollmentChange} value={selectedEnrollment.enrollmentNumber}>
            {studentData.map(student => (
              <option key={student.enrollmentNumber} value={student.enrollmentNumber}>
                {student.enrollmentNumber}
              </option>
            ))}
          </select>
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
          <div className="question-box">
              <h3>Your Question</h3>
              <p>Create a Mongoose model named <strong>{selectedEnrollment.question.modelName}</strong> with the following fields: <strong>{selectedEnrollment.question.fields.join(', ')}</strong>.</p>
          </div>
          <FileDropzone type="model" onFileChange={handleFileChange} fileName={modelFile?.name}/>
          <FileDropzone type="controller" onFileChange={handleFileChange} fileName={controllerFile?.name}/>
          <button 
            className="analyze-button" 
            onClick={handleAnalyze} 
            disabled={!modelFile || !controllerFile || isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
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