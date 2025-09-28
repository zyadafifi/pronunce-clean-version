// DOM Elements
const sentenceElement = document.getElementById("sentence");
const micButton = document.getElementById("micButton");
const retryButton = document.getElementById("retryButton");
const nextButton = document.getElementById("nextButton");
const recognizedTextDiv = document.getElementById("recognizedText");
const pronunciationScoreDiv = document.getElementById("pronunciationScore");
const listenButton = document.getElementById("listenButton");
const listen2Button = document.getElementById("listen2Button");
const missingWordDiv = document.getElementById("missingWordDiv");
const dialogContainer = document.getElementById("resultsDialog");
const overallScoreDiv = document.getElementById("overallScore");
const continueButton = document.querySelector(".continue-to-next-lesson");
const bookmarkIcon = document.getElementById("bookmarkIcon");
const bookmarkIcon2 = document.getElementById("bookmark-icon2");
const translationDiv = document.getElementById("translationDiv");

// New elements for updated design
const currentSentenceElement = document.querySelector(".current-sentence");
const totalSentencesElement = document.querySelector(".total-sentences");
const progressBarFill = document.getElementById("progressBarFill");
const progressPercentageElement = document.querySelector(
  ".progress-percentage"
);

// Score circle elements
const scoreCircle = document.getElementById("scoreCircle");
const scorePercentage = document.getElementById("scorePercentage");

// Video Elements
const lessonVideo = document.getElementById("lessonVideo");
const playVideoBtn = document.getElementById("playVideoBtn");
const replayVideoBtn = document.getElementById("replayVideoBtn");

// Enhanced Recording Elements
const recordingIndicator = document.getElementById("recordingIndicator");
const recordingTimer = document.getElementById("recordingTimer");

// Global variables
let isSpeaking = false;
let isPlaying = false;
let currentUtterance = null;
let currentAudio = null;
let lessons = []; // Stores loaded lessons
let currentLessonIndex = 0; // Tracks the current lesson
let currentSentenceIndex = 0; // Tracks the current sentence in the lesson
let totalPronunciationScore = 0; // Tracks total pronunciation score

// Subtitle Manager
let subtitleManager = null;
let currentLessonData = null;
let currentTopicData = null;
let currentConversationData = null;
let mediaRecorder;
let audioChunks = [];
let recordedAudioBlob; // Stores the recorded audio blob
let isRecording = false; // Flag to track recording state
let speechDetected = false; // Flag to track if speech was detected
let noSpeechTimeout;
const NO_SPEECH_TIMEOUT_MS = 3000; // 3 seconds timeout to detect speech
let recordingUI;
let waveformBars;
let waveformAnimation;

// Progress tracking variables
let currentLessonId = null; // Track the current lesson ID from URL
let sentenceScores = []; // Array to store individual sentence scores
let completedSentences = new Set(); // Track completed sentences

// Mobile elements
const mobileVideoContainer = document.getElementById("mobileVideoContainer");
const mobileLessonVideo = document.getElementById("mobileLessonVideo");
const mobileProgressBar = document.getElementById("mobileProgressBar");
const mobileProgressFill = document.getElementById("mobileProgressFill");
const progressBullets = document.getElementById("progressBullets");
const mobileBackButton = document.getElementById("mobileBackButton");
// Video Subtitles (new simple implementation)
const videoSubtitlesEl = document.getElementById("videoSubtitles");
const subtitleTextEl = document.getElementById("subtitleText");
const mobileReplayOverlay = document.getElementById("mobileReplayOverlay");
const mobileReplayBtn = document.getElementById("mobileReplayBtn");
const mobilePracticeOverlay = document.getElementById("mobilePracticeOverlay");
const mobilePracticeSentence = document.getElementById(
  "mobilePracticeSentence"
);
const mobilePracticePhonetic = document.getElementById(
  "mobilePracticePhonetic"
);
const mobilePracticeCloseBtn = document.getElementById(
  "mobilePracticeCloseBtn"
);
const mobileListenBtn = document.getElementById("mobileListenBtn");
const mobileListenSlowBtn = document.getElementById("mobileListenSlowBtn");
const mobileMicBtn = document.getElementById("mobileMicBtn");

// Mobile completion elements
const mobileCompletionCard = document.getElementById("mobileCompletionCard");
const mobileBackToLessonsBtn = document.getElementById(
  "mobileBackToLessonsBtn"
);
const mobileFinalScore = document.getElementById("mobileFinalScore");

// Mobile dialog elements
let mobileResultsDialog;
let mobileCloseBtn;
let mobileScoreCircle;
let mobileScorePercentage;
let mobileRecognizedText;
let mobileMissingWords;
let mobileListenResultBtn;
let mobileRetryButton;
let mobileNextButton;
let mobilePlayRecordingBtn;
let mobileRecordingUI;
let mobilePracticeControls;
let mobileWaveformCanvas;
let mobileCanvasCtx;
let mobileAnalyser;
let mobileDataArray;
let mobileDeleteBtn;
let mobileStopBtn;
let mobileWaveformBars;
let mobileRecordingTimer;
let mobileRecordingStartTime;
let mobileWaveformAnimation;
let mobileAudioAnalyser;
let mobileAudioDataArray;

// Simple Subtitle System Variables
let currentSubtitles = [];
let currentSubtitleIndex = -1;
let subtitleInterval = null;
let srtFileMapping = {};
let isLoadingSubtitles = false;
// Mobile state variables
let isMobile = window.innerWidth <= 768;
let mobileVideoEnded = false;
let mobilePracticeActive = false;
let mobileRecording = false;

// Sound effect variables
let soundEffects = {
  success: null,
  failure: null,
};

// Global detection
const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// iOS video audio handling
let hasUserInteracted = false;
let iosAudioOverlay;

// Function to enable video audio on iOS after user interaction
function enableVideoAudio() {
  if (isIOS && mobileLessonVideo) {
    mobileLessonVideo.muted = false;
    mobileLessonVideo.volume = 1.0;
    hasUserInteracted = true;

    // Hide the audio overlay
    if (iosAudioOverlay) {
      iosAudioOverlay.style.display = "none";
    }

    // Try to play the video again with sound if it's currently playing
    if (!mobileLessonVideo.paused) {
      mobileLessonVideo.currentTime = mobileLessonVideo.currentTime; // Trigger reload
    }
  }
}

// Function to show iOS audio overlay
function showIOSAudioOverlay() {
  if (isIOS && iosAudioOverlay && !hasUserInteracted) {
    iosAudioOverlay.style.display = "flex";
  }
}

// Function to hide iOS audio overlay
function hideIOSAudioOverlay() {
  if (iosAudioOverlay) {
    iosAudioOverlay.style.display = "none";
  }
}

// Constants for recording
const RECORDING_DURATION = 5000; // 5 seconds recording time
let recordingTimeout;

// Enhanced AudioContext for sound effects and waveform
let audioContext;
let analyser;
let dataArray;
let canvasCtx;
let animationId;
let recordingStartTime;
let waveformCanvas;
let waveformContainer; // Container for canvas and buttons
let stopRecButton; // Stop button
let deleteRecButton; // Delete button
let isRecordingCancelled = false; // Flag for cancellation

// AssemblyAI API Key
const ASSEMBLYAI_API_KEY = "bdb00961a07c4184889a80206c52b6f2";

// ===== INITIALIZATION FUNCTIONS =====

document.addEventListener("DOMContentLoaded", function () {
  // Get the back button
  const backButton = document.getElementById("backToLessonsBtn");

  // Add click event listener
  if (backButton) {
    backButton.addEventListener("click", function () {
      // Navigate to index.html
      window.location.href = "index.html";
    });
  }

  // Initialize mobile if on mobile device
  if (isMobile) {
    initializeMobileLayout();
    initializeMobileDialog();
  }
  if (isMobile) {
    initializeMobileRecordingUI();
    setupMobileRecordingListeners();
  }
  // Listen for orientation changes
  window.addEventListener("orientationchange", function () {
    setTimeout(() => {
      isMobile = window.innerWidth <= 768;
      if (isMobile && !mobileVideoContainer.style.display) {
        initializeMobileLayout();
        initializeMobileDialog();
      }
    }, 100);
  });
});

// Add this function to initialize the recording UI elements
function initializeRecordingUI() {
  recordingUI = document.querySelector(".recording-ui-container");
  waveformBars = document.querySelectorAll(".waveform-bar");
}

// Call this function when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeRecordingUI();
});

// Function to create and load sound effects
async function initializeSoundEffects() {
  try {
    soundEffects.success = new Audio(
      "https://raw.githubusercontent.com/zyadafifi/records_project/main/right%20answer%20SFX.wav"
    );
    soundEffects.failure = new Audio(
      "https://raw.githubusercontent.com/zyadafifi/records_project/main/wrong%20answer%20SFX.wav"
    );

    await Promise.all([
      soundEffects.success.load(),
      soundEffects.failure.load(),
    ]);
  } catch (error) {
    console.error("Error loading sound effects:", error);
  }
}

// Initialize sound effects when the page loads
window.addEventListener("DOMContentLoaded", initializeSoundEffects);

// ===== MOBILE DIALOG FUNCTIONS =====

// Initialize mobile dialog elements
function initializeMobileDialogElements() {
  mobileResultsDialog = document.getElementById("mobileResultsDialog");
  mobileCloseBtn = document.getElementById("mobileCloseBtn");
  mobileScoreCircle = document.getElementById("mobileScoreCircle");
  mobileScorePercentage = document.getElementById("mobileScorePercentage");
  mobileRecognizedText = document.getElementById("mobileRecognizedText");
  mobileMissingWords = document.getElementById("mobileMissingWords");
  mobileListenResultBtn = document.getElementById("mobileListenResultBtn");
  mobileRetryButton = document.getElementById("mobileRetryButton");
  mobileNextButton = document.getElementById("mobileNextButton");
  mobilePlayRecordingBtn = document.getElementById("mobilePlayRecordingBtn");
}

// Show mobile dialog with results
function showMobileDialog(score, recognizedText, missingWords = "") {
  if (!mobileResultsDialog || !isMobile) return;

  // Update dialog content
  if (mobileScorePercentage) {
    mobileScorePercentage.textContent = `${score}%`;
  }

  if (mobileRecognizedText) {
    mobileRecognizedText.innerHTML = recognizedText;
  }

  if (mobileMissingWords) {
    mobileMissingWords.textContent = missingWords;
    mobileMissingWords.style.display = missingWords ? "block" : "none";
  }

  // Update score circle
  if (mobileScoreCircle) {
    const degrees = (score / 100) * 360;
    mobileScoreCircle.style.background = `conic-gradient(#275151
 0deg, #275151
 ${degrees}deg, #e0e0e0 ${degrees}deg)`;
  }

  // Update button states based on score
  if (mobileNextButton) {
    if (score < 50) {
      mobileNextButton.style.background =
        "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)";
      mobileNextButton.classList.add("error");
      mobileNextButton.classList.remove("success");
    } else {
      mobileNextButton.style.background =
        "linear-gradient(135deg, #275151 0%, #275151 100%)";

      mobileNextButton.classList.add("success");
      mobileNextButton.classList.remove("error");
    }
  }

  // Show dialog
  mobileResultsDialog.style.display = "block";
  setTimeout(() => {
    mobileResultsDialog.classList.add("active");
  }, 10);

  // Hide practice overlay
  hideMobilePracticeOverlay();
}

// Hide mobile dialog
function hideMobileDialog() {
  if (!mobileResultsDialog) return;

  mobileResultsDialog.classList.remove("active");
  setTimeout(() => {
    mobileResultsDialog.style.display = "none";
  }, 300);
}

// Animate mobile score circle
function animateMobileScoreCircle(percentage) {
  if (!mobileScoreCircle || !mobileScorePercentage) return;

  const circle = mobileScoreCircle;
  const scoreText = mobileScorePercentage;

  // Reset animation
  circle.classList.remove("animate");
  scoreText.textContent = "0%";

  // Set the conic gradient
  const degrees = (percentage / 100) * 360;
  circle.style.background = `conic-gradient(#275151 0deg, #275151 ${degrees}deg, #e0e0e0 ${degrees}deg)`;

  // Animate the score text
  setTimeout(() => {
    circle.classList.add("animate");
    let currentScore = 0;
    const increment = percentage / 30;

    const scoreAnimation = setInterval(() => {
      currentScore += increment;
      if (currentScore >= percentage) {
        currentScore = percentage;
        clearInterval(scoreAnimation);
      }
      scoreText.textContent = `${Math.round(currentScore)}%`;
    }, 20);
  }, 100);
}

// Setup mobile dialog event listeners
function setupMobileDialogListeners() {
  // Close button
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener("click", hideMobileDialog);
  }

  // Backdrop click
  const mobileBackdrop = mobileResultsDialog?.querySelector(
    ".mobile-dialog-backdrop"
  );
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener("click", hideMobileDialog);
  }

  // Retry button
  if (mobileRetryButton) {
    mobileRetryButton.addEventListener("click", function () {
      hideMobileDialog();
      resetEnhancedUI();
      setTimeout(() => {
        showMobilePracticeOverlay();
      }, 300);
    });
  }

  // Next button
  if (mobileNextButton) {
    mobileNextButton.addEventListener("click", function () {
      hideMobileDialog();
      mobileNextSentence();
    });
  }

  // Listen button (now uses mobile-specific function)
  if (mobileListenResultBtn) {
    mobileListenResultBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      mobileSpeakSentenceFromDialog();
    });
  }

  // Play recording button (plays recorded audio at normal speed)
  if (mobilePlayRecordingBtn) {
    mobilePlayRecordingBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      playRecordedAudio();
    });
  }

  // Setup mobile-specific listeners
  setupMobileSpecificListeners();
}

// Modify the calculatePronunciationScore function to trigger mobile dialog
function setupMobileDialogIntegration() {
  // Store original function
  const originalCalculatePronunciationScore = calculatePronunciationScore;

  // Override the function
  calculatePronunciationScore = function (transcript, expectedSentence) {
    const score = originalCalculatePronunciationScore.call(
      this,
      transcript,
      expectedSentence
    );

    // If we're on mobile, show mobile dialog instead of desktop dialog
    if (isMobile) {
      // Get the recognized text from the desktop version
      const recognizedText = recognizedTextDiv
        ? recognizedTextDiv.innerHTML
        : "";
      const missingWords = missingWordDiv ? missingWordDiv.textContent : "";

      // Play sound effects for mobile (same as desktop)
      if (score > 50) {
        playSoundEffect("success");
      } else {
        playSoundEffect("failure");
      }

      // Show mobile dialog
      showMobileDialog(score, recognizedText, missingWords);

      // Animate the score circle
      animateMobileScoreCircle(score);

      // Reset mobile mic button from loading state
      if (mobileMicBtn) {
        mobileMicBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        mobileMicBtn.classList.remove("loading");
        mobileMicBtn.style.animation =
          "pulse 2s infinite, glow 2s infinite alternate";
      }
    }

    return score;
  };
}

