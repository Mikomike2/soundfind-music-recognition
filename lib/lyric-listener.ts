/**
 * AI Lyric Listener using Web Speech API
 * Transcribes live vocal lyrics in real-time to match songs even when fingerprinting quotas are exhausted
 */

export class LyricListener {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private transcripts: string[] = [];
  private isListening = false;
  private onTranscriptUpdate?: (text: string) => void;

  constructor(onUpdate?: (text: string) => void) {
    this.onTranscriptUpdate = onUpdate;

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechClass) {
        try {
          this.recognition = new SpeechClass();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.maxAlternatives = 2;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.recognition.onresult = (event: any) => {
            let current = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const text = event.results[i][0].transcript;
              if (text) {
                current += ' ' + text;
                this.transcripts.push(text.trim());
              }
            }
            if (this.onTranscriptUpdate && current.trim()) {
              this.onTranscriptUpdate(current.trim());
            }
          };

          this.recognition.onerror = () => {
            // Non-fatal error in speech recognition
          };
        } catch {
          // Browser speech recognition setup failure
        }
      }
    }
  }

  public start() {
    this.transcripts = [];
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch {
        // Ignore if already active
      }
    }
  }

  public stop(): string {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
      this.isListening = false;
    }

    // Filter unique clean phrases and join
    const unique = Array.from(new Set(this.transcripts.filter((t) => t.length > 3)));
    return unique.join(' ').trim();
  }

  public get supported(): boolean {
    return this.recognition !== null;
  }
}
