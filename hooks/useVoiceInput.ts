import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const useVoiceInput = (options?: {
  onTranscriptChange?: (text: string) => void;
  language?: string;
  continuous?: boolean;
}) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsSupported(browserSupportsSpeechRecognition);
    if (!browserSupportsSpeechRecognition) {
      setError('Speech recognition not supported in this browser');
    } else if (!isMicrophoneAvailable) {
      setError('Microphone access not available');
    }
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  useEffect(() => {
    if (options?.onTranscriptChange) {
      options.onTranscriptChange(transcript);
    }
  }, [transcript, options?.onTranscriptChange]);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({
        language: options?.language || 'en-US',
        continuous: options?.continuous || false,
      });
    }
  };

  return {
    isListening: listening,
    toggleListening,
    transcript,
    resetTranscript,
    isSupported,
    error,
  };
};