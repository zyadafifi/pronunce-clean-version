import { useState, useRef, useCallback } from "react";

export const useNewSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [speechDetected, setSpeechDetected] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      console.log("🎤 Starting new recording system...");

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        setRecordedAudio(audioBlob);
        console.log("✅ Recording completed, blob size:", audioBlob.size);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Setup audio visualization with a small delay
      setTimeout(() => {
        setupAudioVisualization(stream);
      }, 100);

      console.log("✅ Recording started successfully");
    } catch (error) {
      console.error("❌ Error starting recording:", error);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    console.log("🛑 Stopping recording...");

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // Stop audio visualization
      stopAudioVisualization();

      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }

      console.log("✅ Recording stopped");
    }
  }, [isRecording]);

  // Stop recording and return audio blob
  const stopRecordingAndGetBlob = useCallback(() => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        // Store the resolve function
        const originalOnStop = mediaRecorderRef.current.onstop;

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm;codecs=opus",
          });
          setRecordedAudio(audioBlob);
          console.log("✅ Recording completed, blob size:", audioBlob.size);
          resolve(audioBlob);

          // Call original onstop if it exists
          if (originalOnStop) {
            originalOnStop();
          }
        };

        mediaRecorderRef.current.stop();
        setIsRecording(false);

        // Clear timer
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }

        // Stop audio visualization
        stopAudioVisualization();

        // Stop all tracks
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
        }
      } else {
        resolve(null);
      }
    });
  }, [isRecording]);

  // Setup audio visualization
  const setupAudioVisualization = (stream) => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 256;

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start visualization
      animateWaveform();
    } catch (error) {
      console.error("❌ Error setting up audio visualization:", error);
    }
  };

  // Animate waveform
  const animateWaveform = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const animate = () => {
      if (!isRecording) {
        animationFrameRef.current = null;
        return;
      }

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      // Update speech detection
      setSpeechDetected(average > 20);

      // Update waveform bars
      updateWaveformBars(dataArray);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  // Update waveform bars
  const updateWaveformBars = (dataArray) => {
    const bars = document.querySelectorAll(".mobile-waveform-bar");
    if (bars.length === 0) return;

    bars.forEach((bar, index) => {
      const dataIndex = Math.floor((index / bars.length) * dataArray.length);
      const value = dataArray[dataIndex] || 0;
      const height = Math.max(6, (value / 255) * 30);

      bar.style.height = `${height}px`;
      bar.style.opacity = value > 50 ? "1" : "0.7";

      if (value > 100) {
        bar.classList.add("active");
      } else {
        bar.classList.remove("active");
      }
    });
  };

  // Stop audio visualization
  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;

    // Reset waveform bars
    const bars = document.querySelectorAll(".mobile-waveform-bar");
    bars.forEach((bar) => {
      bar.style.height = "6px";
      bar.style.opacity = "0.7";
      bar.classList.remove("active");
    });
  };

  // Delete recording
  const deleteRecording = useCallback(() => {
    console.log("🗑️ Deleting recording...");
    setRecordedAudio(null);
    setRecordingTime(0);
    setSpeechDetected(false);
  }, []);

  // Play recorded audio
  const playRecordedAudio = useCallback(() => {
    if (recordedAudio) {
      const audio = new Audio(URL.createObjectURL(recordedAudio));
      audio.play();
    }
  }, [recordedAudio]);

  // Clear recording (alias for deleteRecording)
  const clearRecording = useCallback(() => {
    deleteRecording();
  }, [deleteRecording]);

  // Speak text using Web Speech API
  const speakText = useCallback((text, rate = 1, pitch = 1) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.voice =
        speechSynthesis
          .getVoices()
          .find((voice) => voice.lang.startsWith("en")) ||
        speechSynthesis.getVoices()[0];
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopRecording();
    stopSpeaking();
    deleteRecording();
  }, [stopRecording, stopSpeaking, deleteRecording]);

  return {
    isRecording,
    recordingTime,
    speechDetected,
    recordedAudio,
    startRecording,
    stopRecording,
    stopRecordingAndGetBlob,
    deleteRecording,
    playRecordedAudio,
    clearRecording,
    speakText,
    stopSpeaking,
    cleanup,
  };
};
