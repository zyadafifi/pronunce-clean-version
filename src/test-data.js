// Test data loading
import { LessonService } from "./services/lessonService.js";

export async function testDataLoading() {
  try {
    console.log("Testing data loading...");
    const lessons = await LessonService.fetchLessons();
    console.log("Lessons loaded:", lessons);

    if (lessons && lessons.length > 0) {
      const lesson = LessonService.getLesson(lessons, 1);
      console.log("Lesson 1:", lesson);

      if (lesson && lesson.topics && lesson.topics.length > 0) {
        const topic = LessonService.getTopic(lesson, 1);
        console.log("Topic 1:", topic);

        if (topic && topic.conversations && topic.conversations.length > 0) {
          const conversation = LessonService.getConversation(topic, 1);
          console.log("Conversation 1:", conversation);

          if (
            conversation &&
            conversation.sentences &&
            conversation.sentences.length > 0
          ) {
            const sentence = LessonService.getSentence(conversation, 0);
            console.log("First sentence:", sentence);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Data loading test failed:", error);
    return false;
  }
}
