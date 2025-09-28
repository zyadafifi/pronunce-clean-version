import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import { useConversationProgress } from "../hooks/useConversationProgress";
import { useNewSpeechRecognition } from "../hooks/useNewSpeechRecognition";
import { usePronunciationScoring } from "../hooks/usePronunciationScoring";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import DesktopProgressSection from "../components/desktop/conversation/DesktopProgressSection";
import DesktopVideoSection from "../components/desktop/conversation/DesktopVideoSection";
import DesktopPracticeSection from "../components/desktop/conversation/DesktopPracticeSection";
import DesktopResultsDialog from "../components/desktop/conversation/DesktopResultsDialog";
import DesktopCompletionModal from "../components/desktop/conversation/DesktopCompletionModal";
import "./DesktopConversationPage.css";

const DesktopConversationPage = () => {
  const { lessonNumber, topicId, conversationId } = useParams();
  const navigate = useNavigate();
  const {
    setCurrentLesson,
    setCurrentTopic,
    setCurrentConversation,
    updateTopicProgress,
    updateLessonProgressByTopics,
  } = useProgress();

  const [lesson, setLesson] = useState(null);
  const [topic, setTopic] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [lessonsData, setLessonsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [lastScore, setLastScore] = useState(null);

  // Hooks
  const {
    currentSentenceIndex,
    sentenceScores,
    completedSentences,
    overallScore,
    progressPercentage,
    isConversationCompleted,
    isCurrentSentenceCompleted,
    completeSentence,
    retrySentence,
    resetConversation,
    setCurrentSentenceIndex,
  } = useConversationProgress(
    conversationId ? parseInt(conversationId) : 0,
    conversation?.sentences?.length || 0
  );

  const {
    isRecording,
    isSpeaking,
    recordedAudio,
    recordingTime,
    speechDetected,
    startRecording,
    stopRecording,
    stopRecordingAndGetBlob,
    playRecordedAudio,
    clearRecording,
    speakText,
    stopSpeaking,
    cleanup,
  } = useNewSpeechRecognition();

  const {
    isProcessing,
    calculatePronunciationScore,
    getScoreColor,
    getScoreMessage,
  } = usePronunciationScoring();

  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isLoading: videoLoading,
    hasError: videoError,
    play,
    pause,
    replay,
    setVideoSource,
    seekTo,
    setVolume,
    toggleMute,
    formatTime,
    getProgress,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleLoadStart,
    handleCanPlay,
  } = useVideoPlayer();

  // Load lessons data
  useEffect(() => {
    const loadLessonsData = async () => {
      try {
        console.log("Fetching data.json...");
        const response = await fetch("/data.json");
        const data = await response.json();
        console.log(
          "Data loaded successfully, lessons count:",
          data.lessons?.length
        );
        setLessonsData(data);
      } catch (error) {
        console.error("Error loading lessons data:", error);
      }
    };

    loadLessonsData();
  }, []);

  // Load conversation data
  useEffect(() => {
    if (!lessonsData) return;

    console.log("Loading conversation data with params:", {
      lessonNumber,
      topicId,
      conversationId,
    });

    const currentLesson = lessonsData.lessons.find(
      (l) => l.lessonNumber === parseInt(lessonNumber)
    );

    if (currentLesson) {
      setLesson(currentLesson);
      setCurrentLesson(currentLesson.lessonNumber);

      const currentTopic = currentLesson.topics.find(
        (t) => t.id === parseInt(topicId)
      );

      if (currentTopic) {
        setTopic(currentTopic);
        setCurrentTopic(currentTopic.id);

        const currentConversation = currentTopic.conversations.find(
          (c) => c.id === parseInt(conversationId)
        );

        if (currentConversation) {
          setConversation(currentConversation);
          setCurrentConversation(currentConversation.id);
        } else {
          console.error("Conversation not found with ID:", conversationId);
        }
      } else {
        console.error("Topic not found with ID:", topicId);
      }
    } else {
      console.error("Lesson not found with number:", lessonNumber);
    }
    setIsLoading(false);
  }, [
    lessonNumber,
    topicId,
    conversationId,
    lessonsData,
    setCurrentLesson,
    setCurrentTopic,
    setCurrentConversation,
  ]);

  // Set video source when conversation changes
  useEffect(() => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (currentSentence.videoSrc) {
        console.log("Setting video source:", currentSentence.videoSrc);
        setVideoSource(currentSentence.videoSrc);
      }
    }
  }, [conversation, currentSentenceIndex, setVideoSource]);

  // Handle conversation completion
  const handleConversationCompleted = useCallback(
    (completedConversationId, finalScore) => {
      if (topic && lesson && lessonsData) {
        console.log(
          `Conversation ${completedConversationId} completed with score: ${finalScore}%`
        );

        // Update topic progress
        const topicResult = updateTopicProgress(parseInt(topicId), topic);
        console.log(`Topic ${topicId} progress updated:`, topicResult);

        // If topic is completed, update lesson progress
        if (topicResult.completed) {
          const lessonResult = updateLessonProgressByTopics(
            parseInt(lessonNumber),
            lessonsData.lessons
          );
          console.log(`Lesson ${lessonNumber} progress updated:`, lessonResult);
        }
      }
    },
    [
      topic,
      lesson,
      lessonsData,
      topicId,
      lessonNumber,
      updateTopicProgress,
      updateLessonProgressByTopics,
    ]
  );

  // Show completion modal when conversation is completed
  useEffect(() => {
    if (
      isConversationCompleted &&
      currentSentenceIndex >= conversation?.sentences?.length - 1
    ) {
      setShowCompletionModal(true);

      // Trigger conversation completion handling
      if (conversation && topic && lesson) {
        handleConversationCompleted(conversation.id, overallScore);
      }
    } else {
      setShowCompletionModal(false);
    }
  }, [
    isConversationCompleted,
    currentSentenceIndex,
    conversation,
    topic,
    lesson,
    overallScore,
    handleConversationCompleted,
  ]);

  // Handle video end
  const handleVideoEnd = () => {
    // Video ended, ready for practice
  };

  // Handle listen button click
  const handleListenClick = () => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      speakText(currentSentence.english);
    }
  };

  // Handle microphone button click
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
      setShowRecordingUI(false);
    } else {
      startRecording();
      setShowRecordingUI(true);
    }
  };

  // Handle stop recording
  const handleStopRecording = async () => {
    const audioBlob = await stopRecordingAndGetBlob();
    setShowRecordingUI(false);

    if (audioBlob && conversation?.sentences?.[currentSentenceIndex]) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      const result = await calculatePronunciationScore(
        audioBlob,
        currentSentence.english
      );

      if (result) {
        setLastScore(result.score);
        setRecognizedText(result.recognizedText || "");
        setShowResultsDialog(true);
      }
    }
  };

  // Handle delete recording
  const handleDeleteRecording = () => {
    clearRecording();
    setShowRecordingUI(false);
  };

  // Handle retry
  const handleRetry = () => {
    setShowResultsDialog(false);
    clearRecording();
    setRecognizedText("");
    retrySentence();
  };

  // Handle continue to next sentence
  const handleContinue = () => {
    setShowResultsDialog(false);
    clearRecording();

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      completeSentence(currentSentenceIndex, lastScore);

      // Move to next sentence if not completed
      if (currentSentenceIndex < conversation.sentences.length - 1) {
        const nextSentenceIndex = currentSentenceIndex + 1;
        setCurrentSentenceIndex(nextSentenceIndex);

        // Auto-play next video
        setTimeout(() => {
          if (conversation.sentences[nextSentenceIndex]?.videoSrc) {
            setVideoSource(conversation.sentences[nextSentenceIndex].videoSrc);
            setTimeout(() => {
              play();
            }, 200);
          }
        }, 500);
      }
    }
  };

  // Handle back to topics
  const handleBackToTopics = () => {
    navigate(`/topics/${lessonNumber}`);
  };

  // Handle close completion modal
  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    navigate(`/topics/${lessonNumber}`);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (isLoading) {
    return (
      <div className="desktop-conversation-page">
        <div className="main-container">
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading practice session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !topic || !conversation) {
    return (
      <div className="desktop-conversation-page">
        <div className="main-container">
          <div className="error-message">
            <h3>Content Not Found</h3>
            <p>
              {!lesson && `Lesson ${lessonNumber} not found. `}
              {!topic && `Topic ${topicId} not found. `}
              {!conversation && `Conversation ${conversationId} not found. `}
            </p>
            <button onClick={handleBackToTopics} className="btn btn-primary">
              Back to Topics
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSentence = conversation.sentences[currentSentenceIndex];

  return (
    <div className="desktop-conversation-page">
      <div className="main-container">
        <div className="content-wrapper">
          {/* Learning Progress Section */}
          <DesktopProgressSection
            currentSentenceIndex={currentSentenceIndex}
            totalSentences={conversation.sentences.length}
            progressPercentage={progressPercentage}
          />

          {/* Watch & Learn Section */}
          <DesktopVideoSection
            videoRef={videoRef}
            currentSentence={currentSentence}
            isPlaying={isPlaying}
            videoLoading={videoLoading}
            videoError={videoError}
            onPlay={play}
            onReplay={replay}
            onVideoEnd={handleVideoEnd}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onVideoPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
          />

          {/* Practice Section */}
          <DesktopPracticeSection
            currentSentence={currentSentence}
            isRecording={isRecording}
            isSpeaking={isSpeaking}
            onListenClick={handleListenClick}
            onMicClick={handleMicClick}
            onPlayRecording={playRecordedAudio}
            showRecordingUI={showRecordingUI}
            recordingTime={recordingTime}
            onStopRecording={handleStopRecording}
            onDeleteRecording={handleDeleteRecording}
          />
        </div>
      </div>

      {/* Results Dialog */}
      {showResultsDialog && (
        <DesktopResultsDialog
          show={showResultsDialog}
          score={lastScore}
          recognizedText={recognizedText}
          targetText={currentSentence?.english}
          isProcessing={isProcessing}
          onRetry={handleRetry}
          onContinue={handleContinue}
          onClose={() => setShowResultsDialog(false)}
          onListenClick={handleListenClick}
          onPlayRecording={playRecordedAudio}
        />
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <DesktopCompletionModal
          show={showCompletionModal}
          overallScore={overallScore}
          onClose={handleCloseCompletionModal}
        />
      )}
    </div>
  );
};

export default DesktopConversationPage;
