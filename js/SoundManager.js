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
      
      // this._startEngineSound(); // Disabled per user request (No BGM/Drone)
      // this._startBGM(); // Removed for combat focus
    }
  
    playShoot() {
        if (!this.ctx) return;
        
        // Laser Pew
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playExplosion() {
        if (!this.ctx) return;
        
        // Noise Burst
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 sec
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.5);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        noise.start();
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
