import React, { createContext, useContext, useReducer } from "react";

// App State Management
const AppContext = createContext();

// Initial state
const initialState = {
  currentLesson: null,
  currentTopic: null,
  currentConversation: null,
  currentSentenceIndex: 0,
  isLoading: false,
  error: null,
  userProgress: {
    completedLessons: [],
    completedTopics: [],
    completedSentences: [],
    overallScore: 0,
  },
};

// Action types
const ActionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_CURRENT_LESSON: "SET_CURRENT_LESSON",
  SET_CURRENT_TOPIC: "SET_CURRENT_TOPIC",
  SET_CURRENT_CONVERSATION: "SET_CURRENT_CONVERSATION",
  SET_CURRENT_SENTENCE: "SET_CURRENT_SENTENCE",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  RESET_STATE: "RESET_STATE",
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case ActionTypes.SET_CURRENT_LESSON:
      return { ...state, currentLesson: action.payload };

    case ActionTypes.SET_CURRENT_TOPIC:
      return { ...state, currentTopic: action.payload };

    case ActionTypes.SET_CURRENT_CONVERSATION:
      return { ...state, currentConversation: action.payload };

    case ActionTypes.SET_CURRENT_SENTENCE:
      return { ...state, currentSentenceIndex: action.payload };

    case ActionTypes.UPDATE_PROGRESS:
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          ...action.payload,
        },
      };

    case ActionTypes.RESET_STATE:
      return initialState;

    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setLoading: (loading) =>
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setError: (error) =>
      dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    setCurrentLesson: (lesson) =>
      dispatch({ type: ActionTypes.SET_CURRENT_LESSON, payload: lesson }),
    setCurrentTopic: (topic) =>
      dispatch({ type: ActionTypes.SET_CURRENT_TOPIC, payload: topic }),
    setCurrentConversation: (conversation) =>
      dispatch({
        type: ActionTypes.SET_CURRENT_CONVERSATION,
        payload: conversation,
      }),
    setCurrentSentence: (index) =>
      dispatch({ type: ActionTypes.SET_CURRENT_SENTENCE, payload: index }),
    updateProgress: (progress) =>
      dispatch({ type: ActionTypes.UPDATE_PROGRESS, payload: progress }),
    resetState: () => dispatch({ type: ActionTypes.RESET_STATE }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export default AppContext;
