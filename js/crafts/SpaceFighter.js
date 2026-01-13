import * as THREE from "three";

/**
 * SpaceFighter Craft Model
 */
export class SpaceFighter {
  constructor() {
    this.mesh = new THREE.Group();
    this.leftEng = null;
    this.rightEng = null;
    this.propeller = new THREE.Group(); // Placeholder for consistency

    this._build();
  }

  _build() {
    // 1. Sleek Fuselage (Dark Metal)
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.4, 2.8, 6); // Hexagonal body
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 80 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.mesh.add(body);

    // 2. Cockpit (Glowing Cyan)
    const cockGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const cockMat = new THREE.MeshPhongMaterial({ color: 0x00f5ff, emissive: 0x00f5ff, emissiveIntensity: 0.5, transparent: true, opacity: 0.8 });
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
    const wingMat = new THREE.MeshPhongMaterial({ color: 0x444444, side: THREE.DoubleSide });
    
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
    
    this.leftEng = new THREE.Mesh(engineGeo, engineMat);
    this.leftEng.position.set(0.45, 0, 0.8);
    this.mesh.add(this.leftEng);

    this.rightEng = new THREE.Mesh(engineGeo, engineMat);
    this.rightEng.position.set(-0.45, 0, 0.8);
    this.mesh.add(this.rightEng);

    // 5. Engine Glow (Visual only)
    const glowGeo = new THREE.CircleGeometry(0.2, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, side: THREE.DoubleSide });
    const lGlow = new THREE.Mesh(glowGeo, glowMat);
    lGlow.position.set(0.45, 0, 1.31);
    this.mesh.add(lGlow);
    const rGlow = new THREE.Mesh(glowGeo, glowMat);
    rGlow.position.set(-0.45, 0, 1.31);
    this.mesh.add(rGlow);

    // 6. Laser Barrels
    const gunGeo = new THREE.BoxGeometry(0.08, 0.08, 1.2);
    const gunMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const lGun = new THREE.Mesh(gunGeo, gunMat);
    lGun.position.set(0.8, -0.1, -0.2);
    this.mesh.add(lGun);
    const rGun = new THREE.Mesh(gunGeo, gunMat);
    rGun.position.set(-0.8, -0.1, -0.2);
    this.mesh.add(rGun);
  }
}