// Show mobile loading state during processing
function showMobileLoadingState() {
  if (!isMobile) return;

  // Show loading state on mobile mic button
  if (mobileMicBtn) {
    mobileMicBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    mobileMicBtn.classList.add("loading");
    mobileMicBtn.style.color = "#fff";
    mobileMicBtn.style.background = "var(--gradient-primary)";
  }

  // Show loading message in practice overlay
  if (mobilePracticeSentence) {
    const originalText = mobilePracticeSentence.textContent;
    mobilePracticeSentence.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--primary-color);">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Analyzing your pronunciation...</span>
      </div>
    `;

    // Store original text for restoration
    mobilePracticeSentence.setAttribute("data-original-text", originalText);
  }
}

// Hide mobile loading state
function hideMobileLoadingState() {
  if (!isMobile) return;

  // Reset mobile mic button
  if (mobileMicBtn) {
    mobileMicBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    mobileMicBtn.classList.remove("loading");
    mobileMicBtn.style.animation =
      "pulse 2s infinite, glow 2s infinite alternate";
  }

  // Restore original practice sentence text
  if (mobilePracticeSentence) {
    const originalText =
      mobilePracticeSentence.getAttribute("data-original-text");
    if (originalText) {
      mobilePracticeSentence.textContent = originalText;
      mobilePracticeSentence.removeAttribute("data-original-text");
    }
  }
}

// Initialize mobile dialog when DOM is ready
function initializeMobileDialog() {
  if (!isMobile) return;

  initializeMobileDialogElements();
  setupMobileDialogListeners();
  setupMobileDialogIntegration();
}

// ===== MOBILE LAYOUT FUNCTIONS =====

// Initialize mobile layout
function initializeMobileLayout() {
  // Show mobile container, hide desktop
  if (mobileVideoContainer) {
    mobileVideoContainer.style.display = "block";
  }

  const desktopContainer = document.querySelector(".desktop-container");
  if (desktopContainer) {
    desktopContainer.style.display = "none";
  }

  // Initialize iOS audio overlay
  iosAudioOverlay = document.getElementById("iosAudioOverlay");
  if (iosAudioOverlay) {
    iosAudioOverlay.addEventListener("click", function () {
      enableVideoAudio();
    });
  }

  // Ensure replay button is properly initialized
  if (mobileReplayBtn && !mobileReplayBtn.hasAttribute("data-initialized")) {
    mobileReplayBtn.addEventListener("click", handleMobileReplay);
    mobileReplayBtn.setAttribute("data-initialized", "true");
  }

  // Wait for lessons to load, then setup mobile
  if (lessons.length === 0) {
    const checkLessons = setInterval(() => {
      if (lessons.length > 0) {
        clearInterval(checkLessons);
        setupMobileContent();
      }
    }, 100);
  } else {
    setupMobileContent();
  }

  // Setup mobile event listeners
  setupMobileEventListeners();

  // Setup mobile-specific functionality
  setupMobileSpecificListeners();
}

// Setup mobile content
function setupMobileContent() {
  generateMobileProgressBullets();
  loadMobileContent();
  // Don't show replay button initially - only show when practice overlay is active
}

// Generate progress bullets for mobile
function generateMobileProgressBullets() {
  if (!progressBullets || lessons.length === 0 || currentLessonIndex === -1)
    return;

  const currentLesson = lessons[currentLessonIndex];
  progressBullets.innerHTML = "";

  console.log(
    `🔵 generateMobileProgressBullets: currentSentenceIndex=${currentSentenceIndex}, totalSentences=${currentLesson.sentences.length}`
  );

  currentLesson.sentences.forEach((sentence, index) => {
    const bullet = document.createElement("div");
    bullet.className = "progress-bullet";

    if (index === currentSentenceIndex) {
      bullet.classList.add("active");
      console.log(`🔵 Added active class to bullet ${index}`);
    } else if (completedSentences.has(index)) {
      bullet.classList.add("completed");
      console.log(`🔵 Added completed class to bullet ${index}`);
    } else {
      bullet.classList.add("inactive");
    }

    progressBullets.appendChild(bullet);
  });

  // Update progress line based on completed sentences
  updateMobileProgressLine();

  console.log(
    `🔵 Progress bullets generated for sentence ${currentSentenceIndex + 1}`
  );
}

// Update mobile progress line based on completed sentences
function updateMobileProgressLine() {
  if (!progressBullets || lessons.length === 0 || currentLessonIndex === -1)
    return;

  const currentLesson = lessons[currentLessonIndex];
  const totalSentences = currentLesson.sentences.length;
  const completedCount = completedSentences.size;

  // Calculate progress percentage
  const progressPercentage = Math.round(
    (completedCount / totalSentences) * 100
  );

  // Remove existing progress classes
  progressBullets.classList.remove(
    "progress-0",
    "progress-20",
    "progress-40",
    "progress-60",
    "progress-80",
    "progress-100"
  );

  // Add appropriate progress class
  if (progressPercentage >= 100) {
    progressBullets.classList.add("progress-100");
  } else if (progressPercentage >= 80) {
    progressBullets.classList.add("progress-80");
  } else if (progressPercentage >= 60) {
    progressBullets.classList.add("progress-60");
  } else if (progressPercentage >= 40) {
    progressBullets.classList.add("progress-40");
  } else if (progressPercentage >= 20) {
    progressBullets.classList.add("progress-20");
  } else {
    progressBullets.classList.add("progress-0");
  }

  console.log(
    `🔵 Progress line updated: ${progressPercentage}% (${completedCount}/${totalSentences})`
  );
}

// Load mobile content for current sentence with synchronization
function loadMobileContent() {
  if (lessons.length === 0 || currentLessonIndex === -1) return;

  const currentLesson = lessons[currentLessonIndex];
  const currentSentence = currentLesson.sentences[currentSentenceIndex];

  console.log(
    `🟣 loadMobileContent: currentSentenceIndex=${currentSentenceIndex}, sentence="${currentSentence.english}"`
  );
  console.log(
    `🟣 Subtitle sync active: ${isSubtitlesActive}, will not interfere with subtitles`
  );

  // Subtitle display is now fully controlled by the new subtitle system
  // Do not interfere with subtitle card visibility here

  // Update practice overlay content (for when practice starts)
  if (mobilePracticeSentence) {
    mobilePracticeSentence.textContent = currentSentence.english;
  }

  // Generate phonetic (simplified version for demo)
  if (mobilePracticePhonetic) {
    // This would ideally use a proper phonetic conversion library
    const phonetic = generatePhoneticText(currentSentence.english);
    mobilePracticePhonetic.textContent = phonetic;
  }

  // Load video with synchronized subtitles
  if (mobileLessonVideo && currentSentence.videoSrc) {
    mobileLessonVideo.src = currentSentence.videoSrc;
    mobileLessonVideo.load();

    // Reset iOS audio state for new video
    if (isIOS) {
      hasUserInteracted = false;
      hideIOSAudioOverlay();
    }

    // Auto-start video with subtitles after loading
    setTimeout(() => {
      playVideoWithSubtitles();
    }, 500); // Small delay to ensure video is loaded
  }

  // Reset states
  mobileVideoEnded = false;
  hideMobilePracticeOverlay();
  hideMobileCompletionCard();
}

// Simple phonetic text generator (placeholder)
function generatePhoneticText(text) {
  // This is a simplified version - you'd want a proper phonetic library
  const phoneticMap = {
    welcome: "wel-kuhm",
    to: "tuh",
    the: "thuh",
    course: "kawrs",
    hello: "heh-loh",
    how: "haw",
    are: "ahr",
    you: "yoo",
    i: "ay",
    want: "waant",
    learn: "lern",
    english: "ing-glish",
    by: "bay",
    speaking: "spee-king",
  };

  return text
    .toLowerCase()
    .split(" ")
    .map((word) => {
      const cleanWord = word.replace(/[^\w]/g, "");
      return phoneticMap[cleanWord] || cleanWord;
    })
    .join(" ");
}

// Show mobile replay button (only when practice overlay is active)
function showMobileReplayButton() {
  if (mobileReplayOverlay) {
    mobileReplayOverlay.classList.add("show");
  }
}

// Hide mobile replay button
function hideMobileReplayButton() {
  if (mobileReplayOverlay) {
    mobileReplayOverlay.classList.remove("show");
  }
}

// Show mobile practice overlay
function showMobilePracticeOverlay() {
  if (mobilePracticeOverlay) {
    mobilePracticeOverlay.classList.add("show");
    mobilePracticeActive = true;
  }
}

// Check if topic is completed
function checkTopicCompletion() {
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = parseInt(urlParams.get("conversation"));
  const lessonNumber = parseInt(urlParams.get("lesson"));

  if (!conversationId || !lessonNumber) return;

  // Find the lesson and topic
  const lesson = lessons.find((l) => l.lessonNumber === lessonNumber);
  if (!lesson || !lesson.topics || !Array.isArray(lesson.topics)) return;

  // Find the topic containing this conversation
  let topic = null;
  for (const t of lesson.topics) {
    if (
      t.conversations &&
      Array.isArray(t.conversations) &&
      t.conversations.some((c) => c.id === conversationId)
    ) {
      topic = t;
      break;
    }
  }

  if (!topic) return;

  // Check if all conversations in the topic are completed
  const allCompleted = topic.conversations.every((conversation) =>
    window.ProgressManager.isConversationCompleted(conversation.id)
  );

  if (allCompleted) {
    // Complete the topic
    window.ProgressManager.completeTopic(topic.id);

    // Show topic completion message
    showTopicCompletionMessage(topic.title);

    // Check if all topics in the lesson are now completed
    checkLessonCompletion(lessonNumber);
  }
}

// Show topic completion message
function showTopicCompletionMessage(topicTitle) {
  // You can implement a custom completion message here
}

// Check if lesson is completed after topic completion
function checkLessonCompletion(lessonNumber) {
  if (!window.ProgressManager || !lessons) return;

  // Check if all topics in the lesson are completed
  const isLessonComplete = window.ProgressManager.isLessonCompleteByTopics(
    lessonNumber,
    lessons
  );

  if (isLessonComplete) {
    // Mark the lesson as completed
    window.ProgressManager.completeLesson(lessonNumber);

    // Show lesson completion message

    // Notify index.html to update the lesson progress
    updateIndexPageProgress(lessonNumber);
  }
}

// Update index.html page progress
function updateIndexPageProgress(lessonNumber) {
  // Try to communicate with the parent window (index.html)
  try {
    // If this page was opened from index.html, notify the parent
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        {
          type: "lessonCompleted",
          lessonNumber: lessonNumber,
          progress: 100,
        },
        "*"
      );
    }

    // Also try localStorage event for same-origin communication
    localStorage.setItem(
      "lastCompletedLesson",
      JSON.stringify({
        lessonNumber: lessonNumber,
        completedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Error notifying index.html of lesson completion:", error);
  }
}

// ========== TESTING UTILITIES ==========
// These functions are for testing purposes only

// Test function: Complete all conversations in a topic
function testCompleteAllConversationsInTopic(topicId) {
  if (!window.ProgressManager) {
    console.error("ProgressManager not available");
    return;
  }

  // Find the topic in lessons data
  let topic = null;
  let lessonNumber = null;

  for (const lesson of lessons) {
    if (lesson.topics) {
      const foundTopic = lesson.topics.find((t) => t.id === topicId);
      if (foundTopic) {
        topic = foundTopic;
        lessonNumber = lesson.lessonNumber;
        break;
      }
    }
  }

  if (!topic) {
    console.error(`Topic with ID ${topicId} not found`);
    return;
  }

  console.log(
    `🧪 Testing: Completing all conversations in topic "${topic.title}"`
  );

  // Complete all conversations in the topic
  topic.conversations.forEach((conversation) => {
    window.ProgressManager.completeConversation(conversation.id);
    console.log(`  ✅ Completed conversation: ${conversation.title}`);
  });

  // Manually trigger topic completion check
  window.ProgressManager.completeTopic(topicId);
  console.log(`  🎯 Completed topic: ${topic.title}`);

  // Check if lesson is now complete
  if (lessonNumber) {
    checkLessonCompletion(lessonNumber);
  }
}

// Test function: Complete all topics in a lesson
async function testCompleteAllTopicsInLesson(lessonNumber) {
  if (!window.ProgressManager) {
    console.error("ProgressManager not available");
    return;
  }

  // First, let's load the original lesson data from data.json
  let originalLessons = [];
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    originalLessons = data.lessons;
  } catch (error) {
    console.error("Error loading original lesson data:", error);
    return;
  }

  const lesson = originalLessons.find((l) => l.lessonNumber === lessonNumber);
  if (!lesson) {
    console.error(`Lesson ${lessonNumber} not found in original data`);
    return;
  }

  console.log(
    `🧪 Testing: Completing all topics in lesson ${lessonNumber} - "${lesson.title}"`
  );

  if (!lesson.topics || lesson.topics.length === 0) {
    console.error(`Lesson ${lessonNumber} has no topics`);
    console.log("Available lesson data:", lesson);
    return;
  }

  console.log(
    `📋 Found ${lesson.topics.length} topics in lesson ${lessonNumber}`
  );

  // Complete all topics in the lesson
  lesson.topics.forEach((topic) => {
    console.log(`🎯 Processing topic: ${topic.title} (ID: ${topic.id})`);

    // Complete all conversations in each topic
    if (topic.conversations) {
      console.log(
        `  💬 Found ${topic.conversations.length} conversations in topic`
      );
      topic.conversations.forEach((conversation) => {
        window.ProgressManager.completeConversation(conversation.id);
        console.log(
          `    ✅ Completed conversation: ${conversation.title} (ID: ${conversation.id})`
        );
      });
    }

    // Complete the topic
    window.ProgressManager.completeTopic(topic.id);
    console.log(`  🎯 Completed topic: ${topic.title}`);
  });

  // Manually trigger lesson completion check using original lessons data
  const isLessonComplete = window.ProgressManager.isLessonCompleteByTopics(
    lessonNumber,
    originalLessons
  );

  if (isLessonComplete) {
    // Mark the lesson as completed
    window.ProgressManager.completeLesson(lessonNumber);
    console.log(`🎉 Lesson ${lessonNumber} completed! All topics finished.`);

    // Notify index.html to update the lesson progress
    updateIndexPageProgress(lessonNumber);
  } else {
    console.log(`⏳ Lesson ${lessonNumber} not yet complete`);
  }
}

// Test function: Clear all progress (for testing)
function testClearAllProgress() {
  if (!window.ProgressManager) {
    console.error("ProgressManager not available");
    return;
  }

  console.log("🧪 Testing: Clearing all progress");
  window.ProgressManager.clearProgress();
  console.log("  ✅ All progress cleared");
}

// Test function: Show current progress status
function testShowProgressStatus() {
  if (!window.ProgressManager) {
    console.error("ProgressManager not available");
    return;
  }

  console.log("🧪 Current Progress Status:");
  const progress = window.ProgressManager.getAllCompletionStatus();

  console.log("📊 Completed Lessons:", progress);

  if (progress.conversations) {
    console.log(
      "💬 Completed Conversations:",
      Object.keys(progress.conversations).length
    );
  }

  if (progress.topics) {
    console.log("📋 Completed Topics:", Object.keys(progress.topics).length);
  }

  // Check each lesson's completion status
  for (let i = 1; i <= 10; i++) {
    const isComplete = window.ProgressManager.isLessonCompleted(i);
    const byTopics = window.ProgressManager.isLessonCompleteByTopics
      ? window.ProgressManager.isLessonCompleteByTopics(i, lessons)
      : "N/A";
    console.log(`  Lesson ${i}: Regular=${isComplete}, ByTopics=${byTopics}`);
  }
}

// Test function: Debug current lesson data
function testDebugLessonData() {
  console.log("🔍 Debug: Current lesson data structure");
  console.log("Current lessons array:", lessons);
  console.log("Current lesson index:", currentLessonIndex);
  console.log("Current lesson ID:", currentLessonId);

  if (lessons.length > 0) {
    console.log("First lesson in array:", lessons[0]);
  }

  // Also load and show original data
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      console.log("📄 Original data.json structure:");
      console.log("Total lessons in data.json:", data.lessons.length);
      if (data.lessons.length > 0) {
        console.log("First lesson from data.json:", data.lessons[0]);
        if (data.lessons[0].topics) {
          console.log("Topics in first lesson:", data.lessons[0].topics.length);
        }
      }
    })
    .catch((error) => console.error("Error loading data.json:", error));
}

// Test function: Simple lesson completion (direct approach)
function testDirectLessonCompletion(lessonNumber) {
  console.log(`🧪 Testing: Direct lesson ${lessonNumber} completion`);

  if (window.ProgressManager) {
    // Directly mark lesson as completed
    window.ProgressManager.completeLesson(lessonNumber);
    console.log(`✅ Directly marked lesson ${lessonNumber} as completed`);

    // Notify index.html
    updateIndexPageProgress(lessonNumber);
    console.log(`📤 Notified index.html of lesson ${lessonNumber} completion`);
  }
}

// Make testing functions globally available
window.testCompleteAllConversationsInTopic =
  testCompleteAllConversationsInTopic;
window.testCompleteAllTopicsInLesson = testCompleteAllTopicsInLesson;
window.testClearAllProgress = testClearAllProgress;
window.testShowProgressStatus = testShowProgressStatus;
window.testDebugLessonData = testDebugLessonData;
window.testDirectLessonCompletion = testDirectLessonCompletion;

// Show conversation completion dialog with average score
function showConversationCompletionDialog(conversationId) {
  // Calculate average score from sentence scores
  let totalScore = 0;
  let validScores = 0;

  const currentLesson = lessons[currentLessonIndex];
  if (!currentLesson || !currentLesson.sentences) return;

  // Calculate average score from sentenceScores array
  for (let i = 0; i < currentLesson.sentences.length; i++) {
    if (sentenceScores[i] !== undefined && sentenceScores[i] !== null) {
      totalScore += sentenceScores[i];
      validScores++;
    }
  }

  // If no scores recorded, calculate based on completion percentage
  let averageScore = 0;
  if (validScores > 0) {
    averageScore = Math.round(totalScore / validScores);
  } else {
    // Fallback: use completion percentage
    const completionPercentage =
      (completedSentences.size / currentLesson.sentences.length) * 100;
    averageScore = Math.round(completionPercentage);
  }

  // Hide mobile overlay and replay button
  hideMobilePracticeOverlay();
  hideMobileReplayButton();

  // Create and show completion dialog
  createConversationCompletionDialog(averageScore, conversationId);
}

// Create conversation completion dialog
function createConversationCompletionDialog(averageScore, conversationId) {
  // Remove existing dialog if present
  const existingDialog = document.getElementById(
    "conversationCompletionDialog"
  );
  if (existingDialog) {
    existingDialog.remove();
  }

  // Get lesson number for navigation
  const urlParams = new URLSearchParams(window.location.search);
  const lessonNumber = urlParams.get("lesson") || "1";

  // Create dialog HTML
  const dialogHTML = `
    <div id="conversationCompletionDialog" class="mobile-dialog-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    ">
      <div class="completion-dialog" style="
        background: white;
        border: 4px solid transparent;
        background-image: linear-gradient(white, white), linear-gradient(135deg, #63a29b 0%, #275151 100%);
        background-origin: border-box;
        background-clip: padding-box, border-box;
        border-radius: 20px;
        padding: 40px 30px;
        text-align: center;
        color: #2c3e50;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(99, 162, 155, 0.2), 0 0 0 1px rgba(99, 162, 155, 0.1);
        animation: slideInUp 0.5s ease-out;
      ">
        <div style="margin-bottom: 30px;">
          <div style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #63a29b 0%, #275151 100%);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: white;
            box-shadow: 0 8px 20px rgba(99, 162, 155, 0.3);
          ">🎉</div>
          <h2 style="margin: 0 0 10px; font-size: 24px; font-weight: bold; color: #63a29b;">
            Conversation Completed!
          </h2>
          <p style="margin: 0; opacity: 0.8; font-size: 16px; color: #6c757d;">
            Great job finishing this conversation
          </p>
        </div>
        
        <div style="margin: 30px 0;">
          <div style="
            background: linear-gradient(135deg, rgba(99, 162, 155, 0.1) 0%, rgba(39, 81, 81, 0.05) 100%);
            border: 2px solid rgba(99, 162, 155, 0.2);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
          ">
            <p style="margin: 0 0 10px; font-size: 16px; opacity: 0.8; color: #6c757d;">
              Your overall score is:
            </p>
            <div style="font-size: 48px; font-weight: bold; color: #63a29b;">
              ${averageScore}%
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center;">
          <button id="backToTopicsBtn" style="
            background: linear-gradient(135deg, #63a29b 0%, #275151 100%);
            border: 2px solid #63a29b;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(99, 162, 155, 0.3);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(99, 162, 155, 0.4)'" 
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(99, 162, 155, 0.3)'">
            Back to Topics
          </button>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes slideInUp {
        from {
          transform: translateY(50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    </style>
  `;

  // Add dialog to page
  document.body.insertAdjacentHTML("beforeend", dialogHTML);

  // Add event listener for back to topics button
  const backToTopicsBtn = document.getElementById("backToTopicsBtn");
  if (backToTopicsBtn) {
    backToTopicsBtn.addEventListener("click", function () {
      // Navigate back to topics page
      window.location.href = `topics.html?lesson=${lessonNumber}`;
    });
  }

  // Store conversation completion in localStorage
  if (window.ProgressManager) {
    window.ProgressManager.completeConversation(conversationId);
  }
}

// Hide mobile practice overlay
function hideMobilePracticeOverlay() {
  if (mobilePracticeOverlay) {
    mobilePracticeOverlay.classList.remove("show");
    mobilePracticeActive = false;
  }
}

// Show mobile completion card
function showMobileCompletionCard() {
  if (mobileCompletionCard) {
    mobileCompletionCard.classList.add("show");
  }
}

// Hide mobile completion card
function hideMobileCompletionCard() {
  if (mobileCompletionCard) {
    mobileCompletionCard.classList.remove("show");
  }
}

// Play mobile video (legacy function - now redirects to synchronized version)
async function playMobileVideo() {
  console.log("Playing mobile video with new subtitle system");
  await playVideoWithSubtitles();
}
// Add event listeners for mobile recording controls
function setupMobileRecordingListeners() {
  // Delete button
  if (mobileDeleteBtn) {
    mobileDeleteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      stopMobileRecording();
      resetMobilePracticeControls();
    });
  }

  // Stop button
  if (mobileStopBtn) {
    mobileStopBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      stopMobileRecording();
      // The existing recording logic will handle processing
    });
  }
}
// Handle mobile video end
function handleMobileVideoEnd() {
  console.log("Mobile video ended");
  mobileVideoEnded = true;

  // Show practice overlay after short delay
  setTimeout(() => {
    showMobilePracticeOverlay();
    // Show replay button after practice overlay is shown
    setTimeout(() => {
      showMobileReplayButton();
    }, 100);
  }, 800);
}

// Handle mobile replay
function handleMobileReplay() {
  if (mobileRecording) return;

  console.log("Replaying mobile video with synchronization");

  // Hide practice overlay and replay button
  hideMobilePracticeOverlay();
  hideMobileReplayButton();

  // Reset and replay video with subtitles
  if (mobileLessonVideo) {
    mobileLessonVideo.currentTime = 0;
    playVideoWithSubtitles();
  }
}

// Handle mobile practice close
function handleMobilePracticeClose() {
  hideMobilePracticeOverlay();
  hideMobileReplayButton();
}

// Mobile continue to next sentence
function mobileNextSentence() {
  const currentLesson = lessons[currentLessonIndex];

  if (currentSentenceIndex < currentLesson.sentences.length - 1) {
    // Move to next sentence
    currentSentenceIndex++;

    // Hide practice overlay and replay button
    hideMobilePracticeOverlay();
    hideMobileReplayButton();

    // Update content (video will auto-start from loadMobileContent)
    loadMobileContent();
    generateMobileProgressBullets();

    console.log(`Moved to sentence ${currentSentenceIndex + 1}`);
  } else {
    // Lesson completed
    handleMobileLessonComplete();
  }
}

// Handle mobile lesson completion
function handleMobileLessonComplete() {
  // Save progress
  if (window.ProgressManager && currentLessonId) {
    // Check if this is a conversation
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get("conversation");

    if (conversationId) {
      // Complete the conversation
      window.ProgressManager.completeConversation(parseInt(conversationId));

      // Calculate and show conversation completion dialog
      showConversationCompletionDialog(parseInt(conversationId));

      // Check if all conversations in the topic are completed
      checkTopicCompletion();
    } else {
      // Complete the lesson (legacy)
      window.ProgressManager.completeLesson(currentLessonId);

      // Hide mobile overlay and replay button
      hideMobilePracticeOverlay();
      hideMobileReplayButton();

      // Calculate completion percentage
      const currentLesson = lessons[currentLessonIndex];
      const completionPercentage =
        (completedSentences.size / currentLesson.sentences.length) * 100;

      // Update mobile final score
      if (mobileFinalScore) {
        mobileFinalScore.textContent = `${Math.round(completionPercentage)}%`;
      }

      // Show mobile completion card
      showMobileCompletionCard();
    }
  }
}

// Mobile speech functions
function mobileSpeakSentence(slow = false) {
  if (mobileRecording || !lessons[currentLessonIndex]) return;

  const sentence =
    lessons[currentLessonIndex].sentences[currentSentenceIndex].english;

  const utterance = new SpeechSynthesisUtterance(sentence);
  utterance.lang = "en-US";
  utterance.rate = slow ? 0.6 : 1.0;

  speechSynthesis.cancel(); // Cancel any ongoing speech
  speechSynthesis.speak(utterance);
}

// Mobile recording functions
async function startMobileRecording() {
  if (mobileRecording) return;

  try {
    mobileRecording = true;

    // Show recording UI
    showMobileRecordingUI();

    // Update mic button state
    if (mobileMicBtn) {
      mobileMicBtn.classList.add("recording");
    }

    // Start the actual recording (reuse existing recording logic)
    await startAudioRecording();

    // Setup mobile-specific audio visualization
    setTimeout(() => {
      setupMobileAudioVisualization();
    }, 100);

    console.log("Mobile recording started with waveform visualization");
  } catch (error) {
    console.error("Mobile recording failed:", error);
    stopMobileRecording();
  }
}

// Stop mobile recording
function stopMobileRecording() {
  mobileRecording = false;

  // Hide recording UI
  hideMobileRecordingUI();

  // Stop waveform animation
  stopMobileWaveformAnimation();

  if (mobileMicBtn) {
    mobileMicBtn.classList.remove("recording");
  }

  // Stop the actual recording
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}

// Setup mobile event listeners
function setupMobileEventListeners() {
  // Video events
  if (mobileLessonVideo) {
    mobileLessonVideo.addEventListener("ended", handleMobileVideoEnd);

    mobileLessonVideo.addEventListener("error", function (e) {
      console.error("Mobile video error:", e);
      // Don't show replay button on video error - only show when practice overlay is active
    });
  }

  // Replay button
  if (mobileReplayBtn) {
    mobileReplayBtn.addEventListener("click", handleMobileReplay);
  }

  // Back button
  if (mobileBackButton) {
    mobileBackButton.addEventListener("click", function () {
      // Check if we came from topics page
      const urlParams = new URLSearchParams(window.location.search);
      const conversationId = urlParams.get("conversation");
      const lessonNumber = urlParams.get("lesson");

      if (conversationId && lessonNumber) {
        // Go back to topics page
        window.location.href = `pronunce-react/src/pages/TopicsPage.html?lesson=${lessonNumber}`;
      } else {
        // Go back to lessons page
        window.location.href = "index.html";
      }
    });
  }

  // Back to lessons button (completion card)
  if (mobileBackToLessonsBtn) {
    mobileBackToLessonsBtn.addEventListener("click", function () {
      // Check if we came from topics page
      const urlParams = new URLSearchParams(window.location.search);
      const conversationId = urlParams.get("conversation");
      const lessonNumber = urlParams.get("lesson");

      if (conversationId && lessonNumber) {
        // Go back to topics page
        window.location.href = `pronunce-react/src/pages/TopicsPage.html?lesson=${lessonNumber}`;
      } else {
        // Go back to lessons page
        window.location.href = "index.html";
      }
    });
  }

  // Practice close button
  if (mobilePracticeCloseBtn) {
    mobilePracticeCloseBtn.addEventListener("click", handleMobilePracticeClose);
  }

  // Practice control buttons
  if (mobileListenBtn) {
    mobileListenBtn.addEventListener("click", () => mobileSpeakSentence(false));
  }
  // Ensure mobile recording UI is initialized
  if (isMobile) {
    initializeMobileRecordingUI();
  }
  // Listen slow button - now handled by setupMobileSpecificListeners()

  if (mobileMicBtn) {
    mobileMicBtn.addEventListener("click", function () {
      if (mobileRecording) {
        // Don't stop here - let the waveform container buttons handle it
        return;
      } else {
        startMobileRecording();
      }
    });
  }
  window.addEventListener("resize", function () {
    if (isMobile && mobileWaveformCanvas && mobileCanvasCtx) {
      mobileWaveformCanvas.width = mobileWaveformCanvas.offsetWidth;
      mobileWaveformCanvas.height = mobileWaveformCanvas.offsetHeight;
    }
  });
  // Video will auto-start from loadMobileContent, no need for touch interaction
}

// Handle window resize
window.addEventListener("resize", function () {
  const wasMobile = isMobile;
  isMobile = window.innerWidth <= 768;

  if (isMobile && !wasMobile) {
    // Switched to mobile
    initializeMobileLayout();
    initializeMobileDialog();
  } else if (!isMobile && wasMobile) {
    // Switched to desktop
    if (mobileVideoContainer) {
      mobileVideoContainer.style.display = "none";
    }

    const desktopContainer = document.querySelector(".desktop-container");
    if (desktopContainer) {
      desktopContainer.style.display = "block";
    }
  }
});

// ===== CORE FUNCTIONALITY (EXISTING CODE) =====

// Function to initialize AudioContext
function initializeAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Function to resume AudioContext
async function resumeAudioContext() {
  if (audioContext && audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch (error) {
      console.error("Failed to resume AudioContext:", error);
    }
  }
}

// Video Control Functions
function loadVideo(videoSrc) {
  if (videoSrc) {
    lessonVideo.src = videoSrc;
    lessonVideo.load();
  }
}

async function playVideo() {
  if (lessonVideo.src) {
    // Load subtitles before playing
    loadSubtitlesForCurrentSentence();

    lessonVideo.play().catch((error) => {
      console.error("Error playing video:", error);
    });
  }
}

async function replayVideo() {
  if (lessonVideo.src) {
    lessonVideo.currentTime = 0;

    // Load subtitles before replaying
    loadSubtitlesForCurrentSentence();

    lessonVideo.play().catch((error) => {
      console.error("Error replaying video:", error);
    });
  }
}

// Video Event Listeners
playVideoBtn?.addEventListener("click", playVideo);
replayVideoBtn?.addEventListener("click", replayVideo);

// Toggle bookmark buttons state
function toggleBookmarkButtons(disabled) {
  if (bookmarkIcon) {
    bookmarkIcon.disabled = disabled;
    bookmarkIcon.style.opacity = disabled ? "0.5" : "1";
    bookmarkIcon.title = disabled
      ? "Cannot play audio while recording"
      : "Play recorded audio";
  }

  if (bookmarkIcon2) {
    bookmarkIcon2.disabled = disabled;
    bookmarkIcon2.style.opacity = disabled ? "0.5" : "1";
    bookmarkIcon2.title = disabled
      ? "Cannot play audio while recording"
      : "Play recorded audio";
  }
}

// Toggle listen buttons state
function toggleListenButtons(disabled) {
  if (listenButton) {
    listenButton.disabled = disabled;
    listenButton.style.opacity = disabled ? "0.5" : "1";
    listenButton.title = disabled
      ? "Cannot listen while recording"
      : "Listen to example";
  }

  if (listen2Button) {
    listen2Button.disabled = disabled;
    listen2Button.style.opacity = disabled ? "0.5" : "1";
    listen2Button.title = disabled
      ? "Cannot listen while recording"
      : "Listen to example";
  }
}

// Function to animate score circle
function animateScoreCircle(percentage) {
  if (!scoreCircle || !scorePercentage) return;

  const circle = scoreCircle;
  const scoreText = scorePercentage;

  // Reset animation
  circle.classList.remove("animate");
  scoreText.textContent = "0%";

  // Set the conic gradient based on percentage
  const degrees = (percentage / 100) * 360;
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary-color")
    .trim();
  const primaryDark = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary-dark")
    .trim();
  const borderLight = getComputedStyle(document.documentElement)
    .getPropertyValue("--border-light")
    .trim();

  circle.style.background = `conic-gradient(${primaryColor} 0deg, ${primaryDark} ${degrees}deg, ${borderLight} ${degrees}deg)`;

  // Animate the score text
  setTimeout(() => {
    circle.classList.add("animate");
    let currentScore = 0;
    const increment = percentage / 30; // 30 steps for smooth animation

    const scoreAnimation = setInterval(() => {
      currentScore += increment;
      if (currentScore >= percentage) {
        currentScore = percentage;
        clearInterval(scoreAnimation);
      }
      scoreText.textContent = `${Math.round(currentScore)}%`;
    }, 20);
  }, 100);
}

// Function to open the dialog
function openDialog() {
  if (dialogContainer) {
    dialogContainer.style.display = "block";
    requestAnimationFrame(() => {
      dialogContainer.classList.add("active");
    });
  }
}

// Function to close the dialog
function closeDialog() {
  if (dialogContainer) {
    dialogContainer.classList.remove("active");
    setTimeout(() => {
      dialogContainer.style.display = "none";
    }, 300);
  }
}

// Event listeners for closing the dialog
document.querySelector(".close-btn")?.addEventListener("click", closeDialog);
document
  .querySelector(".dialog-backdrop")
  ?.addEventListener("click", closeDialog);

// Enhanced Canvas Context Extensions (Must be defined before waveform functions)
if (
  typeof CanvasRenderingContext2D !== "undefined" &&
  CanvasRenderingContext2D.prototype.roundRect === undefined
) {
  CanvasRenderingContext2D.prototype.roundRect = function (
    x,
    y,
    width,
    height,
    radius
  ) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;

    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();

    return this;
  };
}

// Function to create and setup waveform visualization
function setupWaveformVisualization(stream) {
  if (!audioContext) {
    console.error("Cannot setup waveform: AudioContext not initialized.");
    return;
  }

  // Create container if it doesn't exist
  if (!waveformContainer) {
    waveformContainer = document.createElement("div");
    waveformContainer.id = "waveformContainer";
    waveformContainer.style.display = "flex";
    waveformContainer.style.flexDirection = "column";
    waveformContainer.style.justifyContent = "space-between";
    waveformContainer.style.alignItems = "center";
    waveformContainer.style.width = "100%";
    waveformContainer.style.marginTop = "10px";
    waveformContainer.style.padding = "5px 15px";
    waveformContainer.style.background =
      "linear-gradient(135deg, #4b9b94 0%, #2c7873 100%)";
    waveformContainer.style.borderRadius = "30px";
    waveformContainer.style.display = "none";
    waveformContainer.style.height = "40px";
    waveformContainer.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    waveformContainer.style.transition = "all 0.3s ease";
    waveformContainer.style.position = "relative";
    waveformContainer.style.overflow = "hidden";

    // Create inner container for buttons and waveform
    const controlsContainer = document.createElement("div");
    controlsContainer.style.display = "flex";
    controlsContainer.style.alignItems = "center";
    controlsContainer.style.width = "100%";
    controlsContainer.style.height = "30px";
    controlsContainer.style.justifyContent = "space-between";
    controlsContainer.style.marginTop = "0";
    controlsContainer.style.marginBottom = "0";
    controlsContainer.style.padding = "0 20px";
    controlsContainer.style.gap = "10px";

    // Create timer element
    const timerElement = document.createElement("div");
    timerElement.id = "recordingTimer";
    timerElement.style.color = "#908c8c";
    timerElement.style.fontSize = "12px";
    timerElement.style.fontWeight = "bold";
    timerElement.style.position = "relative";
    timerElement.style.marginTop = "11px";
    timerElement.style.textAlign = "center";
    timerElement.style.width = "100%";
    timerElement.textContent = "0:00";

    // Create and style buttons
    deleteRecButton = document.createElement("button");
    deleteRecButton.id = "deleteRecButton";
    deleteRecButton.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    deleteRecButton.title = "Cancel Recording";
    deleteRecButton.style.background = "none";
    deleteRecButton.style.border = "none";
    deleteRecButton.style.color = "#f0f0f0";
    deleteRecButton.style.fontSize = "1em";
    deleteRecButton.style.cursor = "pointer";
    deleteRecButton.style.padding = "0 12px";
    deleteRecButton.style.transition = "all 0.3s ease";
    deleteRecButton.style.webkitTapHighlightColor = "transparent";

    stopRecButton = document.createElement("button");
    stopRecButton.id = "stopRecButton";
    stopRecButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
    stopRecButton.title = "Send Recording";
    stopRecButton.style.background = "white";
    stopRecButton.style.border = "none";
    stopRecButton.style.borderRadius = "50%";
    stopRecButton.style.width = "30px";
    stopRecButton.style.height = "30px";
    stopRecButton.style.display = "flex";
    stopRecButton.style.alignItems = "center";
    stopRecButton.style.justifyContent = "center";
    stopRecButton.style.cursor = "pointer";
    stopRecButton.style.color = "#4b9b94";
    stopRecButton.style.padding = "0 12px";
    stopRecButton.style.webkitTapHighlightColor = "transparent";

    // Create waveform canvas
    waveformCanvas = document.createElement("canvas");
    waveformCanvas.id = "waveformCanvas";
    waveformCanvas.style.width = "100%";
    waveformCanvas.style.height = "25px";
    waveformCanvas.style.flexGrow = "1";
    waveformCanvas.style.margin = "0";
    waveformCanvas.style.background = "transparent";
    waveformCanvas.style.transition = "all 0.3s ease";
    waveformCanvas.style.position = "relative";
    waveformCanvas.style.zIndex = "1";

    // Build the structure
    controlsContainer.appendChild(deleteRecButton);
    controlsContainer.appendChild(waveformCanvas);
    controlsContainer.appendChild(stopRecButton);
    waveformContainer.appendChild(controlsContainer);

    // Add event listeners for the buttons
    deleteRecButton.addEventListener("click", handleDeleteRecording);
    deleteRecButton.addEventListener("touchend", function (e) {
      e.preventDefault(); // Prevent default touch behavior
      handleDeleteRecording();
    });

    stopRecButton.addEventListener("click", handleStopRecording);
    stopRecButton.addEventListener("touchend", function (e) {
      e.preventDefault(); // Prevent default touch behavior
      handleStopRecording();
    });

    // Create a separate container for the timer
    const timerContainer = document.createElement("div");
    timerContainer.style.width = "100%";
    timerContainer.style.display = "flex";
    timerContainer.style.justifyContent = "center";
    timerContainer.style.marginTop = "5px";
    timerContainer.appendChild(timerElement);

    // Get the parent container once
    const micButtonContainer = micButton.parentElement;
    if (micButtonContainer && micButtonContainer.parentNode) {
      // Insert both containers
      micButtonContainer.parentNode.insertBefore(
        waveformContainer,
        micButtonContainer.nextSibling
      );
      micButtonContainer.parentNode.insertBefore(
        timerContainer,
        waveformContainer.nextSibling
      );
    } else {
      document.body.appendChild(waveformContainer);
      document.body.appendChild(timerContainer);
    }

    // Add hover effects
    waveformContainer.addEventListener("mouseenter", () => {
      waveformContainer.style.background =
        "linear-gradient(135deg, #2c7873 0%, #4b9b94 100%)";
      waveformContainer.style.boxShadow = "0 4px 12px rgba(75, 155, 148, 0.3)";
    });

    waveformContainer.addEventListener("mouseleave", () => {
      waveformContainer.style.background =
        "linear-gradient(135deg, #4b9b94 0%, #2c7873 100%)";
      waveformContainer.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    });
  }

  // Get canvas context
  canvasCtx = waveformCanvas.getContext("2d");

  // Create analyzer
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.8;

  // Connect stream to analyzer
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  // Create data array
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  // Reset cancellation flag
  isRecordingCancelled = false;

  // Make container visible and start drawing
  waveformContainer.style.display = "flex"; // Show container
  stopRecButton.disabled = false; // Ensure buttons are enabled
  deleteRecButton.disabled = false;
  drawWhatsAppWaveform();
  console.log("Waveform drawing started.");
}

// Function to draw WhatsApp-style waveform
function drawWhatsAppWaveform() {
  if (!isRecording || !analyser || !canvasCtx || !dataArray) return;

  animationId = requestAnimationFrame(drawWhatsAppWaveform);

  // Get frequency data
  analyser.getByteFrequencyData(dataArray);

  // Clear canvas
  canvasCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

  // Draw bars
  const barCount = 20;
  const barWidth = 3;
  const barSpacing = 3;
  const totalBarAreaWidth = barCount * (barWidth + barSpacing) - barSpacing;
  const startX = (waveformCanvas.width - totalBarAreaWidth) / 2;
  const maxBarHeight = waveformCanvas.height * 1.2; // Increased from 0.8 to 1.2 to make bars taller

  canvasCtx.fillStyle = "#ffffff";

  for (let i = 0; i < barCount; i++) {
    const dataIndex = Math.floor((i * dataArray.length) / barCount);
    const value = dataArray[dataIndex];
    const barHeight = Math.max(3, (value / 255) * maxBarHeight);
    const x = startX + i * (barWidth + barSpacing);
    const y = (waveformCanvas.height - barHeight) / 2;

    // Draw rounded bars
    canvasCtx.beginPath();
    canvasCtx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
    canvasCtx.fill();
  }

  // Update the timer
  if (recordingStartTime) {
    const recordingTime = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;
    const timeText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    const timerElement = document.getElementById("recordingTimer");
    if (timerElement) {
      timerElement.textContent = timeText;
    }
  }
}

// --- Button Click Handlers ---

function handleStopRecording() {
  console.log("Stop button clicked/touched.");
  if (mediaRecorder && mediaRecorder.state === "recording") {
    console.log("Calling mediaRecorder.stop() via button.");
    stopRecButton.disabled = true; // Prevent double clicks
    deleteRecButton.disabled = true;

    // Add visual feedback
    stopRecButton.style.transform = "scale(0.95)";
    setTimeout(() => {
      stopRecButton.style.transform = "scale(1)";
    }, 100);

    try {
      mediaRecorder.stop();
    } catch (error) {
      console.error("Error stopping MediaRecorder:", error);
      // Fallback handling
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      resetUI();
    }
  }
}

function handleDeleteRecording() {
  console.log("Delete button clicked.");
  isRecordingCancelled = true; // Set the flag

  if (mediaRecorder && mediaRecorder.state === "recording") {
    console.log("Stopping MediaRecorder immediately for cancellation.");
    // Stop recorder without triggering normal onstop processing logic
    mediaRecorder.onstop = null; // Detach the normal handler temporarily
    mediaRecorder.stop();
  }

  // Stop visualization and audio stream directly
  stopWaveformVisualization();
  if (mediaRecorder && mediaRecorder.stream) {
    console.log("Stopping media stream tracks for cancellation.");
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  }

  // Reset the UI immediately
  console.log("Calling resetUI for cancellation.");
  resetUI();

  // Optionally provide feedback
  recognizedTextDiv.textContent = "(Recording cancelled)";
  micButton.innerHTML = '<i class="fas fa-microphone mic-icon"></i>';
  micButton.style.color = "#fff";
  micButton.style.backgroundColor = "";
  micButton.style.display = "inline-block";
  micButton.style.opacity = "1";
  micButton.classList.remove("recording");
  micButton.style.animation = "pulse 2s infinite, glow 2s infinite alternate";
}

// Function to stop waveform visualization and clean up
function stopWaveformVisualization() {
  console.log("Stopping waveform visualization.");
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (analyser) {
    analyser.disconnect();
    analyser = null;
  }

  // Reset the timer display
  const timerElement = document.getElementById("recordingTimer");
  if (timerElement) {
    timerElement.textContent = "0:00";
  }

  if (waveformContainer) {
    waveformContainer.style.display = "none";
  }

  if (waveformCanvas && canvasCtx) {
    canvasCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
  }
  dataArray = null;
}

// Function to reset UI without changing the sentence
function resetUI() {
  // Reset UI elements
  recognizedTextDiv.textContent = "";
  pronunciationScoreDiv.textContent = "0%";
  micButton.style.display = "inline-block";
  micButton.style.color = "#fff";
  micButton.style.backgroundColor = "";
  micButton.disabled = false;
  retryButton.style.display = "none";
  retryButton.disabled = true;
  missingWordDiv.textContent = "";
  closeDialog();
  updateProgressCircle(0);
  document.getElementById("recordingIndicator").style.display = "none";

  // Stop and hide waveform visualization
  stopWaveformVisualization(); // This now hides the container

  // Reset recording state and re-enable buttons
  isRecording = false;
  isRecordingCancelled = false; // Reset cancellation flag here
  mediaRecorder = null; // Ensure recorder instance is cleared
  recordingStartTime = null;
  speechDetected = false;
  toggleListenButtons(false);
  toggleBookmarkButtons(false);

  // Clear the timeouts
  clearTimeout(noSpeechTimeout);
  clearTimeout(recordingTimeout);

  // Reset the score for the current sentence
  if (sentenceScores[currentSentenceIndex] !== undefined) {
    totalPronunciationScore -= sentenceScores[currentSentenceIndex];
    sentenceScores[currentSentenceIndex] = 0;
    updateSimpleProgress();
  }

  // Remove current sentence from completed sentences when retrying
  completedSentences.delete(currentSentenceIndex);

  // Update progress to previous state
  updateSimpleProgress();

  console.log("UI Reset completed.");
}

// Update the progress circle based on the pronunciation score
function updateProgressCircle(score) {
  // Use the existing animateScoreCircle function instead
  animateScoreCircle(score);
}

// Add simple progress bar update function
function updateSimpleProgress() {
  if (lessons.length === 0 || currentLessonIndex === -1) return;

  const currentLesson = lessons[currentLessonIndex];
  const totalSentences = currentLesson.sentences.length;

  // Calculate progress based on number of completed sentences
  const progress = (completedSentences.size / totalSentences) * 100;

  const simpleProgressFill = document.querySelector(".simple-progress-fill");
  const simpleProgressBar = document.querySelector(".simple-progress-bar");
  const simpleProgressPercentage = document.querySelector(
    ".simple-progress-percentage"
  );

  if (simpleProgressFill && simpleProgressBar) {
    // Get current width
    const startWidth = parseFloat(simpleProgressFill.style.width) || 0;
    const targetWidth = progress;

    // Update tooltip position
    simpleProgressBar.style.setProperty(
      "--progress-position",
      `${targetWidth}%`
    );
    simpleProgressBar.setAttribute("data-progress", `${Math.round(progress)}%`);

    // Animate the width change
    const startTime = performance.now();
    const duration = 800; // Slightly longer duration for smoother animation

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Use cubic-bezier easing for smoother animation
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentWidth =
        startWidth + (targetWidth - startWidth) * easedProgress;
      simpleProgressFill.style.width = `${currentWidth}%`;

      // Update tooltip position during animation
      simpleProgressBar.style.setProperty(
        "--progress-position",
        `${currentWidth}%`
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  if (simpleProgressPercentage) {
    // Animate the percentage text
    const startPercentage = parseInt(simpleProgressPercentage.textContent) || 0;
    const targetPercentage = Math.round(progress);

    const startTime = performance.now();
    const duration = 800; // Match the fill animation duration

    function animatePercentage(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Use cubic-bezier easing
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentValue = Math.round(
        startPercentage + (targetPercentage - startPercentage) * easedProgress
      );
      simpleProgressPercentage.textContent = `${currentValue}%`;

      // Add a subtle scale effect during animation
      const scale = 1 + easedProgress * 0.1;
      simpleProgressPercentage.style.transform = `scale(${scale})`;

      if (progress < 1) {
        requestAnimationFrame(animatePercentage);
      } else {
        // Reset transform after animation
        simpleProgressPercentage.style.transform = "scale(1)";
      }
    }

    requestAnimationFrame(animatePercentage);
  }
}

function startWaveformAnimation() {
  let lastTime = 0;
  const animationSpeed = 100; // ms between updates

  function animateWaveform(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;

    if (elapsed > animationSpeed) {
      lastTime = timestamp;

      // Animate each bar with random heights
      waveformBars.forEach((bar) => {
        const randomHeight = Math.floor(Math.random() * 22) + 4;
        bar.style.height = `${randomHeight}px`;
      });
    }

    if (isRecording) {
      waveformAnimation = requestAnimationFrame(animateWaveform);
    }
  }

  waveformAnimation = requestAnimationFrame(animateWaveform);
}

function startRecordingTimer() {
  recordingStartTime = Date.now();

  function updateTimer() {
    if (!isRecording) return;

    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    if (recordingTimer) {
      recordingTimer.textContent = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    setTimeout(updateTimer, 1000);
  }

  updateTimer();
}

// Enhanced Function to draw waveform - Exact WhatsApp Match
function drawEnhancedWaveform() {
  if (!isRecording || !analyser || !canvasCtx || !dataArray || !waveformCanvas)
    return;

  animationId = requestAnimationFrame(drawEnhancedWaveform);

  // Get frequency data
  analyser.getByteFrequencyData(dataArray);

  const canvas = waveformCanvas;
  const rect = canvas.getBoundingClientRect();

  // Clear canvas
  canvasCtx.clearRect(0, 0, rect.width, rect.height);

  // Exact WhatsApp waveform settings
  const barCount = 25; // Optimal number for WhatsApp look
  const barWidth = 3;
  const barSpacing = 2;
  const minBarHeight = 2;
  const totalBarAreaWidth = barCount * (barWidth + barSpacing) - barSpacing;
  const startX = (rect.width - totalBarAreaWidth) / 2;
  const maxBarHeight = rect.height * 0.8; // Slightly reduced for exact match

  // Create solid white fill for bars
  canvasCtx.fillStyle = "rgba(255, 255, 255, 0.95)";

  // Draw WhatsApp-style waveform bars
  for (let i = 0; i < barCount; i++) {
    const dataIndex = Math.floor((i * dataArray.length) / barCount);
    const value = dataArray[dataIndex];

    // Calculate bar height with WhatsApp-style variation
    let normalizedValue = value / 255;
    let barHeight = Math.max(minBarHeight, normalizedValue * maxBarHeight);

    // Add subtle variation for visual appeal when quiet
    if (value < 20) {
      barHeight = minBarHeight + Math.random() * 6;
    }

    // Add pulsing effect based on overall volume
    const avgVolume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const pulseMultiplier = 1 + (avgVolume / 255) * 0.2;
    barHeight *= pulseMultiplier;

    const x = startX + i * (barWidth + barSpacing);
    const y = (rect.height - barHeight) / 2;

    // Draw bars with rounded corners (WhatsApp style)
    canvasCtx.beginPath();
    canvasCtx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
    canvasCtx.fill();
  }

  // Update timer
  updateRecordingTimer();
}

// Enhanced Function to update recording timer
function updateRecordingTimer() {
  if (recordingStartTime && recordingTimer) {
    const recordingTime = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;
    const timeText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    // Add pulsing effect near time limit
    if (recordingTime > RECORDING_DURATION / 1000 - 10) {
      recordingTimer.style.animation = "recordingPulse 1s infinite";
      recordingTimer.style.color = "rgba(255, 200, 200, 0.9)";
    } else {
      recordingTimer.style.animation = "none";
      recordingTimer.style.color = "rgba(255, 255, 255, 0.9)";
    }

    recordingTimer.textContent = timeText;
  }
}

// Enhanced Stop Recording Handler
function handleStopRecording() {
  // Add visual feedback
  if (stopRecButton) {
    stopRecButton.classList.add("pressed");
    stopRecButton.classList.add("loading");
    setTimeout(() => stopRecButton.classList.remove("pressed"), 150);
  }

  if (mediaRecorder && mediaRecorder.state === "recording") {
    // Disable buttons to prevent double-clicks
    if (stopRecButton) stopRecButton.disabled = true;
    if (deleteRecButton) deleteRecButton.disabled = true;

    // Add success state
    setTimeout(() => {
      if (stopRecButton) {
        stopRecButton.classList.remove("loading");
        stopRecButton.classList.add("success");
      }
    }, 300);

    try {
      mediaRecorder.stop();
    } catch (error) {
      console.error("Error stopping MediaRecorder:", error);

      // Add error state
      if (stopRecButton) {
        stopRecButton.classList.remove("loading", "success");
        stopRecButton.classList.add("error");
      }

      // Fallback handling
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      resetEnhancedUI();
    }
  }
}

// Enhanced Delete Recording Handler
function handleDeleteRecording() {
  // Add visual feedback
  if (deleteRecButton) {
    deleteRecButton.classList.add("pressed");
    setTimeout(() => deleteRecButton.classList.remove("pressed"), 150);
  }

  isRecordingCancelled = true;

  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.onstop = null;
    mediaRecorder.stop();
  }

  stopEnhancedWaveformVisualization();

  if (mediaRecorder && mediaRecorder.stream) {
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  }

  resetEnhancedUI();
}

// Enhanced Function to stop waveform visualization
function stopEnhancedWaveformVisualization() {
  if (waveformAnimation) {
    cancelAnimationFrame(waveformAnimation);
    waveformAnimation = null;
  }

  if (recordingUI) {
    recordingUI.style.display = "none";
  }

  // Reset waveform bars to initial state
  if (waveformBars) {
    waveformBars.forEach((bar) => {
      bar.style.height = "8px";
    });
  }
}

// Enhanced UI Reset Function
function resetEnhancedUI() {
  // Reset recognized text with fade animation
  if (recognizedTextDiv) {
    recognizedTextDiv.style.opacity = "0";
    setTimeout(() => {
      recognizedTextDiv.textContent = "";
      recognizedTextDiv.style.opacity = "1";
    }, 150);
  }
  if (recordingUI) {
    recordingUI.style.display = "none";
  }
  if (pronunciationScoreDiv) pronunciationScoreDiv.textContent = "0%";

  // Enhanced microphone button reset
  if (micButton) {
    micButton.style.display = "inline-flex";
    micButton.disabled = false;
    micButton.classList.remove("recording");

    // Add bounce-in animation
    micButton.style.transform = "scale(0.8)";
    setTimeout(() => {
      micButton.style.transform = "scale(1)";
    }, 100);
  }

  // Enhanced retry button
  if (retryButton) {
    retryButton.style.display = "none";
    retryButton.disabled = true;
    retryButton.classList.remove("loading", "success", "error");
  }

  if (missingWordDiv) missingWordDiv.textContent = "";

  closeDialog();

  // Enhanced recording indicator hide
  if (recordingIndicator) {
    recordingIndicator.style.opacity = "0";
    recordingIndicator.style.transform = "translateY(-10px)";
    setTimeout(() => {
      recordingIndicator.style.display = "none";
      recordingIndicator.style.opacity = "1";
      recordingIndicator.style.transform = "translateY(0)";
    }, 300);
  }

  stopEnhancedWaveformVisualization();

  // Reset all states
  isRecording = false;
  isRecordingCancelled = false;
  mediaRecorder = null;
  recordingStartTime = null;
  speechDetected = false;

  // Reset button states
  toggleListenButtons(false);
  toggleBookmarkButtons(false);

  // Clear timeouts
  clearTimeout(noSpeechTimeout);
  clearTimeout(recordingTimeout);

  // Reset sentence scores
  if (sentenceScores[currentSentenceIndex] !== undefined) {
    totalPronunciationScore -= sentenceScores[currentSentenceIndex];
    sentenceScores[currentSentenceIndex] = 0;
    updateProgress();
  }

  completedSentences.delete(currentSentenceIndex);
  updateProgress();

  // Hide mobile loading state
  if (isMobile) {
    hideMobileLoadingState();
  }
}

// Function to update sentence counter
function updateSentenceCounter() {
  if (lessons.length === 0 || currentLessonIndex === -1) return;

  const currentLesson = lessons[currentLessonIndex];
  if (currentSentenceElement) {
    currentSentenceElement.textContent = currentSentenceIndex + 1;
  }
  if (totalSentencesElement) {
    totalSentencesElement.textContent = currentLesson.sentences.length;
  }

  // Update progress bullets when sentence index changes
  if (progressBullets) {
    updateProgressBullets();
  }
}

// Function to update progress
function updateProgress() {
  if (lessons.length === 0 || currentLessonIndex === -1) return;

  const currentLesson = lessons[currentLessonIndex];
  const totalSentences = currentLesson.sentences.length;
  const progress = (completedSentences.size / totalSentences) * 100;

  if (progressBarFill) {
    progressBarFill.style.width = `${progress}%`;
  }

  if (progressPercentageElement) {
    progressPercentageElement.textContent = `${Math.round(progress)}%`;
  }

  // Update progress bullets to reflect current state
  if (progressBullets) {
    updateProgressBullets();
  }
}

// Function to update progress bullets to match current progress
function updateProgressBullets() {
  if (!progressBullets || lessons.length === 0 || currentLessonIndex === -1)
    return;

  const currentLesson = lessons[currentLessonIndex];
  const bullets = progressBullets.querySelectorAll(".progress-bullet");

  bullets.forEach((bullet, index) => {
    // Remove all state classes
    bullet.classList.remove("active", "completed", "inactive");

    // Apply appropriate state class based on progress
    if (index < currentSentenceIndex) {
      // Past sentences - mark as completed if they're in completedSentences
      if (completedSentences.has(index)) {
        bullet.classList.add("completed");
      } else {
        bullet.classList.add("inactive");
      }
    } else if (index === currentSentenceIndex) {
      // Current sentence - mark as active
      bullet.classList.add("active");
    } else {
      // Future sentences - mark as inactive
      bullet.classList.add("inactive");
    }
  });
}

// Function to update sentence
function updateSentence() {
  if (lessons.length === 0) return;
  const currentLesson = lessons[currentLessonIndex];
  const currentSentence = currentLesson.sentences[currentSentenceIndex];

  if (sentenceElement) {
    const sentenceTextElement = sentenceElement.querySelector(".sentence-text");
    if (sentenceTextElement) {
      sentenceTextElement.textContent = currentSentence.english;
    }
  }

  updateSentenceCounter();

  if (translationDiv) {
    const translationTextElement =
      translationDiv.querySelector(".translation-text");
    if (translationTextElement) {
      translationTextElement.textContent = currentSentence.arabic;
    }
  }

  // Load video if available
  if (currentSentence.videoSrc) {
    loadVideo(currentSentence.videoSrc);
  }

  if (recognizedTextDiv) recognizedTextDiv.textContent = "";
  if (pronunciationScoreDiv) pronunciationScoreDiv.textContent = "0%";

  if (micButton) {
    micButton.style.display = "inline-flex";
    micButton.classList.remove("recording");
  }

  if (retryButton) {
    retryButton.style.display = "none";
    retryButton.disabled = true;
  }

  if (missingWordDiv) missingWordDiv.textContent = "";

  closeDialog();

  toggleListenButtons(false);
  toggleBookmarkButtons(false);

  updateProgress();
}

// Normalize text (remove punctuation and convert to lowercase)
function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, "");
}

// Check if two words are exactly the same
function isExactMatch(word1, word2) {
  return word1 === word2;
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;

  const dp = Array(m + 1)
    .fill()
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// Function to calculate similarity between two words
function calculateSimilarity(word1, word2) {
  word1 = word1.toLowerCase();
  word2 = word2.toLowerCase();

  if (word1 === word2) return 1;

  const lengthDiff = Math.abs(word1.length - word2.length);
  if (lengthDiff > Math.min(word1.length, word2.length)) {
    return 0.1;
  }

  const distance = levenshteinDistance(word1, word2);
  const maxDistance = Math.max(word1.length, word2.length);
  let similarity = 1 - distance / maxDistance;

  if (lengthDiff > 0) {
    similarity *= 1 - (lengthDiff / maxDistance) * 0.5;
  }

  if (Math.min(word1.length, word2.length) <= 3 && distance > 0) {
    similarity *= 0.7;
  }

  if ((word1.startsWith(word2) || word2.startsWith(word1)) && lengthDiff > 2) {
    similarity *= 0.8;
  }

  return similarity;
}

// Enhanced pronunciation score calculation
function calculatePronunciationScore(transcript, expectedSentence) {
  const transcriptWords = normalizeText(transcript)
    .split(/\s+/)
    .filter((word) => word.trim() !== "");
  const sentenceWords = normalizeText(expectedSentence.english)
    .split(/\s+/)
    .filter((word) => word.trim() !== "");

  let correctWords = 0;
  let missingWords = [];

  let matchedTranscriptIndices = new Array(transcriptWords.length).fill(false);
  let matchedSentenceIndices = new Array(sentenceWords.length).fill(false);

  // Exact matches first
  for (let i = 0; i < sentenceWords.length; i++) {
    for (let j = 0; j < transcriptWords.length; j++) {
      if (
        !matchedTranscriptIndices[j] &&
        !matchedSentenceIndices[i] &&
        isExactMatch(transcriptWords[j], sentenceWords[i])
      ) {
        matchedTranscriptIndices[j] = true;
        matchedSentenceIndices[i] = true;
        correctWords++;
        break;
      }
    }
  }

  // Similarity matches
  let potentialMatches = [];

  for (let i = 0; i < sentenceWords.length; i++) {
    if (matchedSentenceIndices[i]) continue;

    for (let j = 0; j < transcriptWords.length; j++) {
      if (matchedTranscriptIndices[j]) continue;

      const similarity = calculateSimilarity(
        transcriptWords[j],
        sentenceWords[i]
      );
      if (similarity > 0) {
        potentialMatches.push({
          sentenceIndex: i,
          transcriptIndex: j,
          similarity: similarity,
          transcriptWord: transcriptWords[j],
          expectedWord: sentenceWords[i],
        });
      }
    }
  }

  potentialMatches.sort((a, b) => b.similarity - a.similarity);

  for (const match of potentialMatches) {
    if (
      !matchedSentenceIndices[match.sentenceIndex] &&
      !matchedTranscriptIndices[match.transcriptIndex]
    ) {
      if (match.similarity >= 0.85) {
        matchedSentenceIndices[match.sentenceIndex] = true;
        matchedTranscriptIndices[match.transcriptIndex] = true;
        correctWords += match.similarity;
      }
    }
  }

  // Build result display
  let spokenSentenceText = "";
  for (let j = 0; j < transcriptWords.length; j++) {
    if (!matchedTranscriptIndices[j]) {
      spokenSentenceText += `<span style="color: red;">${transcriptWords[j]}</span> `;
    } else {
      let found = false;
      for (let i = 0; i < sentenceWords.length; i++) {
        if (
          matchedSentenceIndices[i] &&
          calculateSimilarity(transcriptWords[j], sentenceWords[i]) >= 0.85
        ) {
          spokenSentenceText += `<span style="color: green;">${transcriptWords[j]}</span> `;
          found = true;
          break;
        }
      }
      if (!found) {
        spokenSentenceText += `<span style="color: red;">${transcriptWords[j]}</span> `;
      }
    }
  }

  if (recognizedTextDiv) {
    recognizedTextDiv.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>Original:</strong><br>
        ${expectedSentence.english}
      </div>
      <div>
        <strong>You said:</strong><br>
        ${spokenSentenceText.trim()}
      </div>
    `;
  }

  if (missingWordDiv && missingWords.length > 0) {
    missingWordDiv.textContent = `Missing: ${missingWords.join(", ")}`;
  } else if (missingWordDiv) {
    missingWordDiv.textContent = "";
  }

  const pronunciationScore = (correctWords / sentenceWords.length) * 100;

  if (pronunciationScore > 50) {
    playSoundEffect("success");
  } else {
    playSoundEffect("failure");
  }

  if (pronunciationScore >= 50) {
    completedSentences.add(currentSentenceIndex);
  }

  sentenceScores[currentSentenceIndex] = pronunciationScore;
  totalPronunciationScore = sentenceScores.reduce(
    (sum, score) => sum + score,
    0
  );

  updateProgress();

  return Math.round(pronunciationScore);
}

// Function to speak sentence
// Speak the sentence using the Web Speech API
function speakSentence() {
  // Check if currently recording - if so, don't allow listening
  if (isRecording) {
    console.log("Cannot listen while recording");
    alert(
      "Cannot listen to example while recording. Please finish recording first."
    );
    return;
  }

  if (isSpeaking) {
    // If already speaking, stop the speech
    speechSynthesis.cancel();
    isSpeaking = false;
    updateListenButtonIcon();
    return;
  }

  // Check if lessons are loaded and valid
  if (!lessons || lessons.length === 0 || currentLessonIndex === -1) {
    console.log("No lessons loaded yet");
    alert("Please wait for lessons to load.");
    return;
  }

  const currentLesson = lessons[currentLessonIndex];
  if (
    !currentLesson ||
    !currentLesson.sentences ||
    !currentLesson.sentences[currentSentenceIndex]
  ) {
    console.log("Current lesson or sentence not found");
    alert("Current sentence not available.");
    return;
  }

  const sentence = currentLesson.sentences[currentSentenceIndex].english;

  // Update button immediately
  isSpeaking = true;
  updateListenButtonIcon();

  currentUtterance = new SpeechSynthesisUtterance(sentence);
  currentUtterance.lang = "en-US";

  currentUtterance.onend = function () {
    isSpeaking = false;
    updateListenButtonIcon();
  };

  currentUtterance.onerror = function () {
    isSpeaking = false;
    updateListenButtonIcon();
  };

  speechSynthesis.speak(currentUtterance);
}

function updateListenButtonIcon() {
  // Always keep the button circular, gradient, and with white icon
  [listenButton, listen2Button].forEach((btn) => {
    btn.style.background = "linear-gradient(135deg, #4b9b94 0%, #2c7873 100%)";
    btn.style.borderRadius = "50%";
    btn.style.padding = "8px";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.boxShadow = "0 4px 12px rgba(75, 155, 148, 0.3)";
    btn.style.border = "none";
  });
  if (isSpeaking) {
    // Use the pause SVG (same as ear icon's pause)
    const pauseSVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512' width='24' height='24'><path fill='white' d='M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z'/></svg>`;
    listenButton.innerHTML = pauseSVG;
    listen2Button.innerHTML = pauseSVG;
    listenButton.title = "Stop playback";
    listen2Button.title = "Stop playback";
  } else {
    // Use the speaker SVG for idle
    const soundSVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512' width='24' height='24'><path fill='white' d='M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z'/></svg>`;
    listenButton.innerHTML = soundSVG;
    listen2Button.innerHTML = soundSVG;
    listenButton.title = "Listen to example";
    listen2Button.title = "Listen to example";
  }
}

// Function to update bookmark icons
function updateBookmarkIcons() {
  [bookmarkIcon, bookmarkIcon2].forEach((btn) => {
    btn.style.background = "linear-gradient(135deg, #4b9b94 0%, #2c7873 100%)";
    btn.style.borderRadius = "50%";
    btn.style.padding = "8px";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.boxShadow = "0 4px 12px rgba(75, 155, 148, 0.3)";
    btn.style.border = "none";
  });
  if (isPlaying) {
    // Use the same pause SVG as the listen button
    const pauseSVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512' width='24' height='24'><path fill='white' d='M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z'/></svg>`;
    bookmarkIcon.innerHTML = pauseSVG;
    bookmarkIcon2.innerHTML = pauseSVG;
    bookmarkIcon.title = "Stop playback";
    bookmarkIcon2.title = "Stop playback";
  } else {
    // Use the ear SVG for idle, ensure fill='white' is set directly
    const earSVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='24' height='24'><path fill='white' d='M398.3 3.4c-15.8-7.9-35-1.5-42.9 14.3c-7.9 15.8-1.5 34.9 14.2 42.9l.4 .2c.4 .2 1.1 .6 2.1 1.2c2 1.2 5 3 8.7 5.6c7.5 5.2 17.6 13.2 27.7 24.2C428.5 113.4 448 146 448 192c0 17.7 14.3 32 32 32s32-14.3 32-32c0-66-28.5-113.4-56.5-143.7C441.6 33.2 427.7 22.2 417.3 15c-5.3-3.7-9.7-6.4-13-8.3c-1.6-1-3-1.7-4-2.2c-.5-.3-.9-.5-1.2-.7l-.4-.2-.2-.1c0 0 0 0-.1 0c0 0 0 0 0 0L384 32 398.3 3.4zM128.7 227.5c6.2-56 53.7-99.5 111.3-99.5c61.9 0 112 50.1 112 112c0 29.3-11.2 55.9-29.6 75.9c-17 18.4-34.4 45.1-34.4 78l0 6.1c0 26.5-21.5 48-48 48c-17.7 0-32 14.3-32 32s14.3 32 32 32c61.9 0 112-50.1 112-112l0-6.1c0-9.8 5.4-21.7 17.4-34.7C398.3 327.9 416 286 416 240c0-97.2-78.8-176-176-176C149.4 64 74.8 132.5 65.1 220.5c-1.9 17.6 10.7 33.4 28.3 35.3s33.4-10.7 35.3-28.3zM32 512a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM192 352a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0zM208 240c0-17.7 14.3-32 32-32s32 14.3 32 32c0 13.3 10.7 24 24 24s24-10.7 24-24c0-44.2-35.8-80-80-80s-80 35.8-80 80c0 13.3 10.7 24 24 24s24-10.7 24-24z'/></svg>`;
    bookmarkIcon.innerHTML = earSVG;
    bookmarkIcon2.innerHTML = earSVG;
    bookmarkIcon.title = "Play recorded audio";
    bookmarkIcon2.title = "Play recorded audio";
  }
}

// Modified playRecordedAudio function with iOS compatibility
function playRecordedAudio() {
  if (!recordedAudioBlob) {
    alert("No recorded audio available.");
    return;
  }

  // Prevent playing recorded audio during recording
  if (isRecording) {
    console.log("Cannot play audio while recording");
    alert("Cannot play audio while recording. Please finish recording first.");
    return;
  }

  if (isPlaying) {
    // If already playing, stop the audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    isPlaying = false;
    updateBookmarkIcons();
    return;
  }

  // Initialize AudioContext if not already initialized
  initializeAudioContext();

  const audioURL = URL.createObjectURL(recordedAudioBlob);
  currentAudio = new Audio(audioURL);

  // Add iOS-specific error handling
  currentAudio.addEventListener("error", function (e) {
    console.error("Audio playback error:", e);
    alert("Error playing audio. Please try again.");
    isPlaying = false;
    updateBookmarkIcons();
  });

  // Update button immediately
  isPlaying = true;
  updateBookmarkIcons();

  // Use Promise-based play for better error handling
  const playPromise = currentAudio.play();

  if (playPromise !== undefined) {
    playPromise
      .then((_) => {
        // Playback started successfully
        console.log("Playback started successfully");
      })
      .catch((error) => {
        console.error("Playback failed:", error);
        isPlaying = false;
        updateBookmarkIcons();
        alert("Could not play audio. Please try again.");
      });
  }

  currentAudio.onended = function () {
    isPlaying = false;
    updateBookmarkIcons();
  };
}

// Function to stop all audio playback
function stopAllAudioPlayback() {
  // Stop current audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // Stop speech synthesis
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  // Stop any existing audio elements
  const audioElements = document.querySelectorAll("audio");
  audioElements.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });

  // Stop any existing audio context
  if (window.audioContext && window.audioContext.state !== "closed") {
    window.audioContext.suspend();
  }

  isPlaying = false;
}

// Function to handle user interaction for audio playback
function enableAudioPlayback() {
  // Resume audio context if suspended
  if (window.audioContext && window.audioContext.state === "suspended") {
    window.audioContext
      .resume()
      .then(() => {
        console.log("Audio context resumed");
      })
      .catch((error) => {
        console.error("Failed to resume audio context:", error);
      });
  }
}

// Add user interaction listeners to enable audio playback
document.addEventListener("click", enableAudioPlayback, { once: true });
document.addEventListener("touchstart", enableAudioPlayback, { once: true });
document.addEventListener("keydown", enableAudioPlayback, { once: true });

// Enhanced Button Event Listeners with Better Feedback
function setupEnhancedEventListeners() {
  // Enhanced microphone button
  micButton?.addEventListener("click", async () => {
    if (!isRecording) {
      // Add click animation
      micButton.style.transform = "scale(0.95)";
      setTimeout(() => {
        micButton.style.transform = "scale(1)";
      }, 100);

      await startAudioRecording();
    }
  });

  // Enhanced delete button with haptic feedback simulation
  deleteRecButton?.addEventListener("click", (e) => {
    e.preventDefault();

    // Add enhanced visual feedback
    deleteRecButton.classList.add("pressed");

    // Simulate haptic feedback with animation
    deleteRecButton.style.animation = "shake 0.3s ease-in-out";

    setTimeout(() => {
      deleteRecButton.classList.remove("pressed");
      deleteRecButton.style.animation = "";
      handleDeleteRecording();
    }, 150);
  });

  // Enhanced stop button with success feedback
  stopRecButton?.addEventListener("click", (e) => {
    e.preventDefault();

    // Add enhanced visual feedback
    stopRecButton.classList.add("pressed");

    setTimeout(() => {
      stopRecButton.classList.remove("pressed");
      handleStopRecording();
    }, 150);
  });

  // Enhanced touch support
  if ("ontouchstart" in window) {
    deleteRecButton?.addEventListener("touchend", (e) => {
      e.preventDefault();
      handleDeleteRecording();
    });

    stopRecButton?.addEventListener("touchend", (e) => {
      e.preventDefault();
      handleStopRecording();
    });
  }
}

// Enhanced Shake Animation for Delete Button
const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }
`;

// Add shake animation to document
if (!document.querySelector("#shake-animation")) {
  const style = document.createElement("style");
  style.id = "shake-animation";
  style.textContent = shakeKeyframes;
  document.head.appendChild(style);
}

// Enhanced Performance Monitoring
const WaveformPerformance = {
  frameCount: 0,
  lastTime: performance.now(),
  lastFPS: 0,

  monitor() {
    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime - this.lastTime >= 1000) {
      const fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastTime)
      );
      this.lastFPS = fps;
      console.log(`Waveform FPS: ${fps}`);

      // Adjust quality based on performance
      if (fps < 30 && analyser) {
        analyser.fftSize = 256; // Reduce quality for better performance
      } else if (fps > 50 && analyser) {
        analyser.fftSize = 512; // Increase quality when performance allows
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  },
};

// Make WaveformPerformance globally available for development monitoring
window.WaveformPerformance = WaveformPerformance;

// Override the original draw function with performance monitoring
const originalDrawFunction = drawEnhancedWaveform;
drawEnhancedWaveform = function () {
  WaveformPerformance.monitor();
  return originalDrawFunction.apply(this, arguments);
};

// Basic Event listeners (keeping existing functionality)
listenButton?.addEventListener("click", () => {
  if (isSpeaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
  } else {
    speakSentence();
  }
});

listen2Button?.addEventListener("click", () => {
  if (isSpeaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
  } else {
    speakSentence();
  }
});

bookmarkIcon?.addEventListener("click", playRecordedAudio);
bookmarkIcon2?.addEventListener("click", playRecordedAudio);

// Load SRT file mapping
async function loadSRTFileMapping() {
  try {
    const response = await fetch("srt-file-mapping.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    srtFileMapping = await response.json();
    console.log("SRT file mapping loaded successfully", {
      keysCount: Object.keys(srtFileMapping).length,
    });
  } catch (error) {
    console.warn("Failed to load SRT file mapping:", error.message);
    srtFileMapping = {};
  }
}

// Simple Subtitle System Functions
function loadSubtitlesForCurrentSentence() {
  // Only load subtitles on mobile devices
  if (!isMobile) {
    console.log("Subtitles disabled on desktop - skipping subtitle load");
    return;
  }

  if (!currentLessonData || !currentTopicData || !currentConversationData) {
    console.warn("Cannot load subtitles - missing required data");
    return;
  }

  // Check if SRT mapping is loaded
  if (!srtFileMapping || Object.keys(srtFileMapping).length === 0) {
    console.warn("SRT file mapping not loaded yet, retrying in 100ms");
    setTimeout(() => loadSubtitlesForCurrentSentence(), 100);
    return;
  }

  // Prevent multiple simultaneous loads
  if (isLoadingSubtitles) {
    console.log("Subtitle loading already in progress, skipping");
    return;
  }

  const lessonNumber = currentLessonData.lessonNumber;
  const topicId = currentTopicData.id;
  const conversationId = currentConversationData.id;
  const sentenceIndex = currentSentenceIndex + 1; // SRT files are 1-indexed

  const key = `${lessonNumber}_${topicId}_${conversationId}_${sentenceIndex}`;
  const srtPath = srtFileMapping[key];

  console.log("Looking for SRT file:", {
    key: key,
    found: !!srtPath,
    path: srtPath,
    mappingKeys: Object.keys(srtFileMapping).slice(0, 5),
  });

  if (!srtPath) {
    console.warn(`No SRT file found for key: ${key}`);
    clearSubtitles();
    return;
  }

  console.log(`Loading subtitles from: ${srtPath}`);
  isLoadingSubtitles = true;

  fetch(srtPath)
    .then((response) => response.text())
    .then((srtContent) => {
      currentSubtitles = parseSRT(srtContent);
      console.log(`Loaded ${currentSubtitles.length} subtitles`);
      startSubtitleSync();
      isLoadingSubtitles = false;
    })
    .catch((error) => {
      console.error(`Failed to load SRT file: ${error}`);
      clearSubtitles();
      isLoadingSubtitles = false;
    });
}

function parseSRT(srtContent) {
  const subtitles = [];
  const blocks = srtContent.trim().split(/\n\s*\n/);

  // Process blocks in groups of 6 (3 English + 3 Arabic)
  for (let i = 0; i < blocks.length; i += 6) {
    const englishBlocks = [blocks[i], blocks[i + 1], blocks[i + 2]];
    const arabicBlocks = [blocks[i + 3], blocks[i + 4], blocks[i + 5]];

    // Process each of the 3 timestamps
    for (let j = 0; j < 3; j++) {
      const englishBlock = englishBlocks[j];
      const arabicBlock = arabicBlocks[j];

      if (!englishBlock || !arabicBlock) continue;

      const englishLines = englishBlock.trim().split("\n");
      const arabicLines = arabicBlock.trim().split("\n");

      if (englishLines.length >= 3 && arabicLines.length >= 3) {
        const timeMatch = englishLines[1].match(
          /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/
        );

        if (timeMatch) {
          const startTime =
            parseInt(timeMatch[1]) * 3600 +
            parseInt(timeMatch[2]) * 60 +
            parseInt(timeMatch[3]) +
            parseInt(timeMatch[4]) / 1000;
          const endTime =
            parseInt(timeMatch[5]) * 3600 +
            parseInt(timeMatch[6]) * 60 +
            parseInt(timeMatch[7]) +
            parseInt(timeMatch[8]) / 1000;

          const englishText = englishLines[2] || "";
          const arabicText = arabicLines[2] || "";

          console.log(`Parsed subtitle ${j + 1}:`, {
            englishText,
            arabicText,
            startTime,
            endTime,
          });

          subtitles.push({
            startTime,
            endTime,
            english: englishText,
            arabic: arabicText,
          });
        }
      }
    }
  }

  return subtitles;
}

function startSubtitleSync() {
  if (subtitleInterval) {
    clearInterval(subtitleInterval);
  }

  subtitleInterval = setInterval(updateSubtitles, 100);
}

function updateSubtitles() {
  const video = isMobile ? mobileLessonVideo : lessonVideo;
  if (!video || !currentSubtitles.length) return;

  const currentTime = video.currentTime;
  let activeSubtitle = null;

  for (let i = 0; i < currentSubtitles.length; i++) {
    const sub = currentSubtitles[i];
    if (currentTime >= sub.startTime && currentTime <= sub.endTime) {
      activeSubtitle = sub;
      break;
    }
  }

  if (activeSubtitle) {
    showSubtitles(activeSubtitle.english, activeSubtitle.arabic);
  } else {
    hideSubtitles();
  }
}

function showSubtitles(english, arabic) {
  // Only show subtitles on mobile devices
  if (!isMobile) {
    return;
  }

  const englishEl = document.getElementById("mobileSubtitleEnglish");
  const arabicEl = document.getElementById("mobileSubtitleArabic");

  console.log("Showing subtitles:", {
    english,
    arabic,
    englishEl: !!englishEl,
    arabicEl: !!arabicEl,
  });

  if (englishEl && arabicEl) {
    englishEl.textContent = english;
    arabicEl.textContent = arabic;
    console.log("Subtitle text set successfully");
  } else {
    console.error("Subtitle elements not found");
  }
}

function hideSubtitles() {
  // Only hide subtitles on mobile devices
  if (!isMobile) {
    return;
  }

  const englishEl = document.getElementById("mobileSubtitleEnglish");
  const arabicEl = document.getElementById("mobileSubtitleArabic");

  if (englishEl && arabicEl) {
    englishEl.textContent = "";
    arabicEl.textContent = "";
  }
}

function clearSubtitles() {
  // Only clear subtitles on mobile devices
  if (!isMobile) {
    return;
  }

  if (subtitleInterval) {
    clearInterval(subtitleInterval);
    subtitleInterval = null;
  }
  currentSubtitles = [];
  hideSubtitles();
}

// Enhanced Load Lessons Function
async function loadLessons() {
  try {
    const response = await fetch("data.json");
    if (!response.ok)
      throw new Error(`Failed to fetch lessons: ${response.statusText}`);
    const data = await response.json();
    if (!data || !data.lessons)
      throw new Error("Invalid JSON structure: 'lessons' array not found");

    lessons = data.lessons;

    // Check if we're loading a conversation
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get("conversation");
    const lessonNumber = urlParams.get("lesson");
    const topicId = urlParams.get("topic");

    if (conversationId && lessonNumber) {
      // Load conversation data
      await loadConversationData(
        parseInt(lessonNumber),
        parseInt(conversationId),
        topicId ? parseInt(topicId) : null
      );
    } else {
      // Load lesson data (legacy support)
      const quizId = urlParams.get("quizId") || "131";
      currentLessonIndex = lessons.findIndex(
        (lesson) => lesson.quizId === quizId
      );
      if (currentLessonIndex === -1) currentLessonIndex = 0;

      // Convert lesson to conversation format
      convertLessonToConversation();
    }

    // Get current lesson ID for progress tracking
    currentLessonId = lessons[currentLessonIndex]?.lessonNumber || 1;

    // Load SRT file mapping
    await loadSRTFileMapping();

    updateSentence();
    updateSentenceCounter();
    updateProgress();
  } catch (error) {
    console.error("Error loading lessons:", error);
  }
}

// Load conversation data
async function loadConversationData(
  lessonNumber,
  conversationId,
  topicId = null
) {
  const lesson = lessons.find((l) => l.lessonNumber === lessonNumber);
  if (!lesson) {
    console.error("Lesson not found:", lessonNumber);
    return;
  }

  // Find the conversation and topic
  let conversation = null;
  let topic = null;

  if (topicId) {
    // Use specific topic if provided
    topic = lesson.topics.find((t) => t.id === parseInt(topicId));
    if (topic) {
      conversation = topic.conversations.find((c) => c.id === conversationId);
    }
  } else {
    // Search all topics for the conversation
    for (const t of lesson.topics) {
      conversation = t.conversations.find((c) => c.id === conversationId);
      if (conversation) {
        topic = t;
        break;
      }
    }
  }

  if (!conversation) {
    console.error("Conversation not found:", conversationId);
    return;
  }

  // Store current data for subtitle loading
  currentLessonData = lesson;
  currentTopicData = topic;
  currentConversationData = conversation;

  // Convert conversation to lesson format (preserve all conversation data)
  const conversationLesson = {
    lessonNumber: lessonNumber,
    quizId: `conversation_${conversationId}`,
    sentences: conversation.sentences,
    conversationData: conversation, // Keep reference to original conversation data
  };

  // Replace current lesson with conversation
  currentLessonIndex = 0;
  lessons = [conversationLesson];

  // Load subtitles for the first sentence
  loadSubtitlesForCurrentSentence();
}

// Convert lesson to conversation format (legacy support)
function convertLessonToConversation() {
  if (lessons[currentLessonIndex]) {
    const lesson = lessons[currentLessonIndex];
    if (lesson.sentences) {
      // Already in conversation format
      return;
    }

    // Convert old format to new format
    if (lesson.topics && lesson.topics.length > 0) {
      // Get first conversation from first topic
      const firstTopic = lesson.topics[0];
      if (firstTopic.conversations && firstTopic.conversations.length > 0) {
        const firstConversation = firstTopic.conversations[0];
        lesson.sentences = firstConversation.sentences;
      }
    }
  }
}

// Initialize lessons on page load
loadLessons();

// Enhanced Retry Button Event Listener
retryButton?.addEventListener("click", () => {
  clearTimeout(recordingTimeout);
  closeDialog();
  resetEnhancedUI();
  if (mediaRecorder && mediaRecorder.state === "recording")
    mediaRecorder.stop();
});

// Enhanced Next Button Event Listener
nextButton?.addEventListener("click", async () => {
  const currentLesson = lessons[currentLessonIndex];
  if (currentSentenceIndex < currentLesson.sentences.length - 1) {
    currentSentenceIndex++;
    updateSentence();
    updateSentenceCounter();
    updateProgress();
    isRecording = false;
    toggleListenButtons(false);
    toggleBookmarkButtons(false);
    if (mediaRecorder && mediaRecorder.state === "recording")
      mediaRecorder.stop();

    // Load subtitles for the new sentence
    loadSubtitlesForCurrentSentence();
  } else {
    // LESSON/CONVERSATION COMPLETION - SAVE TO LOCALSTORAGE
    if (window.ProgressManager && currentLessonId) {
      // Check if this is a conversation
      const urlParams = new URLSearchParams(window.location.search);
      const conversationId = urlParams.get("conversation");

      if (conversationId) {
        // Complete the conversation and show completion dialog
        window.ProgressManager.completeConversation(parseInt(conversationId));
        showConversationCompletionDialog(parseInt(conversationId));

        // Check if all conversations in the topic are completed
        checkTopicCompletion();
        return; // Don't show the regular modal for conversations
      } else {
        // Complete the lesson (legacy)
        window.ProgressManager.completeLesson(currentLessonId);
      }
    }

    const congratulationModal = new bootstrap.Modal(
      document.getElementById("congratulationModal")
    );
    const completionPercentage =
      (completedSentences.size / currentLesson.sentences.length) * 100;
    if (overallScoreDiv)
      overallScoreDiv.textContent = `${Math.round(completionPercentage)}%`;
    congratulationModal.show();
  }
});

// Enhanced Continue Button Event Listener
continueButton?.addEventListener("click", () => {
  // Ensure progress is saved before closing
  if (window.ProgressManager && currentLessonId) {
    window.ProgressManager.completeLesson(currentLessonId);
  }

  const congratulationModal = bootstrap.Modal.getInstance(
    document.getElementById("congratulationModal")
  );
  congratulationModal.hide();

  // Rest of existing code...
});

// Enhanced Start Audio Recording Function
// Start audio recording with automatic stop
async function startAudioRecording() {
  console.log("startAudioRecording called");
  // Ensure AudioContext is ready (important for iOS/Safari)
  initializeAudioContext();
  await resumeAudioContext();

  if (!audioContext) {
    alert("AudioContext could not be initialized. Cannot record.");
    return;
  }

  try {
    console.log("Requesting microphone access...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Microphone access granted.");
    audioChunks = [];

    // iOS-compatible MediaRecorder setup
    const getSupportedMimeType = () => {
      const types = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/wav",
      ];

      for (let type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          return type;
        }
      }
      return "audio/webm"; // fallback
    };

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: getSupportedMimeType(),
      audioBitsPerSecond: 128000,
    });
    console.log("MediaRecorder created.");

    // Set recording flag, start time, toggle buttons
    isRecording = true;
    recordingStartTime = Date.now();
    toggleListenButtons(true);
    toggleBookmarkButtons(true);
    isRecordingCancelled = false; // Ensure flag is reset

    // Setup and start waveform visualization (this now shows the container)
    setupWaveformVisualization(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && !isRecordingCancelled) {
        // Don't collect if cancelled
        audioChunks.push(event.data);
      }
    };

    // Assign the NORMAL onstop handler HERE
    mediaRecorder.onstop = async () => {
      console.log("mediaRecorder.onstop triggered.");

      // ***** Check Cancellation Flag *****
      if (isRecordingCancelled) {
        console.log("onstop: Recording was cancelled, skipping processing.");
        // UI reset should have already happened in handleDeleteRecording
        isRecordingCancelled = false; // Reset flag just in case
        return;
      }

      // Stop the waveform visual (should be quick)
      stopWaveformVisualization();

      // --- Normal stop processing ---
      if (audioChunks.length === 0) {
        console.warn(
          "No audio chunks recorded. Recording might have been too short or silent."
        );
        resetUI();
        recognizedTextDiv.textContent = "(Recording too short or silent)";
        retryButton.style.display = "inline-block";
        retryButton.disabled = false;
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      recordedAudioBlob = new Blob(audioChunks, { type: "audio/mp4" });
      console.log(
        "Recorded audio blob created, size:",
        recordedAudioBlob?.size
      );
      audioChunks = []; // Clear chunks

      // UI Updates after stopping normally
      micButton.innerHTML = '<i class="fas fa-microphone mic-icon"></i>';
      micButton.style.backgroundColor = "";
      micButton.disabled = false;
      micButton.style.color = "#fff";
      micButton.style.display = "inline-block";
      micButton.style.opacity = "1";
      micButton.style.animation =
        "pulse 2s infinite, glow 2s infinite alternate";

      retryButton.style.display = "inline-block";
      retryButton.disabled = false;
      document.getElementById("recordingIndicator").style.display = "none";

      // Set recording flag false AFTER UI updates
      isRecording = false;
      recordingStartTime = null;
      toggleListenButtons(false);
      toggleBookmarkButtons(false);
      console.log("UI updated after normal recording stop.");

      // Stop tracks
      console.log("Stopping media stream tracks normally...");
      stream.getTracks().forEach((track) => track.stop());
      console.log("Media stream tracks stopped normally.");

      // Upload for transcription
      if (recordedAudioBlob && recordedAudioBlob.size > 100) {
        console.log("Uploading audio for transcription...");
        recognizedTextDiv.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Transcribing...';
        pronunciationScoreDiv.textContent = "...";

        // Show mobile loading state if on mobile
        if (isMobile) {
          showMobileLoadingState();
        } else {
          // Keep the original microphone icon during transcription for desktop
          micButton.innerHTML = '<i class="fas fa-microphone mic-icon"></i>';
          micButton.style.color = "#fff";
          micButton.style.backgroundColor = "";
          micButton.style.animation =
            "pulse 2s infinite, glow 2s infinite alternate";
        }
        const transcription = await uploadAudioToAssemblyAI(recordedAudioBlob);
        if (transcription !== null) {
          console.log("Transcription received:", transcription);
          const pronunciationScore = calculatePronunciationScore(
            transcription,
            lessons[currentLessonIndex].sentences[currentSentenceIndex]
          );
          pronunciationScoreDiv.textContent = `${pronunciationScore}%`;
          updateProgressCircle(pronunciationScore);
          totalPronunciationScore += pronunciationScore; // Add score to total
          console.log("Score calculated and totals updated.");

          // Update progress bar immediately after score calculation
          updateSimpleProgress();

          // Hide mobile loading state if on mobile
          if (isMobile) {
            hideMobileLoadingState();
          } else {
            // Restore mic icon after transcription is complete for desktop
            micButton.innerHTML = '<i class="fas fa-microphone mic-icon"></i>';
            micButton.style.color = "#fff";
            micButton.style.backgroundColor = "";
            micButton.style.display = "inline-block";
            micButton.style.opacity = "1";
            micButton.style.animation =
              "pulse 2s infinite, glow 2s infinite alternate";
          }

          openDialog();
          console.log("Dialog opened.");
        } else {
          console.log(
            "Transcription was null, likely an error during processing."
          );
          recognizedTextDiv.textContent = "(Transcription failed)";

          // Hide mobile loading state if on mobile
          if (isMobile) {
            hideMobileLoadingState();
          } else {
            // Restore mic icon after transcription failed for desktop
            micButton.innerHTML = '<i class="fas fa-microphone mic-icon"></i>';
            micButton.style.color = "#fff";
            micButton.style.backgroundColor = "";
            micButton.style.display = "inline-block";
            micButton.style.opacity = "1";
            micButton.style.animation =
              "pulse 2s infinite, glow 2s infinite alternate";
          }
        }
      } else {
        console.warn(
          "Recorded audio blob is empty or very small, skipping transcription."
        );
        recognizedTextDiv.textContent = "(Recording too short or silent)";
        retryButton.style.display = "inline-block";
        retryButton.disabled = false;
      }
    };

    mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event.error);
      alert(`Recording error: ${event.error.name} - ${event.error.message}`);
      // Reset UI on error
      resetUI(); // resetUI already calls stopWaveformVisualization
      if (stream) {
        stream.getTracks().forEach((track) => track.stop()); // Stop stream on error
      }
    };

    // Start recording
    mediaRecorder.start(100);
    micButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    micButton.style.color = "#ff0000";
    micButton.disabled = true;
    document.getElementById("recordingIndicator").style.display =
      "inline-block";
    console.log("UI updated for recording start.");

    // Set timeout to automatically stop recording after RECORDING_DURATION
    clearTimeout(recordingTimeout); // Clear any previous timeout
    recordingTimeout = setTimeout(() => {
      console.log("Recording duration timeout reached.");
      if (mediaRecorder && mediaRecorder.state === "recording") {
        console.log("Stopping recorder due to timeout...");
        mediaRecorder.stop();
      }
    }, RECORDING_DURATION);
    console.log(`Recording timeout set for ${RECORDING_DURATION}ms`);
  } catch (error) {
    console.error("Error in startAudioRecording:", error);
    alert(
      `Could not start recording: ${error.message}. Please check microphone permissions.`
    );

    // Ensure recording flag is reset and buttons are re-enabled in case of error
    isRecording = false;
    recordingStartTime = null;
    toggleListenButtons(false);
    toggleBookmarkButtons(false);
    // Make sure waveform is stopped and hidden on error
    stopWaveformVisualization();
  }
}

