import { useState, useCallback, useEffect } from "react";
import { useProgress } from "../contexts/ProgressContext";

export const useConversationProgress = (conversationId, totalSentences) => {
  const {
    updateConversationProgress,
    updateSentenceProgress,
    getConversationProgress,
  } = useProgress();

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentenceScores, setSentenceScores] = useState([]);
  const [completedSentences, setCompletedSentences] = useState(new Set());
  const [overallScore, setOverallScore] = useState(0);

  // Calculate progress percentage
  const progressPercentage = Math.round(
    (completedSentences.size / totalSentences) * 100
  );

  // Update overall score when sentence scores change
  useEffect(() => {
    if (sentenceScores.length > 0) {
      const averageScore =
        sentenceScores.reduce((sum, score) => sum + score, 0) /
        sentenceScores.length;
      setOverallScore(Math.round(averageScore));
    }
  }, [sentenceScores]);

  const completeSentence = useCallback(
    (sentenceIndex, score) => {
      // Update local state
      setCompletedSentences((prev) => new Set([...prev, sentenceIndex]));
      setSentenceScores((prev) => {
        const newScores = [...prev];
        newScores[sentenceIndex] = score;
        return newScores;
      });

      // Update global progress
      const sentenceId = `${conversationId}-${sentenceIndex}`;
      updateSentenceProgress(sentenceId, true, score);

      // Move to next sentence
      if (sentenceIndex < totalSentences - 1) {
        setCurrentSentenceIndex(sentenceIndex + 1);
      } else {
        // Conversation completed
        const finalScore =
          sentenceScores.length > 0
            ? Math.round(
                sentenceScores.reduce((sum, score) => sum + score, 0) /
                  sentenceScores.length
              )
            : score;

        updateConversationProgress(conversationId, 100, finalScore);
      }
    },
    [
      conversationId,
      totalSentences,
      sentenceScores,
      updateSentenceProgress,
      updateConversationProgress,
    ]
  );

  const retrySentence = useCallback(() => {
    // Reset current sentence for retry
    setCurrentSentenceIndex(0);
  }, []);

  const resetConversation = useCallback(() => {
    setCurrentSentenceIndex(0);
    setSentenceScores([]);
    setCompletedSentences(new Set());
    setOverallScore(0);
  }, []);

  const isConversationCompleted = completedSentences.size === totalSentences;
  const isCurrentSentenceCompleted =
    completedSentences.has(currentSentenceIndex);

  return {
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
  };
};


