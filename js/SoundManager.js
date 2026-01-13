/**
 * SoundManager - Handles Web Audio API for synthesized SFX and BGM
 */
export class SoundManager {
    constructor() {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.5; // Master Volume
  
      this.bgmOscs = [];
      this.engineOsc = null;
      this.engineGain = null;
      
      this.isInitialized = false;
      this.isPlaying = false;
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
  
    /**
     * Initializes audio context on first user interaction
     */
    async init() {
      if (this.isInitialized) return;
      
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      this.isInitialized = true;
      
      this._startEngineSound();
      this._startBGM();
    }
  
    _startBGM() {
      // Create a dark, industrial drone chord
      const freqs = [55, 110, 165]; // Low A notes
      
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = i === 0 ? 'sawtooth' : 'sine';
        osc.frequency.value = f;
        
        // Detune slightly for "analog" feel
        osc.detune.value = (Math.random() - 0.5) * 10;
        
        gain.gain.value = 0.05; // Very low volume for BGM
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        this.bgmOscs.push({ osc, gain });
      });
  
      // LFO for pulsing effect
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.2; // Slow pulse
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.02;
      
      lfo.connect(lfoGain);
      this.bgmOscs[1].gain.gain.value = 0.05; 
      // Modulate the second oscillator's volume
      
      this.isPlaying = true;
    }
  
    _startEngineSound() {
        // Brown noise for rumbling engine
        const bufferSize = 2 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; 
        }
  
        this.engineOsc = this.ctx.createBufferSource();
        this.engineOsc.buffer = buffer;
        this.engineOsc.loop = true;
  
        // Lowpass filter for muffling
        this.engineFilter = this.ctx.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.value = 400;
  
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0.1;
  
        this.engineOsc.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);
  
        this.engineOsc.start();
    }
  
    updateEngine(speedRatio) {
        if (!this.engineFilter) return;
        // Modulate filter frequency based on speed
        // Speed 1.0 -> 400Hz, Speed 2.0 -> 800Hz
        const targetFreq = 400 + (speedRatio * 400); 
        this.engineFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
        
        // Volume up slightly with speed
        this.engineGain.gain.setTargetAtTime(0.1 + (speedRatio * 0.05), this.ctx.currentTime, 0.1);
    }
  
    playCollision() {
        if (!this.ctx) return;
        
        // Impact Noise
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
        
        // Sub-bass thump
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.frequency.setValueAtTime(60, this.ctx.currentTime);
        kick.frequency.exponentialRampToValueAtTime(1, this.ctx.currentTime + 0.3);
        kickGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        kickGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        kick.connect(kickGain);
        kickGain.connect(this.masterGain);
        kick.start();
        kick.stop(this.ctx.currentTime + 0.3);
    }
  }
