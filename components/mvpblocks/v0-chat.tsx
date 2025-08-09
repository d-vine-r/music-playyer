'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea';
import {
  Annoyed,
  Smile,
  Meh,
  Laugh,
  ArrowUpIcon,
  Mic,
  PlusIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackgroundGradientAnimation } from '../ui/background-gradient-animation';
import { VoiceButton } from '@/components/voicebox';

// Variable to store chat result
let Chatresult = '';

export function VercelV0Chat() {
  const [value, setValue] = useState('');
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 40,
    maxHeight: 100,
  });
  const router = useRouter();

  // Function to store textarea input in Chatresult and localStorage
  function storeChatResult() {
    Chatresult = value;
    if (typeof window !== 'undefined') {
      localStorage.setItem('Chatresult', value);
    }
  }

  // Only append new transcript segments
  const [lastTranscript, setLastTranscript] = useState('');
  const handleTranscript = useCallback((transcript: string) => {
    if (transcript && transcript !== lastTranscript) {
      const newPart = transcript.replace(lastTranscript, '');
      setValue(prev => prev + (prev && newPart ? ' ' : '') + newPart);
      setLastTranscript(transcript);
    }
    if (!transcript) {
      setLastTranscript('');
    }
  }, [lastTranscript]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        setValue('');
        adjustHeight(true);
        storeChatResult();
        router.push('/result');
      }
    }
  };

  return (
    
      <div className="mx-auto h-screen flex w-full max-w-4xl flex-col items-center space-y-4 md:space-y-8 px-4 sm:px-8">
        <BackgroundGradientAnimation>
          <div className="absolute overflow-hidden w-full mx-auto space-y-10 h-screen z-50 inset-0 flex flex-col items-center justify-center text-white font-bold px-2 text-2xl text-center sm:text-3xl md:text-4xl lg:text-7xl">
            <h3 className='font-mont text-2xl sm:text-4xl align-top text-white'>MUSON</h3>
            <h1 className="bg-clip-text text-transparent drop-shadow-2xl pointer-events-none text-4xl sm:text-7xl bg-gradient-to-b from-white/80 to-white/20">
              How are you feeling?
            </h1>

            <div className="w-full">
              <div className="shadow-lg bg-secondary/20 relative rounded-xl">
                <div className="overflow-y-auto">
                  <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Tell us how ure feeling..."
                    className={cn(
                      'w-full px-2 sm:px-4 py-2 sm:py-3',
                      'resize-none',
                      'bg-transparent',
                      'border-none',
                      'text-sm sm:text-base',
                      'focus:outline-none',
                      'focus-visible:ring-0 focus-visible:ring-offset-0',
                      'placeholder:text-sm',
                      'min-h-[60px]',
                    )}
                    style={{
                      overflow: 'hidden',
                    }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-2 sm:p-3 gap-2 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <VoiceButton
                      onTranscriptChange={handleTranscript}
                      className="p-2 px-1.5 py-1.5 text-sm rounded-lg text-black cursor-pointer hover:bg-gray-200 transition-colors"
                      icon={<Mic className="h-5 w-5" />}
                      activeClassName="bg-red-500"
                      inactiveClassName="bg-white"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </VoiceButton>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={cn(
                        'border-border flex items-center justify-between gap-1 rounded-lg border px-1.5 py-1.5 text-sm transition-colors',
                        value.trim() ? 'bg-white text-black' : 'text-zinc-400',
                      )}
                      onClick={() => {
                        if (value.trim()) {
                          storeChatResult();
                          router.push('/result');
                        }
                      }}
                    >
                      <ArrowUpIcon
                        className={cn(
                          'h-4 w-4',
                          value.trim() ? 'text-black' : 'text-zinc-400',
                        )}
                      />
                      <span className="sr-only">Send</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="-mx-2 mt-4 px-2 sm:mx-0 sm:px-0">
                <div className="flex flex-col flex-wrap items-start text-white gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3 sm:overflow-x-auto sm:pb-2">
                  <ActionButton
                    icon={<Annoyed className="h-4 w-4" />}
                    label="Moody"
                    onSelect={setValue}
                  />
                  <ActionButton
                    icon={<Smile className="h-4 w-4" />}
                    label="Happy"
                    onSelect={setValue}
                  />
                  <ActionButton
                    icon={<Laugh className="h-4 w-4" />}
                    label="Joyful"
                    onSelect={setValue}
                  />
                  <ActionButton
                    icon={<Meh className="h-4 w-4" />}
                    label="Depressed"
                    onSelect={setValue}
                  />
                </div>
              </div>
            </div>
          </div>
        </BackgroundGradientAnimation>
      </div>

  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onSelect?: (label: string) => void;
}

function ActionButton({ icon, label, onSelect }: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="bg-secondary/20 flex cursor-pointer w-full flex-shrink-3 hover:bg-muted-secondary items-center gap-2 rounded-full text-white px-3 py-2 whitespace-nowrap transition-colors sm:w-auto sm:px-4"
      onClick={() => onSelect && onSelect(label)}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}

export default VercelV0Chat;
