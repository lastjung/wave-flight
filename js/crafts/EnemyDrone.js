import * as THREE from "three";

/**
 * EnemyDrone Craft Model
 * A hostile, red-tinted variation of the SpaceFighter.
 */
export class EnemyDrone {
  constructor() {
    this.mesh = new THREE.Group();
    this.health = 20; // Takes 2 hits
    this._build();
  }

  takeDamage(amount) {
    this.health -= amount;
    // Visual feedback? Flash white?
    return this.health <= 0;
  }

  _build() {
    // 1. Sleek Fuselage (Dark Metal)
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.4, 2.8, 6); // Hexagonal body
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x1a0a0a, shininess: 80 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.mesh.add(body);

    // 2. Cockpit (Glowing Red)
    const cockGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const cockMat = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8, transparent: true, opacity: 0.9 });
    const cockpit = new THREE.Mesh(cockGeo, cockMat);
    cockpit.position.set(0, 0.2, -0.4);
    cockpit.scale.set(1, 0.6, 1.8);
    this.mesh.add(cockpit);

    // 3. Forward-Swept Wings (Sharp & Aggressive)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(2.2, -0.4); 
    wingShape.lineTo(2.0, 0.8);
    wingShape.lineTo(0, 0.4);
    wingShape.lineTo(0, 0);

    const wingExtrude = { depth: 0.05, bevelEnabled: false };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrude);
    wingGeo.rotateX(-Math.PI / 2);
    const wingMat = new THREE.MeshPhongMaterial({ color: 0x330000, side: THREE.DoubleSide });
    
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(0.2, 0, -0.6);
    this.mesh.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.scale.x = -1;
    rightWing.position.set(-0.2, 0, -0.6);
    this.mesh.add(rightWing);

    // 4. Twin Thrusters (Rear)
    const engineGeo = new THREE.CylinderGeometry(0.25, 0.35, 1, 8);
    engineGeo.rotateX(Math.PI / 2);
    const engineMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
    
    const leftEng = new THREE.Mesh(engineGeo, engineMat);
    leftEng.position.set(0.45, 0, 0.8);
    this.mesh.add(leftEng);

    const rightEng = new THREE.Mesh(engineGeo, engineMat);
    rightEng.position.set(-0.45, 0, 0.8);
    this.mesh.add(rightEng);

    // 5. Engine Glow (Red/Orange)
    const glowGeo = new THREE.CircleGeometry(0.2, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff4500, side: THREE.DoubleSide });
    const lGlow = new THREE.Mesh(glowGeo, glowMat);
    lGlow.position.set(0.45, 0, 1.31);
    this.mesh.add(lGlow);
    const rGlow = new THREE.Mesh(glowGeo, glowMat);
    rGlow.position.set(-0.45, 0, 1.31);
    this.mesh.add(rGlow);
  }
}
