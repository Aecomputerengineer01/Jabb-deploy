/**
 * JAABBAR 3D LIVE OPS - Procedural Web Audio Engine
 * Zero external audio files required - works offline and across all browsers!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // start muted for friendly user experience
    this.ambientGain = null;
    this.sfxGain = null;
    this.ambientInterval = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gains
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = this.isMuted ? 0 : 0.08;
      this.ambientGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.25;
      this.sfxGain.connect(this.ctx.destination);

      this.startAmbientBeat();
    } catch (e) {
      console.warn('Web Audio not supported or blocked', e);
    }
  }

  toggleMute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.ambientGain && this.sfxGain) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.08, now, 0.1);
      this.sfxGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.25, now, 0.1);
    }
    return !this.isMuted;
  }

  // Play subtle concert lounge beat (synth bass kick & hi-hat)
  startAmbientBeat() {
    if (!this.ctx || this.ambientInterval) return;

    let step = 0;
    const notes = [130.81, 146.83, 164.81, 196.00]; // C, D, E, G

    this.ambientInterval = setInterval(() => {
      if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;

      const t = this.ctx.currentTime;

      // 4-on-the-floor gentle concert kick
      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(g);
        g.connect(this.ambientGain);
        osc.start(t);
        osc.stop(t + 0.2);
      }

      // Soft melodic synth pluck
      if (step % 4 === 1 || step % 4 === 3) {
        const note = notes[(step / 2) % notes.length];
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, t);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(g);
        g.connect(this.ambientGain);
        osc.start(t);
        osc.stop(t + 0.35);
      }

      step = (step + 1) % 16;
    }, 450); // ~133 BPM
  }

  // Happy chime when an order is successfully served to a customer
  playServeChime() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Arpeggio)

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        g.gain.setValueAtTime(0.2, t + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);

        osc.connect(g);
        g.connect(this.sfxGain);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.4);
      });
    } catch (e) {
      // Audio might be waiting for user interaction
    }
  }

  // Bar shaker / sizzle SFX
  playActionSfx(type = 'bar') {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = type === 'kitchen' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'kitchen' ? 800 : 2400;

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      noise.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain);

      noise.start(t);
      noise.stop(t + 0.15);
    } catch (e) {}
  }

  // Button click SFX
  playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  }
}

const soundEngine = new SoundEngine();
