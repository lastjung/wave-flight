import * as THREE from "three";

/**
 * Obstacle Craft/Prop Model
 * Represents a floating obstacle or structure in the world.
 */
export class Obstacle {
  constructor() {
    this.mesh = new THREE.Group();
    this.type = Math.random() > 0.5 ? 'mine' : 'gear';
    this.rotSpeed = (Math.random() - 0.5) * 2; // Random rotation speed
    
    if (this.type === 'mine') {
        this._buildMine();
    } else {
        this._buildGear();
    }
  }

  update(dt) {
    // Self-rotation animation
    if (this.type === 'mine') {
        this.mesh.rotation.y += this.rotSpeed * dt;
        this.mesh.rotation.z += this.rotSpeed * 0.5 * dt;
    } else {
        // Gears spin faster on Z axis (rolling)
        this.mesh.rotation.z += this.rotSpeed * 3 * dt;
    }
  }

  _buildMine() {
    // Steampunk Floating Mine
    // 1. Core Sphere (Dark Iron)
    const coreGeo = new THREE.IcosahedronGeometry(0.8, 1);
    const coreMat = new THREE.MeshPhongMaterial({ 
        color: 0x222222, 
        flatShading: true,
        shininess: 30
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    this.mesh.add(core);

    // 2. Spikes (Rusty Metal)
    const spikeGeo = new THREE.ConeGeometry(0.15, 0.8, 6);
    const spikeMat = new THREE.MeshPhongMaterial({ color: 0x552200 });
    
    // Distribute spikes
    const positions = [
        [0, 1, 0], [0, -1, 0], 
        [1, 0, 0], [-1, 0, 0], 
        [0, 0, 1], [0, 0, -1]
    ];
    
    positions.forEach(pos => {
        const spike = new THREE.Mesh(spikeGeo, spikeMat);
        const vec = new THREE.Vector3(...pos);
        spike.position.copy(vec.multiplyScalar(0.7));
        spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec.normalize());
        this.mesh.add(spike);
    });

    // 3. Glowing Eyes/Sensors
    const glowGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    [0.6, -0.6].forEach(x => {
        const eye = new THREE.Mesh(glowGeo, glowMat);
        eye.position.set(x, 0, 0.5);
        this.mesh.add(eye);
    });
  }

  _buildGear() {
    // Brass Gear
    // 1. Main Cylinder (Brass)
    const radius = 1.0;
    const bodyGeo = new THREE.CylinderGeometry(radius, radius, 0.3, 16);
    const bodyMat = new THREE.MeshPhongMaterial({ 
        color: 0xb8860b, // Dark Goldenrod
        shininess: 80,
        specular: 0xffd700
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.mesh.add(body);

    // 2. Center Hole (Visual only - dark cylinder caps)
    const holeGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.31, 12);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x110000 });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    this.mesh.add(hole);

    // 3. Teeth (Small cubes around perimeter)
    const toothGeo = new THREE.BoxGeometry(0.4, 0.3, 0.4);
    const toothCount = 8;
    
    for(let i=0; i<toothCount; i++) {
        const angle = (i / toothCount) * Math.PI * 2;
        const tooth = new THREE.Mesh(toothGeo, bodyMat);
        
        tooth.position.set(
            Math.cos(angle) * (radius), 
            0, 
            Math.sin(angle) * (radius)
        );
        tooth.rotation.y = -angle;
        this.mesh.add(tooth);
    }
    
    // Orient the whole gear to face player (Standing up)
    this.mesh.rotation.x = Math.PI / 2;
    // But wrapper rotation handles global orientation, so this is local
  }
}
