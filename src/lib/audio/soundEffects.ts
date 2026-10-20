/**
 * Web Audio API Synth Sound System
 * Zero-dependency, offline-ready tactical sound effects and audio alerts
 */
class SoundSystem {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public playBeep(freq = 880, duration = 0.12, type: OscillatorType = 'sine', volume = 0.15) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  public playTick() {
    if (!this.enabled) return;
    this.playBeep(1000, 0.05, 'sine', 0.1);
  }

  public playComplete() {
    if (!this.enabled) return;
    try {
      this.playBeep(587.33, 0.1, 'sine', 0.2); // D5
      setTimeout(() => this.playBeep(880, 0.12, 'sine', 0.22), 110); // A5
      setTimeout(() => this.playBeep(1174.66, 0.35, 'triangle', 0.25), 230); // D6
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 80, 250]);
      }
    } catch {}
  }

  public playStart() {
    if (!this.enabled) return;
    this.playBeep(700, 0.08, 'sine', 0.15);
  }
}

export const soundEffects = new SoundSystem();
