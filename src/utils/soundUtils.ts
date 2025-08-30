export class SoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext();
      return false;
    }

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
        return false;
      }
    }

    return true;
  }

  public async playCompletionSound() {
    if (this.isMuted || !(await this.ensureAudioContext()) || !this.audioContext) {
      return;
    }

    try {
      // Create a pleasant completion tone (multiple beeps)
      const frequencies = [800, 1000, 1200]; // Pleasant ascending tones
      const duration = 0.15; // Each beep duration
      const gap = 0.05; // Gap between beeps

      for (let i = 0; i < frequencies.length; i++) {
        const startTime = this.audioContext.currentTime + (i * (duration + gap));
        this.createTone(frequencies[i], duration, startTime);
      }
    } catch (error) {
      console.warn('Failed to play completion sound:', error);
    }
  }

  private createTone(frequency: number, duration: number, startTime: number) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Use a sine wave for a pleasant tone
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Create a smooth envelope to avoid clicking sounds
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.01);
    gainNode.gain.setValueAtTime(0, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public destroy() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}