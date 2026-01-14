import * as THREE from "three";
import { EnemyDrone } from "./crafts/EnemyDrone.js";
import { EnemyInterceptor } from "./crafts/EnemyInterceptor.js";
import { EnemyBomber } from "./crafts/EnemyBomber.js";

export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = []; // Active enemies
    this.pool = [];
    this.poolSize = 14;
    
    this.spawnTimer = 0;
    this.spawnInterval = 3.0; // Every 3 seconds

    this._initPool();
  }

  _initPool() {
    for(let i=0; i<this.poolSize; i++) {
        let enemy;
        if (i % 5 === 0) {
            enemy = new EnemyBomber();
        } else if (i % 2 === 0) {
            enemy = new EnemyInterceptor();
        } else {
            enemy = new EnemyDrone();
        }
        enemy.mesh.visible = false;
        enemy.mesh.rotation.y = Math.PI; // Face +Z
        this.scene.add(enemy.mesh);
        this.pool.push(enemy);
    }
  }

  update(dt, playerPos, speed) {
    this.spawnTimer += dt;
    const interval = Math.max(1.5, this.spawnInterval - (speed * 0.4));
    if (this.spawnTimer > interval) {
        this.spawnTimer = 0;
        this._spawn();
    }

    // Update active enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        
        // Move towards +Z (Player)
        // Terrain speed is speed * 12. 
        // We want enemies to be faster than terrain.
        // Let's set enemy speed to TerrainSpeed + 40.
        const speedBonus = enemy.speedBonus || 0;
        const enemySpeed = (speed * 12) + 30 + speedBonus;
        enemy.mesh.position.z += enemySpeed * dt;

        // Banking/Wobble effect
        enemy.mesh.rotation.z = Math.sin(Date.now() * 0.003 + enemy.mesh.id) * (enemy.bankIntensity || 0.3);

        // Remove if passed player
        if (enemy.mesh.position.z > 20) {
            this._despawn(enemy);
            continue;
        }

        // Check if dead (health handled in ProjectileManager mostly, but we trigger cleanup here if needed?)
        // Actually ProjectileManager calls takeDamage. If dead, we need to remove it.
        // But ProjectileManager returns true if dead.
        // Handling death via update loop check is safer.
        if (enemy.health <= 0) {
            this._explode(enemy);
            this._despawn(enemy);
        }
    }
  }

  _spawn() {
    const enemy = this.pool.find(e => !e.mesh.visible);
    if (!enemy) return;

    enemy.health = 20; // Reset health
    enemy.mesh.visible = true;
    enemy.speedBonus = 0;
    enemy.bankIntensity = 0.3;
    
    // Random X, Far -Z
    const x = (Math.random() - 0.5) * 40;
    const y = 8 + (Math.random() - 0.5) * 10; // Altitude variation
    const z = -200;

    enemy.mesh.position.set(x, y, z);
    
    // Apply type-based tuning
    if (enemy instanceof EnemyInterceptor) {
        enemy.health = 12;
        enemy.speedBonus = 25 + Math.random() * 10;
        enemy.bankIntensity = 0.5;
    } else if (enemy instanceof EnemyBomber) {
        enemy.health = 35;
        enemy.speedBonus = -8;
        enemy.bankIntensity = 0.18;
    } else {
        enemy.health = 20;
        enemy.speedBonus = 10 + Math.random() * 10;
        enemy.bankIntensity = 0.3;
    }

    this.enemies.push(enemy);
  }

  _despawn(enemy) {
    enemy.mesh.visible = false;
    const idx = this.enemies.indexOf(enemy);
    if (idx > -1) this.enemies.splice(idx, 1);
  }

  _explode(enemy) {
    // Trigger explosion event
    window.dispatchEvent(new CustomEvent('player-collision', { 
        detail: { 
            type: 'enemy-destroyed', // Special type for effect
            position: enemy.mesh.position.clone() 
        } 
    }));
  }
}
