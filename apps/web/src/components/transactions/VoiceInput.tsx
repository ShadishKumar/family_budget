import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, X } from 'lucide-react';
import { isSpeechSupported, startListening, stopListening, parseSpokenTransaction } from '../../utils/speech';
import { TransactionType } from '@family-budget/shared';

interface VoiceInputProps {
  onResult: (data: { amount?: number; description?: string; type?: TransactionType }) => void;
  onClose: () => void;
}

export default function VoiceInput({ onResult, onClose }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const transcriptRef = useRef('');

  const supported = isSpeechSupported();

  useEffect(() => {
    return () => stopListening();
  }, []);

  const handleStart = useCallback(() => {
    setTranscript('');
    setError('');
    transcriptRef.current = '';
    setIsListening(true);
    startListening(
      (text) => {
        transcriptRef.current = text;
        setTranscript(text);
      },
      (err) => {
        setError(err);
        setIsListening(false);
      }
    );
  }, []);

  const handleStop = useCallback(() => {
    stopListening();
    setIsListening(false);
    if (transcriptRef.current) {
      const parsed = parseSpokenTransaction(transcriptRef.current);
      onResult(parsed);
    }
  }, [onResult]);

  // Support keyboard: hold Space to record
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isListening && e.target === document.body) {
        e.preventDefault();
        handleStart();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isListening) {
        e.preventDefault();
        handleStop();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isListening, handleStart, handleStop]);

  if (!supported) {
    return (
      <div className="p-4 bg-yellow-50 border-b">
        <p className="text-sm text-yellow-700">
          Speech recognition is not supported in this browser. Try Chrome or Edge.
        </p>
        <button onClick={onClose} className="text-sm text-yellow-600 underline mt-1">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-primary-50 border-b">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-primary-900">Voice Input</h4>
        <button onClick={onClose} className="text-primary-400 hover:text-primary-600">
          <X size={18} />
        </button>
      </div>

      <div className="text-center">
        <button
          onMouseDown={handleStart}
          onMouseUp={handleStop}
          onMouseLeave={() => { if (isListening) handleStop(); }}
          onTouchStart={(e) => { e.preventDefault(); handleStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); handleStop(); }}
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all select-none ${
            isListening
              ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-200 animate-pulse'
              : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
          }`}
        >
          <Mic size={32} />
        </button>

        <p className="text-sm text-primary-700 mt-3 font-medium">
          {isListening ? 'Listening... Release to stop' : 'Hold the mic to speak'}
        </p>

        {transcript && (
          <div className="mt-3 p-3 bg-white rounded-lg text-sm text-gray-700 border border-primary-100">
            "{transcript}"
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <p className="text-xs text-primary-500 mt-3">
          Hold mic or press & hold <kbd className="px-1 py-0.5 bg-white rounded border text-xs">Space</kbd> — Try: "Spent 500 rupees on groceries"
        </p>
      </div>
    </div>
  );
}
