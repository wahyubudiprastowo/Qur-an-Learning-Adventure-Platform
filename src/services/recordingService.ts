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
  private simIntervalId: any = null;
  private startTime: number = 0;

  public state: RecordingState = 'IDLE';
  public errorMessage: string | null = null;
  public isSimulated: boolean = false;
  public onStateChange?: (state: RecordingState) => void;
  public onVolumeChange?: (volume: number) => void; // 0 to 100

  private setState(newState: RecordingState) {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  async checkOrRequestPermission(): Promise<boolean> {
    this.errorMessage = null;
    try {
      this.setState('REQUESTING_PERMISSION');

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Browser atau lingkungan ini belum mendukung navigator.mediaDevices.getUserMedia');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioStream = stream;
      this.isSimulated = false;
      this.setState('READY');
      return true;
    } catch (err: any) {
      console.warn('Microphone permission or device issue:', err);
      const isNotAllowed = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      const isNotFound = err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError';

      if (isNotAllowed) {
        this.errorMessage = 'Izin mikrofon belum diberikan di browser. Silakan klik ikon gembok di bilah alamat browser untuk mengizinkan mikrofon, atau gunakan Mode Latihan Mandiri.';
      } else if (isNotFound) {
        this.errorMessage = 'Perangkat mikrofon fisik tidak ditemukan. Silakan gunakan Mode Latihan Mandiri.';
      } else {
        this.errorMessage = err?.message || 'Gagal mengakses mikrofon browser.';
      }

      this.setState('ERROR');
      return false;
    }
  }

  async startRecording(forceSimulation: boolean = false): Promise<boolean> {
    this.errorMessage = null;

    if (forceSimulation) {
      return this.startSimulatedRecording();
    }

    // Check if current stream is alive
    const isStreamLive = !!(
      this.audioStream &&
      this.audioStream.active &&
      this.audioStream.getAudioTracks().some((t) => t.readyState === 'live')
    );

    if (!isStreamLive) {
      const ok = await this.checkOrRequestPermission();
      if (!ok) {
        // Fallback to simulated recording if mic is denied or unavailable so the user is never stuck
        console.info('Switching to simulated recording mode due to mic unavailability');
        return this.startSimulatedRecording();
      }
    }

    this.audioChunks = [];
    try {
      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

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
      this.isSimulated = false;
      this.mediaRecorder.start(100);
      this.setState('RECORDING');
      return true;
    } catch (err: any) {
      console.error('Failed to start real MediaRecorder, falling back to simulated recording:', err);
      return this.startSimulatedRecording();
    }
  }

  private startSimulatedRecording(): boolean {
    this.isSimulated = true;
    this.startTime = Date.now();
    this.setState('RECORDING');

    // Simulate sound wave volume changes
    if (this.simIntervalId) clearInterval(this.simIntervalId);
    this.simIntervalId = setInterval(() => {
      if (this.state === 'RECORDING') {
        const fakeVol = Math.floor(35 + Math.random() * 45);
        this.onVolumeChange?.(fakeVol);
      }
    }, 150);

    return true;
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

  // Generates a minimal valid WAV audio file blob (speech-like duration)
  private createSilentWavBlob(durationSeconds: number): Blob {
    const sampleRate = 16000;
    const numChannels = 1;
    const numSamples = sampleRate * durationSeconds;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF identifier
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Subtle gentle hum waveform so it's not pure click
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      // Gentle sine tone at 220Hz with soft amplitude
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * 220 * t) * 800;
      view.setInt16(offset, Math.floor(sample), true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  stopRecording(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (this.state !== 'RECORDING') {
        return reject(new Error('Recorder is not recording'));
      }

      if (this.simIntervalId) clearInterval(this.simIntervalId);
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

      const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      if (this.isSimulated || !this.mediaRecorder) {
        const blob = this.createSilentWavBlob(durationSeconds);
        const blobUrl = URL.createObjectURL(blob);
        this.setState('RECORDED');
        return resolve({
          blob,
          blobUrl,
          durationSeconds,
        });
      }

      this.mediaRecorder.onstop = () => {
        if (this.audioContext && this.audioContext.state !== 'closed') {
          this.audioContext.close().catch(() => {});
        }

        const mime = this.mediaRecorder?.mimeType || 'audio/webm';
        let blob = new Blob(this.audioChunks, { type: mime });

        // If recorded chunks were empty for any reason, create fallback WAV
        if (blob.size === 0) {
          blob = this.createSilentWavBlob(durationSeconds);
        }

        const blobUrl = URL.createObjectURL(blob);
        this.setState('RECORDED');
        resolve({
          blob,
          blobUrl,
          durationSeconds,
        });
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        const blob = this.createSilentWavBlob(durationSeconds);
        const blobUrl = URL.createObjectURL(blob);
        this.setState('RECORDED');
        resolve({
          blob,
          blobUrl,
          durationSeconds,
        });
      }
    });
  }

  cancelRecording(): void {
    if (this.simIntervalId) clearInterval(this.simIntervalId);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }
    if (this.mediaRecorder && this.state === 'RECORDING') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
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
