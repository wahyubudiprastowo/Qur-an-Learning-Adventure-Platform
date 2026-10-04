import { getAyahAudioUrl, getAyahAudioFallbackUrl } from '../data/recitersData';

export type PlaybackState = 'IDLE' | 'LOADING' | 'PLAYING' | 'PAUSED' | 'ENDED' | 'ERROR';

export interface AudioProgressInfo {
  currentTimeMs: number;
  durationMs: number;
  surahNumber: number;
  ayahNumber: number;
  currentAyahRepeat: number;
  totalAyahRepeat: number;
  currentBlockRepeat: number;
  totalBlockRepeat: number; // -1 for infinity
}

type AudioStopListener = () => void;

/**
 * Global audio manager to guarantee single-channel audio playback across the entire app.
 * Completely prevents any simultaneous audio playback between Ziadah, Tilawah, Dengar, Murojaah, and Quizzes.
 */
export class GlobalAudioManager {
  private static activePlayers = new Set<QuranAudioPlayer>();
  private static activeRawAudios = new Set<HTMLAudioElement>();
  private static stopListeners = new Set<AudioStopListener>();

  static registerPlayer(player: QuranAudioPlayer) {
    this.activePlayers.add(player);
  }

  static unregisterPlayer(player: QuranAudioPlayer) {
    this.activePlayers.delete(player);
  }

  static registerRawAudio(audio: HTMLAudioElement) {
    this.activeRawAudios.add(audio);
  }

  static unregisterRawAudio(audio: HTMLAudioElement) {
    this.activeRawAudios.delete(audio);
  }

  /**
   * Called immediately before or when any audio starts playing.
   * Pauses and resets all other audio sources across all modules.
   */
  static notifyPlayStarted(source: QuranAudioPlayer | HTMLAudioElement) {
    // 1. Pause and stop all other QuranAudioPlayer instances (Ziadah, Dengar, Murojaah)
    for (const player of this.activePlayers) {
      if (player !== source) {
        player.pause();
      }
    }

    // 2. Pause and disarm all other HTMLAudioElement instances (Tilawah, Quizzes, Recordings)
    for (const audio of Array.from(this.activeRawAudios)) {
      if (audio !== source) {
        try {
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
          audio.currentTime = 0;
          this.activeRawAudios.delete(audio);
        } catch (e) {}
      }
    }

    // 3. Notify stop listeners so UI components update their play/pause indicators
    for (const listener of Array.from(this.stopListeners)) {
      try {
        listener();
      } catch (e) {}
    }
  }

  /**
   * Stops all active audio across the app (invoked on navigation, tab switch, etc.)
   */
  static stopAll() {
    for (const player of this.activePlayers) {
      try {
        player.stop();
      } catch (e) {}
    }

    for (const audio of Array.from(this.activeRawAudios)) {
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    }
    this.activeRawAudios.clear();

    for (const listener of Array.from(this.stopListeners)) {
      try {
        listener();
      } catch (e) {}
    }
  }

  static addStopListener(listener: AudioStopListener): () => void {
    this.stopListeners.add(listener);
    return () => {
      this.stopListeners.delete(listener);
    };
  }
}

export class QuranAudioPlayer {
  private audio: HTMLAudioElement;
  public state: PlaybackState = 'IDLE';

  public reciterId: string = 'alafasy';
  public surahNumber: number = 1;
  public startAyah: number = 1;
  public endAyah: number = 7;
  public currentAyah: number = 1;

  public targetAyahRepeats: number = 1;
  public currentAyahRepeat: number = 1;

  public targetBlockRepeats: number = 1; // -1 for infinity
  public currentBlockRepeat: number = 1;

  public playbackRate: number = 1.0;
  public singleAyahMode: boolean = false; // When true, plays only the selected ayah

  private isFallingBack: boolean = false;
  private currentPlayToken: number = 0;

  // Listeners
  public onStateChange?: (state: PlaybackState) => void;
  public onProgressUpdate?: (info: AudioProgressInfo) => void;
  public onAyahChange?: (ayahNumber: number) => void;
  public onBlockCycleComplete?: (completedCount: number) => void;
  public onError?: (errorMsg: string) => void;

  constructor() {
    this.audio = new Audio();
    GlobalAudioManager.registerPlayer(this);
    this.setupListeners();
  }

  private setupListeners() {
    this.audio.addEventListener('play', () => {
      GlobalAudioManager.notifyPlayStarted(this);
      this.state = 'PLAYING';
      this.onStateChange?.('PLAYING');
    });

    this.audio.addEventListener('pause', () => {
      if (this.state !== 'ENDED' && this.state !== 'ERROR') {
        this.state = 'PAUSED';
        this.onStateChange?.('PAUSED');
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.state === 'PLAYING') {
        this.onProgressUpdate?.({
          currentTimeMs: Math.round(this.audio.currentTime * 1000),
          durationMs: Math.round((this.audio.duration || 0) * 1000),
          surahNumber: this.surahNumber,
          ayahNumber: this.currentAyah,
          currentAyahRepeat: this.currentAyahRepeat,
          totalAyahRepeat: this.targetAyahRepeats,
          currentBlockRepeat: this.currentBlockRepeat,
          totalBlockRepeat: this.targetBlockRepeats,
        });
      }
    });

    this.audio.addEventListener('ended', () => {
      this.handleAyahEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio error on src:', this.audio.src, e);
      if (!this.isFallingBack) {
        this.isFallingBack = true;
        const fallbackUrl = getAyahAudioFallbackUrl(this.reciterId, this.surahNumber, this.currentAyah);
        if (this.audio.src !== fallbackUrl) {
          this.audio.src = fallbackUrl;
          this.audio.play().catch(() => {});
          return;
        }
      }
      this.state = 'ERROR';
      this.onStateChange?.('ERROR');
      this.onError?.('Gagal memuat audio qari. Silakan coba lagi.');
    });
  }

