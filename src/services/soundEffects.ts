/**
 * Sound Effects & Audio Synthesis Service
 * Provides zero-dependency Web Audio API sound effects for games, quizzes, and celebrations.
 * Also includes Speech Synthesis narration for stories and reading assistance.
 */

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Cheerful, uplifting ascending chime when an answer is correct
   */
  public playCorrectSound(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    } catch {}
  }

  /**
   * Gentle, encouraging low tone when an answer is wrong (not discouraging)
   */
  public playWrongSound(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [349.23, 311.13]; // F4 -> Eb4
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.001, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.15, now + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch {}
  }

  /**
   * Victory Fanfare when a game or target is achieved
   */
  public playFanfareSound(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Arpeggio: C5, G5, C6, E6, G6
      const fanfare = [
        { freq: 523.25, delay: 0, dur: 0.15 },
        { freq: 659.25, delay: 0.14, dur: 0.15 },
        { freq: 783.99, delay: 0.28, dur: 0.18 },
        { freq: 1046.5, delay: 0.44, dur: 0.45 },
      ];
      fanfare.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, now + n.delay);

        gain.gain.setValueAtTime(0.001, now + n.delay);
        gain.gain.exponentialRampToValueAtTime(0.25, now + n.delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.delay + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.delay);
        osc.stop(now + n.delay + n.dur + 0.05);
      });
    } catch {}
  }

  /**
   * Twinkling Star / Coin Sound when earning stars
   */
  public playRewardSound(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const freqs = [987.77, 1318.51, 1567.98]; // B5, E6, G6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    } catch {}
  }

  /**
   * Soft UI tactile click
   */
  public playClickSound(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  /**
   * Speech Synthesis Narration for Indonesian text
   */
  public speakIndonesian(text: string, onEnd?: () => void): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95; // Slightly slower for clarity
      utterance.pitch = 1.05; // Friendly tone for children

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.startsWith('ind'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Stop Speech Synthesis
   */
  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const SoundEffects = new SoundEffectsService();
