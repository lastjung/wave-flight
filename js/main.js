import * as THREE from "three";
import { Environment } from "./Environment.js";
import { Player } from "./Player.js";
import { CameraSystem } from "./CameraSystem.js";
import { Input } from "./Input.js";
import { SoundManager } from "./SoundManager.js"; // Import SoundManager

import { ObstacleManager } from "./ObstacleManager.js";

/**
 * Main Game Class - Orchestrates the entire simulation
 */
class Game {
  constructor() {
    this.canvas = document.getElementById("c");
    this.audioInit = false; // Flag for audio init
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);

    // Game State
    this.state = {
        score: 0,
        health: 100,
        isGameOver: false
    };

    // UI Elements
    this.ui = {
      reset: document.getElementById("reset"),
      speed: document.getElementById("speed"),
      speedV: document.getElementById("speedV"),
      amp: document.getElementById("amp"),
      ampV: document.getElementById("ampV"),
      freq: document.getElementById("freq"),
      freqV: document.getElementById("freqV"),
      glow: document.getElementById("glow"),
      glowV: document.getElementById("glowV"),
      fps: document.getElementById("fps"),
      res: document.getElementById("res"),
      score: document.getElementById("score"),
      vol: document.getElementById("vol"),
      volV: document.getElementById("volV"),
      muteBtn: document.getElementById("muteBtn"),
      gameOver: document.getElementById("gameOver"),
      restartBtn: document.getElementById("restartBtn"),
      finalScore: document.getElementById("finalScore"),
    };

