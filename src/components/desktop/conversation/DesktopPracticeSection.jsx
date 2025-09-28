import React from "react";
import DesktopRecordingUI from "./DesktopRecordingUI";

const DesktopPracticeSection = ({
  currentSentence,
  isRecording,
  isSpeaking,
  onListenClick,
  onMicClick,
  onPlayRecording,
  showRecordingUI,
  recordingTime,
  onStopRecording,
  onDeleteRecording,
}) => {
  return (
    <div className="practice-section">
      {/* Arabic Text Container */}
      <div dir="rtl" className="arabic-instruction">
        <p>مرحبا! كيف حالك؟ اضغط على الميكروفون واقرأ الجملة التالية:</p>
      </div>

      {/* English Sentence Container */}
      <div className="sentence-container" id="sentence">
        <p className="sentence-text">
          {currentSentence?.english || "Loading..."}
        </p>
      </div>

      {/* Arabic Translation */}
      <div className="translation-container" id="translationDiv">
        <p className="translation-text">
          {currentSentence?.arabic || "جاري التحميل..."}
        </p>
      </div>

      {/* Control Icons - Show when not recording */}
      {!showRecordingUI && (
        <div className="control-icons">
          {/* Listen Button */}
          <button
            className={`control-btn listen-btn ${isSpeaking ? "speaking" : ""}`}
            id="listenButton"
            title="Listen to example"
            onClick={onListenClick}
            disabled={isSpeaking}
          >
            <i className="fas fa-volume-up"></i>
          </button>

          {/* Microphone Button */}
          <button
            className={`mic-button ${isRecording ? "recording" : ""}`}
            id="micButton"
            title={isRecording ? "Stop recording" : "Start recording"}
            onClick={onMicClick}
          >
            <i className="fas fa-microphone"></i>
          </button>

          {/* Play Recording Button */}
          <button
            className="control-btn play-btn"
            id="bookmarkIcon"
            title="Play recorded audio"
            onClick={onPlayRecording}
          >
            <i className="fas fa-headphones"></i>
          </button>
        </div>
      )}

      {/* Recording UI Container - Show when recording */}
      {showRecordingUI && (
        <DesktopRecordingUI
          recordingTime={recordingTime}
          onStopRecording={onStopRecording}
          onDeleteRecording={onDeleteRecording}
        />
      )}
    </div>
  );
};

export default DesktopPracticeSection;
