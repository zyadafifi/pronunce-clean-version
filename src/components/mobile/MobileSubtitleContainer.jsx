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
    showVideoSubtitles && isMobile && currentSubtitle
      ? currentSubtitle.englishText
      : englishText;

  const displayArabic =
    showVideoSubtitles && isMobile && currentSubtitle
      ? currentSubtitle.arabicText
      : arabicText;

  return (
    <div className="subtitle-container" id="mobileSubtitleContainer">
      <div className="subtitle-content">
        <div className="subtitle-english" id="mobileSubtitleEnglish">
          {displayEnglish}
        </div>
        <div className="subtitle-arabic" id="mobileSubtitleArabic">
          {displayArabic}
        </div>
      </div>
    </div>
  );
};

export default MobileSubtitleContainer;
