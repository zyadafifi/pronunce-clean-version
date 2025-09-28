import React from "react";

const MobileSubtitleContainer = ({
  englishText,
  arabicText,
  currentSubtitle,
  showVideoSubtitles = false,
  isMobile = false,
}) => {
  // Use video subtitles if available and we're on mobile, otherwise fallback to static text
  const displayEnglish =
    showVideoSubtitles && isMobile && currentSubtitle?.englishText
      ? currentSubtitle.englishText
      : englishText;

  const displayArabic =
    showVideoSubtitles && isMobile && currentSubtitle?.arabicText
      ? currentSubtitle.arabicText
      : arabicText;

  // Debug logging
  console.log("📱 MobileSubtitleContainer render:", {
    englishText,
    arabicText,
    currentSubtitle,
    showVideoSubtitles,
    isMobile,
    displayEnglish,
    displayArabic,
  });

  // Always render the container, but only show content if we have text to display
  const hasContent = displayEnglish || displayArabic;

  if (!hasContent) {
    console.log("❌ No subtitle content to display");
    return null; // Don't render empty container
  }

  console.log("✅ Rendering subtitle container with content");

  return (
    <div className="subtitle-container" id="mobileSubtitleContainer">
      <div className="subtitle-content">
        {displayEnglish && (
          <div className="subtitle-english" id="mobileSubtitleEnglish">
            {displayEnglish}
          </div>
        )}
        {displayArabic && (
          <div className="subtitle-arabic" id="mobileSubtitleArabic">
            {displayArabic}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSubtitleContainer;
