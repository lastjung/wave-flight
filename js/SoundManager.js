/**
 * SoundManager - Handles Web Audio API for synthesized SFX and ambience
 */
export class SoundManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    this.engine = null;
    this.wind = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.volume = 0.5;
  }

  setVolume(val) {
    this.volume = val;
    if (!this.isMuted && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  async init() {
    if (this.isInitialized) return;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    this.isInitialized = true;
    // Background loops intentionally disabled (SFX only).
  }

  _startEngine() {
    const noiseBuffer = this._createNoiseBuffer("brown", 2.0);
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 180;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.12;

    const toneOsc = this.ctx.createOscillator();
    toneOsc.type = "sawtooth";
    toneOsc.frequency.value = 90;

    const toneGain = this.ctx.createGain();
    toneGain.gain.value = 0.05;

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    toneOsc.connect(toneGain);
    toneGain.connect(this.masterGain);

    noiseSrc.start();
    toneOsc.start();

    this.engine = {
      noiseFilter,
      noiseGain,
      toneOsc,
      toneGain,
    };
  }

  _startWind() {
    const noiseBuffer = this._createNoiseBuffer("white", 2.0);
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 600;
    bandpass.Q.value = 0.8;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.02;

    noiseSrc.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);

    noiseSrc.start();

    this.wind = { bandpass, gain };
  }

  updateEngine(speedRatio, isBoost) {
    if (!this.engine || !this.wind) return;

    const sr = Math.max(0, Math.min(1, speedRatio));
    const boost = isBoost ? 1 : 0;

    const engineFreq = 120 + sr * 220 + boost * 40;
    const engineCutoff = 200 + sr * 500 + boost * 120;

    this.engine.toneOsc.frequency.setTargetAtTime(engineFreq, this.ctx.currentTime, 0.08);
    this.engine.noiseFilter.frequency.setTargetAtTime(engineCutoff, this.ctx.currentTime, 0.08);
    this.engine.noiseGain.gain.setTargetAtTime(0.08 + sr * 0.12 + boost * 0.06, this.ctx.currentTime, 0.1);
    this.engine.toneGain.gain.setTargetAtTime(0.04 + sr * 0.05 + boost * 0.02, this.ctx.currentTime, 0.1);

    this.wind.bandpass.frequency.setTargetAtTime(400 + sr * 1000, this.ctx.currentTime, 0.1);
    this.wind.gain.gain.setTargetAtTime(0.01 + sr * 0.08 + boost * 0.04, this.ctx.currentTime, 0.1);
  }

  playShoot() {
    if (!this.ctx) return;

    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = "square";
    click.frequency.setValueAtTime(1200, this.ctx.currentTime);
    click.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.08);
    clickGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    click.connect(clickGain);
    clickGain.connect(this.masterGain);
    click.start();
    click.stop(this.ctx.currentTime + 0.09);

    const zap = this.ctx.createOscillator();
    const zapGain = this.ctx.createGain();
    zap.type = "sawtooth";
    zap.frequency.setValueAtTime(700, this.ctx.currentTime);
    zap.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.2);
    zapGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    zapGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    zap.connect(zapGain);
    zapGain.connect(this.masterGain);
    zap.start();
    zap.stop(this.ctx.currentTime + 0.22);
  }

  playExplosion() {
    if (!this.ctx) return;

    const noise = this._playNoiseBurst(0.5, 1400, 120);

    const boom = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boom.type = "sine";
    boom.frequency.setValueAtTime(110, this.ctx.currentTime);
    boom.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.4);
    boomGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    boomGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    boom.connect(boomGain);
    boomGain.connect(this.masterGain);
    boom.start();
    boom.stop(this.ctx.currentTime + 0.45);

    noise.output.connect(this.masterGain);
    noise.source.start();
    noise.source.stop(this.ctx.currentTime + 0.5);
  }

  playCollision() {
    if (!this.ctx) return;

    const clang = this.ctx.createOscillator();
    const clangGain = this.ctx.createGain();
    clang.type = "triangle";
    clang.frequency.setValueAtTime(220, this.ctx.currentTime);
    clang.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.25);
    clangGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    clangGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    clang.connect(clangGain);
    clangGain.connect(this.masterGain);
    clang.start();
    clang.stop(this.ctx.currentTime + 0.3);

    const thump = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(70, this.ctx.currentTime);
    thump.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.2);
    thumpGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    thumpGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    thump.connect(thumpGain);
    thumpGain.connect(this.masterGain);
    thump.start();
    thump.stop(this.ctx.currentTime + 0.22);
  }

  playPickup(type) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    const base = type === "fuel" ? 520 : 880;
    osc.frequency.setValueAtTime(base, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(base * 1.6, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playBoost() {
    if (!this.ctx) return;

    const noise = this._playNoiseBurst(0.25, 2200, 400);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    noise.output.connect(gain);
    gain.connect(this.masterGain);
    noise.source.start();
    noise.source.stop(this.ctx.currentTime + 0.25);
  }

  _playNoiseBurst(duration, high, low) {
    const buffer = this._createNoiseBuffer("white", duration);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(high, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(low, this.ctx.currentTime + duration);
    source.connect(filter);
    return { source, output: filter };
  }

  _createNoiseBuffer(type, duration) {
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "brown") {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    } else {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    return buffer;
  }
}
