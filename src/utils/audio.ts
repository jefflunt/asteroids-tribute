export class SoundManager {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  thrustOscillator: OscillatorNode | null = null;
  thrustGain: GainNode | null = null;
  isMuted: boolean = false;
  noiseBuffer: AudioBuffer | null = null;
  heartbeatTimer: any = null;
  heartbeatStep: boolean = true;
  heartbeatActive: boolean = false;
  asteroidsCount: number = 0;

  constructor() {
    try {
      const AudioContextClass = (globalThis as any).AudioContext ||
        (typeof window !== 'undefined' ? (window as any).AudioContext || (window as any).webkitAudioContext : null);
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      this.ctx = null;
    }

    if (this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      const storage = typeof localStorage !== 'undefined' ? localStorage : (globalThis as any).localStorage;
      if (storage) {
        this.isMuted = storage.getItem('asteroids_sound_muted') === 'true';
      } else {
        this.isMuted = false;
      }

      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
    }
  }

  init(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => {
        console.warn('Failed to resume audio context:', err);
      });
    }
  }

  setMute(mute: boolean): void {
    this.isMuted = mute;
    const storage = typeof localStorage !== 'undefined' ? localStorage : (globalThis as any).localStorage;
    if (storage) {
      storage.setItem('asteroids_sound_muted', String(mute));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 1.0, this.ctx.currentTime);
    }
  }

  playFire(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) {
      return;
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);

    gainNode.gain.setValueAtTime(0.15, t);
    gainNode.gain.linearRampToValueAtTime(0, t + 0.15);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  private getNoiseBuffer(): AudioBuffer | null {
    if (this.noiseBuffer) {
      return this.noiseBuffer;
    }

    if (!this.ctx) {
      return null;
    }

    const bufferSize = this.ctx.sampleRate * 1.0; // 1 second
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    return this.noiseBuffer;
  }

  playExplosion(size: 'small' | 'medium' | 'large'): void {
    if (!this.ctx || !this.masterGain || this.isMuted) {
      return;
    }

    const noise = this.getNoiseBuffer();
    if (!noise) {
      return;
    }

    const t = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();

    let filterFreq = 1000;
    let filterType: BiquadFilterType = 'bandpass';
    let initialGain = 0.2;
    let decayTime = 0.15;

    if (size === 'large') {
      filterType = 'lowpass'; // Bandpass or lowpass, lowpass gives deep rumble
      filterFreq = 200;
      initialGain = 0.3;
      decayTime = 0.5;
    } else if (size === 'medium') {
      filterType = 'bandpass';
      filterFreq = 500;
      initialGain = 0.25;
      decayTime = 0.3;
    } else {
      filterType = 'bandpass';
      filterFreq = 1000;
      initialGain = 0.2;
      decayTime = 0.15;
    }

    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, t);

    gainNode.gain.setValueAtTime(initialGain, t);
    gainNode.gain.linearRampToValueAtTime(0, t + decayTime);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(t);
    source.stop(t + decayTime);
  }

  playShipDeath(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) {
      return;
    }

    const noise = this.getNoiseBuffer();
    if (!noise) {
      return;
    }

    const t = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(150, t);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, t);
    gainNode.gain.linearRampToValueAtTime(0, t + 1.2);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(t);
    source.stop(t + 1.2);
  }

  setThrust(active: boolean): void {
    if (active) {
      if (!this.ctx || !this.masterGain || this.isMuted) {
        return;
      }
      if (this.thrustOscillator) {
        return;
      }

      const t = this.ctx.currentTime;
      this.thrustOscillator = this.ctx.createOscillator();
      this.thrustOscillator.type = 'triangle';
      this.thrustOscillator.frequency.setValueAtTime(70, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, t);

      this.thrustGain = this.ctx.createGain();
      this.thrustGain.gain.setValueAtTime(0, t);
      this.thrustGain.gain.linearRampToValueAtTime(0.15, t + 0.1);

      this.thrustOscillator.connect(filter);
      filter.connect(this.thrustGain);
      this.thrustGain.connect(this.masterGain);

      this.thrustOscillator.start(t);
    } else {
      if (this.thrustOscillator && this.thrustGain && this.ctx) {
        const t = this.ctx.currentTime;
        this.thrustGain.gain.cancelScheduledValues(t);
        this.thrustGain.gain.setValueAtTime(this.thrustGain.gain.value, t);
        this.thrustGain.gain.linearRampToValueAtTime(0, t + 0.1);

        const osc = this.thrustOscillator;

        this.thrustOscillator = null;
        this.thrustGain = null;

        osc.stop(t + 0.1);
      }
    }
  }

  playHyperspace(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) {
      return;
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.2);

    gainNode.gain.setValueAtTime(0.1, t);
    gainNode.gain.linearRampToValueAtTime(0, t + 0.2);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  getHeartbeatInterval(): number {
    return Math.max(0.25, Math.min(1.0, 0.25 + (this.asteroidsCount / 10) * 0.75));
  }

  playHeartbeatPulse(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) {
      return;
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    const freq = this.heartbeatStep ? 110 : 98;
    osc.frequency.setValueAtTime(freq, t);

    this.heartbeatStep = !this.heartbeatStep;

    gainNode.gain.setValueAtTime(0.15, t);
    gainNode.gain.linearRampToValueAtTime(0, t + 0.1);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  startHeartbeat(): void {
    if (this.heartbeatActive) {
      return;
    }
    this.heartbeatActive = true;
    this.heartbeatStep = true;

    const tick = () => {
      if (!this.heartbeatActive) {
        return;
      }
      this.playHeartbeatPulse();
      const interval = this.getHeartbeatInterval();
      this.heartbeatTimer = setTimeout(tick, interval * 1000);
    };

    tick();
  }

  stopHeartbeat(): void {
    this.heartbeatActive = false;
    if (this.heartbeatTimer !== null) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  updateHeartbeatAsteroidsCount(count: number): void {
    this.asteroidsCount = count;
  }
}
