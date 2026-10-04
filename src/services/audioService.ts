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
   * Hard-stops and resets all other audio sources across all modules.
   */
  static notifyPlayStarted(source: QuranAudioPlayer | HTMLAudioElement) {
    // 1. Hard-stop and disarm all other QuranAudioPlayer instances (Ziadah, Dengar, Murojaah)
    for (const player of this.activePlayers) {
      if (player !== source) {
        try {
          player.stop();
        } catch (e) {}
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
   * Stops and hard-terminates all active audio across the app (invoked on navigation, tab switch, etc.)
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
  private isDestroyed: boolean = false;

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

  private handlePlayEvent = () => {
    if (this.isDestroyed) return;
    GlobalAudioManager.notifyPlayStarted(this);
    this.state = 'PLAYING';
    this.onStateChange?.('PLAYING');
  };

  private handlePauseEvent = () => {
    if (this.isDestroyed) return;
    // If the audio track ended naturally, ignore pause event so handleEndedEvent can proceed with repeat
    if (this.audio.ended) {
      return;
    }
    if (this.state !== 'ENDED' && this.state !== 'ERROR' && this.state !== 'IDLE') {
      this.state = 'PAUSED';
      this.onStateChange?.('PAUSED');
    }
  };

  private handleTimeUpdateEvent = () => {
    if (this.isDestroyed || (this.state !== 'PLAYING' && !this.audio.seeking)) return;
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
  };

  private handleEndedEvent = () => {
    if (this.isDestroyed) return;
    this.handleAyahEnded();
  };

  private handleErrorEvent = (e: any) => {
    if (this.isDestroyed || this.state === 'IDLE' || !this.audio.src) return;
    console.warn('Audio error on src:', this.audio.src, e);
    if (!this.isFallingBack) {
      this.isFallingBack = true;
      const fallbackUrl = getAyahAudioFallbackUrl(this.reciterId, this.surahNumber, this.currentAyah);
      if (this.audio.src !== fallbackUrl && !this.isDestroyed) {
        this.audio.src = fallbackUrl;
        this.audio.play().catch(() => {});
        return;
      }
    }
    this.state = 'ERROR';
    this.onStateChange?.('ERROR');
    this.onError?.('Gagal memuat audio qari. Silakan coba lagi.');
  };

  private setupListeners() {
    this.audio.addEventListener('play', this.handlePlayEvent);
    this.audio.addEventListener('pause', this.handlePauseEvent);
    this.audio.addEventListener('timeupdate', this.handleTimeUpdateEvent);
    this.audio.addEventListener('ended', this.handleEndedEvent);
    this.audio.addEventListener('error', this.handleErrorEvent);
  }

  private removeListeners() {
    this.audio.removeEventListener('play', this.handlePlayEvent);
    this.audio.removeEventListener('pause', this.handlePauseEvent);
    this.audio.removeEventListener('timeupdate', this.handleTimeUpdateEvent);
    this.audio.removeEventListener('ended', this.handleEndedEvent);
    this.audio.removeEventListener('error', this.handleErrorEvent);
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
    if (this.isDestroyed) return;
    this.isFallingBack = false;
    const url = getAyahAudioUrl(this.reciterId, this.surahNumber, this.currentAyah);
    this.audio.src = url;
    this.audio.playbackRate = this.playbackRate;
    this.state = 'LOADING';
    this.onStateChange?.('LOADING');
    this.onAyahChange?.(this.currentAyah);
  }

  public async play(): Promise<void> {
    if (this.isDestroyed) return;
    const token = ++this.currentPlayToken;
    GlobalAudioManager.notifyPlayStarted(this);
    if (!this.audio.src || this.audio.src === '' || this.state === 'IDLE' || this.state === 'ENDED') {
      this.loadCurrentAyah();
    }
    try {
      await this.audio.play();
      if (token !== this.currentPlayToken || this.isDestroyed) {
        this.audio.pause();
        return;
      }
    } catch (err) {
      if (token !== this.currentPlayToken || this.isDestroyed) return;
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
      try {
        this.audio.currentTime = 0;
      } catch (e) {}
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
    if (this.isDestroyed) return;

    // If single ayah mode is enabled (user selected one specific ayah to hear)
    if (this.singleAyahMode) {
      if (this.currentAyahRepeat < this.targetAyahRepeats) {
        this.currentAyahRepeat++;
        try {
          this.audio.currentTime = 0;
        } catch (e) {}
        this.play();
        return;
      }
      this.state = 'ENDED';
      this.onStateChange?.('ENDED');
      return;
    }

    // Check if ayah repetition is needed (e.g. set to 3 times)
    if (this.currentAyahRepeat < this.targetAyahRepeats) {
      this.currentAyahRepeat++;
      try {
        this.audio.currentTime = 0;
      } catch (e) {}
      this.play();
      return;
    }

    // Move to next ayah in block
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
    if (this.isDestroyed) return;
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
    this.isDestroyed = true;
    this.currentPlayToken++;
    GlobalAudioManager.unregisterPlayer(this);
    this.removeListeners();
    this.onStateChange = undefined;
    this.onProgressUpdate = undefined;
    this.onAyahChange = undefined;
    this.onBlockCycleComplete = undefined;
    this.onError = undefined;
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
    } catch (e) {}
    this.state = 'IDLE';
  }
}

/**
 * Synchronized word progress calculator.
 * Prevents highlighter from rushing ahead of audio in long surahs like Al-Baqarah
 * by scaling smoothly according to actual durationMs and word character proportions.
 */
export function getActiveWordIndexFromProgress(
  words: { arabic: string; startMs: number; endMs: number }[] | undefined,
  currentTimeMs: number,
  durationMs: number
): number | null {
  if (!words || words.length === 0) return null;
  if (durationMs > 500) {
    const lengths = words.map((w) =>
      Math.max(2, w.arabic.replace(/[^\u0600-\u06FF]/g, '').length || w.arabic.length)
    );
    const totalLength = lengths.reduce((acc, l) => acc + l, 0);
    const progressFraction = Math.min(0.999, Math.max(0, currentTimeMs / durationMs));
    let accumulatedFraction = 0;
    for (let i = 0; i < words.length; i++) {
      const wordFraction = lengths[i] / totalLength;
      if (
        progressFraction >= accumulatedFraction &&
        progressFraction < accumulatedFraction + wordFraction
      ) {
        return i;
      }
      accumulatedFraction += wordFraction;
    }
    return words.length - 1;
  }
  // Fallback to static timestamps if duration not yet loaded
  const found = words.findIndex((w) => currentTimeMs >= w.startMs && currentTimeMs < w.endMs);
  return found !== -1 ? found : null;
}
