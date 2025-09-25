import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './ResultsDisplay.css'; // We'll create this CSS file next

// Helper to determine the color for the progress bar based on the score
const getScoreColor = (score) => {
  if (score >= 80) return '#28a745'; // Green for high scores
  if (score >= 50) return '#ffc107'; // Yellow for medium scores
  return '#dc3545'; // Red for low scores
};

function ResultsDisplay({ results }) {
  const { 
    overallScore, 
    summary, 
    modelEvaluation, 
    controllerEvaluation 
  } = results;

  const scoreColor = getScoreColor(overallScore);

  return (
    <div className="results-container">
      <div className="summary-grid">
        <div className="score-chart">
          <CircularProgressbar
            value={overallScore}
            text={`${overallScore}%`}
            styles={buildStyles({
              textColor: '#fff',
              pathColor: scoreColor,
              trailColor: 'rgba(255, 255, 255, 0.2)',
            })}
          />
        </div>
        <div className="summary-text">
          <p>{summary}</p>
          <div className="score-cards">
            <div className="score-card">
              <h4>Overall Score</h4>
              <p>{overallScore} / 100</p>
            </div>
            <div className="score-card">
              <h4>Model</h4>
              <p>{modelEvaluation.score} / {modelEvaluation.maxScore}</p>
            </div>
            <div className="score-card">
              <h4>Controller</h4>
              <p>{controllerEvaluation.score} / {controllerEvaluation.maxScore}</p>
            </div>
          </div>
        </div>
      </div>
{/*       
      <div className="feedback-section">
        <h3>Detailed Diagnostics</h3>
        <div className="feedback-list">
          <h4>Model Feedback</h4>
          {modelEvaluation.feedback.map((item, index) => (
            <FeedbackItem key={`model-${index}`} item={item} />
          ))}
        </div>
        <div className="feedback-list">
          <h4>Controller Feedback</h4>
          {controllerEvaluation.feedback.map((item, index) => (
            <FeedbackItem key={`controller-${index}`} item={item} />
          ))}
        </div>
      </div> */}
    </div>
  );
}


// A small sub-component for individual feedback items
function FeedbackItem({ item }) {
    // We use the feedback type (e.g., 'ERROR') to apply a specific CSS class
    const typeClass = item.type.toLowerCase(); 
    return (
        <div className={`feedback-item ${typeClass}`}>
            <span className="feedback-type">{item.type}</span>
            <p className="feedback-message">{item.message}</p>
        </div>
    );
}


export default ResultsDisplay;