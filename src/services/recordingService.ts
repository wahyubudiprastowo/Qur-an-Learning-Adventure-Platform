export type RecordingState =
  | 'IDLE'
  | 'REQUESTING_PERMISSION'
  | 'READY'
  | 'RECORDING'
  | 'RECORDED'
  | 'ERROR';

export interface RecordingResult {
  blob: Blob;
  blobUrl: string;
  durationSeconds: number;
}

export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private startTime: number = 0;

  public state: RecordingState = 'IDLE';
  public onStateChange?: (state: RecordingState) => void;
  public onVolumeChange?: (volume: number) => void; // 0 to 100

  private setState(newState: RecordingState) {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  async checkOrRequestPermission(): Promise<boolean> {
    try {
      this.setState('REQUESTING_PERMISSION');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.audioStream = stream;
      this.setState('READY');
      return true;
    } catch (err) {
      console.error('Microphone permission denied or unavailable:', err);
      this.setState('ERROR');
      return false;
    }
  }

  async startRecording(): Promise<void> {
    if (!this.audioStream) {
      const ok = await this.checkOrRequestPermission();
      if (!ok) return;
    }

    this.audioChunks = [];
    try {
      const options = { mimeType: 'audio/webm' };
      // Fallback for Safari/iOS
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.audioStream!, { mimeType })
        : new MediaRecorder(this.audioStream!);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Set up volume monitor
      this.setupVolumeMonitor(this.audioStream!);

      this.startTime = Date.now();
      this.mediaRecorder.start(100);
      this.setState('RECORDING');
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      this.setState('ERROR');
    }
  }

  private setupVolumeMonitor(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (this.state === 'RECORDING' && this.analyser) {
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          this.onVolumeChange?.(normalized);
          this.animFrameId = requestAnimationFrame(checkVolume);
        }
      };
      checkVolume();
    } catch (e) {
      console.warn('Volume meter could not be initialized:', e);
    }
  }

  stopRecording(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.state !== 'RECORDING') {
        return reject(new Error('Recorder is not recording'));
      }

      this.mediaRecorder.onstop = () => {
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        if (this.audioContext && this.audioContext.state !== 'closed') {
          this.audioContext.close().catch(() => {});
        }

        const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
        const mime = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mime });
        const blobUrl = URL.createObjectURL(blob);

        this.setState('RECORDED');
        resolve({
          blob,
          blobUrl,
          durationSeconds,
        });
      };

      this.mediaRecorder.stop();
    });
  }

  cancelRecording(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }
    if (this.mediaRecorder && this.state === 'RECORDING') {
      this.mediaRecorder.stop();
    }
    this.audioChunks = [];
    this.setState('READY');
  }

  cleanup(): void {
    this.cancelRecording();
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
    this.setState('IDLE');
  }
}
