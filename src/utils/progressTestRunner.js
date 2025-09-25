// Progress System Test Runner
// Import this in your components to run progress system tests

import { useProgress } from "../contexts/ProgressContext";

export const useProgressTester = () => {
  const {
    updateTopicProgress,
    calculateTopicProgress,
    updateLessonProgressByTopics,
    calculateLessonProgressByTopics,
    isTopicCompleted,
    isLessonCompleted,
    completeConversation,
    batchUpdateProgress,
  } = useProgress();

  const runProgressTests = (lessonsData) => {
    console.log("🧪 Running Progress System Tests...");

    const results = {
      topicProgressTest: false,
      lessonProgressTest: false,
      unlockingTest: false,
      persistenceTest: false,
    };

    try {
      // Test 1: Topic Progress Calculation
      console.log("📝 Test 1: Topic Progress Calculation");
      const testTopic = lessonsData.lessons[0].topics[0];
      const initialProgress = calculateTopicProgress(testTopic.id, testTopic);
      console.log(`Initial topic progress: ${initialProgress}%`);

      // Simulate conversation completions
      testTopic.conversations.forEach((conv) => {
        completeConversation(conv.id);
      });

      const updatedProgress = calculateTopicProgress(testTopic.id, testTopic);
      console.log(`Updated topic progress: ${updatedProgress}%`);

      results.topicProgressTest = updatedProgress === 100;
      console.log(
        `✅ Topic Progress Test: ${
          results.topicProgressTest ? "PASSED" : "FAILED"
        }`
      );

      // Test 2: Lesson Progress Integration
      console.log("\n📝 Test 2: Lesson Progress Integration");
      const lesson = lessonsData.lessons[0];
      const lessonProgress = calculateLessonProgressByTopics(
        lesson.lessonNumber,
        lessonsData.lessons
      );
      console.log(`Lesson progress: ${lessonProgress}%`);

      results.lessonProgressTest = lessonProgress > 0;
      console.log(
        `✅ Lesson Progress Test: ${
          results.lessonProgressTest ? "PASSED" : "FAILED"
        }`
      );

      // Test 3: Unlocking Logic
      console.log("\n📝 Test 3: Topic Unlocking Logic");
      const firstTopicCompleted = isTopicCompleted(testTopic.id);
      console.log(`First topic completed: ${firstTopicCompleted}`);

      results.unlockingTest = firstTopicCompleted;
      console.log(
        `✅ Unlocking Test: ${results.unlockingTest ? "PASSED" : "FAILED"}`
      );

      // Test 4: Data Persistence
      console.log("\n📝 Test 4: Data Persistence");
      const storageData = localStorage.getItem("pronunciationMasterProgress");
      const hasPersistentData = storageData && JSON.parse(storageData).topics;
      console.log(`Data persisted: ${!!hasPersistentData}`);

      results.persistenceTest = !!hasPersistentData;
      console.log(
        `✅ Persistence Test: ${results.persistenceTest ? "PASSED" : "FAILED"}`
      );

      // Summary
      const passedTests = Object.values(results).filter(Boolean).length;
      const totalTests = Object.keys(results).length;

      console.log(
        `\n📊 Test Summary: ${passedTests}/${totalTests} tests passed`
      );

      if (passedTests === totalTests) {
        console.log(
          "🎉 All tests passed! Progress system is working correctly."
        );
      } else {
        console.log("⚠️ Some tests failed. Check the implementation.");
      }

      return { results, passed: passedTests, total: totalTests };
    } catch (error) {
      console.error("❌ Test execution failed:", error);
      return { results, error: error.message };
    }
  };

  const demonstrateProgressFlow = async (lessonsData) => {
    console.log("🎬 Demonstrating Progress Flow...");

    if (!lessonsData?.lessons?.length) {
      console.error("No lessons data available for demonstration");
      return;
    }

    const lesson = lessonsData.lessons[0];
    const topic = lesson.topics[0];

    console.log(`📚 Lesson: ${lesson.title}`);
    console.log(`📖 Topic: ${topic.title}`);
    console.log(`💬 Conversations: ${topic.conversations.length}`);

    // Step 1: Show initial state
    console.log("\n🔍 Initial State:");
    console.log(`Topic Progress: ${calculateTopicProgress(topic.id, topic)}%`);
    console.log(
      `Lesson Progress: ${calculateLessonProgressByTopics(
        lesson.lessonNumber,
        lessonsData.lessons
      )}%`
    );
    console.log(`Topic Completed: ${isTopicCompleted(topic.id)}`);
    console.log(`Lesson Completed: ${isLessonCompleted(lesson.lessonNumber)}`);

    // Step 2: Complete conversations one by one
    for (let i = 0; i < topic.conversations.length; i++) {
      const conv = topic.conversations[i];
      console.log(`\n⏳ Completing conversation: ${conv.title}`);

      completeConversation(conv.id);

      const topicProgress = calculateTopicProgress(topic.id, topic);
      const lessonProgress = calculateLessonProgressByTopics(
        lesson.lessonNumber,
        lessonsData.lessons
      );

      console.log(`Topic Progress: ${topicProgress}%`);
      console.log(`Lesson Progress: ${lessonProgress}%`);

      if (topicProgress === 100) {
        console.log("🌟 Topic completed!");
      }

      if (lessonProgress === 100) {
        console.log("🏆 Lesson completed!");
      }

      // Add a small delay for demonstration
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("\n✨ Progress flow demonstration complete!");
  };

  return {
    runProgressTests,
    demonstrateProgressFlow,
  };
};

// Export a standalone function for use in browser console
export const runStandaloneProgressTest = () => {
  console.log("🚀 Running Standalone Progress Test...");
  console.log("This test checks localStorage data and basic functionality");

  const storageKey = "pronunciationMasterProgress";
  const data = localStorage.getItem(storageKey);

  if (!data) {
    console.log("📭 No progress data found in localStorage");
    console.log("Complete some conversations first, then run this test again");
    return;
  }

  try {
    const progress = JSON.parse(data);
    console.log("📊 Current Progress Data:", progress);

    // Analyze the data
    const hasConversations =
      progress.conversations && Object.keys(progress.conversations).length > 0;
    const hasTopics =
      progress.topics && Object.keys(progress.topics).length > 0;
    const hasLessons = Object.keys(progress).some(
      (key) => !isNaN(key) && progress[key].completed
    );

    console.log(`✅ Has conversation data: ${hasConversations}`);
    console.log(`✅ Has topic data: ${hasTopics}`);
    console.log(`✅ Has lesson data: ${hasLessons}`);

    if (hasConversations) {
      const completedConversations = Object.values(
        progress.conversations
      ).filter((c) => c.completed).length;
      console.log(`📈 Completed conversations: ${completedConversations}`);
    }

    if (hasTopics) {
      const completedTopics = Object.values(progress.topics).filter(
        (t) => t.completed
      ).length;
      console.log(`📈 Completed topics: ${completedTopics}`);
    }

    console.log("🎯 Progress system is storing data correctly!");
  } catch (error) {
    console.error("❌ Error parsing progress data:", error);
  }
};

// Make it available globally for easy testing
if (typeof window !== "undefined") {
  window.runProgressTest = runStandaloneProgressTest;
}
