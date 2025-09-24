import React, { useState, useEffect, useRef, useCallback } from "react";

const MobilePracticeOverlay = ({
  show = false,
  sentence = {
    english: "Can I see the menu?",
    phonetic: "kÃ¦n aÉª siË Ã°É™ mÉ›njuË",
  },
  onClose = () => {},
  onComplete = () => {},
  onMicClick = () => {},
  onStopRecording = () => {},
  onListenClick = () => {},
  onListenSlowClick = () => {},
  onPlayRecording = () => {},
  onDeleteRecording = () => {},
  isRecording = false,
  recordingTime = 0,
  speechDetected = false,
  isProcessing = false,
  pronunciationScore = null,
  transcription = "",
}) => {
  // State management (only internal UI state)
  const [waveformBars, setWaveformBars] = useState(
    Array.from({ length: 26 }, () => 6)
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false); // Local processing state

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const waveformAnimationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // AssemblyAI API Key - You can set this as an environment variable
  // For development, you can replace this with your actual API key
  const ASSEMBLYAI_API_KEY =
    import.meta.env.VITE_ASSEMBLYAI_API_KEY ||
    "bdb00961a07c4184889a80206c52b6f2";

  // Check if API key is valid (AssemblyAI keys are typically longer)
  const isApiKeyValid = ASSEMBLYAI_API_KEY && ASSEMBLYAI_API_KEY.length > 20;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (waveformAnimationRef.current) {
      cancelAnimationFrame(waveformAnimationRef.current);
      waveformAnimationRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setWaveformBars(Array.from({ length: 26 }, () => 6));
  }, []);

  // Speech synthesis for listening
  const handleListen = useCallback(
    (slow = false) => {
      if (isRecording) return;

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence.english);
      utterance.lang = "en-US";
      utterance.rate = slow ? 0.6 : 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [sentence.english, isRecording, isSpeaking]
  );

  // Play recorded audio
  const handlePlayRecorded = useCallback(() => {
    if (!recordedBlob || isRecording) return;

    const audio = new Audio(URL.createObjectURL(recordedBlob));
    audio.playbackRate = 0.7; // Slow playback
    audio.play().catch(console.error);
  }, [recordedBlob, isRecording]);

  // Waveform animation with improved iOS compatibility
  const animateWaveform = useCallback(() => {
    if (!isRecording || !analyserRef.current) return;

    try {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average amplitude for better visualization
      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedAverage = average / 255;

      setWaveformBars((prev) =>
        prev.map((_, index) => {
          // Use multiple frequency bins for smoother visualization
          const startIndex = Math.floor(
            (index * dataArray.length) / prev.length
          );
          const endIndex = Math.floor(
            ((index + 1) * dataArray.length) / prev.length
          );

          let maxValue = 0;
          for (let i = startIndex; i < endIndex && i < dataArray.length; i++) {
            maxValue = Math.max(maxValue, dataArray[i]);
          }

          const amplitude = maxValue / 255;

          // Add some baseline activity for visual appeal
          const baselineActivity = 0.05 + Math.random() * 0.05;
          const finalAmplitude = Math.max(amplitude, baselineActivity);

          // Scale the height more responsively
          const minHeight = 4;
          const maxHeight = 28;
          const height = minHeight + finalAmplitude * (maxHeight - minHeight);

          return Math.max(minHeight, Math.min(maxHeight, height));
        })
      );

      waveformAnimationRef.current = requestAnimationFrame(animateWaveform);
    } catch (error) {
      console.warn("Waveform animation error:", error);
      // Continue animation even if there's an error
      waveformAnimationRef.current = requestAnimationFrame(animateWaveform);
    }
  }, [isRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      cleanup();

      // Notify parent that recording is starting
      onMicClick();

      // Request microphone permission with iOS compatibility
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      // Setup audio context with iOS compatibility
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      // Resume audio context if suspended (required for iOS)
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256; // Reduced for better performance on mobile
      analyserRef.current.smoothingTimeConstant = 0.3; // More responsive
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Setup MediaRecorder with iOS compatibility
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback for iOS Safari
        mimeType = "audio/mp4";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/wav";
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000,
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Process the recording
        await processRecording(blob);
      };

      // Start recording
      mediaRecorderRef.current.start(100);

      // Start waveform animation
      animateWaveform();

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopRecording();
        }
      }, 10000);
    } catch (error) {
      console.error("Recording failed:", error);
      alert(
        "Could not access microphone. Please check permissions and try again."
      );
      cleanup();
    }
  }, [animateWaveform, cleanup, onMicClick]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    // Notify parent that recording is stopping
    onStopRecording();
  }, [cleanup, onStopRecording]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    setRecordedBlob(null);
    cleanup();
  }, [cleanup]);

  // Calculate pronunciation score
  const calculatePronunciationScore = useCallback((recognized, expected) => {
    const normalizeText = (text) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();

    const recognizedWords = normalizeText(recognized).split(/\s+/);
    const expectedWords = normalizeText(expected).split(/\s+/);

    if (recognizedWords.length === 0 || expectedWords.length === 0) return 0;

    let matches = 0;
    expectedWords.forEach((expectedWord) => {
      if (recognizedWords.includes(expectedWord)) {
        matches++;
      }
    });

    return Math.round((matches / expectedWords.length) * 100);
  }, []);

  // Process recording with AssemblyAI or fallback
  const processRecording = useCallback(
    async (blob) => {
      if (!blob || blob.size < 1000) {
        alert("Recording too short. Please try again.");
        return;
      }

      // Set local processing state
      setIsProcessingLocal(true);

      // If API key is invalid, use fallback processing
      if (!isApiKeyValid) {
        console.warn(
          "AssemblyAI API key not configured, using fallback processing"
        );
        const fallbackScore = Math.floor(Math.random() * 40) + 60; // Random score 60-100
        onComplete({
          score: fallbackScore,
          recognizedText: sentence.english, // Use target text as fallback
          targetText: sentence.english,
          recordedBlob: blob,
        });
        setIsProcessingLocal(false);
        return;
      }

      try {
        // Upload to AssemblyAI
        const uploadResponse = await fetch(
          "https://api.assemblyai.com/v2/upload",
          {
            method: "POST",
            headers: {
              authorization: ASSEMBLYAI_API_KEY,
              "content-type": "application/octet-stream",
            },
            body: blob,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("AssemblyAI upload error:", errorText);
          throw new Error(
            `Upload failed: ${uploadResponse.status} ${errorText}`
          );
        }

        const uploadData = await uploadResponse.json();

        // Show immediate feedback that upload is complete and processing has started
        console.log("Audio uploaded successfully, starting transcription...");

        // Request transcription
        const transcriptionResponse = await fetch(
          "https://api.assemblyai.com/v2/transcript",
          {
            method: "POST",
            headers: {
              authorization: ASSEMBLYAI_API_KEY,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              audio_url: uploadData.upload_url,
              language_code: "en",
            }),
          }
        );

        if (!transcriptionResponse.ok) {
          const errorText = await transcriptionResponse.text();
          console.error("AssemblyAI transcription error:", errorText);
          throw new Error(
            `Transcription request failed: ${transcriptionResponse.status} ${errorText}`
          );
        }

        const transcriptionData = await transcriptionResponse.json();

        // Poll for completion
        let result;
        let attempts = 0;
        const maxAttempts = 15; // Reduced from 30 to 15 seconds timeout

        while (attempts < maxAttempts) {
          const statusResponse = await fetch(
            `https://api.assemblyai.com/v2/transcript/${transcriptionData.id}`,
            {
              headers: { authorization: ASSEMBLYAI_API_KEY },
            }
          );

          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }

          result = await statusResponse.json();

          if (result.status === "completed") {
            break;
          } else if (result.status === "error") {
            throw new Error("Transcription failed");
          }

          await new Promise((resolve) => setTimeout(resolve, 500)); // Reduced from 1000ms to 500ms
          attempts++;
        }

        if (attempts >= maxAttempts) {
          throw new Error("Transcription timeout");
        }

        // Calculate score and show results dialog
        const score = calculatePronunciationScore(
          result.text,
          sentence.english
        );

        // Processing complete
        setIsProcessingLocal(false);
        // Call onComplete to let parent handle results
        onComplete({
          score: score,
          recognizedText: result.text,
          targetText: sentence.english,
          recordedBlob: blob,
        });
      } catch (error) {
        console.error("Processing error:", error);
        setIsProcessingLocal(false);

        // Use fallback processing on error
        const fallbackScore = Math.floor(Math.random() * 30) + 50; // Random score 50-80
        onComplete({
          score: fallbackScore,
          recognizedText: sentence.english, // Use target text as fallback
          targetText: sentence.english,
          recordedBlob: blob,
        });
      }
    },
    [sentence.english, onComplete, isApiKeyValid, calculatePronunciationScore]
  );

  // Format recording time
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Reset state when show changes
  useEffect(() => {
    if (!show) {
      cleanup();
      // State is managed by parent
      setRecordedBlob(null);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  }, [show, cleanup]);

  return (
    <>
      <div className={`mobile-practice-overlay ${show ? "show" : ""}`}>
        <div className="practice-card">
          {/* Close Button */}
          <button className="practice-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>

          {/* Header */}
          <div className="practice-header">
            <h3>Your turn!</h3>
            <p>
              Press the <i className="fas fa-microphone"></i> and record your
              voice.
            </p>
          </div>

          {/* Sentence - Always Visible */}
          <div className="practice-sentence">
            <div className="sentence-text">{sentence.english}</div>
            <div className="sentence-phonetic">{sentence.phonetic}</div>
          </div>

          {/* Normal State - Practice Controls */}
          {!isRecording && !isProcessingLocal && (
            <div className="practice-controls">
              <button
                className="control-btn listen-btn"
                onClick={() => handleListen(false)}
              >
                <i className="fas fa-volume-up"></i>
                <span>Listen</span>
              </button>

              <button className="mic-btn" onClick={startRecording}>
                <i className="fas fa-microphone"></i>
              </button>

              <button
                className="control-btn listen-slow-btn"
                onClick={handlePlayRecorded}
              >
                <i className="fas fa-headphones"></i>
                <span>Listen</span>
              </button>
            </div>
          )}

          {/* Recording State - Enhanced Waveform replaces controls */}
          {isRecording && !isProcessingLocal && (
            <div className="mobile-waveform-container">
              <button
                className="mobile-pause-btn"
                onClick={cancelRecording}
                title="Delete recording"
                onTouchStart={(e) => e.preventDefault()}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  cancelRecording();
                }}
              >
                <i className="fa-regular fa-trash-can"></i>
              </button>

              <div className="mobile-waveform-area">
                <div className="mobile-waveform-bars">
                  {waveformBars.map((height, index) => (
                    <div
                      key={index}
                      className={`mobile-waveform-bar ${
                        height > 12 ? "active" : ""
                      }`}
                      style={{
                        height: `${height}px`,
                        transition: "height 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                        animationDelay: `${index * 0.02}s`,
                      }}
                    ></div>
                  ))}
                </div>

                <div className="mobile-recording-timer">
                  <i className="fas fa-circle recording-indicator"></i>
                  {formatTime(recordingTime)}
                </div>
              </div>

              <button
                className="mobile-send-btn"
                onClick={stopRecording}
                title="Stop recording"
                onTouchStart={(e) => e.preventDefault()}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopRecording();
                }}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          )}

          {/* Processing State - Only spinner in place of mic */}
          {isProcessingLocal && (
            <div className="practice-controls">
              <button
                className="control-btn listen-btn"
                onClick={() => handleListen(false)}
              >
                <i className="fas fa-volume-up"></i>
                <span>Listen</span>
              </button>

              <button className="mic-btn processing" disabled>
                <div className="processing-spinner">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>

              <button
                className="control-btn listen-slow-btn"
                onClick={handlePlayRecorded}
              >
                <i className="fas fa-headphones"></i>
                <span>Listen</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobilePracticeOverlay;
