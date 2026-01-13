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
            life: 0
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
  }

  update(dt, enemies) {
    for (const b of this.pool) {
      if (!b.active) continue;

      // Move
      b.mesh.position.addScaledVector(b.velocity, dt);
      b.life -= dt;

      // Check Bounds/Life
      if (b.life <= 0) {
        this._deactivate(b);
        continue;
      }

      // Collision with Enemies
      if (enemies && enemies.length > 0) {
        for (const enemy of enemies) {
            // Simple distance check
            // Enemy is usually a Group, need its position
            const enemyPos = enemy.mesh.position; 
            const dist = b.mesh.position.distanceTo(enemyPos);
            
            if (dist < 1.5) { // Hit radius
                // Hit!
                this._deactivate(b);
                enemy.takeDamage(10); // Assume enemy has takeDamage
                break; // One bullet hits one enemy
            }
        }
      }
    }
  }

  _deactivate(bullet) {
    bullet.active = false;
    bullet.mesh.visible = false;
  }
}