// Enhanced AssemblyAI Upload Function
async function uploadAudioToAssemblyAI(audioBlob) {
  try {
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        "content-type": "application/octet-stream",
      },
      body: audioBlob,
    });
    if (!uploadResponse.ok)
      throw new Error(`Failed to upload audio: ${uploadResponse.statusText}`);

    const uploadData = await uploadResponse.json();
    const transcriptionResponse = await fetch(
      "https://api.AssemblyAI.com/v2/transcript",
      {
        method: "POST",
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({ audio_url: uploadData.upload_url }),
      }
    );
    if (!transcriptionResponse.ok)
      throw new Error(
        `Failed to submit transcription request: ${transcriptionResponse.statusText}`
      );

    const transcriptionData = await transcriptionResponse.json();
    const transcriptId = transcriptionData.id;

    while (true) {
      const statusResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { authorization: ASSEMBLYAI_API_KEY },
        }
      );
      if (!statusResponse.ok)
        throw new Error(
          `Failed to get transcription status: ${statusResponse.statusText}`
        );

      const statusData = await statusResponse.json();
      if (statusData.status === "completed") return statusData.text;
      else if (statusData.status === "error")
        throw new Error("Transcription failed");

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Error in AssemblyAI transcription:", error);
    alert("Failed to transcribe audio. Please try again.");
    return null;
  }
}

