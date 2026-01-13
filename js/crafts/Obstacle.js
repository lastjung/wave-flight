import * as THREE from "three";

/**
 * Obstacle Craft/Prop Model
 * Represents a floating obstacle or structure in the world.
 */
export class Obstacle {
  constructor() {
    this.mesh = new THREE.Group();
    this._build();
  }

  _build() {
    // Steampunk Floating Mine / Pillar
    
    // 1. Main Cylinder (Brass/Copper)
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 3.5, 8);
    const mat = new THREE.MeshPhongMaterial({ 
        color: 0x8b4513, 
        shininess: 60,
        specular: 0x442200 
    });
    const mainBody = new THREE.Mesh(geo, mat);
    this.mesh.add(mainBody);

    // 2. Iron Rings (Top and Bottom)
    const ringGeo = new THREE.TorusGeometry(0.55, 0.1, 4, 12);
    const ringMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    
    const topRing = new THREE.Mesh(ringGeo, ringMat);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 1.0;
    this.mesh.add(topRing);

    const botRing = new THREE.Mesh(ringGeo, ringMat);
    botRing.rotation.x = Math.PI / 2;
    botRing.position.y = -1.0;
    this.mesh.add(botRing);

    // 3. Spikes (Hazard indicator)
    const spikeGeo = new THREE.ConeGeometry(0.1, 0.8, 8);
    const spikeMat = new THREE.MeshPhongMaterial({ color: 0x550000 });
    
    const topSpike = new THREE.Mesh(spikeGeo, spikeMat);
    topSpike.position.y = 2.0;
    this.mesh.add(topSpike);

    const botSpike = new THREE.Mesh(spikeGeo, spikeMat);
    botSpike.rotation.x = Math.PI;
    botSpike.position.y = -2.0;
    this.mesh.add(botSpike);

    // 4. Glowing Core (Optional)
    const glowGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    this.mesh.add(glow);
  }
}
