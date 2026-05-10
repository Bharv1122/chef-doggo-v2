import { useState, useEffect, useRef, useCallback } from 'react';

export type VoiceCommand =
  | 'START_COOKING' | 'NEXT_STEP' | 'PREV_STEP' | 'REPEAT_STEP'
  | 'READ_INGREDIENTS' | 'SET_TIMER' | 'SAVE_RECIPE'
  | 'ADD_TO_SHOPPING' | 'MAKE_CHEAPER' | 'STOP_LISTENING';

// Minimal subset of the Web Speech API surface we use. The native lib.dom types
// don't ship with SpeechRecognition (still experimental / vendor-prefixed), so
// we declare just what we need.
interface SRAlternative { transcript: string }
interface SRResult { isFinal: boolean; 0: SRAlternative; length: number }
interface SREvent { results: ArrayLike<SRResult> }
interface SRInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SRWindow = Window & {
  SpeechRecognition?: new () => SRInstance;
  webkitSpeechRecognition?: new () => SRInstance;
};

const COMMAND_MAP: Array<{ phrases: string[]; command: VoiceCommand }> = [
  { phrases: ['start cooking', 'begin', 'let\'s go'], command: 'START_COOKING' },
  { phrases: ['next', 'next step', 'continue', 'go on', 'forward'], command: 'NEXT_STEP' },
  { phrases: ['back', 'previous', 'previous step', 'go back'], command: 'PREV_STEP' },
  { phrases: ['repeat', 'say again', 'again', 'what did you say', 'repeat step'], command: 'REPEAT_STEP' },
  { phrases: ['ingredients', 'read ingredients', 'what do i need', 'ingredient list'], command: 'READ_INGREDIENTS' },
  { phrases: ['save', 'save recipe', 'save this'], command: 'SAVE_RECIPE' },
  { phrases: ['add to shopping', 'add to list', 'shopping list'], command: 'ADD_TO_SHOPPING' },
  { phrases: ['cheaper', 'make it cheaper', 'budget', 'less expensive'], command: 'MAKE_CHEAPER' },
  { phrases: ['stop', 'stop listening', 'pause', 'quiet'], command: 'STOP_LISTENING' },
];

function parseCommand(transcript: string): VoiceCommand | null {
  const lower = transcript.toLowerCase().trim();
  for (const { phrases, command } of COMMAND_MAP) {
    if (phrases.some(p => lower.includes(p))) return command;
  }
  return null;
}

// Detect browser support once at module level
const hasSpeechRecognition =
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

const hasSpeechSynthesis =
  typeof window !== 'undefined' && 'speechSynthesis' in window;

export function useVoice(onCommand?: (cmd: VoiceCommand) => void) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  // hasSpeechRecognition / hasSpeechSynthesis are evaluated once at module load with
  // a typeof-window guard, so it's safe to use them as initial state directly. The
  // previous useEffect+setSupported pattern caused an unnecessary cascading render.
  const [supported] = useState({ recognition: hasSpeechRecognition, synthesis: hasSpeechSynthesis });
  const recognitionRef = useRef<SRInstance | null>(null);

  const speak = useCallback((text: string, rate = 0.9) => {
    if (!hasSpeechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate;
    utt.pitch = 1;
    window.speechSynthesis.speak(utt);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (hasSpeechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const startListening = useCallback(() => {
    if (!hasSpeechRecognition) return;
    const SR = (window as SRWindow).SpeechRecognition ?? (window as SRWindow).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (e: SREvent) => {
      const last = e.results[e.results.length - 1];
      if (!last.isFinal) return;
      const text = last[0].transcript;
      setTranscript(text);
      const cmd = parseCommand(text);
      if (cmd) {
        onCommand?.(cmd);
        if (cmd === 'STOP_LISTENING') {
          recognitionRef.current?.stop();
          recognitionRef.current = null;
          setListening(false);
        }
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (hasSpeechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  return { listening, transcript, supported, startListening, stopListening, speak, stopSpeaking };
}
