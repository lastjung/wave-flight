import * as THREE from "three";

/**
 * SteampunkPlane Craft Model
 */
export class SteampunkPlane {
  constructor() {
    this.mesh = new THREE.Group();
    this.leftEng = null;
    this.rightEng = null;
    this.propeller = null;

    this._build();
  }

  _build() {
    // 1. Main Fuselage (BUILD ALONG Z AXIS)
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.6, 3, 16);
    bodyGeo.rotateX(Math.PI / 2); // Body along Z
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xd4a017, shininess: 100 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.mesh.add(body);

    // 2. Nose Cone (Forward is -Z)
    const noseGeo = new THREE.ConeGeometry(0.3, 1.2, 16);
    noseGeo.rotateX(Math.PI / 2);
    const noseMat = new THREE.MeshPhongMaterial({ color: 0x805a10 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = -2.1;
    this.mesh.add(nose);

    // 3. Cockpit (Glass Dome)
    const cockGeo = new THREE.SphereGeometry(0.35, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockMat = new THREE.MeshPhongMaterial({ color: 0x3366ff, transparent: true, opacity: 0.6 });
    const cockpit = new THREE.Mesh(cockGeo, cockMat);
    cockpit.position.set(0, 0.3, -0.6); // Centered on X, slightly up and slightly forward
    cockpit.scale.set(1, 0.8, 1.5);
    this.mesh.add(cockpit);

    // 4. Main Wings (Flat on XZ plane)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(1.8, 1.5); // Wing span along X, back along Z
    wingShape.lineTo(1.8, 2.2);
    wingShape.lineTo(0, 1.2);
    wingShape.lineTo(0, 0);

    const wingExtrude = { depth: 0.1, bevelEnabled: false };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrude);
    wingGeo.rotateX(-Math.PI / 2); // Put on XZ plane
    const wingMat = new THREE.MeshPhongMaterial({ color: 0xd4a017, side: THREE.DoubleSide });
    
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(0.4, 0, -0.2);
    this.mesh.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.scale.x = -1; // Flip for right side
    rightWing.position.set(-0.4, 0, -0.2);
    this.mesh.add(rightWing);

    // 5. Tail Stabilizers (Back is +Z)
    const tailGeo = new THREE.BoxGeometry(1.2, 0.8, 0.05);
    const tailMat = new THREE.MeshPhongMaterial({ color: 0xd4a017 });
    
    const tailV = new THREE.Mesh(tailGeo, tailMat); // Vertical
    tailV.rotateY(Math.PI / 2);
    tailV.position.set(0, 0, 1.6);
    this.mesh.add(tailV);
    
    const tailH = new THREE.Mesh(tailGeo, tailMat); // Horizontal
    tailH.rotation.z = Math.PI / 2;
    tailH.rotateY(Math.PI / 2);
    tailH.position.set(0, 0, 1.6);
    this.mesh.add(tailH);

    // 6. Dual Thrusters (Rear Engines at +Z)
    const engGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 12);
    engGeo.rotateX(Math.PI / 2);
    const engMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
    
    this.leftEng = new THREE.Mesh(engGeo, engMat);
    this.leftEng.position.set(0.6, 0, 1.2);
    this.mesh.add(this.leftEng);

    this.rightEng = new THREE.Mesh(engGeo, engMat);
    this.rightEng.position.set(-0.6, 0, 1.2);
    this.mesh.add(this.rightEng);

    // 7. GUN BARRELS (Wing-tip mounted)
    const gunGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8);
    gunGeo.rotateX(Math.PI / 2);
    const gunMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
    
    const lGun = new THREE.Mesh(gunGeo, gunMat);
    lGun.position.set(1.8, -0.1, -0.5);
    this.mesh.add(lGun);

    const rGun = new THREE.Mesh(gunGeo, gunMat);
    rGun.position.set(-1.8, -0.1, -0.5);
    this.mesh.add(rGun);

    // 8. Propeller (Small Turbo at the back +Z)
    const propGeo = new THREE.BoxGeometry(0.1, 1.5, 0.2);
    const propMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    this.propeller = new THREE.Mesh(propGeo, propMat);
    this.propeller.rotateX(Math.PI / 2);
    this.propeller.position.z = 2.1;
    this.mesh.add(this.propeller);
  }
}
