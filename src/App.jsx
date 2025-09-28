import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import HomePage from "./pages/HomePage";
import TopicsPage from "./pages/TopicsPage";
import MobileLessonPage from "./pages/MobileLessonPage";
import DesktopConversationPage from "./pages/DesktopConversationPage";
import { testDataLoading } from "./test-data";
import "./App.css";

function App() {
  useEffect(() => {
    // Test data loading on app start
    testDataLoading();
  }, []);

  return (
    <AppProvider>
      <ProgressProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Home Page */}
              <Route path="/" element={<HomePage />} />

              {/* Topics Page */}
              <Route path="/topics/:lessonNumber" element={<TopicsPage />} />

              {/* Mobile Routes */}
              <Route
                path="/mobile/:lessonNumber/:topicId/:conversationId"
                element={<MobileLessonPage />}
              />

              {/* Desktop Routes */}
              <Route
                path="/desktop/:lessonNumber/:topicId/:conversationId"
                element={<DesktopConversationPage />}
              />

              {/* Fallback for any other route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ProgressProvider>
    </AppProvider>
  );
}

export default App;