// Initialize enhanced event listeners when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  setupEnhancedEventListeners();
});

// Enhanced Function to show dialog with animation
function showDialog() {
  if (dialogContainer) {
    // Make sure the dialog is initially hidden
    dialogContainer.style.display = "block";
    dialogContainer.classList.remove("active");

    // Add the dialog content if it's missing
    if (!dialogContainer.querySelector(".dialog-content")) {
      console.log("Dialog content missing, check HTML structure");
      return;
    }

    // Start the animation after one frame
    requestAnimationFrame(() => {
      dialogContainer.classList.add("active");
    });

    // Run the circle animation if present
    setTimeout(() => {
      if (scoreCircle) {
        scoreCircle.classList.add("animate");
      }
    }, 300);
  }
}

// Ensure this function is called instead of openDialog
function openDialog() {
  showDialog();
}

// Add event listeners for buttons if not present
document.addEventListener("DOMContentLoaded", function () {
  // Close button
  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeDialog);
  }

  // Dialog backdrop
  const dialogBackdrop = document.querySelector(".dialog-backdrop");
  if (dialogBackdrop) {
    dialogBackdrop.addEventListener("click", closeDialog);
  }

  // Retry button
  const retryBtn = document.getElementById("retryButton");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      closeDialog();
      resetEnhancedUI();
    });
  }

  // Next button
  const nextBtn = document.getElementById("nextButton");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      closeDialog();
      // Continue to next sentence logic handled in existing event listener
    });
  }
});