  public setConfiguration(params: {
    reciterId: string;
    surahNumber: number;
    startAyah: number;
    endAyah: number;
    ayahRepeats: number;
    blockRepeats: number;
    playbackRate?: number;
    singleAyahMode?: boolean;
  }) {
    this.reciterId = params.reciterId;
    this.surahNumber = params.surahNumber;
    this.startAyah = params.startAyah;
    this.endAyah = params.endAyah;
    this.currentAyah = params.startAyah;
    this.targetAyahRepeats = params.ayahRepeats;
    this.currentAyahRepeat = 1;
    this.targetBlockRepeats = params.blockRepeats;
    this.currentBlockRepeat = 1;
    this.singleAyahMode = params.singleAyahMode ?? false;
    if (params.playbackRate) {
      this.setSpeed(params.playbackRate);
    }
  }

  public setSpeed(rate: number) {
    this.playbackRate = rate;
    this.audio.playbackRate = rate;
  }

  public loadCurrentAyah(): void {
    this.isFallingBack = false;
    const url = getAyahAudioUrl(this.reciterId, this.surahNumber, this.currentAyah);
    this.audio.src = url;
    this.audio.playbackRate = this.playbackRate;
    this.state = 'LOADING';
    this.onStateChange?.('LOADING');
    this.onAyahChange?.(this.currentAyah);
  }

  public async play(): Promise<void> {
    const token = ++this.currentPlayToken;
    GlobalAudioManager.notifyPlayStarted(this);
    if (!this.audio.src || this.audio.src === '' || this.state === 'IDLE' || this.state === 'ENDED') {
      this.loadCurrentAyah();
    }
    try {
      await this.audio.play();
    } catch (err) {
      if (token !== this.currentPlayToken) return;
      console.warn('Play was interrupted or waiting user gesture:', err);
    }
  }

  public pause(): void {
    this.currentPlayToken++;
    try {
      this.audio.pause();
    } catch (e) {}
    this.state = 'PAUSED';
    this.onStateChange?.('PAUSED');
  }

  public stop(): void {
    this.currentPlayToken++;
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
    } catch (e) {}
    this.state = 'IDLE';
    this.onStateChange?.('IDLE');
  }

  public togglePlayPause(): void {
    if (this.state === 'PLAYING') {
      this.pause();
    } else {
      this.play();
    }
  }

  public nextAyah(): void {
    if (this.currentAyah < this.endAyah) {
      this.currentAyah++;
      this.currentAyahRepeat = 1;
      this.loadCurrentAyah();
      this.play();
    } else {
      this.handleBlockComplete();
    }
  }

  public previousAyah(): void {
    if (this.currentAyah > this.startAyah) {
      this.currentAyah--;
      this.currentAyahRepeat = 1;
      this.loadCurrentAyah();
      this.play();
    } else {
      this.audio.currentTime = 0;
      this.play();
    }
  }

  public jumpToAyah(ayahNumber: number, singleOnly: boolean = false): void {
    this.currentAyah = ayahNumber;
    this.currentAyahRepeat = 1;
    if (singleOnly) {
      this.singleAyahMode = true;
    }
    this.loadCurrentAyah();
    this.play();
  }

  private handleAyahEnded(): void {
    // If not playing or player was preempted by another module, stop immediately!
    if (this.state !== 'PLAYING') {
      return;
    }

    // If single ayah mode is enabled (user selected one specific ayah to hear)
    if (this.singleAyahMode) {
      if (this.currentAyahRepeat < this.targetAyahRepeats) {
        this.currentAyahRepeat++;
        this.audio.currentTime = 0;
        this.play();
        return;
      }
      this.state = 'ENDED';
      this.onStateChange?.('ENDED');
      return;
    }

    // Check if ayah repetition is needed
    if (this.currentAyahRepeat < this.targetAyahRepeats) {
      this.currentAyahRepeat++;
      this.audio.currentTime = 0;
      this.play();
      return;
    }

    // Move to next ayah in range
    if (this.currentAyah < this.endAyah) {
      this.currentAyah++;
      this.currentAyahRepeat = 1;
      this.loadCurrentAyah();
      this.play();
    } else {
      this.handleBlockComplete();
    }
  }

  private handleBlockComplete(): void {
    this.onBlockCycleComplete?.(this.currentBlockRepeat);

    // If infinity or more block repeats remaining
    if (this.targetBlockRepeats === -1 || this.currentBlockRepeat < this.targetBlockRepeats) {
      this.currentBlockRepeat++;
      this.currentAyah = this.startAyah;
      this.currentAyahRepeat = 1;
      this.loadCurrentAyah();
      this.play();
    } else {
      this.state = 'ENDED';
      this.onStateChange?.('ENDED');
    }
  }

  public destroy(): void {
    GlobalAudioManager.unregisterPlayer(this);
    this.stop();
    this.audio.src = '';
  }
}
