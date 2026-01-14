import * as THREE from "three";

export class ProjectileManager {
  constructor(scene) {
    this.scene = scene;
    this.bullets = [];
    this.pool = [];
    this.poolSize = 50;

    // Bullet Geometry and Material
    const geo = new THREE.CapsuleGeometry(0.05, 0.4, 4, 8);
    geo.rotateX(Math.PI / 2); // Align with Z axis
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green laser

    // Initialize Pool
    for (let i = 0; i < this.poolSize; i++) {
        const mesh = new THREE.Mesh(geo, mat.clone());
        mesh.visible = false;
        this.scene.add(mesh);
        this.pool.push({
            mesh: mesh,
            active: false,
            velocity: new THREE.Vector3(),
            life: 0,
            lastPos: new THREE.Vector3()
        });
    }
  }

  shoot(position) {
    // Find inactive bullet
    const b = this.pool.find(b => !b.active);
    if (!b) return;

    b.active = true;
    b.mesh.visible = true;
    b.mesh.position.copy(position);
    
    // Slight offset to spawn from nose/wings? Just center for now
    b.mesh.position.y -= 0.2; 
    b.mesh.position.z -= 1.0; // In front of player

    // Velocity: Straight forward (-Z)
    b.velocity.set(0, 0, -50); // Fast speed
    b.life = 2.0; // 2 seconds life range
    b.lastPos.copy(b.mesh.position);
  }

  update(dt, enemies, walls) {
    for (const b of this.pool) {
      if (!b.active) continue;

      b.lastPos.copy(b.mesh.position);

      // Move
      b.mesh.position.addScaledVector(b.velocity, dt);
      b.life -= dt;

      // Check Bounds/Life
      if (b.life <= 0) {
        this._deactivate(b);
        continue;
      }

      // 1. Collision with Enemies
      let hit = false;
      if (enemies && enemies.length > 0) {
        for (const enemy of enemies) {
            const dist = b.mesh.position.distanceTo(enemy.mesh.position);
            if (dist < 1.5) { // Hit radius
                this._deactivate(b);
                enemy.takeDamage(10);
                hit = true;
                break; 
            }
        }
      }
      if (hit) continue;

      // 2. Collision with Walls
      if (walls && walls.length > 0) {
          for (const w of walls) {
              if (!w.group.visible || w.passed) continue;
              
              const wallZ = w.group.position.z;
              const prevZ = b.lastPos.z;
              const currZ = b.mesh.position.z;
              const crossed = (prevZ >= wallZ && currZ <= wallZ) || (prevZ <= wallZ && currZ >= wallZ);
              if (!crossed) continue;

              const dx = b.mesh.position.x - w.group.position.x;
              const dy = b.mesh.position.y - w.group.position.y;
              const holeW = w.holeW || 0;
              const holeH = w.holeH || 0;
              const inHole = Math.abs(dx) < holeW / 2 && Math.abs(dy) < holeH / 2;

              if (!inHole) {
                  this._deactivate(b);
                  hit = true;
                  window.dispatchEvent(new CustomEvent("bullet-hit-wall", {
                      detail: { position: b.mesh.position.clone() }
                  }));
              }
              if (hit) break;
          }
      }
      if (hit) continue;
    }
  }

  _deactivate(bullet) {
    bullet.active = false;
    bullet.mesh.visible = false;
  }
}
