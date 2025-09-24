// Lesson data service
export class LessonService {
  static async fetchLessons() {
    try {
      const response = await fetch("/data.json");
      if (!response.ok) {
        throw new Error("Failed to fetch lessons data");
      }
      const data = await response.json();
      return data.lessons; // Return just the lessons array
    } catch (error) {
      console.error("Error fetching lessons:", error);
      throw new Error("Failed to load lessons. Please try again.");
    }
  }

  static getLesson(lessons, lessonNumber) {
    return lessons.find(
      (lesson) => lesson.lessonNumber === parseInt(lessonNumber)
    );
  }

  static getTopic(lesson, topicId) {
    return lesson?.topics?.find((topic) => topic.id === parseInt(topicId));
  }

  static getConversation(topic, conversationId) {
    return topic?.conversations?.find(
      (conv) => conv.id === parseInt(conversationId)
    );
  }

  static getSentence(conversation, sentenceIndex) {
    const sentence = conversation?.sentences?.[sentenceIndex];
    if (!sentence) return null;

    // Map the data structure to match our expected format
    return {
      text: sentence.english, // Map english to text
      videoSrc: sentence.videoSrc,
      arabic: sentence.arabic,
      english: sentence.english,
    };
  }

  static getNextSentence(conversation, currentIndex) {
    if (!conversation?.sentences) return null;
    return currentIndex < conversation.sentences.length - 1
      ? currentIndex + 1
      : null;
  }

  static isLastSentence(conversation, currentIndex) {
    return (
      !conversation?.sentences ||
      currentIndex >= conversation.sentences.length - 1
    );
  }
}
