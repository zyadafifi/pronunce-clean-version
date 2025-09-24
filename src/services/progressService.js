// Progress tracking service
export class ProgressService {
  static STORAGE_KEY = "pronunciation_app_progress";

  static getProgress() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored
        ? JSON.parse(stored)
        : {
            completedLessons: [],
            completedTopics: [],
            completedSentences: [],
            overallScore: 0,
            lastLesson: null,
            lastTopic: null,
            lastConversation: null,
          };
    } catch (error) {
      console.error("Error loading progress:", error);
      return this.getDefaultProgress();
    }
  }

  static saveProgress(progress) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }

  static updateProgress(updates) {
    const currentProgress = this.getProgress();
    const newProgress = { ...currentProgress, ...updates };
    this.saveProgress(newProgress);
    return newProgress;
  }

  static markSentenceCompleted(
    lessonId,
    topicId,
    conversationId,
    sentenceIndex,
    score
  ) {
    const progress = this.getProgress();
    const sentenceKey = `${lessonId}-${topicId}-${conversationId}-${sentenceIndex}`;

    if (!progress.completedSentences.includes(sentenceKey)) {
      progress.completedSentences.push(sentenceKey);
    }

    // Update overall score
    const totalSentences = progress.completedSentences.length;
    progress.overallScore =
      totalSentences > 0
        ? Math.round(
            (progress.overallScore * (totalSentences - 1) + score) /
              totalSentences
          )
        : score;

    this.saveProgress(progress);
    return progress;
  }

  static markConversationCompleted(lessonId, topicId, conversationId) {
    const progress = this.getProgress();
    const conversationKey = `${lessonId}-${topicId}-${conversationId}`;

    if (!progress.completedConversations) {
      progress.completedConversations = [];
    }

    if (!progress.completedConversations.includes(conversationKey)) {
      progress.completedConversations.push(conversationKey);
    }

    this.saveProgress(progress);
    return progress;
  }

  static getDefaultProgress() {
    return {
      completedLessons: [],
      completedTopics: [],
      completedSentences: [],
      completedConversations: [],
      overallScore: 0,
      lastLesson: null,
      lastTopic: null,
      lastConversation: null,
    };
  }

  static resetProgress() {
    this.saveProgress(this.getDefaultProgress());
  }
}