// Enhanced Dialog Content Update Function
function updateDialogContent(score, recognizedText, missingWords) {
  // Update the score inside the circle
  if (scorePercentage) {
    scorePercentage.textContent = `${score}%`;
  }

  // Update the score circle
  animateScoreCircle(score);

  // Update the recognized text
  if (recognizedTextDiv) {
    recognizedTextDiv.innerHTML = recognizedText;
  }

  // Update the missing words
  if (missingWordDiv) {
    missingWordDiv.textContent = missingWords;
  }

  // Update the Continue button color based on the score
  const nextButton = document.getElementById("nextButton");
  if (nextButton) {
    if (score < 50) {
      nextButton.style.background = "var(--gradient-danger)";
      nextButton.classList.add("error");
      nextButton.classList.remove("success");
    } else {
      nextButton.style.background = "var(--gradient-primary)";
      nextButton.classList.add("success");
      nextButton.classList.remove("error");
    }
  }
}

// Enhanced Error Handling
window.addEventListener("error", function (e) {
  console.error("Global error caught:", e.error);

  // Stop any ongoing recording
  if (isRecording && mediaRecorder && mediaRecorder.state === "recording") {
    try {
      mediaRecorder.stop();
    } catch (err) {
      console.error("Error stopping recorder during error cleanup:", err);
    }
  }

  // Reset UI
  resetEnhancedUI();
});

