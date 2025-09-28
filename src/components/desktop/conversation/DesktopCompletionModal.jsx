import React from "react";

const DesktopCompletionModal = ({ show, overallScore, onClose }) => {
  if (!show) return null;

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      id="congratulationModal"
      tabIndex="-1"
      aria-labelledby="congratulationModalLabel"
      aria-hidden={!show}
      style={{ display: show ? "block" : "none" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body text-center">
            {/* Celebration Image */}
            <img
              src="https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif"
              alt="Celebration GIF"
              className="congrats-img"
            />
            <h5 className="modal-title" id="congratulationModalLabel">
              🎉 Congratulations! 🎉
            </h5>
            <p>You've successfully completed this conversation!</p>

            {/* Overall Score Display */}
            <div className="overall-score-container">
              <h4>Overall Score</h4>
              <p id="overallScore" className="overall-score">
                {overallScore}%
              </p>
            </div>
          </div>
          <div className="modal-footer border-0 justify-content-center">
            <button
              type="button"
              className="btn btn-primary continue-to-next-lesson"
              onClick={onClose}
            >
              <i className="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopCompletionModal;
