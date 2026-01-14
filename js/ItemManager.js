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
    this.spawnInterval = 2.5; // More frequent spawn (every 2.5s)

    this._initPool();
  }

  _initPool() {
    for (let i = 0; i < this.poolSize; i++) {
        const item = new THREE.Group();
        
        // Visuals can be swapped based on type later
        // Default: Fuel Can (Blue Cylinder)
        const geo = new THREE.CylinderGeometry(0.7, 0.7, 1.6, 10);
        const mat = new THREE.MeshPhongMaterial({ color: 0x0088ff, emissive: 0x0044aa });
        const mesh = new THREE.Mesh(geo, mat);
        item.add(mesh);

        const glowGeo = new THREE.SphereGeometry(1.2, 12, 12);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x66ccff,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        item.add(glow);
        
        // Label/Icon? Keep simple for now
        
        item.visible = false;
        this.scene.add(item);
        
        // Container object
        this.pool.push({
            group: item,
            type: 'fuel', // or 'score'
            active: false,
            baseY: 0
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
        
        // Spin + bob + pulse
        it.group.rotation.y += dt * 1.5;
        it.group.rotation.x += dt * 0.5;
        it.group.position.y = it.baseY + Math.sin(performance.now() * 0.003 + it.group.id) * 0.6;
        const pulse = 0.9 + Math.sin(performance.now() * 0.004 + it.group.id) * 0.12;
        it.group.scale.set(pulse, pulse, pulse);
        
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
    const glow = it.group.children[1];
    if (it.type === 'fuel') {
        mesh.material.color.setHex(0x0088ff); // Blue
        mesh.material.emissive.setHex(0x0044aa);
        glow.material.color.setHex(0x66ccff);
    } else {
        mesh.material.color.setHex(0xffd700); // Gold
        mesh.material.emissive.setHex(0xffaa00);
        glow.material.color.setHex(0xffdd66);
    }

    const x = (Math.random() - 0.5) * 30;
    const z = -150;
    const y = this.environment.getHeightAt(x, z) + 6 + Math.random() * 12; // Floating high

    it.baseY = y;
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