// Enhanced Unload Handler
window.addEventListener("beforeunload", function () {
  // Clean up audio resources
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }
});

// Export functions for global access (useful for debugging)
if (typeof window !== "undefined") {
  window.resetEnhancedUI = resetEnhancedUI;
  window.setupWaveformVisualization = setupWaveformVisualization;
  window.drawEnhancedWaveform = drawEnhancedWaveform;
  window.updateRecordingTimer = updateRecordingTimer;
}

// Function to play sound effects
function playSoundEffect(type) {
  if (!soundEffects[type]) return;

  try {
    Object.values(soundEffects).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const sound = soundEffects[type];
    sound.currentTime = 0;
    sound.play().catch((error) => {
      console.error(`Error playing ${type} sound:`, error);
    });
  } catch (error) {
    console.error("Error playing sound effect:", error);
  }
}
// Show mobile alert
function showMobileAlert(message) {
  const alertContainer = document.getElementById("mobileAlertContainer");
  const alertMessage = document.getElementById("mobileAlertMessage");

  if (alertContainer && alertMessage) {
    alertMessage.textContent = message;
    alertContainer.style.display = "flex";
  }
}

// Initialize mobile alert
function initializeMobileAlert() {
  const alertClose = document.getElementById("mobileAlertClose");
  const alertContainer = document.getElementById("mobileAlertContainer");

  if (alertClose && alertContainer) {
    alertClose.addEventListener("click", function () {
      alertContainer.style.display = "none";
    });

    // Close alert when clicking backdrop
    alertContainer.addEventListener("click", function (e) {
      if (e.target === alertContainer) {
        alertContainer.style.display = "none";
      }
    });
  }
}
// Mobile-specific function to play recorded audio (slow version)
function playMobileRecordedAudioSlow() {
  if (!recordedAudioBlob) {
    showMobileAlert("No recorded audio yet. Please record your voice first.");
    return;
  }

  if (isRecording) {
    showMobileAlert("Cannot play audio while recording.");
    return;
  }

  if (isPlaying) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    isPlaying = false;
    return;
  }

  initializeAudioContext();
  const audioURL = URL.createObjectURL(recordedAudioBlob);
  currentAudio = new Audio(audioURL);

  // Apply slow playback rate (0.7x speed)
  currentAudio.playbackRate = 0.7;

  currentAudio.addEventListener("error", () => {
    showMobileAlert("Error playing audio. Please try again.");
    isPlaying = false;
  });

  isPlaying = true;
  currentAudio
    .play()
    .then(() => {
      console.log("Slow playback started successfully");
    })
    .catch((error) => {
      isPlaying = false;
      showMobileAlert("Could not play audio. Please try again.");
      console.error("Playback error:", error);
    });

  currentAudio.onended = () => {
    isPlaying = false;
  };
}
// Mobile-specific function to speak sentence (for dialog listen button)
function mobileSpeakSentenceFromDialog() {
  if (isRecording) {
    showMobileAlert("Cannot listen while recording.");
    return;
  }

  if (isSpeaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
    return;
  }

  if (!lessons || lessons.length === 0 || currentLessonIndex === -1) {
    showMobileAlert("Please wait for lessons to load.");
    return;
  }

  const currentLesson = lessons[currentLessonIndex];
  if (
    !currentLesson ||
    !currentLesson.sentences ||
    !currentLesson.sentences[currentSentenceIndex]
  ) {
    showMobileAlert("Current sentence not available.");
    return;
  }

  const sentence = currentLesson.sentences[currentSentenceIndex].english;
  isSpeaking = true;

  currentUtterance = new SpeechSynthesisUtterance(sentence);
  currentUtterance.lang = "en-US";
  currentUtterance.rate = 1.0; // Normal speed for dialog listen

  currentUtterance.onend = () => {
    isSpeaking = false;
  };

  currentUtterance.onerror = () => {
    isSpeaking = false;
    console.error("Error playing the sentence");
  };

  speechSynthesis.speak(currentUtterance);
}
// Setup mobile-specific event listeners
function setupMobileSpecificListeners() {
  if (!isMobile) return;

  // Listen slow button in practice overlay
  const mobileListenSlowBtn = document.getElementById("mobileListenSlowBtn");
  if (mobileListenSlowBtn) {
    mobileListenSlowBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      enableVideoAudio(); // Enable video audio on user interaction
      playMobileRecordedAudioSlow();
    });
  }

  // Listen button in dialog (for original sentence)
  const mobileListenResultBtn = document.getElementById(
    "mobileListenResultBtn"
  );
  if (mobileListenResultBtn) {
    mobileListenResultBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      enableVideoAudio(); // Enable video audio on user interaction
      mobileSpeakSentenceFromDialog();
    });
  }

  // Listen button in practice overlay
  const mobileListenBtn = document.getElementById("mobileListenBtn");
  if (mobileListenBtn) {
    mobileListenBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      enableVideoAudio(); // Enable video audio on user interaction
      mobileSpeakSentence();
    });
  }

  // Microphone button interaction
  const mobileMicBtn = document.getElementById("mobileMicBtn");
  if (mobileMicBtn) {
    mobileMicBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      enableVideoAudio(); // Enable video audio on user interaction
    });
  }

  // Video click to enable audio
  if (mobileLessonVideo) {
    mobileLessonVideo.addEventListener("click", function (e) {
      enableVideoAudio();
    });
  }

  // Initialize mobile alert system
  initializeMobileAlert();
}
// Initialize mobile recording UI elements
function initializeMobileRecordingUI() {
  mobileRecordingUI = document.getElementById("mobileRecordingUI");
  mobileWaveformBars = document.querySelectorAll(".mobile-waveform-bar");
  mobileRecordingTimer = document.getElementById("mobileRecordingTimer");
  mobileDeleteBtn = document.getElementById("mobileDeleteBtn");
  mobileStopBtn = document.getElementById("mobileStopBtn");
  mobilePracticeControls = document.getElementById("practiceControls"); // Add this line
}
// Update the startMobileRecording function
async function startMobileRecording() {
  if (mobileRecording) return;

  try {
    mobileRecording = true;

    // Hide practice controls and show recording UI
    if (mobilePracticeControls) {
      mobilePracticeControls.style.display = "none";
    }
    if (mobileRecordingUI) {
      mobileRecordingUI.classList.add("show");
    }

    // Update mic button state
    if (mobileMicBtn) {
      mobileMicBtn.classList.add("recording");
    }

    // Start the actual recording
    await startAudioRecording();

    // Setup audio visualization
    setupMobileAudioVisualization();

    console.log("Mobile recording started");
  } catch (error) {
    console.error("Mobile recording failed:", error);
    stopMobileRecording();
  }
}

