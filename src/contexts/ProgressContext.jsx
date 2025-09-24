import { createContext, useContext, useState, useEffect } from "react";

// Progress Management System for Pronunciation Master
// Handles localStorage operations and lesson state management - Exact copy from progress-manager.js

class ProgressManager {
  constructor() {
    this.STORAGE_KEY = "pronunciationMasterProgress";
    this.progress = this.loadProgress();

    // Check if lessons should be marked as completed based on existing conversation progress
    this.checkAndCompleteLessons();
  }

  // Load progress from localStorage
  loadProgress() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const progress = stored ? JSON.parse(stored) : {};
      return progress;
    } catch (error) {
      console.error("Error loading progress from localStorage:", error);
      return {};
    }
  }

  // Save progress to localStorage
  saveProgress() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.progress));
    } catch (error) {
      console.error("Error saving progress to localStorage:", error);
    }
  }

  // Mark a lesson as completed
  completeLesson(lessonId) {
    this.progress[lessonId] = {
      completed: true,
      completedAt: new Date().toISOString(),
    };
    this.saveProgress();
  }

  // Get conversation IDs for a specific lesson
  getConversationIdsForLesson(lessonId) {
    // Each lesson has 6 conversations
    // Lesson 1: conversations 1-6
    // Lesson 2: conversations 7-12
    // Lesson 3: conversations 13-18
    // Lesson 4: conversations 19-24
    // Lesson 5: conversations 25-30
    // Lesson 6-10: conversations 31-60 (if they exist)

    const conversationsPerLesson = 6;
    const startId = (lessonId - 1) * conversationsPerLesson + 1;
    const endId = lessonId * conversationsPerLesson;

    const conversationIds = [];
    for (let i = startId; i <= endId; i++) {
      conversationIds.push(i);
    }

    return conversationIds;
  }

  // Check if a lesson is completed
  isLessonCompleted(lessonId) {
    // First check if lesson is directly completed
    const directCompleted =
      this.progress[lessonId] && this.progress[lessonId].completed === true;

    // If not directly completed, check if all conversations in the lesson are completed
    let conversationCompleted = false;
    if (!directCompleted && this.progress.conversations) {
      const requiredConversations = this.getConversationIdsForLesson(lessonId);
      conversationCompleted = requiredConversations.every(
        (convId) =>
          this.progress.conversations[convId] &&
          this.progress.conversations[convId].completed === true
      );
    }

    const isCompleted = directCompleted || conversationCompleted;
    return isCompleted;
  }

  // Mark a conversation as completed
  completeConversation(conversationId) {
    if (!this.progress.conversations) {
      this.progress.conversations = {};
    }
    this.progress.conversations[conversationId] = {
      completed: true,
      completedAt: new Date().toISOString(),
    };

    // Check if this conversation completion should trigger lesson completion
    this.checkAndCompleteLessons();

    this.saveProgress();
  }

  // Check if lessons should be marked as completed based on conversation progress
  checkAndCompleteLessons() {
    // Check all lessons 1-10
    for (let lessonId = 1; lessonId <= 10; lessonId++) {
      // Skip if lesson is already marked as completed
      if (this.progress[lessonId]) {
        continue;
      }

      // Check if all conversations for this lesson are completed
      if (this.progress.conversations) {
        const requiredConversations =
          this.getConversationIdsForLesson(lessonId);
        const allCompleted = requiredConversations.every(
          (convId) =>
            this.progress.conversations[convId] &&
            this.progress.conversations[convId].completed === true
        );

        if (allCompleted) {
          console.log(
            `All conversations for lesson ${lessonId} completed, marking lesson ${lessonId} as completed`
          );
          this.progress[lessonId] = {
            completed: true,
            completedAt: new Date().toISOString(),
          };
        }
      }
    }
  }

  // Check if a conversation is completed
  isConversationCompleted(conversationId) {
    return (
      this.progress.conversations &&
      this.progress.conversations[conversationId] &&
      this.progress.conversations[conversationId].completed === true
    );
  }

  // Mark a topic as completed
  completeTopic(topicId) {
    if (!this.progress.topics) {
      this.progress.topics = {};
    }
    this.progress.topics[topicId] = {
      completed: true,
      completedAt: new Date().toISOString(),
    };
    this.saveProgress();
  }

  // Check if a topic is completed
  isTopicCompleted(topicId) {
    return (
      this.progress.topics &&
      this.progress.topics[topicId] &&
      this.progress.topics[topicId].completed === true
    );
  }

  // Check if all topics in a lesson are completed
  isLessonCompleteByTopics(lessonNumber, lessonsData) {
    // Find the lesson data
    const lesson = lessonsData.find((l) => l.lessonNumber === lessonNumber);
    if (!lesson || !lesson.topics || !Array.isArray(lesson.topics)) {
      return false;
    }

    // Check if all topics in the lesson are completed
    return lesson.topics.every((topic) => this.isTopicCompleted(topic.id));
  }

  // Get completion status for all lessons
  getAllCompletionStatus() {
    return this.progress;
  }

  // Check if a lesson should be unlocked
  isLessonUnlocked(lessonId, lessonsData) {
    // First lesson is always unlocked
    if (lessonId === 1) {
      return true;
    }

    // Find the previous lesson
    const currentLessonIndex = lessonsData.findIndex(
      (lesson) => lesson.lessonNumber === lessonId
    );
    if (currentLessonIndex === -1 || currentLessonIndex === 0) {
      return lessonId === 1;
    }

    const previousLesson = lessonsData[currentLessonIndex - 1];
    return this.isLessonCompleted(previousLesson.lessonNumber);
  }

  // Update lessons data with progress information
  updateLessonsWithProgress(lessonsData) {
    return lessonsData.map((lesson) => {
      const isCompleted = this.isLessonCompleted(lesson.lessonNumber);
      const isUnlocked = this.isLessonUnlocked(
        lesson.lessonNumber,
        lessonsData
      );

      return {
        ...lesson,
        progress: isCompleted ? 100 : 0,
        locked: !isUnlocked,
      };
    });
  }

  // Get current lesson (first incomplete lesson)
  getCurrentLesson(lessonsData) {
    for (const lesson of lessonsData) {
      if (!this.isLessonCompleted(lesson.lessonNumber)) {
        return lesson.lessonNumber;
      }
    }
    return lessonsData.length; // All lessons completed
  }

  // Clear all progress (for development/testing)
  clearProgress() {
    this.progress = {};
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get progress statistics
  getProgressStats(lessonsData) {
    const totalLessons = lessonsData.length;
    const completedLessons = lessonsData.filter((lesson) =>
      this.isLessonCompleted(lesson.lessonNumber)
    ).length;

    return {
      total: totalLessons,
      completed: completedLessons,
      percentage: Math.round((completedLessons / totalLessons) * 100),
    };
  }
}

