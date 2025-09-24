import React from "react";

const MobileCompletionCard = ({ show, overallScore, onBackToLessons }) => {
  if (!show) return null;

  return (
    <div className="mobile-completion-card show">
      <div className="completion-content">
        <div className="completion-icon">
          <i className="fas fa-party-horn"></i>
        </div>
        <h3>Conversation Completed!</h3>
        <p>Great job finishing this conversation</p>

        <div className="completion-score">
          <div className="score-container">
            <span className="score-label">Your overall score is:</span>
            <span className="score-value" id="mobileFinalScore">
              {overallScore}%
            </span>
          </div>
        </div>

        <button className="completion-btn" onClick={onBackToLessons}>
          Back to Topics
        </button>
      </div>
    </div>
  );
};

export default MobileCompletionCard;
