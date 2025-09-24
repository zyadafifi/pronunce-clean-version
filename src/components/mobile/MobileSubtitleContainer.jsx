import React from "react";

const MobileSubtitleContainer = ({ englishText, arabicText }) => {
  return (
    <div className="subtitle-container" id="mobileSubtitleContainer">
      <div className="subtitle-content">
        <div className="subtitle-english" id="mobileSubtitleEnglish">
          {englishText}
        </div>
        <div className="subtitle-arabic" id="mobileSubtitleArabic">
          {arabicText}
        </div>
      </div>
    </div>
  );
};

export default MobileSubtitleContainer;