    this._init();
  }

  _init() {
    // Systems
    this.input = new Input();
    this.env = new Environment(this.scene);
    this.player = new Player(this.scene, this.input, this.env);
    this.cameraSystem = new CameraSystem(this.camera, this.player);
    this.obstacles = new ObstacleManager(this.scene, this.env);
    this.sound = new SoundManager(); // Init Sound Manager

    // Initial Camera Pos
    this.camera.position.set(0, 8, 15);

    // Event Listeners for UI
    this.ui.reset.addEventListener("click", () => this._reset());
    this.ui.restartBtn.addEventListener("click", () => this._reset());
    this.ui.muteBtn.addEventListener("click", () => this._toggleMute()); // Mute Toggle
    ["speed", "amp", "freq", "glow", "vol"].forEach(k => {
      this.ui[k]?.addEventListener("input", () => this._syncUI());
    });

    window.addEventListener("resize", () => this._onResize());
    window.addEventListener('player-collision', (e) => this._onCollision(e.detail));

    // Audio Init on interaction
    const initAudio = () => {
        if (!this.audioInit) {
            this.sound.init();
            this.audioInit = true;
        }
    };
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    this._onResize(); // Initial call
    this._syncUI();

    // Color Preset Events
    document.querySelectorAll(".color-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const color = e.target.dataset.color;
        this.env.setColor(color);
      });
    });
    // Craft Selection Events
    document.querySelectorAll(".craft-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const type = e.target.dataset.craft;
        this.player.setCraft(type);
      });
    });
    
    this._animate();
  }

  _onCollision(detail) {
    if (this.state.isGameOver) return;
    
    // Increased Impact: Terrain = 0.5, Obstacle = 0.8
    this.cameraSystem.shake(detail.type === 'terrain' ? 0.5 : 0.8);
    this.sound.playCollision(); // Play SFX
    
    // Flash Screen Effect
    if (this.ui.flash) {
        this.ui.flash.style.opacity = detail.type === 'terrain' ? "0.2" : "0.5";
        setTimeout(() => {
            if (this.ui.flash) this.ui.flash.style.opacity = "0";
        }, 50);
    }

    this.state.health -= 10;
    if (this.state.health <= 0) {
        this.state.health = 0;
        this._triggerGameOver();
    }
  }

  _triggerGameOver() {
    this.state.isGameOver = true;
    
    // Show Overlay
    if (this.ui.gameOver) {
        this.ui.gameOver.classList.remove('opacity-0', 'pointer-events-none');
        this.ui.finalScore.textContent = Math.floor(this.state.score);
    }

    // Stop Engine Sound if needed (optional)
    // this.sound.stopEngine(); 
  }

  _reset() {
    this.env.travel = 0;
    this.state.health = 100;
    this.state.score = 0;
    this.state.isGameOver = false;
    
    // Hide Overlay
    if (this.ui.gameOver) {
        this.ui.gameOver.classList.add('opacity-0', 'pointer-events-none');
    }
    
    // Reset player visual pos just in case
    this.player.reset(); 
  }

  _toggleMute() {
    if (!this.sound) return;
    const isMuted = this.sound.toggleMute();
    this.ui.muteBtn.textContent = isMuted ? "OFF" : "ON";
    this.ui.muteBtn.className = isMuted 
        ? "px-1.5 py-0.5 bg-red-900/40 border border-red-700/50 rounded text-[9px] hover:bg-red-800/60 uppercase transition-colors text-red-400"
        : "px-1.5 py-0.5 bg-yellow-900/40 border border-yellow-700/50 rounded text-[9px] hover:bg-yellow-800/60 uppercase transition-colors text-yellow-500";
  }

  _syncUI() {
    if (this.ui.speedV) this.ui.speedV.textContent = Number(this.ui.speed.value).toFixed(2);
    if (this.ui.ampV) this.ui.ampV.textContent = Number(this.ui.amp.value).toFixed(2);
    if (this.ui.freqV) this.ui.freqV.textContent = Number(this.ui.freq.value).toFixed(3);
    if (this.ui.glowV) this.ui.glowV.textContent = Number(this.ui.glow.value).toFixed(2);
    if (this.ui.volV) {
        const v = Number(this.ui.vol.value);
        this.ui.volV.textContent = v.toFixed(2);
        if (this.sound) this.sound.setVolume(v);
    }
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.ui.res) this.ui.res.textContent = `${w}×${h}`;
  }

  _animate() {
    let lastTime = performance.now();
    let fpsAcc = 0;
    let fpsN = 0;

    const loop = (currentTime) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;
      const t = currentTime / 1000;

      if (!this.state.isGameOver) {
        // Read UI values
        const speed = Number(this.ui.speed.value);
        const amp = Number(this.ui.amp.value);
        const freq = Number(this.ui.freq.value);
        const glow = Number(this.ui.glow.value);

        // Update Systems
        this.env.update(t, dt, speed, amp, freq, glow);
        this.player.update(t, dt);
        
        // Dynamic FOV for Boost
        this.cameraSystem.targetFOV = this.input.keys.shift ? 75 : 60;
        this.cameraSystem.update(t, dt);
        
        // Update Sound (Engine Pitch)
        // Normalize speed: base is 1.0, boost is 1.8. map to 0..1 range approximately
        // speed comes from UI slider, input.keys.shift adds boost
        const isBoost = this.input.keys.shift;
        this.sound.updateEngine(isBoost ? 1.0 : 0.0);

        this.obstacles.update(dt, this.player.getPosition(), speed);

        // Update Score
        this.state.score += dt * speed * 10;
        if (this.ui.score) this.ui.score.textContent = Math.floor(this.state.score);
        if (this.ui.health) this.ui.health.style.width = `${this.state.health}%`;

        // Check for terrain collision damage (indirectly handled by Player.js dispatching events or speed drop)
        // Here we can check if player speed is significantly dropped as a proxy for collision
        if (this.player.speed < 0.9) {
             // Speed drop logic handled elsewhere
        }
      }

      // FPS tracking
      fpsAcc += 1 / dt;
      fpsN++;
      if (fpsN >= 20) {
        if (this.ui.fps) this.ui.fps.textContent = Math.round(fpsAcc / fpsN);
        fpsAcc = 0;
        fpsN = 0;
      }

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Start Game
new Game();
