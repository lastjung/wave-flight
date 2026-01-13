import * as THREE from "three";

/**
 * ItemManager - Spawns floating collectibles
 */
export class ItemManager {
  constructor(scene, environment) {
    this.scene = scene;
    this.environment = environment;
    this.items = [];
    this.pool = [];
    this.poolSize = 10;
    
    this.spawnTimer = 0;
    this.spawnInterval = 5.0; // Rare spawn (every 5s)

    this._initPool();
  }

  _initPool() {
    for (let i = 0; i < this.poolSize; i++) {
        const item = new THREE.Group();
        
        // Visuals can be swapped based on type later
        // Default: Fuel Can (Blue Cylinder)
        const geo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 8);
        const mat = new THREE.MeshPhongMaterial({ color: 0x0088ff, emissive: 0x0044aa });
        const mesh = new THREE.Mesh(geo, mat);
        item.add(mesh);
        
        // Label/Icon? Keep simple for now
        
        item.visible = false;
        this.scene.add(item);
        
        // Container object
        this.pool.push({
            group: item,
            type: 'fuel', // or 'score'
            active: false
        });
    }
  }

  update(dt, playerPos, speed) {
    this.spawnTimer += dt;
    if (this.spawnTimer > this.spawnInterval) {
        this.spawnTimer = 0;
        this._spawn();
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        
        // Spin
        it.group.rotation.y += dt;
        it.group.rotation.x += dt * 0.5;
        
        // Move Z
        it.group.position.z += dt * speed * 12;

        // Despawn
        if (it.group.position.z > 20) {
            this._despawn(it);
            continue;
        }

        // Collision
        const dist = it.group.position.distanceTo(playerPos);
        if (dist < 2.0) {
            this._collect(it);
        }
    }
  }

  _spawn() {
    const it = this.pool.find(i => !i.active);
    if (!it) return;

    it.active = true;
    it.group.visible = true;
    
    // Pick type
    it.type = Math.random() > 0.5 ? 'fuel' : 'score';
    
    // Color change based on type
    const mesh = it.group.children[0];
    if (it.type === 'fuel') {
        mesh.material.color.setHex(0x0088ff); // Blue
        mesh.material.emissive.setHex(0x0044aa);
    } else {
        mesh.material.color.setHex(0xffd700); // Gold
        mesh.material.emissive.setHex(0xffaa00);
    }

    const x = (Math.random() - 0.5) * 30;
    const z = -150;
    const y = this.environment.getHeightAt(x, z) + 5 + Math.random() * 10; // Floating high

    it.group.position.set(x, y, z);
    this.items.push(it);
  }

  _despawn(it) {
    it.active = false;
    it.group.visible = false;
    const idx = this.items.indexOf(it);
    if (idx > -1) this.items.splice(idx, 1);
  }

  _collect(it) {
    this._despawn(it);
    // Dispatch event
    window.dispatchEvent(new CustomEvent('player-search-item', { 
        detail: { type: it.type, position: it.group.position.clone() } 
    }));
  }
}
