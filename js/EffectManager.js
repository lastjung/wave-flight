import * as THREE from "three";

/**
 * EffectManager - Handles visual effects like explosions and particles
 */
export class EffectManager {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.poolSize = 100;
    
    // Initialize Particle Pool
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    for (let i = 0; i < this.poolSize; i++) {
        const mesh = new THREE.Mesh(geometry, material.clone());
        mesh.visible = false;
        this.scene.add(mesh);
        this.particles.push({
            mesh: mesh,
            active: false,
            velocity: new THREE.Vector3(),
            life: 0
        });
    }
  }

  /**
   * Internal helper to get an inactive particle from the pool.
   * @returns {object|null} An inactive particle object or null if none available.
   */
  _getParticle() {
    for (const p of this.particles) {
        if (!p.active) {
            return p;
        }
    }
    return null; // No inactive particles available
  }

  /**
   * Spawns an explosion at the given position
   * @param {THREE.Vector3} position 
   * @param {string|number} color 
   * @param {number} count 
   */
  explode(position, color = 0xffaa00, count = 10) {
    let spawned = 0;
    for (const p of this.particles) {
        if (!p.active) {
            p.active = true;
            p.mesh.visible = true;
            p.mesh.position.copy(position);
            p.mesh.material.color.set(color);
            
            // Random Velocity spreading outward
            p.velocity.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            
            p.life = 1.0; // 1 second life
            
            // Random Rotation
            p.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            spawned++;
            if (spawned >= count) break;
        }
    }
  }

  spawnSteamVent(pos) {
    // Rising steam column
    for(let i=0; i<5; i++) {
        const p = this._getParticle();
        if(!p) return;
        
        p.active = true;
        p.mesh.visible = true;
        p.mesh.position.copy(pos);
        p.mesh.position.x += (Math.random() - 0.5) * 2; // Spread
        
        p.mesh.material.color.setHex(0xaaaaaa); // White/Grey steam
        p.mesh.scale.set(0.5, 0.5, 0.5);
        p.life = 2.0; // Long life
        
        // Rise up fast
        p.velocity.set(
            (Math.random() - 0.5) * 2,
            5 + Math.random() * 5, // Up
            30 // Move with world
        );
    }
  }

  spawnLava(pos) {
      // Lava Burst
      for(let i=0; i<3; i++) {
        const p = this._getParticle();
        if(!p) return;

        p.active = true;
        p.mesh.visible = true;
        p.mesh.position.copy(pos);
        p.mesh.material.color.setHex(0xff3300); // Red/Orange
        p.mesh.scale.set(0.3, 0.3, 0.3);
        p.life = 1.5;

        p.velocity.set(
            (Math.random() - 0.5) * 5,
            8 + Math.random() * 5, // Up pop
            30
        );
      }
  }

  update(dt) {
    for (const p of this.particles) {
        if (p.active) {
            p.life -= dt * 2.0; // Decay speed

            if (p.life <= 0) {
                p.active = false;
                p.mesh.visible = false;
            } else {
                // Move
                p.mesh.position.addScaledVector(p.velocity, dt);
                
                // Gravity
                p.velocity.y -= 9.8 * dt;

                // Rotate
                p.mesh.rotation.x += p.velocity.z * dt;
                p.mesh.rotation.y += p.velocity.x * dt;

                // Scale down
                const s = p.life;
                p.mesh.scale.set(s, s, s);
            }
        }
    }
  }
}
