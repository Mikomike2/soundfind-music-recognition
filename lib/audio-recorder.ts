/**
 * Audio Recorder using MediaStream, MediaRecorder, and Web Audio API
 * Provides audio capture and real-time frequency analysis for visualizers
 */

export interface RecorderVisualizerHooks {
  onFrequencyData?: (dataArray: Uint8Array) => void;
  onVolumeChange?: (volume: number) => void;
}

export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private isRecording = false;
  private mimeType = 'audio/webm';

  /**
   * Determine the best supported audio mime type
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
      ''
    ];

    for (const type of types) {
      if (!type || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type))) {
        return type;
      }
    }
    return '';
  }

  /**
   * Check if microphone permission is granted or available
   */
  public static async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return 'denied';
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as any });
        return permissionStatus.state;
      }
    } catch {
      // Permission API not fully supported for mic in all browsers
    }
    return 'prompt';
  }

  /**
   * Start microphone audio capture and Web Audio visualizer
   */
  public async start(hooks?: RecorderVisualizerHooks, customStream?: MediaStream): Promise<void> {
    if (this.isRecording) {
      return;
    }

    this.audioChunks = [];

    // Use custom stream if provided (e.g. Tab/system audio), or request microphone
    if (customStream) {
      this.mediaStream = customStream;
    } else {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false, // Critical for music: do not filter out speaker output
            noiseSuppression: false, // Preserve music harmonics and instruments
            autoGainControl: false,  // Do not compress music dynamic range
          },
        });
      } catch {
        // Fallback to basic audio constraints if advanced properties are unsupported
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    }

    // Set up Web Audio API Analyser
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      this.audioContext = new AudioContextClass();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;
      this.sourceNode.connect(this.analyser);

      // Start frequency analysis loop if hooks provided
      if (hooks?.onFrequencyData || hooks?.onVolumeChange) {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const analyze = () => {
          if (!this.isRecording || !this.analyser) return;

          this.analyser.getByteFrequencyData(dataArray);

          if (hooks.onFrequencyData) {
            hooks.onFrequencyData(dataArray);
          }

          if (hooks.onVolumeChange) {
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            // Normalized 0 to 1
            hooks.onVolumeChange(Math.min(1, average / 128));
          }

          this.animationFrameId = requestAnimationFrame(analyze);
        };

        this.animationFrameId = requestAnimationFrame(analyze);
      }
    }

    // Initialize MediaRecorder with high quality 128kbps bitrate
    this.mimeType = this.getSupportedMimeType();
    const options: MediaRecorderOptions = {
      audioBitsPerSecond: 128000,
    };
    if (this.mimeType) {
      options.mimeType = this.mimeType;
    }

    this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250); // Collect in 250ms chunks
    this.isRecording = true;
  }

  /**
   * Stop recording and return the accumulated audio Blob
   */
  public stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        this.cleanup();
        reject(new Error('Recorder is not active'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          const finalMimeType = this.mimeType || this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: finalMimeType });
          this.cleanup();
          resolve(audioBlob);
        } catch (err) {
          this.cleanup();
          reject(err);
        }
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        this.cleanup();
        reject(err);
      }
    });
  }

  /**
   * Cancel and cleanup immediately without saving
   */
  public cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // Ignore
      }
    }
    this.cleanup();
  }

  /**
   * Release hardware stream, audio nodes, and animation frames
   */
  private cleanup(): void {
    this.isRecording = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // Ignore
      }
      this.sourceNode = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {
        // Ignore
      }
      this.audioContext = null;
    }

    this.analyser = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  public get recording(): boolean {
    return this.isRecording;
  }
}
