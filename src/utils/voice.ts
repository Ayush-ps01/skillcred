export interface VoiceListener {
  onResult: (text: string) => void;
  onEnd?: () => void;
}

export interface SpeechController {
  start: () => boolean;
  stop: () => void;
  isSupported: boolean;
}

export function createSpeechRecognizer(listener: VoiceListener): SpeechController {
  const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return { start: () => false, stop: () => {}, isSupported: false };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener('result', (event: any) => {
    const transcript = Array.from(event.results)
      .map((r: any) => r[0]?.transcript)
      .filter(Boolean)
      .join(' ');
    if (transcript) listener.onResult(transcript);
  });

  recognition.addEventListener('end', () => {
    if (listener.onEnd) listener.onEnd();
  });

  return {
    start: () => {
      try { recognition.start(); return true; } catch { return false; }
    },
    stop: () => {
      try { recognition.stop(); } catch {}
    },
    isSupported: true,
  };
}






