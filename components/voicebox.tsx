'use client';

import { useVoiceInput } from '@/hooks/useVoiceInput';

interface VoiceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onTranscriptChange?: (text: string) => void;
  language?: string;
  continuous?: boolean;
  activeClassName?: string;
  icon?: String  | React.ReactNode;
  inactiveClassName?: string;
  showIndicator?: boolean;
}

export const VoiceButton = ({
  onTranscriptChange,
  language = 'en-US',
  continuous = false,
  activeClassName = 'bg-red-500',
  inactiveClassName = 'bg-blue-500',
  showIndicator = true,
  className = '',
  icon = '',
  children,
  ...props
}: VoiceButtonProps) => {
  const {
    isListening,
    toggleListening,
    isSupported,
    error,
  } = useVoiceInput({ onTranscriptChange, language, continuous });

  if (!isSupported) {
    console.warn(error);
    return (
      <button {...props} className={className} disabled>
        {children}
      </button>
    );
  }

  return (
    <button
      {...props}
      type="button"
      onClick={toggleListening}
      className={`${className} ${isListening ? activeClassName : inactiveClassName}`}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      {children}
      {showIndicator && (
        <span className={`ml-2 inline-block w-2 h-2 rounded-full ${
          isListening ? 'bg-purple-500 animate-pulse' : 'bg-transparent'
        }`} />
      )}
    </button>
  );
};