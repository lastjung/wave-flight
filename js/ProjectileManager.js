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
    this.materials = {
      normal: new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
      pierce: new THREE.MeshBasicMaterial({ color: 0x00f5ff }),
      explosive: new THREE.MeshBasicMaterial({ color: 0xffaa33 }),
      emp: new THREE.MeshBasicMaterial({ color: 0x6b7bff }),
      shotgun: new THREE.MeshBasicMaterial({ color: 0xffcc66 }),
    };
    const mat = this.materials.normal;

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
            lastPos: new THREE.Vector3(),
            type: "normal",
            pierceLeft: 0,
            hitIds: null,
        });
    }

    this.beams = [];
    this.beamPoolSize = 6;
    const beamMat = new THREE.LineBasicMaterial({ color: 0xff4b3a });
    for (let i = 0; i < this.beamPoolSize; i++) {
        const beamGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(),
            new THREE.Vector3(0, 0, -1),
        ]);
        const beam = new THREE.Line(beamGeo, beamMat.clone());
        beam.visible = false;
        this.scene.add(beam);
        this.beams.push({ mesh: beam, life: 0, active: false });
    }
  }

  shoot(position, type = "normal", options = {}) {
    // Find inactive bullet
    const b = this.pool.find(b => !b.active);
    if (!b) return;

    b.active = true;
    b.mesh.visible = true;
    b.mesh.position.copy(position);
    b.type = type;
    b.pierceLeft = type === "pierce" ? 5 : 0;
    b.hitIds = type === "pierce" ? new Set() : null;
    b.mesh.material = this.materials[type] || this.materials.normal;
    
    // Slight offset to spawn from nose/wings? Just center for now
    b.mesh.position.y -= 0.2; 
    b.mesh.position.z -= 1.0; // In front of player

    // Velocity: Straight forward (-Z)
    const dir = options.direction || new THREE.Vector3(0, 0, -1);
    const speed = options.speed ?? 50;
    b.velocity.copy(dir).normalize().multiplyScalar(speed);
    b.life = options.life ?? 2.0; // 2 seconds life range
    b.lastPos.copy(b.mesh.position);
  }

  update(dt, enemies, walls, obstacleManager) {
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
            if (b.hitIds?.has(enemy.mesh.id)) continue;
            const dist = b.mesh.position.distanceTo(enemy.mesh.position);
            if (dist < 1.6) { // Hit radius
                if (b.type === "explosive") {
                    this._triggerExplosion(b.mesh.position, enemies, obstacleManager, 4.0);
                    this._deactivate(b);
                    hit = true;
                    break;
                }
                if (b.type === "emp") {
                    enemy.stunTime = Math.max(enemy.stunTime || 0, 1.8);
                    window.dispatchEvent(new CustomEvent("bullet-emp", {
                      detail: { position: enemy.mesh.position.clone() }
                    }));
                    this._deactivate(b);
                    hit = true;
                    break;
                } else if (b.type === "pierce") {
                    enemy.takeDamage(8);
                } else if (b.type === "shotgun") {
                    enemy.takeDamage(6);
                } else {
                    enemy.takeDamage(10);
                }
                if (b.type === "pierce") {
                    b.hitIds?.add(enemy.mesh.id);
                    b.pierceLeft -= 1;
                    if (b.pierceLeft <= 0) {
                        this._deactivate(b);
                        hit = true;
                        break;
                    }
                } else if (b.type !== "emp") {
                    this._deactivate(b);
                    hit = true;
                    break;
                }
            }
        }
      }
      if (hit) continue;

      // 2. Collision with Obstacles
      const obstacleList = obstacleManager?.obstacles;
      if (obstacleList && obstacleList.length > 0) {
        for (const obs of obstacleList) {
          if (!obs.mesh.visible) continue;
          if (b.hitIds?.has(obs.mesh.id)) continue;
          const dist = b.mesh.position.distanceTo(obs.mesh.position);
          if (dist < 1.6) {
            if (b.type === "explosive") {
              this._triggerExplosion(b.mesh.position, enemies, obstacleManager, 4.0);
              this._deactivate(b);
              hit = true;
              break;
            }
            if (b.type === "emp") {
              window.dispatchEvent(new CustomEvent("bullet-emp", {
                detail: { position: obs.mesh.position.clone() }
              }));
              this._deactivate(b);
              hit = true;
              break;
            } else {
              obstacleManager.destroyObstacle(obs);
              window.dispatchEvent(new CustomEvent("bullet-hit-obstacle", {
                detail: { position: obs.mesh.position.clone(), obstacle: obs }
              }));
            }
            if (b.type === "pierce") {
              b.hitIds?.add(obs.mesh.id);
              b.pierceLeft -= 1;
              if (b.pierceLeft <= 0) {
                this._deactivate(b);
                hit = true;
                break;
              }
            } else {
              this._deactivate(b);
              hit = true;
              break;
            }
          }
        }
      }
      if (hit) continue;

      // 3. Collision with Walls (impact effect + bullet destruction)
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
                  // Spawn hit effect at the wall plane for clearer feedback.
                  const denom = currZ - prevZ;
                  const t = denom !== 0 ? (wallZ - prevZ) / denom : 0;
                  const hitPos = b.lastPos.clone().lerp(b.mesh.position, Math.max(0, Math.min(1, t)));
                  if (b.type === "explosive") {
                      this._triggerExplosion(hitPos, enemies, obstacleManager, 4.0);
                  } else if (b.type === "emp") {
                      window.dispatchEvent(new CustomEvent("bullet-emp", {
                          detail: { position: hitPos }
                      }));
                  } else {
                      window.dispatchEvent(new CustomEvent("bullet-hit-wall", {
                          detail: { position: hitPos }
                      }));
                  }
                  this._deactivate(b);
                  hit = true;
              }
              if (hit) break;
          }
      }
      if (hit) continue;
    }
  }

  _triggerExplosion(position, enemies, obstacleManager, radius) {
    let destroyedObstacles = 0;
    if (enemies && enemies.length > 0) {
      for (const enemy of enemies) {
        if (enemy.mesh.position.distanceTo(position) <= radius) {
          enemy.takeDamage(20);
        }
      }
    }
    const obstacleList = obstacleManager?.obstacles;
    if (obstacleList && obstacleList.length > 0) {
      for (const obs of obstacleList.slice()) {
        if (obs.mesh.position.distanceTo(position) <= radius) {
          obstacleManager.destroyObstacle(obs);
          destroyedObstacles += 1;
        }
      }
    }
    // Visual + audio handled by event listener in main.
    window.dispatchEvent(new CustomEvent("bullet-explosion", {
      detail: { position: position.clone(), radius, destroyedObstacles }
    }));
  }

  _deactivate(bullet) {
    bullet.active = false;
    bullet.mesh.visible = false;
  }

  fireLaser(start, direction, enemies, obstacleManager) {
    const dir = direction.clone().normalize();
    const range = 140;
    const end = start.clone().addScaledVector(dir, range);
    const radius = 1.0;

    // Apply damage along beam
    if (enemies && enemies.length > 0) {
      for (const enemy of enemies) {
        const d = this._distanceToSegment(enemy.mesh.position, start, end);
        if (d <= radius) {
          enemy.takeDamage(15);
        }
      }
    }
    const obstacleList = obstacleManager?.obstacles;
    if (obstacleList && obstacleList.length > 0) {
      for (const obs of obstacleList.slice()) {
        const d = this._distanceToSegment(obs.mesh.position, start, end);
        if (d <= radius) {
          obstacleManager.destroyObstacle(obs);
        }
      }
    }

    // Visual beam
    const beam = this.beams.find(b => !b.active);
    if (beam) {
      const pos = beam.mesh.geometry.attributes.position;
      pos.setXYZ(0, start.x, start.y, start.z);
      pos.setXYZ(1, end.x, end.y, end.z);
      pos.needsUpdate = true;
      beam.mesh.visible = true;
      beam.active = true;
      beam.life = 0.12;
    }

    window.dispatchEvent(new CustomEvent("bullet-laser", {
      detail: { position: end.clone() }
    }));
  }

  updateBeams(dt) {
    for (const b of this.beams) {
      if (!b.active) continue;
      b.life -= dt;
      if (b.life <= 0) {
        b.active = false;
        b.mesh.visible = false;
      }
    }
  }

  _distanceToSegment(p, a, b) {
    const ab = b.clone().sub(a);
    const t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq()));
    const closest = a.clone().addScaledVector(ab, t);
    return p.distanceTo(closest);
  }
}