// Add function to setup mobile audio visualization
function setupMobileAudioVisualization() {
  if (!audioContext || !mediaRecorder) return;

  try {
    // Create analyser for mobile
    mobileAudioAnalyser = audioContext.createAnalyser();
    mobileAudioAnalyser.fftSize = 512;
    mobileAudioAnalyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaStreamSource(mediaRecorder.stream);
    source.connect(mobileAudioAnalyser);

    // Create data array
    const bufferLength = mobileAudioAnalyser.frequencyBinCount;
    mobileAudioDataArray = new Uint8Array(bufferLength);

    // Start mobile waveform animation
    startMobileWaveformAnimation();

    // Start mobile recording timer
    startMobileRecordingTimer();
  } catch (error) {
    console.error("Error setting up mobile audio visualization:", error);
    // Fallback to basic animation
    startBasicMobileWaveformAnimation();
  }
}

// Add function to stop mobile recording
function stopMobileRecording() {
  mobileRecording = false;

  // Show practice controls and hide recording UI
  if (mobilePracticeControls) {
    mobilePracticeControls.style.display = "flex";
  }
  if (mobileRecordingUI) {
    mobileRecordingUI.classList.remove("show");
  }

  // Reset mic button state
  if (mobileMicBtn) {
    mobileMicBtn.classList.remove("recording");
  }

  // Stop waveform animation
  stopMobileWaveformAnimation();

  // Stop the actual recording
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}

// Add waveform animation function
function startMobileWaveformAnimation() {
  if (!mobileWaveformBars || !mobileAudioAnalyser || !mobileAudioDataArray) {
    startBasicMobileWaveformAnimation();
    return;
  }

  function animateWaveform() {
    if (!mobileRecording) return;

    mobileWaveformAnimation = requestAnimationFrame(animateWaveform);

    // Get frequency data
    mobileAudioAnalyser.getByteFrequencyData(mobileAudioDataArray);

    // Update each bar based on frequency data
    mobileWaveformBars.forEach((bar, index) => {
      // Map bar index to frequency data
      const dataIndex = Math.floor(
        (index * mobileAudioDataArray.length) / mobileWaveformBars.length
      );
      let amplitude = mobileAudioDataArray[dataIndex] || 0;

      // Normalize amplitude (0-255 to 0-1)
      amplitude = amplitude / 255;

      // Add some baseline activity for visual appeal
      const baselineActivity = 0.1 + Math.random() * 0.1;
      amplitude = Math.max(amplitude, baselineActivity);

      // Apply smoothing for more natural movement
      const smoothingFactor = 0.7;
      const currentHeight = parseFloat(bar.style.height) || 4;
      const targetHeight = 4 + amplitude * 24; // 4px min, 28px max
      const newHeight =
        currentHeight * smoothingFactor + targetHeight * (1 - smoothingFactor);

      // Set the height
      bar.style.height = `${Math.round(newHeight)}px`;

      // Add active class for visual feedback
      if (amplitude > 0.3) {
        bar.classList.add("active");
      } else {
        bar.classList.remove("active");
      }
    });
  }

  mobileWaveformAnimation = requestAnimationFrame(animateWaveform);
}
// Fallback basic animation when audio analysis fails
function startBasicMobileWaveformAnimation() {
  if (!mobileWaveformBars) return;

  let animationStep = 0;

  function basicAnimate() {
    if (!mobileRecording) return;

    mobileWaveformAnimation = requestAnimationFrame(basicAnimate);

    animationStep += 0.1;

    mobileWaveformBars.forEach((bar, index) => {
      // Create wave-like pattern
      const wave = Math.sin(animationStep + index * 0.3) * 0.5 + 0.5;
      const randomVariation = Math.random() * 0.3;
      const amplitude = (wave + randomVariation) / 1.3;

      const height = 4 + amplitude * 20;
      bar.style.height = `${Math.round(height)}px`;

      // Add some random active states
      if (Math.random() > 0.7) {
        bar.classList.add("active");
        setTimeout(() => bar.classList.remove("active"), 200);
      }
    });
  }

  mobileWaveformAnimation = requestAnimationFrame(basicAnimate);
}
function stopMobileWaveformAnimation() {
  if (mobileWaveformAnimation) {
    cancelAnimationFrame(mobileWaveformAnimation);
    mobileWaveformAnimation = null;
  }

  // Reset bars to initial state
  if (mobileWaveformBars) {
    mobileWaveformBars.forEach((bar) => {
      bar.style.height = "6px";
      bar.classList.remove("active");
    });
  }
}
// Show mobile recording UI
function showMobileRecordingUI() {
  if (mobileRecordingUI) {
    mobileRecordingUI.classList.add("show");
  }

  // Hide practice controls
  if (mobilePracticeControls) {
    mobilePracticeControls.style.display = "none";
  }
}
// Hide mobile recording UI
function hideMobileRecordingUI() {
  if (mobileRecordingUI) {
    mobileRecordingUI.classList.remove("show");
  }

  // Show practice controls
  if (mobilePracticeControls) {
    mobilePracticeControls.style.display = "flex";
  }
}

