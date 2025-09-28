import React from "react";

const DesktopRecordingUI = ({
  recordingTime,
  onStopRecording,
  onDeleteRecording,
}) => {
  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="recording-ui-container">
      <div className="recording-controls">
        <button
          className="recording-action-btn delete-btn"
          onClick={onDeleteRecording}
          title="Delete recording"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="recording-visual">
          <div className="recording-timer">{formatTime(recordingTime)}</div>
        </div>

        <button
          className="recording-action-btn send-btn"
          onClick={onStopRecording}
          title="Stop recording and process"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default DesktopRecordingUI;
