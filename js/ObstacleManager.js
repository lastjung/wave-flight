/**
 * ObstacleManager - Handles spawning and moving discrete obstacles
 */
import * as THREE from "three";
import { Utils } from "./Utils.js";
import { Obstacle } from "./crafts/Obstacle.js";

export class ObstacleManager {
  constructor(scene, environment) {
    this.scene = scene;
    this.environment = environment;
    this.obstacles = [];
    this.pool = [];
    
    this.spawnTimer = 0;
    this.spawnInterval = 1.5; // Spawn every 1.5 seconds

    this._initPool();
  }

  _initPool() {
    // Create a pool of Obstacle objects
    for (let i = 0; i < 20; i++) {
        const obs = new Obstacle();
        obs.mesh.visible = false;
        this.scene.add(obs.mesh);
        this.pool.push(obs); // Store the class instance
    }
  }

  update(dt, playerPos, speed) {
    this.spawnTimer += dt;
    if (this.spawnTimer > this.spawnInterval) {
        this.spawnTimer = 0;
        this._spawn();
    }

    // Move and update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        
        // Update animation logic
        obs.update(dt);
        
        // Move Z
        obs.mesh.position.z += dt * speed * 12; 

        // Remove if past player
        if (obs.mesh.position.z > 20) {
            obs.mesh.visible = false;
            this.obstacles.splice(i, 1);
        }

        // Collision check
        const dist = obs.mesh.position.distanceTo(playerPos);
        if (dist < 1.5) { // Slightly increased hit radius for new models
            // Collision occurred
            this._handleCollision(obs);
        }
    }
  }

  _spawn() {
    const obs = this.pool.find(o => !o.mesh.visible);
    if (!obs) return;

    const x = (Math.random() - 0.5) * 20;
    const z = -100; // Far ahead
    const groundH = this.environment.getHeightAt(x, z);
    const y = groundH + Math.random() * 8 + 2;

    obs.mesh.position.set(x, y, z);
    // Don't overwrite rotation here completely if Obstacle uses it for animation logic
    // But give it a random starting rotation
    obs.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    
    obs.mesh.visible = true;
    this.obstacles.push(obs);
  }

  _handleCollision(obs) {
    // Basic collision feedback (can be expanded)
    obs.mesh.visible = false;
    this.obstacles = this.obstacles.filter(o => o !== obs);
    
    // Dispatch event for Game class to handle health/score
    window.dispatchEvent(new CustomEvent('player-collision', { 
        detail: { 
            type: 'obstacle',
            position: obs.mesh.position.clone() 
        } 
    }));
  }
}
