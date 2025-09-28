import React, { useState, useEffect, useRef } from "react";

const DesktopRecordingUI = ({
  recordingTime,
  onStopRecording,
  onDeleteRecording,
}) => {
  const [waveformBars, setWaveformBars] = useState(
    Array.from({ length: 8 }, () => 4)
  );
  const animationRef = useRef();

  // Animate waveform bars
  useEffect(() => {
    const animateWaveform = () => {
      setWaveformBars(
        (prev) => prev.map(() => Math.random() * 20 + 4) // Random heights between 4-24px
      );
      animationRef.current = requestAnimationFrame(animateWaveform);
    };

    animateWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
          <div className="recording-waveform">
            {waveformBars.map((height, index) => (
              <div
                key={index}
                className="waveform-bar"
                style={{ height: `${height}px` }}
              ></div>
            ))}
          </div>
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