// Reset mobile practice controls to initial state
function resetMobilePracticeControls() {
  // Cancel recording immediately if active
  if (mobileRecording) {
    mobileRecording = false;

    // Stop media recorder if active
    if (mediaRecorder && mediaRecorder.state === "recording") {
      try {
        mediaRecorder.stop();
      } catch (error) {
        console.warn("Error stopping media recorder:", error);
      }
    }

    // Stop all audio tracks
    if (mediaRecorder && mediaRecorder.stream) {
      mediaRecorder.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (error) {
          console.warn("Error stopping audio track:", error);
        }
      });
    }
  }

  // Hide mobile recording UI
  hideMobileRecordingUI();

  // Reset mobile mic button state
  if (mobileMicBtn) {
    mobileMicBtn.classList.remove("recording");
    mobileMicBtn.disabled = false;
  }

  // Reset recording timer
  if (mobileRecordingTimer) {
    mobileRecordingTimer.textContent = "0:00";
  }

  // Stop waveform animation
  stopMobileWaveformAnimation();

  // Reset waveform bars
  if (mobileWaveformBars) {
    mobileWaveformBars.forEach((bar) => {
      bar.classList.remove("active");
      bar.style.height = "12px"; // Reset to minimum height
    });
  }

  // Show practice controls in their initial state
  if (mobilePracticeControls) {
    mobilePracticeControls.style.display = "flex";
  }

  // Reset any global recording flags
  isRecordingCancelled = true;

  // Clear any recording timeouts
  if (recordingTimeout) {
    clearTimeout(recordingTimeout);
    recordingTimeout = null;
  }

  console.log("Mobile practice controls reset to initial state");
}

// Old subtitle system removed - now using simple subtitle system

// Update the video functions to use new subtitle system
async function playVideoWithSubtitles() {
  if (!mobileLessonVideo || mobileRecording) return;

  try {
    // Load subtitles for current sentence
    loadSubtitlesForCurrentSentence();

    hideMobileReplayButton();
    mobileVideoEnded = false;

    // Reset video and play
    mobileLessonVideo.currentTime = 0;

    // For iOS, we need to handle audio differently
    if (isIOS) {
      // On iOS, check if user has interacted
      if (hasUserInteracted) {
        mobileLessonVideo.muted = false;
        mobileLessonVideo.volume = 1.0;
        hideIOSAudioOverlay();
      } else {
        // Start muted, will be enabled on user interaction
        mobileLessonVideo.muted = true;
        showIOSAudioOverlay();
      }

      try {
        await mobileLessonVideo.play();
        console.log("Mobile video playing on iOS");
      } catch (playError) {
        console.warn("iOS video play failed:", playError);
        showMobileReplayButton();
      }
    } else {
      // For other platforms, try with sound first
      mobileLessonVideo.muted = false;
      mobileLessonVideo.volume = 1.0;

      try {
        await mobileLessonVideo.play();
        console.log("Mobile video playing with sound");
      } catch (error) {
        console.warn("Failed to play with sound, trying muted:", error);
        mobileLessonVideo.muted = true;
        await mobileLessonVideo.play();
        console.log("Mobile video playing muted");
      }
    }
  } catch (error) {
    console.error("Failed to play video:", error);
    showMobileReplayButton();
  }
}

// Update existing functions to use new subtitle system
async function playMobileVideoWithSync() {
  await playVideoWithSubtitles();
}

// Legacy function - redirects to new system
async function playMobileVideo() {
  await playVideoWithSubtitles();
}

// Update loadMobileContent to use new system
function updateLoadMobileContent() {
  const originalTimeout = setTimeout(() => {
    playVideoWithSubtitles();
  }, 500);
}

// End of new subtitle system

// Mobile Progress Bar Management Functions
// Add these functions to your records.js file

// Generate progress bullets for mobile based on current lesson
function generateMobileProgressBullets() {
  const progressBullets = document.getElementById("progressBullets");

  if (!progressBullets || lessons.length === 0 || currentLessonIndex === -1) {
    console.warn(
      "Cannot generate mobile progress bullets - missing elements or lesson data"
    );
    return;
  }

  const currentLesson = lessons[currentLessonIndex];
  if (!currentLesson || !currentLesson.sentences) {
    console.warn("Current lesson or sentences not available");
    return;
  }

  progressBullets.innerHTML = "";

  console.log(
    `🔵 generateMobileProgressBullets: currentSentenceIndex=${currentSentenceIndex}, totalSentences=${currentLesson.sentences.length}`
  );

  // Create bullets for each sentence
  currentLesson.sentences.forEach((sentence, index) => {
    const bullet = document.createElement("div");
    bullet.className = "progress-bullet";
    bullet.setAttribute("data-sentence-index", index);

    // Set bullet state based on completion
    if (completedSentences.has(index)) {
      bullet.classList.add("completed");
    } else if (index === currentSentenceIndex) {
      bullet.classList.add("active");
    }

    progressBullets.appendChild(bullet);
  });
}

// Update mobile bullet states based on current progress
function updateMobileBulletStates() {
  if (!progressBullets) return;

  const bullets = progressBullets.querySelectorAll(".progress-bullet");
  bullets.forEach((bullet, index) => {
    bullet.classList.remove("active", "completed");

    if (completedSentences.has(index)) {
      bullet.classList.add("completed");
    } else if (index === currentSentenceIndex) {
      bullet.classList.add("active");
    }
  });
}

// Enhanced mobile next sentence function with progress updates
function mobileNextSentenceWithProgress() {
  const currentLesson = lessons[currentLessonIndex];
  if (currentSentenceIndex < currentLesson.sentences.length - 1) {
    currentSentenceIndex++;
    updateSentence();
    updateSentenceCounter();
    updateProgress();

    // Load subtitles for the new sentence
    if (subtitleManager) {
      loadCurrentSentenceSubtitles();
    }
  } else {
    // Lesson completed
    showMobileCompletionCard();
  }
}

// Add recording timer function
function startMobileRecordingTimer() {
  mobileRecordingStartTime = Date.now();

  function updateTimer() {
    if (!mobileRecording) return;

    const elapsed = Math.floor((Date.now() - mobileRecordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    const timerDisplay = document.getElementById("mobileRecordingTimer");
    if (timerDisplay) {
      timerDisplay.textContent = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    setTimeout(updateTimer, 1000);
  }

  updateTimer();
}

// Mobile Progress Bar Management Functions
function generateMobileProgressBullets() {
  const progressBullets = document.getElementById("progressBullets");

  if (!progressBullets || lessons.length === 0 || currentLessonIndex === -1) {
    console.warn(
      "Cannot generate mobile progress bullets - missing elements or lesson data"
    );
    return;
  }

  const currentLesson = lessons[currentLessonIndex];
  if (!currentLesson || !currentLesson.sentences) {
    console.warn("Current lesson or sentences not available");
    return;
  }

  progressBullets.innerHTML = "";

  console.log(
    `🔵 generateMobileProgressBullets: currentSentenceIndex=${currentSentenceIndex}, totalSentences=${currentLesson.sentences.length}`
  );
}

// Enhanced mobile next sentence function with progress updates
function mobileNextSentenceWithProgress() {
  const currentLesson = lessons[currentLessonIndex];

  console.log(
    `🔴 mobileNextSentenceWithProgress: currentSentenceIndex=${currentSentenceIndex}, totalSentences=${currentLesson.sentences.length}`
  );

  // Mark current sentence as completed
  completedSentences.add(currentSentenceIndex);

  // Trigger existing video end logic
  setTimeout(() => {
    handleMobileVideoEnd();
  }, 1000);
}

// Enhanced mobile video play with subtitles (redirects to new system)
async function playMobileVideoWithSync() {
  console.log("playMobileVideoWithSync called, using new subtitle system");
  await playVideoWithSubtitles();
}
// Add recording timer function
function startMobileRecordingTimer() {
  mobileRecordingStartTime = Date.now();

  function updateTimer() {
    if (!mobileRecording) return;

    const elapsed = Math.floor((Date.now() - mobileRecordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    if (mobileRecordingTimer) {
      mobileRecordingTimer.textContent = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    setTimeout(updateTimer, 1000);
  }

  updateTimer();
}
// Mobile Progress Bar Management Functions
// Add these functions to your records.js file

// Generate progress bullets for mobile based on current lesson
function generateMobileProgressBullets() {
  const progressBullets = document.getElementById("progressBullets");

  if (!progressBullets || lessons.length === 0 || currentLessonIndex === -1) {
    console.warn(
      "Cannot generate mobile progress bullets - missing elements or lesson data"
    );
    return;
  }

  const currentLesson = lessons[currentLessonIndex];
  if (!currentLesson || !currentLesson.sentences) {
    console.warn("Current lesson or sentences not available");
    return;
  }

  // Clear existing bullets
  progressBullets.innerHTML = "";

  const totalSentences = currentLesson.sentences.length;

  // Create bullets for each sentence
  currentLesson.sentences.forEach((sentence, index) => {
    const bullet = document.createElement("div");
    bullet.className = "progress-bullet";
    bullet.setAttribute("data-sentence-index", index);

    // Set initial state based on current progress
    if (index < currentSentenceIndex) {
      // Previously completed sentences - check if actually completed
      if (completedSentences.has(index)) {
        bullet.classList.add("completed");
      } else {
        bullet.classList.add("inactive");
      }
    } else if (index === currentSentenceIndex) {
      // Current active sentence
      bullet.classList.add("active");
    } else {
      // Future sentences
      bullet.classList.add("inactive");
    }

    progressBullets.appendChild(bullet);
  });

  // Progress is now handled by bullet states and connecting lines

  // Also update main progress to keep everything synchronized
  updateProgress();

  console.log(`Generated ${totalSentences} mobile progress bullets`);
}

// Progress is now handled by bullet states and connecting lines - no separate progress bar needed

// Update bullet states when moving between sentences
function updateMobileBulletStates() {
  const bullets = document.querySelectorAll(".progress-bullet");

  console.log(
    `🟢 updateMobileBulletStates: currentSentenceIndex=${currentSentenceIndex}, bullets count=${bullets.length}`
  );

  bullets.forEach((bullet, index) => {
    // Remove all state classes
    bullet.classList.remove("inactive", "active", "completed");

    // Apply appropriate state class based on actual completion status
    if (index < currentSentenceIndex) {
      // Past sentences - mark as completed only if they're in completedSentences
      if (completedSentences.has(index)) {
        bullet.classList.add("completed");
        console.log(`🟢 Bullet ${index}: added completed class`);
      } else {
        bullet.classList.add("inactive");
        console.log(`🟢 Bullet ${index}: added inactive class`);
      }
    } else if (index === currentSentenceIndex) {
      bullet.classList.add("active");
      console.log(`🟢 Bullet ${index}: added active class (CURRENT)`);
    } else {
      bullet.classList.add("inactive");
      console.log(`🟢 Bullet ${index}: added inactive class`);
    }
  });

  // Update progress line
  updateMobileProgressLine();

  // Also update main progress to keep everything synchronized
  updateProgress();
}

// Initialize mobile progress when lessons are loaded
function initializeMobileProgress() {
  if (!isMobile) return;

  // Wait for lessons to be loaded
  if (lessons.length === 0) {
    const checkLessons = setInterval(() => {
      if (lessons.length > 0) {
        clearInterval(checkLessons);
        generateMobileProgressBullets();
      }
    }, 100);
  } else {
    generateMobileProgressBullets();
  }
}

// Enhanced mobile next sentence function with progress updates
function mobileNextSentenceWithProgress() {
  const currentLesson = lessons[currentLessonIndex];

  console.log(
    `🔴 mobileNextSentenceWithProgress: currentSentenceIndex=${currentSentenceIndex}, totalSentences=${currentLesson.sentences.length}`
  );

  if (currentSentenceIndex < currentLesson.sentences.length - 1) {
    // Mark current sentence as completed
    completedSentences.add(currentSentenceIndex);
    console.log(`🔴 Marked sentence ${currentSentenceIndex} as completed`);

    // Move to next sentence
    currentSentenceIndex++;
    console.log(`🔴 Moved to sentence ${currentSentenceIndex}`);

    // Update bullet states and progress
    updateMobileBulletStates();

    // Update content (video will auto-start from loadMobileContent)
    loadMobileContent();

    // Update main progress to keep everything synchronized
    updateProgress();

    console.log(
      `Mobile: Moved to sentence ${currentSentenceIndex + 1}/${
        currentLesson.sentences.length
      }`
    );
  } else {
    // Mark final sentence as completed
    completedSentences.add(currentSentenceIndex);
    updateMobileBulletStates();

    // Update main progress to keep everything synchronized
    updateProgress();

    // Lesson completed
    handleMobileLessonComplete();
  }
}

// Enhanced mobile content loading with progress sync
function loadMobileContentWithProgress() {
  if (lessons.length === 0 || currentLessonIndex === -1) return;

  const currentLesson = lessons[currentLessonIndex];
  const currentSentence = currentLesson.sentences[currentSentenceIndex];

  // SRT subtitle card is now handled by the SRT sync system
  // No longer updating sentence display here to avoid conflicts

  // Update practice overlay content
  if (mobilePracticeSentence) {
    mobilePracticeSentence.textContent = currentSentence.english;
  }

  // Generate phonetic (simplified version for demo)
  if (mobilePracticePhonetic) {
    const phonetic = generatePhoneticText(currentSentence.english);
    mobilePracticePhonetic.textContent = phonetic;
  }

  // Load video
  if (mobileLessonVideo && currentSentence.videoSrc) {
    mobileLessonVideo.src = currentSentence.videoSrc;
    mobileLessonVideo.load();

    // Auto-start video after loading
    setTimeout(() => {
      playMobileVideo();
    }, 500); // Small delay to ensure video is loaded
  }

  // Update progress bullets
  updateMobileBulletStates();

  // Reset states
  mobileVideoEnded = false;
  hideMobilePracticeOverlay();
  hideMobileCompletionCard();

  console.log(`Mobile content loaded for sentence ${currentSentenceIndex + 1}`);
}

// Update the existing mobile dialog next button handler
function updateMobileNextButtonHandler() {
  const mobileNextButton = document.getElementById("mobileNextButton");
  if (mobileNextButton) {
    // Remove existing listener
    mobileNextButton.replaceWith(mobileNextButton.cloneNode(true));
    const newNextButton = document.getElementById("mobileNextButton");

    // Add new listener with progress updates
    newNextButton.addEventListener("click", function () {
      hideMobileDialog();
      mobileNextSentenceWithProgress();
    });
  }
}

// Update lesson initialization to include mobile progress
function initializeLessonWithMobileProgress() {
  // Reset current sentence index when starting new lesson
  currentSentenceIndex = 0;
  completedSentences.clear();

  // Initialize mobile progress if on mobile
  if (isMobile) {
    generateMobileProgressBullets();
    loadMobileContentWithProgress();
    hideMobileCompletionCard();
  }

  // Update desktop progress as well
  updateSentence();
  updateSentenceCounter();
  updateProgress();
}

// Enhanced setup mobile content function
function setupMobileContentWithProgress() {
  if (!isMobile) return;

  generateMobileProgressBullets();
  loadMobileContentWithProgress();
  // Don't show replay button initially - only show when practice overlay is active
  updateMobileNextButtonHandler();
}

// Function to handle sentence completion based on pronunciation score
function handleMobileSentenceCompletion(score) {
  if (!isMobile) return;

  // Only mark sentence as completed if score is above threshold (e.g., 50%)
  if (score >= 50) {
    completedSentences.add(currentSentenceIndex);
    console.log(
      `Mobile: Sentence ${
        currentSentenceIndex + 1
      } completed with score ${score}%`
    );
  } else {
    // Remove from completed if score is too low
    completedSentences.delete(currentSentenceIndex);
    console.log(
      `Mobile: Sentence ${
        currentSentenceIndex + 1
      } not completed - score ${score}% too low`
    );
  }

  // Update bullet states and progress line immediately
  updateMobileBulletStates();
}

// Integration function to be called when pronunciation score is calculated
function integrateMobileProgressWithScoring() {
  // Override the existing calculatePronunciationScore function for mobile
  const originalCalculatePronunciationScore = calculatePronunciationScore;

  calculatePronunciationScore = function (transcript, expectedSentence) {
    const score = originalCalculatePronunciationScore.call(
      this,
      transcript,
      expectedSentence
    );

    // Handle mobile-specific progress updates
    if (isMobile) {
      handleMobileSentenceCompletion(score);
    }

    return score;
  };
}

// Call this integration function when mobile is initialized
function initializeMobileProgressIntegration() {
  if (!isMobile) return;

  integrateMobileProgressWithScoring();
  initializeMobileProgress();
}

// Update the DOMContentLoaded section to include score integration
document.addEventListener("DOMContentLoaded", function () {
  if (isMobile) {
    // Initialize all mobile progress functionality
    initializeMobileProgressIntegration();

    // Update existing mobile layout initialization
    const originalSetupMobileContent = setupMobileContent;
    setupMobileContent = setupMobileContentWithProgress;

    // Update existing mobile next sentence function
    mobileNextSentence = mobileNextSentenceWithProgress;

    // Update existing mobile content loading
    loadMobileContent = loadMobileContentWithProgress;
  }
});