// Create global instance
const progressManager = new ProgressManager();

// React Context
const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(
    progressManager.getAllCompletionStatus()
  );
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);

  const getLessonProgress = (lessonId) => {
    return progressManager.isLessonCompleted(lessonId) ? 100 : 0;
  };

  const isLessonCompleted = (lessonId) => {
    return progressManager.isLessonCompleted(lessonId);
  };

  const isLessonUnlocked = (lessonId, lessonsData) => {
    return progressManager.isLessonUnlocked(lessonId, lessonsData);
  };

  const completeLesson = (lessonId) => {
    progressManager.completeLesson(lessonId);
    setProgress(progressManager.getAllCompletionStatus());
  };

  const completeConversation = (conversationId) => {
    progressManager.completeConversation(conversationId);
    setProgress(progressManager.getAllCompletionStatus());
  };

  const completeTopic = (topicId) => {
    progressManager.completeTopic(topicId);
    setProgress(progressManager.getAllCompletionStatus());
  };

  const clearProgress = () => {
    progressManager.clearProgress();
    setProgress(progressManager.getAllCompletionStatus());
  };

  const getProgressStats = (lessonsData) => {
    return progressManager.getProgressStats(lessonsData);
  };

  // New functions for PracticePage
  const updateConversationProgress = (conversationId, percentage, score) => {
    if (!progress.conversations) {
      progress.conversations = {};
    }
    progress.conversations[conversationId] = {
      ...progress.conversations[conversationId],
      progress: percentage,
      score: score,
      completed: percentage >= 100,
    };
    setProgress({ ...progress });
    progressManager.saveProgress();
  };

  const updateSentenceProgress = (sentenceId, completed, score) => {
    if (!progress.sentences) {
      progress.sentences = {};
    }
    progress.sentences[sentenceId] = {
      completed,
      score,
      completedAt: completed ? new Date().toISOString() : null,
    };
    setProgress({ ...progress });
    progressManager.saveProgress();
  };

  const getConversationProgress = (conversationId) => {
    return progress.conversations?.[conversationId]?.progress || 0;
  };

  const value = {
    progress,
    getLessonProgress,
    isLessonCompleted,
    isLessonUnlocked,
    isConversationCompleted: (conversationId) =>
      progressManager.isConversationCompleted(conversationId),
    isTopicCompleted: (topicId) => progressManager.isTopicCompleted(topicId),
    completeLesson,
    completeConversation,
    completeTopic,
    clearProgress,
    getProgressStats,
    // New functions for PracticePage
    currentLesson,
    currentTopic,
    currentConversation,
    setCurrentLesson,
    setCurrentTopic,
    setCurrentConversation,
    updateConversationProgress,
    updateSentenceProgress,
    getConversationProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};

export default ProgressContext;
