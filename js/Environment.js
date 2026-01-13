import * as THREE from "three";
import { Utils } from "./Utils.js";

/**
 * Environment Class - Manages Terrain, Sky, and Lights
 */
export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.travel = 0;
    
    // Config (Steampunk Theme)
    this.config = {
      groundColor: 0x2c1b0e, // Deep Wood/Metal
      wireColor: 0xd4a017,   // Brass/Gold
      skyColor: 0x09060d,
      sunColor: 0xff4b3a,
      glowColor: 0xb02bff,
      amp: 1.4,
      freq: 0.08,
      glow: 0.6
    };

    this._init();
  }

  _init() {
    this.scene.fog = new THREE.FogExp2(this.config.skyColor, 0.018);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    this._createTerrain();
    this._createSun();
    this._createStars();
  }

  _createTerrain() {
    const segX = 160, segZ = 240;
    const sizeX = 34, sizeZ = 110;
    this.baseGeo = new THREE.PlaneGeometry(sizeX, sizeZ, segX, segZ);
    this.baseGeo.rotateX(-Math.PI / 2);
    this.baseGeo.translate(0, 0, -sizeZ * 0.45);

    this.baseMat = new THREE.MeshBasicMaterial({
      color: this.config.groundColor,
      transparent: true,
      opacity: 0.85,
    });
    this.wireMat = new THREE.MeshBasicMaterial({
      color: this.config.wireColor,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });

    this.groundGroup = new THREE.Group();
    this.groundGroup.add(new THREE.Mesh(this.baseGeo, this.baseMat));
    this.groundGroup.add(new THREE.Mesh(this.baseGeo, this.wireMat));
    this.scene.add(this.groundGroup);

    this.posAttr = this.baseGeo.attributes.position;
    this.basePos = this.posAttr.array.slice();
  }

  _createSun() {
    // Fake Sun with Gradient
    const geo = new THREE.PlaneGeometry(22, 22);
    const mat = new THREE.MeshBasicMaterial({
      color: this.config.sunColor,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.sun = new THREE.Mesh(geo, mat);
    this.sun.position.set(0, 10, -80);
    this.scene.add(this.sun);
  }

  _createStars() {
    const starsN = 1000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(starsN * 3);
    for (let i = 0; i < starsN; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = Math.random() * 80 + 20;
      pos[i * 3 + 2] = -Math.random() * 200;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.25, color: 0xffffff, opacity: 0.4, transparent: true });
    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }

  update(time, dt, speed, amp, freq, glow) {
    this.travel -= dt * speed * 12;
    this.config.amp = amp;
    this.config.freq = freq;
    this.config.glow = glow;

    // Update aesthetics based on glow
    this.wireMat.opacity = Utils.clamp(0.3 + glow * 0.5, 0.1, 0.9);
    this.baseMat.opacity = Utils.clamp(0.7 + glow * 0.2, 0.5, 0.95);

    for (let i = 0; i < this.posAttr.count; i++) {
        const ix = i * 3;
        const x = this.basePos[ix + 0];
        const z = this.basePos[ix + 2];
        const nx = x * freq;
        const nz = (z + this.travel) * freq;
        // fbm octaves increased for more detail, and added a power function for sharper peaks
        const rawN = Utils.Perlin.fbm(nx + 2.0, 0, nz + time * 0.4, 5);
        const n = Math.sign(rawN) * Math.pow(Math.abs(rawN), 1.2); 
        this.posAttr.array[ix + 1] = n * amp * 2.5; // Increased default amplitude factor
    }
    this.posAttr.needsUpdate = true;
    this.posAttr.needsUpdate = true;
    this.stars.rotation.y += dt * 0.02;
    
    // Dynamic Sky Cycle
    const cycle = (Math.abs(this.travel) * 0.005) % 3; // 0-1: Day, 1-2: Sunset, 2-3: Night
    let targetColor;
    
    if (cycle < 1) { // Day -> Sunset
        targetColor = new THREE.Color().lerpColors(new THREE.Color(0x00f5ff), new THREE.Color(0xff4b3a), cycle);
    } else if (cycle < 2) { // Sunset -> Night
        targetColor = new THREE.Color().lerpColors(new THREE.Color(0xff4b3a), new THREE.Color(0x1a0a2e), cycle - 1);
    } else { // Night -> Day
        targetColor = new THREE.Color().lerpColors(new THREE.Color(0x1a0a2e), new THREE.Color(0x00f5ff), cycle - 2);
    }
    
    // Smoothly apply
    this.scene.fog.color.lerp(targetColor, dt * 0.5);
    this.config.wireColor = targetColor.getHex();
    this.wireMat.color.lerp(targetColor, dt * 0.5);
    this.sun.material.color.lerp(targetColor, dt * 0.5);
  }

  getHeightAt(x, z) {
    const nx = x * this.config.freq;
    const nz = (z + this.travel) * this.config.freq;
    const rawN = Utils.Perlin.fbm(nx + 2.0, 0, nz + performance.now() * 0.0004, 5);
    const n = Math.sign(rawN) * Math.pow(Math.abs(rawN), 1.2);
    return n * (this.config.amp * 2.5);
  }

  setColor(hex) {
    const color = new THREE.Color(hex);
    this.config.wireColor = hex;
    this.config.sunColor = hex;
    this.wireMat.color.copy(color);
    this.sun.material.color.copy(color);
    
    // Optional: Subtle fog update to match the tone
    // this.scene.fog.color.lerp(color, 0.1); 
  }
}
