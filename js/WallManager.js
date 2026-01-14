import * as THREE from "three";

/**
 * WallManager - Manages large approaching walls with holes
 */
export class WallManager {
  constructor(scene, environment) {
    this.scene = scene;
    this.environment = environment;
    this.walls = [];
    this.pool = [];
    this.poolSize = 5; // Expensive objects, fewer needed
    
    this.spawnTimer = 0;
    this.spawnInterval = 8.0; // Every 8 seconds initially
    this.difficulty = 0; // Increases over time

    this._initPool();
  }

  _initPool() {
    // Force Field Material
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x000000, 
        emissive: 0x111111,
        emissiveIntensity: 0.6,
        transparent: false, 
        opacity: 1.0,
        side: THREE.DoubleSide,
        shininess: 60
    });

    const wireMat = new THREE.LineBasicMaterial({ color: 0x333333, transparent: false, opacity: 1.0 });
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: false, opacity: 1.0 });

    for (let i = 0; i < this.poolSize; i++) {
        const group = new THREE.Group();
        
        // We need 4 parts: Top, Bottom, Left, Right
        const geo = new THREE.BoxGeometry(1, 1, 0.5); 
        
        // Parts container
        const parts = {};
        const frameParts = {};
        ['top', 'bottom', 'left', 'right'].forEach(key => {
            const mesh = new THREE.Mesh(geo, material.clone());
            
            // Add wireframe outline
            const edges = new THREE.EdgesGeometry(geo);
            const line = new THREE.LineSegments(edges, wireMat);
            mesh.add(line);
            
            group.add(mesh);
            parts[key] = mesh;
        });

        // Hole frame (thin neon guides)
        const frameGeo = new THREE.BoxGeometry(1, 1, 0.2);
        ['top', 'bottom', 'left', 'right'].forEach(key => {
            const frame = new THREE.Mesh(frameGeo, frameMat.clone());
            group.add(frame);
            frameParts[key] = frame;
        });
        
        group.visible = false;
        this.scene.add(group);
        
        this.pool.push({
            group: group,
            parts: parts,
            frameParts: frameParts,
            active: false,
            passed: false
        });
    }
  }

  update(dt, playerPos, speed) {
    // Increase difficulty slowly
    this.difficulty += dt * 0.01;

    this.spawnTimer += dt;
    // Spawn logic: Interleave with normal obstacles?
    // Let's just spawn rarely but guaranteed
    if (this.spawnTimer > this.spawnInterval) {
        this.spawnTimer = 0;
        this._spawn();
    }

    // Move & Collision
    for (let i = this.walls.length - 1; i >= 0; i--) {
        const w = this.walls[i];
        
        // Move Z
        const wallSpeed = speed * 12 + 5; // Slightly faster than terrain? Or same? User said "Approaching"
        w.group.position.z += wallSpeed * dt;

        // Visual Pulse
        const pulse = 0.4 + Math.sin(Date.now() * 0.005) * 0.1;
        w.parts.top.material.opacity = pulse;
        w.parts.bottom.material.opacity = pulse;
        w.parts.left.material.opacity = pulse;
        w.parts.right.material.opacity = pulse;
        w.frameParts.top.material.opacity = 0.8 + pulse * 0.2;
        w.frameParts.bottom.material.opacity = 0.8 + pulse * 0.2;
        w.frameParts.left.material.opacity = 0.8 + pulse * 0.2;
        w.frameParts.right.material.opacity = 0.8 + pulse * 0.2;

        // Check Passed
        if (!w.passed && w.group.position.z > playerPos.z) {
            w.passed = true;
            this._triggerPass(w);
        }

        // Remove if far behind
        if (w.group.position.z > 20) {
            this._despawn(w);
            continue;
        }

        // Collision Check (AABB vs Point for simplicity, or AABB vs Sphere)
        // Check Player vs Each Wall Part
        if (!w.passed) { // Only check collision if in front
             // Optimization: only check if close in Z
             if (Math.abs(w.group.position.z - playerPos.z) < 1.0) {
                 if (this._checkCollision(w, playerPos)) {
                     this._handleCollision(w);
                 }
             }
        }
    }
  }

  _checkCollision(wall, pPos) {
      // Check each of the 4 parts
      // We can use Box3 for accurate collision
      const pBox = new THREE.Box3().setFromCenterAndSize(pPos, new THREE.Vector3(1, 0.5, 1)); // Player hitbox approx
      
      for(const key in wall.parts) {
          const mesh = wall.parts[key];
          const wallBox = new THREE.Box3().setFromObject(mesh);
          if (wallBox.intersectsBox(pBox)) return true;
      }
      return false;
  }

  _spawn() {
    const w = this.pool.find(i => !i.active);
    if (!w) return;

    w.active = true;
    w.passed = false;
    w.group.visible = true;
    
    // Position far ahead
    const z = -200;
    // Center X/Y mostly, maybe slight offset
    const cx = (Math.random() - 0.5) * 10;
    const cy = 6 + (Math.random() - 0.5) * 4; // Center height 4-8
    
    // Hole Size (Shrinks with difficulty)
    const baseHoleSize = Math.max(3.0, 8.0 - this.difficulty * 5); // Start huge (8), shrink to 3
    const holeW = baseHoleSize;
    const holeH = baseHoleSize * 0.8; 
    
    const wallThick = 50; // Extend far to sides
    const wallDepth = 0.5;
    
    w.group.position.set(cx, cy, z);
    w.holeW = holeW;
    w.holeH = holeH;

    // 1. Top Part
    w.parts.top.scale.set(wallThick, wallThick, wallDepth);
    w.parts.top.position.set(0, wallThick/2 + holeH/2, 0);

    // 2. Bottom Part
    w.parts.bottom.scale.set(wallThick, wallThick, wallDepth);
    w.parts.bottom.position.set(0, -(wallThick/2 + holeH/2), 0);

    // 3. Left Part
    w.parts.left.scale.set(wallThick, holeH, wallDepth);
    w.parts.left.position.set(-(wallThick/2 + holeW/2), 0, 0);

    // 4. Right Part
    w.parts.right.scale.set(wallThick, holeH, wallDepth);
    w.parts.right.position.set(wallThick/2 + holeW/2, 0, 0);

    // Hole frame guides
    const frameThickness = 0.6;
    w.frameParts.top.scale.set(holeW + frameThickness, frameThickness, wallDepth);
    w.frameParts.top.position.set(0, holeH / 2 + frameThickness / 2, 0.02);
    w.frameParts.bottom.scale.set(holeW + frameThickness, frameThickness, wallDepth);
    w.frameParts.bottom.position.set(0, -(holeH / 2 + frameThickness / 2), 0.02);
    w.frameParts.left.scale.set(frameThickness, holeH, wallDepth);
    w.frameParts.left.position.set(-(holeW / 2 + frameThickness / 2), 0, 0.02);
    w.frameParts.right.scale.set(frameThickness, holeH, wallDepth);
    w.frameParts.right.position.set(holeW / 2 + frameThickness / 2, 0, 0.02);

    this.walls.push(w);
  }

  _despawn(w) {
      w.active = false;
      w.group.visible = false;
      const idx = this.walls.indexOf(w);
      if (idx > -1) this.walls.splice(idx, 1);
  }

  _handleCollision(w) {
      // Boom
      window.dispatchEvent(new CustomEvent('player-collision', { 
        detail: { type: 'wall', position: w.group.position.clone() } 
      }));
      // Don't despawn wall, player crashes INTO it. 
      // But for gameplay flow, maybe disable collision after hit so they pass through?
      w.passed = true; 
  }

  _triggerPass(w) {
      // Bonus for survival
      window.dispatchEvent(new CustomEvent('player-search-item', { 
        detail: { type: 'score', position: w.group.position.clone() } // Reuse score logic
      }));
  }
}
