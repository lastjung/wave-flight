import * as THREE from "three";
import { Utils } from "./Utils.js";
import { SpaceFighter } from "./crafts/SpaceFighter.js";
import { SteampunkPlane } from "./crafts/SteampunkPlane.js";
import { GyroCopter } from "./crafts/GyroCopter.js";
import { RailStriker } from "./crafts/RailStriker.js";
import { SolarSkimmer } from "./crafts/SolarSkimmer.js";

/**
 * Player Class - Manages the Airship and its movement
 */
export class Player {
  constructor(scene, input, environment) {
    this.scene = scene;
    this.input = input;
    this.environment = environment;
    
    this.speed = 1.0;
    this.vPos = new THREE.Vector3(0, 5, 0); // Current Visual Position
    this.rotation = { pitch: 0, roll: 0, yaw: 0 };
    
    this.mesh = new THREE.Group();
    this.mesh.scale.set(0.2, 0.2, 0.2); 
    this.mesh.position.copy(this.vPos);
    this.scene.add(this.mesh);
    
    this.limits = {
        x: 18,
        y: 1.5,
        yMax: 22 // Increased significantly from 14 to 22
    };

    this.setCraft("fighter"); // Default craft
    this._initSteamEffect();
  }

  setCraft(type) {
    // Remove current craft mesh if exists
    if (this.craft) {
        this.mesh.remove(this.craft.mesh);
    }

    // Instantiate new craft
    switch (type) {
      case "fighter":
        this.craft = new SpaceFighter();
        break;
      case "gyro":
        this.craft = new GyroCopter();
        break;
      case "rail":
        this.craft = new RailStriker();
        break;
      case "solar":
        this.craft = new SolarSkimmer();
        break;
      case "plane":
      default:
        this.craft = new SteampunkPlane();
        break;
    }

    // Add to parent mesh
    this.mesh.add(this.craft.mesh);
  }

  _initSteamEffect() {
    this.steamParticles = [];
    const geo = new THREE.SphereGeometry(1, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    
    for (let i = 0; i < 10; i++) {
        const p = new THREE.Mesh(geo, mat.clone());
        p.visible = false;
        this.scene.add(p);
        this.steamParticles.push({ mesh: p, life: 0 });
    }
  }

  update(time, dt) {
    // Movement Logic
    const moveX = (this.input.keys.left ? -1 : 0) + (this.input.keys.right ? 1 : 0) + this.input.touch.x;
    // Swapped controls: W/Up for up (+), S/Down for down (-)
    const moveY = (this.input.keys.up || this.input.keys.w ? -1 : 0) + (this.input.keys.down || this.input.keys.s ? 1 : 0) + this.input.touch.y;
    const isVenting = this.input.keys.shift;

    const currentSpeed = isVenting ? 1.8 : 1.0;
    this.vPos.x += moveX * dt * 10 * currentSpeed;
    this.vPos.y += moveY * dt * 8 * currentSpeed;
    this.vPos.x = Utils.clamp(this.vPos.x, -12, 12);
    this.vPos.y = Utils.clamp(this.vPos.y, this.limits.y, this.limits.yMax);

    // Terrain reaction
    const groundH = this.environment.getHeightAt(this.vPos.x, this.vPos.z);
    const minH = groundH + 0.6;
    
    // Check for hard collision (If ground rises too fast/player is too low)
    if (this.vPos.y < minH - 0.2) {
        // Hard collision: Speed reduction and displacement
        this.vPos.y = Utils.lerp(this.vPos.y, minH, 0.2); 
        this.vPos.z += 0.1; // Push back slightly on impact
        this.speed *= 0.95; // Slow down
        // Always trigger player-collision event on terrain collision
        this._spawnSteam(); // Visual feedback of scrape
        window.dispatchEvent(new CustomEvent('player-collision', { 
            detail: { 
                type: 'terrain',
                position: this.vPos.clone()
            } 
        }));
    } else if (this.vPos.y < minH) {
        // Soft hover cushion
        this.vPos.y = Utils.lerp(this.vPos.y, minH, 0.1);
    }

    this.mesh.position.lerp(this.vPos, 0.1);

    // Rotation (Roll/Pitch based on movement)
    this.mesh.rotation.z = Utils.lerp(this.mesh.rotation.z, -moveX * 0.4, 0.05);
    this.mesh.rotation.x = Utils.lerp(this.mesh.rotation.x, moveY * 0.3, 0.05);
    this.mesh.rotation.y = Utils.lerp(this.mesh.rotation.y, moveX * 0.2, 0.05);

    // Craft Animations
    if (this.craft.propeller) {
        this.craft.propeller.rotation.z += dt * 20 * currentSpeed;
    }

    // Steam Vent Effect
    if (isVenting && Math.random() < 0.3) {
        this._spawnSteam();
    }
    this._updateSteam(dt);
  }

  _spawnSteam() {
    const p = this.steamParticles.find(sp => !sp.mesh.visible);
    if (!p) return;
    
    p.mesh.visible = true;
    p.life = 1.0;
    p.mesh.scale.set(0.1, 0.1, 0.1);
    
    // Safety check for engine references
    const eng = Math.random() > 0.5 ? this.craft.leftEng : this.craft.rightEng;
    if (!eng) return;

    const worldPos = new THREE.Vector3();
    eng.getWorldPosition(worldPos);
    p.mesh.position.copy(worldPos);
  }

  _updateSteam(dt) {
    this.steamParticles.forEach(p => {
        if (!p.mesh.visible) return;
        p.life -= dt * 2.0;
        if (p.life <= 0) {
            p.mesh.visible = false;
        } else {
            p.mesh.position.x -= dt * 5;
            p.mesh.position.y += dt * 2;
            const s = (1.0 - p.life) * 0.5;
            p.mesh.scale.set(s, s, s);
            p.mesh.material.opacity = p.life * 0.5;
        }
    });
  }

  getPosition() {
    return this.mesh.position;
  }

  reset() {
    this.vPos.set(0, 5, 0); // Reset to center/safe height
    this.mesh.position.copy(this.vPos);
    this.mesh.rotation.set(0, 0, 0);
    this.speed = 1.0;
  }
}
