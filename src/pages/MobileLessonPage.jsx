import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import { useConversationProgress } from "../hooks/useConversationProgress";
import { useNewSpeechRecognition } from "../hooks/useNewSpeechRecognition";
import { usePronunciationScoring } from "../hooks/usePronunciationScoring";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import { useMobileFeatures } from "../hooks/useMobileFeatures";
import useSubtitleSync from "../hooks/useSubtitleSync";
import MobileVideoContainer from "../components/mobile/MobileVideoContainer";
import MobileProgressBar from "../components/mobile/MobileProgressBar";
import MobileBackButton from "../components/mobile/MobileBackButton";
import MobileSubtitleContainer from "../components/mobile/MobileSubtitleContainer";
import MobileReplayOverlay from "../components/mobile/MobileReplayOverlay";
import MobilePracticeOverlay from "../components/mobile/MobilePracticeOverlay";
import MobileCompletionCard from "../components/mobile/MobileCompletionCard";
import MobileResultsDialog from "../components/mobile/MobileResultsDialog";
import MobileAlertContainer from "../components/mobile/MobileAlertContainer";
import "./MobileLessonPage.css";

const MobileLessonPage = () => {
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
  const [showPracticeOverlay, setShowPracticeOverlay] = useState(false);
  const [showReplayOverlay, setShowReplayOverlay] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const [topicCompletedStatus, setTopicCompletedStatus] = useState(false);
  const [lessonCompletedStatus, setLessonCompletedStatus] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showIOSAudioOverlay, setShowIOSAudioOverlay] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [missingWords, setMissingWords] = useState([]);
  const [lastScore, setLastScore] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [pendingVideoPlay, setPendingVideoPlay] = useState(false);
  const [videoLoadAttempts, setVideoLoadAttempts] = useState(0);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);

  // Add ref for managing user interaction
  const userInteractionRef = useRef(false);

  // Video preloading optimization
  const preloaderRef = useRef(null);
  const [preloadedVideos, setPreloadedVideos] = useState(new Set());

  // Enhanced video states - simplified for smooth playback
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
    audioStream, // Add audioStream like desktop
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

  const {
    isMobile,
    viewportHeight,
    setupMobileAccessibility,
    enableVideoAudio,
    mobileSpeakSentence,
    playMobileRecordedAudioSlow,
    showMobileAlert,
    hideMobileAlert,
  } = useMobileFeatures();

  // Subtitle synchronization hook
  const {
    currentSubtitle,
    subtitles,
    isSubtitlesActive,
    isLoading: subtitleLoading,
    error: subtitleError,
    loadSubtitlesForSentence,
    clearSubtitles,
  } = useSubtitleSync(videoRef);

  // iOS-optimized automatic video play function
  const safeVideoPlay = async (forcePlay = false) => {
    if (!videoRef.current) {
      console.error("Video ref is null");
      return false;
    }

    // Don't play if video has ended
    if (videoRef.current.ended) {
      console.log("🏁 Video has ended, not attempting to play");
      return false;
    }

    console.log("🎬 Attempting automatic video play:", videoRef.current.src);
    console.log("Video ready state:", videoRef.current.readyState);
    console.log("Video network state:", videoRef.current.networkState);

    // iOS Strategy: Start muted for autoplay, then enable audio
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // For iOS: Start muted to allow autoplay, then enable audio after play starts
      videoRef.current.muted = true;
      videoRef.current.volume = 0;

      try {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }

        console.log("✅ iOS video autoplay successful (muted)");

        // Enable audio after video starts playing (iOS allows this)
        setTimeout(() => {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.muted = false;
            videoRef.current.volume = 1.0;
            console.log("🔊 Audio enabled after autoplay");
          }
        }, 100);

        setHasUserInteracted(true);
        userInteractionRef.current = true;
        setShowIOSAudioOverlay(false);
        setPendingVideoPlay(false);

        return true;
      } catch (error) {
        console.error("iOS autoplay failed:", error.name, error.message);

        // Fallback: Try with audio directly (might work on some iOS versions)
        try {
          videoRef.current.muted = false;
          videoRef.current.volume = 1.0;
          await videoRef.current.play();
          console.log("✅ iOS video play successful with audio fallback");
          setHasUserInteracted(true);
          userInteractionRef.current = true;
          setShowIOSAudioOverlay(false);
          setPendingVideoPlay(false);
          return true;
        } catch (fallbackError) {
          console.log("❌ iOS autoplay completely failed");
          setAutoplayFailed(true);
          setPendingVideoPlay(true);
          return false;
        }
      }
    } else {
      // For non-iOS: Try with audio first
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;

      try {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }

        console.log("✅ Video play successful with audio");
        setHasUserInteracted(true);
        userInteractionRef.current = true;
        setShowIOSAudioOverlay(false);
        setPendingVideoPlay(false);

        return true;
      } catch (error) {
        console.error("Video play failed:", error.name, error.message);

        // Fallback: Try muted
        try {
          videoRef.current.muted = true;
          await videoRef.current.play();
          console.log("✅ Video play successful (muted fallback)");
          setHasUserInteracted(true);
          userInteractionRef.current = true;
          setShowIOSAudioOverlay(false);
          setPendingVideoPlay(false);
          return true;
        } catch (mutedError) {
          console.log("❌ All play attempts failed");
          setAutoplayFailed(true);
          setPendingVideoPlay(true);
          return false;
        }
      }
    }
  };

  // Load lessons data
  useEffect(() => {
    const loadLessonsData = async () => {
      try {
        console.log("Fetching data.json...");
        const response = await fetch("/data.json");
        console.log("Response status:", response.status);
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
    console.log("Available lessons:", lessonsData.lessons?.length);

    const currentLesson = lessonsData.lessons.find(
      (l) => l.lessonNumber === parseInt(lessonNumber)
    );
    console.log("Found lesson:", currentLesson?.title);

    if (currentLesson) {
      setLesson(currentLesson);
      setCurrentLesson(currentLesson.lessonNumber);

      const currentTopic = currentLesson.topics.find(
        (t) => t.id === parseInt(topicId)
      );
      console.log("Found topic:", currentTopic?.title);

      if (currentTopic) {
        setTopic(currentTopic);
        setCurrentTopic(currentTopic.id);

        const currentConversation = currentTopic.conversations.find(
          (c) => c.id === parseInt(conversationId)
        );
        console.log("Found conversation:", currentConversation?.title);

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

  // Retry video loading function
  const retryVideoLoad = useCallback(
    (videoSrc, attempts = 0) => {
      const maxAttempts = 3;
      if (attempts >= maxAttempts) {
        console.error(
          `Failed to load video after ${maxAttempts} attempts:`,
          videoSrc
        );
        return;
      }

      console.log(
        `Attempting to load video (attempt ${attempts + 1}):`,
        videoSrc
      );
      setVideoLoadAttempts(attempts + 1);
      setVideoSource(videoSrc);

      // Set a timeout to retry if video doesn't load
      setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState < 3) {
          console.log(`Video not ready after timeout, retrying...`);
          retryVideoLoad(videoSrc, attempts + 1);
        }
      }, 3000);
    },
    [setVideoSource]
  );

  // Set video source when conversation changes
  useEffect(() => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (
        currentSentence.videoSrc &&
        currentSentence.videoSrc !== currentVideoSrc
      ) {
        console.log("Setting video source:", currentSentence.videoSrc);
        setCurrentVideoSrc(currentSentence.videoSrc);
        setVideoLoadAttempts(0);
        retryVideoLoad(currentSentence.videoSrc);

        // Load subtitles for current sentence (mobile only)
        if (isMobile) {
          console.log("🎬 Loading subtitles for:", {
            lesson: parseInt(lessonNumber),
            topic: parseInt(topicId),
            conversation: parseInt(conversationId),
            sentence: currentSentenceIndex + 1,
          });
          loadSubtitlesForSentence(
            parseInt(lessonNumber),
            parseInt(topicId),
            parseInt(conversationId),
            currentSentenceIndex + 1 // SRT files are 1-based
          );
        }

        // Automatic video play triggers - no user interaction required
        const handleCanPlayThrough = () => {
          console.log(
            "🎬 Video can play through, triggering automatic play..."
          );
          safeVideoPlay(true);
          videoRef.current?.removeEventListener(
            "canplaythrough",
            handleCanPlayThrough
          );
        };

        const handleLoadedData = () => {
          console.log("🎬 Video data loaded, triggering automatic play...");
          safeVideoPlay(true);
        };

        const handleCanPlay = () => {
          console.log("🎬 Video can play, triggering automatic play...");
          safeVideoPlay(true);
        };

        if (videoRef.current) {
          videoRef.current.addEventListener(
            "canplaythrough",
            handleCanPlayThrough
          );
          videoRef.current.addEventListener("loadeddata", handleLoadedData);
          videoRef.current.addEventListener("canplay", handleCanPlay);

          // Cleanup listeners
          const cleanup = () => {
            if (videoRef.current) {
              videoRef.current.removeEventListener(
                "canplaythrough",
                handleCanPlayThrough
              );
              videoRef.current.removeEventListener(
                "loadeddata",
                handleLoadedData
              );
              videoRef.current.removeEventListener("canplay", handleCanPlay);
            }
          };

          // Set cleanup timeout
          setTimeout(cleanup, 5000);
        }
      } else {
        console.warn("No video source found for current sentence");
      }
    }
  }, [
    conversation,
    currentSentenceIndex,
    currentVideoSrc,
    hasUserInteracted,
    retryVideoLoad,
    isMobile,
    lessonNumber,
    topicId,
    conversationId,
    loadSubtitlesForSentence,
  ]);

  // Handle conversation completion and update topic/lesson progress
  const handleConversationCompleted = useCallback(
    (completedConversationId, finalScore) => {
      if (topic && lesson && lessonsData) {
        console.log(
          `Conversation ${completedConversationId} completed with score: ${finalScore}%`
        );

        // Update topic progress based on all conversations in the topic
        const topicResult = updateTopicProgress(parseInt(topicId), topic);
        console.log(`Topic ${topicId} progress updated:`, topicResult);

        // If topic is completed, update lesson progress
        if (topicResult.completed) {
          console.log(
            `Topic ${topicId} completed! Updating lesson progress...`
          );
          setTopicCompletedStatus(true);

          const lessonResult = updateLessonProgressByTopics(
            parseInt(lessonNumber),
            lessonsData.lessons
          );
          console.log(`Lesson ${lessonNumber} progress updated:`, lessonResult);

          if (lessonResult.completed) {
            console.log(
              `🎉 Lesson ${lessonNumber} completed! Next lesson should be unlocked.`
            );
            setLessonCompletedStatus(true);
          }
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

  // Set up global conversation completion callback
  useEffect(() => {
    window.onConversationCompleted = handleConversationCompleted;
    return () => {
      window.onConversationCompleted = null;
    };
  }, [handleConversationCompleted]);

  // Show completion card only when conversation is actually completed
  useEffect(() => {
    if (
      isConversationCompleted &&
      currentSentenceIndex >= conversation?.sentences?.length - 1
    ) {
      setShowCompletionCard(true);

      // Trigger conversation completion handling
      if (conversation && topic && lesson) {
        handleConversationCompleted(conversation.id, overallScore);
      }
    } else {
      setShowCompletionCard(false);
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

  // Automatic video play setup - no user interaction required
  useEffect(() => {
    if (!isMobile) {
      // On desktop, user interaction might not be required
      setHasUserInteracted(true);
      userInteractionRef.current = true;
      return;
    }

    // Start with no overlay - we want immediate autoplay
    setShowIOSAudioOverlay(false);
    setHasUserInteracted(true); // Set to true for automatic play
    userInteractionRef.current = true;

    // Mobile-specific setup
    setupMobileAccessibility();

    // Automatic video play trigger - no user interaction needed
    const triggerAutomaticPlay = () => {
      if (
        videoRef.current &&
        videoRef.current.paused &&
        !videoRef.current.ended
      ) {
        console.log("🎬 Triggering automatic video play...");
        safeVideoPlay(true);
      }
    };

    // Trigger automatic play after a short delay to ensure video is ready
    const autoPlayTimeout = setTimeout(triggerAutomaticPlay, 500);

    // Also try when video metadata is loaded
    const handleVideoReady = () => {
      console.log("📹 Video ready for automatic play");
      triggerAutomaticPlay();
    };

    if (videoRef.current) {
      videoRef.current.addEventListener("loadedmetadata", handleVideoReady);
      videoRef.current.addEventListener("canplay", handleVideoReady);
    }

    // Cleanup
    return () => {
      clearTimeout(autoPlayTimeout);
      if (videoRef.current) {
        videoRef.current.removeEventListener(
          "loadedmetadata",
          handleVideoReady
        );
        videoRef.current.removeEventListener("canplay", handleVideoReady);
      }
    };
  }, [isMobile, setupMobileAccessibility]);

  // Video preloading system for smooth playback
  const preloadNextVideo = useCallback(
    (nextSentenceIndex) => {
      if (
        !conversation?.sentences ||
        nextSentenceIndex >= conversation.sentences.length
      ) {
        return;
      }

      const nextSentence = conversation.sentences[nextSentenceIndex];
      if (
        !nextSentence?.videoSrc ||
        preloadedVideos.has(nextSentence.videoSrc)
      ) {
        return;
      }

      console.log("🔄 Preloading next video:", nextSentence.videoSrc);

      // Create aggressive preloader video element for seamless playback
      const preloader = document.createElement("video");
      preloader.preload = "auto";
      preloader.muted = false;
      preloader.playsInline = true;
      preloader.crossOrigin = "anonymous";
      preloader.style.display = "none";

      // Aggressive preloading attributes for mobile optimization
      preloader.setAttribute("webkit-playsinline", "true");
      preloader.setAttribute("x5-video-player-type", "h5");
      preloader.setAttribute("x5-video-player-fullscreen", "true");
      preloader.setAttribute("preload", "auto");
      preloader.setAttribute("buffered", "true");

      preloader.onloadeddata = () => {
        console.log("✅ Video preloaded successfully:", nextSentence.videoSrc);
        setPreloadedVideos((prev) => new Set([...prev, nextSentence.videoSrc]));
      };

      preloader.onerror = (e) => {
        console.warn("❌ Video preload failed:", nextSentence.videoSrc, e);
      };

      // Set source and start preloading
      preloader.src = nextSentence.videoSrc;
      preloader.load();

      // Store reference
      preloaderRef.current = preloader;
      document.body.appendChild(preloader);

      // Cleanup after 30 seconds to prevent memory leaks
      setTimeout(() => {
        if (preloader && preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 30000);
    },
    [conversation, preloadedVideos]
  );

  // Aggressive preloading for seamless video transitions
  useEffect(() => {
    if (conversation?.sentences && currentSentenceIndex >= 0) {
      const nextIndex = currentSentenceIndex + 1;
      if (nextIndex < conversation.sentences.length) {
        // Immediate preloading for seamless experience
        setTimeout(() => {
          preloadNextVideo(nextIndex);
        }, 500); // Reduced delay for faster preloading
      }

      // Also preload the video after next for even smoother experience
      const nextNextIndex = currentSentenceIndex + 2;
      if (nextNextIndex < conversation.sentences.length) {
        setTimeout(() => {
          preloadNextVideo(nextNextIndex);
        }, 1500);
      }
    }
  }, [currentSentenceIndex, conversation, preloadNextVideo]);

  const handleBackClick = () => {
    navigate(`/topics/${lessonNumber}`);
  };

  const handleVideoEnd = () => {
    setShowReplayOverlay(true);
    // Show practice overlay immediately (no delay)
    setShowPracticeOverlay(true);
  };

  const handleReplayClick = async () => {
    setShowReplayOverlay(false);
    setShowPracticeOverlay(false); // Hide practice overlay when replaying
    // Ensure user has interacted before replaying
    if (hasUserInteracted || userInteractionRef.current) {
      // Reset video to beginning and play
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        await safeVideoPlay();
      }
    } else {
      setShowIOSAudioOverlay(true);
    }
  };

  const handlePracticeClose = () => {
    setShowPracticeOverlay(false);
  };

  const handleListenClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (isMobile) {
        mobileSpeakSentence(currentSentence.english);
      } else {
        speakText(currentSentence.english);
      }
    }
  };

  const handleListenSlowClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (isMobile) {
        mobileSpeakSentence(currentSentence.english, true);
      } else {
        speakText(currentSentence.english, 0.7, 1);
      }
    }
  };

  const handleMicClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleStopRecording = async () => {
    // Just stop the recording - let MobilePracticeOverlay handle the processing
    await stopRecordingAndGetBlob();
  };

  const handleRetry = () => {
    setShowResultsDialog(false);
    clearRecording();
    setRecognizedText("");
    setMissingWords([]);
    // Reset practice overlay states
    setShowPracticeOverlay(false);
    setShowReplayOverlay(false);
    // Reset the sentence for retry
    retrySentence();
    // Show practice overlay after a short delay
    setTimeout(() => {
      setShowPracticeOverlay(true);
    }, 500);
  };

  const handleContinue = async () => {
    setShowResultsDialog(false);
    clearRecording();

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      completeSentence(currentSentenceIndex, lastScore);

      // Move to next sentence if not completed
      if (currentSentenceIndex < conversation.sentences.length - 1) {
        const nextSentenceIndex = currentSentenceIndex + 1;
        setCurrentSentenceIndex(nextSentenceIndex);

        // Hide practice overlay and replay overlay
        setShowPracticeOverlay(false);
        setShowReplayOverlay(false);

        // Load subtitles for next sentence (mobile only)
        if (isMobile) {
          loadSubtitlesForSentence(
            parseInt(lessonNumber),
            parseInt(topicId),
            parseInt(conversationId),
            nextSentenceIndex + 1 // SRT files are 1-based
          );
        }

        // Auto-play next video (only if user has interacted)
        if (hasUserInteracted || userInteractionRef.current) {
          setTimeout(async () => {
            if (conversation.sentences[nextSentenceIndex]?.videoSrc) {
              setVideoSource(
                conversation.sentences[nextSentenceIndex].videoSrc
              );
              // Wait a bit for video source to load, then play
              setTimeout(() => {
                safeVideoPlay();
              }, 200);
            }
          }, 500);
        }
      }
    }
  };

  const handleBackToLessons = () => {
    // Save progress before navigating back
    if (lesson && topic && conversation) {
      // Progress is already saved through the ProgressContext
      console.log(
        `Lesson ${lesson.lessonNumber} completed with score: ${overallScore}%`
      );
    }
    navigate(`/topics/${lessonNumber}`);
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  const handleIOSAudioClick = async () => {
    // Mark that user has interacted
    setHasUserInteracted(true);
    userInteractionRef.current = true;

    // Enable video audio
    enableVideoAudio();

    // Hide the overlay
    setShowIOSAudioOverlay(false);

    // Unmute and try to play video
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;

      // If there was a pending video play, try now
      if (pendingVideoPlay) {
        setPendingVideoPlay(false);
        await safeVideoPlay();
      }
    }
  };

  const handleDeleteRecording = () => {
    clearRecording();
    // Keep practice overlay visible (like desktop) - just reset to initial state
    // The MobilePracticeOverlay will handle showing the initial controls
  };

  const handlePracticeComplete = (results) => {
    // Handle results from MobilePracticeOverlay
    setLastScore(results.score);
    setRecognizedText(results.recognizedText);
    setMissingWords([]); // MobilePracticeOverlay doesn't calculate missing words
    setShowResultsDialog(true);
    // Keep practice overlay visible so results dialog can show
  };

  // Removed handleVideoClick - video should not be clickable and should not pause

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (isLoading) {
    return (
      <div className="mobile-video-container">
        <div className="mobile-loading show">
          <div className="spinner"></div>
          <span>Loading practice session...</span>
        </div>
      </div>
    );
  }

  if (!lesson || !topic || !conversation) {
    return (
      <div className="mobile-video-container">
        <div className="mobile-loading show">
          <span>
            {!lesson && `Lesson ${lessonNumber} not found. `}
            {!topic && `Topic ${topicId} not found. `}
            {!conversation && `Conversation ${conversationId} not found. `}
            <br />
            URL: /mobile/{lessonNumber}/{topicId}/{conversationId}
            <br />
            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "var(--sna-primary)",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Back to Home
            </button>
          </span>
        </div>
      </div>
    );
  }

  const currentSentence = conversation.sentences[currentSentenceIndex];

  return (
    <>
      <div className="mobile-video-container">
        {/* Mobile Progress Bar */}
        <MobileProgressBar
          totalSentences={conversation.sentences.length}
          currentSentenceIndex={currentSentenceIndex}
          completedSentences={completedSentences}
        />

        {/* Back Button */}
        <MobileBackButton onBackClick={handleBackClick} />

        {/* Video Element - Enhanced for Autoplay with Audio */}
        <div className="video-container-wrapper">
          <video
            ref={videoRef}
            className="mobile-lesson-video"
            autoPlay
            playsInline
            preload="auto"
            muted={true}
            webkit-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            x5-video-orientation="portrait"
            crossOrigin="anonymous"
            controls={false}
            style={{ pointerEvents: "none" }}
            // iOS-optimized attributes for automatic playback
            buffered="true"
            x5-video-ignore-metadata="true"
            x5-playsinline="true"
            webkit-airplay="allow"
            disablePictureInPicture={false}
            // Additional iOS attributes for better autoplay
            playsinline="true"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={(e) => {
              // Only prevent pausing if video hasn't ended naturally
              if (videoRef.current && !videoRef.current.ended) {
                console.log("🔄 Video paused before completion, resuming...");
                setTimeout(() => {
                  if (
                    videoRef.current &&
                    videoRef.current.paused &&
                    !videoRef.current.ended
                  ) {
                    videoRef.current.play().catch(console.error);
                  }
                }, 10);
              }
              handlePause(e);
            }}
            onEnded={handleVideoEnd}
            onError={(e) => {
              console.error("Video error event:", e.target.error);
              if (e.target.error) {
                console.error("Error code:", e.target.error.code);
                console.error("Error message:", e.target.error.message);
              }
              handleError(e);
            }}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
            onLoadedData={(e) => {
              console.log("📹 Video data loaded - ready for smooth playback");
            }}
            onCanPlayThrough={(e) => {
              console.log(
                "📹 Video can play through - optimized for seamless experience"
              );
            }}
            onWaiting={(e) => {
              // Silently handle waiting - no user notification needed
              console.log("⏳ Video buffering (hidden from user)");
            }}
            onStalled={(e) => {
              // Silently handle stalling - no user notification needed
              console.log("⚠️ Video stalled (hidden from user)");
            }}
            onSuspend={(e) => {
              console.log("⏸️ Video suspended (hidden from user)");
            }}
            onProgress={(e) => {
              // Silent progress tracking for optimization
              if (e.target.buffered.length > 0) {
                const bufferedEnd = e.target.buffered.end(
                  e.target.buffered.length - 1
                );
                const duration = e.target.duration;
                if (duration > 0) {
                  const bufferedPercent = (bufferedEnd / duration) * 100;
                  console.log(
                    `Buffer: ${bufferedPercent.toFixed(1)}% (hidden from user)`
                  );
                }
              }
            }}
            onSeeked={() => {
              console.log("✅ Video seeking completed (seamless)");
            }}
          >
            <source src={currentSentence?.videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Video Loading Indicator - Removed for seamless experience */}

          {/* Video Error Indicator */}
          {videoError && (
            <div className="video-error-overlay">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Video failed to load. Please check your connection.</span>
              <button
                className="retry-video-btn"
                onClick={() => {
                  setRetryCount((prev) => prev + 1);
                  if (currentSentence?.videoSrc) {
                    retryVideoLoad(currentSentence.videoSrc);
                  }
                }}
              >
                <i className="fas fa-redo"></i> Retry
              </button>
            </div>
          )}

          {/* Autoplay Failed Fallback */}
          {autoplayFailed && !videoLoading && !videoError && (
            <div className="autoplay-fallback-overlay">
              <div className="autoplay-fallback-content">
                <i className="fas fa-play-circle"></i>
                <p>Tap to start video with audio</p>
                <button
                  className="fallback-play-btn"
                  onClick={() => {
                    setAutoplayFailed(false);
                    safeVideoPlay(true);
                  }}
                >
                  <i className="fas fa-play"></i> Play Video
                </button>
              </div>
            </div>
          )}
        </div>

        {/* iOS Audio Overlay Removed - Direct autoplay enabled */}

        {/* Subtitle Container */}
        <MobileSubtitleContainer
          englishText={currentSentence?.english}
          arabicText={currentSentence?.arabic}
          currentSubtitle={currentSubtitle}
          showVideoSubtitles={true}
          isMobile={isMobile}
        />

        {/* Replay Overlay */}
        <MobileReplayOverlay
          show={showReplayOverlay}
          onReplayClick={handleReplayClick}
        />

        {/* Practice Overlay */}
        <MobilePracticeOverlay
          show={showPracticeOverlay}
          sentence={currentSentence}
          isRecording={isRecording}
          recordingTime={recordingTime}
          speechDetected={speechDetected}
          isProcessing={isProcessing}
          audioStream={audioStream}
          pronunciationScore={
            lastScore
              ? {
                  score: lastScore,
                  transcriptWords: recognizedText.split(" "),
                  matchedTranscriptIndices: [],
                  missingWords: missingWords,
                }
              : null
          }
          transcription={recognizedText}
          onClose={handlePracticeClose}
          onComplete={handlePracticeComplete}
          onListenClick={handleListenClick}
          onListenSlowClick={handleListenSlowClick}
          onMicClick={handleMicClick}
          onStopRecording={handleStopRecording}
          onPlayRecording={playRecordedAudio}
          onDeleteRecording={handleDeleteRecording}
          onShowAlert={showAlertMessage}
        />

        {/* Completion Card */}
        <MobileCompletionCard
          show={showCompletionCard}
          overallScore={overallScore}
          onBackToLessons={handleBackToLessons}
          topicCompleted={topicCompletedStatus}
          lessonCompleted={lessonCompletedStatus}
        />

        {/* Alert Container */}
        <MobileAlertContainer
          show={showAlert}
          message={alertMessage}
          onClose={hideAlert}
        />
      </div>

      {/* Mobile Results Dialog - Outside mobile-video-container */}
      {showResultsDialog && (
        <MobileResultsDialog
          show={showResultsDialog}
          score={lastScore}
          recognizedText={recognizedText}
          missingWords={missingWords}
          isProcessing={isProcessing}
          targetText={conversation?.sentences?.[currentSentenceIndex]?.english}
          recordedBlob={recordedAudio}
          onRetry={handleRetry}
          onContinue={handleContinue}
          onClose={() => setShowResultsDialog(false)}
          onListenClick={handleListenClick}
          onPlayRecording={playRecordedAudio}
        />
      )}
    </>
  );
};

export default MobileLessonPage;
