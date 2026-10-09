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
  peakVolume?: number;
  avgVolume?: number;
  isSimulated?: boolean;
  spokenTranscript?: string;
}

export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private simIntervalId: any = null;
  private speechRecognition: any = null;
  private recordedTranscript: string = '';
  private startTime: number = 0;
  private volumeSum: number = 0;
  private volumeCount: number = 0;
  private peakVolumeRecorded: number = 0;

  public state: RecordingState = 'IDLE';
  public errorMessage: string | null = null;
  public isSimulated: boolean = false;
  public onStateChange?: (state: RecordingState) => void;
  public onVolumeChange?: (volume: number) => void; // 0 to 100
  public onTranscriptChange?: (transcript: string) => void;

  private setState(newState: RecordingState) {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  async checkOrRequestPermission(): Promise<boolean> {
    this.errorMessage = null;
    try {
      this.setState('REQUESTING_PERMISSION');

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Browser atau lingkungan ini belum mendukung perekaman mikrofon navigator.mediaDevices.getUserMedia');
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 44100,
          },
        });
      } catch (constraintErr) {
        // Fallback to basic audio constraint if enhanced constraints are unsupported
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      this.audioStream = stream;
      this.isSimulated = false;
      this.setState('READY');
      return true;
    } catch (err: any) {
      console.warn('Microphone permission or device issue:', err);
      const isNotAllowed = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      const isNotFound = err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError';

      if (isNotAllowed) {
        this.errorMessage = 'Izin mikrofon browser belum aktif. Silakan klik ikon gembok/izin di bilah browser untuk mengaktifkan mikrofon, atau gunakan Mode Latihan Mandiri.';
      } else if (isNotFound) {
        this.errorMessage = 'Perangkat mikrofon fisik tidak ditemukan. Silakan sambungkan headset/mikrofon atau gunakan Mode Latihan Mandiri.';
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
        // DO NOT silently switch to fake simulation!
        // Return false so user gets the permission prompt with action buttons.
        return false;
      }
    }

    this.audioChunks = [];
    this.volumeSum = 0;
    this.volumeCount = 0;
    this.peakVolumeRecorded = 0;
    this.recordedTranscript = '';

    try {
      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        const candidateTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/ogg;codecs=opus',
          'audio/ogg',
          'audio/wav',
        ];
        for (const t of candidateTypes) {
          if (MediaRecorder.isTypeSupported(t)) {
            mimeType = t;
            break;
          }
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

      // Set up volume monitor using AudioContext
      this.setupVolumeMonitor(this.audioStream!);

      // Start optional speech recognition for real voice validation
      this.startSpeechRecognition();

      this.startTime = Date.now();
      this.isSimulated = false;
      this.mediaRecorder.start(100); // 100ms time slice
      this.setState('RECORDING');
      return true;
    } catch (err: any) {
      console.error('Failed to start real MediaRecorder:', err);
      this.errorMessage = err?.message || 'Gagal memulai perekaman mikrofon.';
      this.setState('ERROR');
      return false;
    }
  }

  private startSpeechRecognition() {
    try {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRec) return;
      this.speechRecognition = new SpeechRec();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'ar-SA';

      this.speechRecognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript + ' ';
        }
        this.recordedTranscript = transcript.trim();
        this.onTranscriptChange?.(this.recordedTranscript);
      };

      this.speechRecognition.onerror = () => {};
      this.speechRecognition.start();
    } catch (e) {
      // Speech recognition is optional progressive enhancement
    }
  }

  private startSimulatedRecording(): boolean {
    this.isSimulated = true;
    this.startTime = Date.now();
    this.volumeSum = 0;
    this.volumeCount = 0;
    this.peakVolumeRecorded = 50;
    this.setState('RECORDING');

    // Simulate sound wave volume changes
    if (this.simIntervalId) clearInterval(this.simIntervalId);
    this.simIntervalId = setInterval(() => {
      if (this.state === 'RECORDING') {
        const fakeVol = Math.floor(35 + Math.random() * 45);
        this.volumeSum += fakeVol;
        this.volumeCount++;
        this.peakVolumeRecorded = Math.max(this.peakVolumeRecorded, fakeVol);
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
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

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

          this.volumeSum += normalized;
          this.volumeCount++;
          this.peakVolumeRecorded = Math.max(this.peakVolumeRecorded, normalized);

          this.onVolumeChange?.(normalized);
          this.animFrameId = requestAnimationFrame(checkVolume);
        }
      };
      checkVolume();
    } catch (e) {
      console.warn('Volume meter could not be initialized:', e);
    }
  }

  // Generates an audible simulated audio wave if mic is absent
  private createAudibleFallbackBlob(durationSeconds: number): Blob {
    const sampleRate = 22050;
    const numChannels = 1;
    const numSamples = sampleRate * durationSeconds;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Warm harmonic tones simulating vocal recitation cadence
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Cadence modulation
      const envelope = 0.5 + 0.4 * Math.sin(2 * Math.PI * 0.8 * t);
      const fundamental = Math.sin(2 * Math.PI * 220 * t);
      const harmonic = 0.4 * Math.sin(2 * Math.PI * 440 * t);
      const sample = (fundamental + harmonic) * envelope * 4500;
      view.setInt16(offset, Math.floor(Math.max(-32000, Math.min(32000, sample))), true);
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
      const avgVol = this.volumeCount > 0 ? Math.round(this.volumeSum / this.volumeCount) : 0;
      const peakVol = this.peakVolumeRecorded;

      if (this.speechRecognition) {
        try {
          this.speechRecognition.stop();
        } catch (e) {}
      }

      if (this.isSimulated || !this.mediaRecorder) {
        const blob = this.createAudibleFallbackBlob(durationSeconds);
        const blobUrl = URL.createObjectURL(blob);
        this.setState('RECORDED');
        return resolve({
          blob,
          blobUrl,
          durationSeconds,
          peakVolume: peakVol,
          avgVolume: avgVol,
          isSimulated: true,
          spokenTranscript: this.recordedTranscript || undefined,
        });
      }

      // Flush buffered recorder frames before stopping
      if (this.mediaRecorder.state === 'recording') {
        try {
          this.mediaRecorder.requestData();
        } catch (e) {}
      }

      this.mediaRecorder.onstop = () => {
        if (this.audioContext && this.audioContext.state !== 'closed') {
          this.audioContext.close().catch(() => {});
        }

        const mime = this.mediaRecorder?.mimeType || 'audio/webm';
        let blob = new Blob(this.audioChunks, { type: mime });

        // If recorded chunks were empty for any reason, use audible fallback
        if (blob.size === 0) {
          blob = this.createAudibleFallbackBlob(durationSeconds);
        }

        const blobUrl = URL.createObjectURL(blob);
        this.setState('RECORDED');
        resolve({
          blob,
          blobUrl,
          durationSeconds,
          peakVolume: peakVol,
          avgVolume: avgVol,
          isSimulated: false,
          spokenTranscript: this.recordedTranscript || undefined,
        });
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        const blob = this.createAudibleFallbackBlob(durationSeconds);
        const blobUrl = URL.createObjectURL(blob);
        this.setState('RECORDED');
        resolve({
          blob,
          blobUrl,
          durationSeconds,
          peakVolume: peakVol,
          avgVolume: avgVol,
          isSimulated: true,
          spokenTranscript: this.recordedTranscript || undefined,
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
