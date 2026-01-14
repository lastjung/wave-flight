import * as THREE from "three";

/**
 * RailStriker Craft Model
 * Aggressive wedge with side fins and rear thrusters.
 */
export class RailStriker {
  constructor() {
    this.mesh = new THREE.Group();
    this.leftEng = null;
    this.rightEng = null;
    this.propeller = new THREE.Group(); // Placeholder for consistent animation hook

    this._build();
  }

  _build() {
    // Wedge body
    const bodyGeo = new THREE.ConeGeometry(0.9, 3.2, 4);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x2b2d42, shininess: 80 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.z = -0.2;
    this.mesh.add(body);

    // Spine
    const spineGeo = new THREE.BoxGeometry(0.3, 0.2, 2.4);
    const spineMat = new THREE.MeshPhongMaterial({ color: 0x8d99ae });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.set(0, 0.25, 0.1);
    this.mesh.add(spine);

    // Cockpit
    const glassGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const glassMat = new THREE.MeshPhongMaterial({ color: 0x00d1ff, emissive: 0x0088aa, transparent: true, opacity: 0.75 });
    const canopy = new THREE.Mesh(glassGeo, glassMat);
    canopy.position.set(0, 0.2, -0.8);
    canopy.scale.set(1.2, 0.6, 1.8);
    this.mesh.add(canopy);

    // Side fins
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(1.4, 0.2);
    finShape.lineTo(1.2, 1.0);
    finShape.lineTo(0, 0.6);
    finShape.lineTo(0, 0);
    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.05, bevelEnabled: false });
    finGeo.rotateX(-Math.PI / 2);
    const finMat = new THREE.MeshPhongMaterial({ color: 0x3c3f58, side: THREE.DoubleSide });
    const finL = new THREE.Mesh(finGeo, finMat);
    finL.position.set(0.25, 0, -0.2);
    this.mesh.add(finL);
    const finR = new THREE.Mesh(finGeo, finMat);
    finR.scale.x = -1;
    finR.position.set(-0.25, 0, -0.2);
    this.mesh.add(finR);

    // Rear thrusters
    const engGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.0, 10);
    engGeo.rotateX(Math.PI / 2);
    const engMat = new THREE.MeshPhongMaterial({ color: 0x1b1b1b });
    this.leftEng = new THREE.Mesh(engGeo, engMat);
    this.leftEng.position.set(0.5, 0, 1.0);
    this.mesh.add(this.leftEng);
    this.rightEng = new THREE.Mesh(engGeo, engMat);
    this.rightEng.position.set(-0.5, 0, 1.0);
    this.mesh.add(this.rightEng);

    // Afterburner rings
    const ringGeo = new THREE.TorusGeometry(0.22, 0.05, 6, 12);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d1ff });
    const ringL = new THREE.Mesh(ringGeo, ringMat);
    ringL.position.set(0.5, 0, 1.55);
    ringL.rotation.x = Math.PI / 2;
    this.mesh.add(ringL);
    const ringR = new THREE.Mesh(ringGeo, ringMat);
    ringR.position.set(-0.5, 0, 1.55);
    ringR.rotation.x = Math.PI / 2;
    this.mesh.add(ringR);
  }
}
