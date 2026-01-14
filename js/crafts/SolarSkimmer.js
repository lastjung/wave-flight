import * as THREE from "three";

/**
 * SolarSkimmer Craft Model
 * Wide-wing glider with bright panels.
 */
export class SolarSkimmer {
  constructor() {
    this.mesh = new THREE.Group();
    this.leftEng = null;
    this.rightEng = null;
    this.propeller = new THREE.Group();

    this._build();
  }

  _build() {
    // Central fuselage
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.5, 2.6, 10);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x6c757d, shininess: 70 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.mesh.add(body);

    // Cockpit
    const glassGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const glassMat = new THREE.MeshPhongMaterial({ color: 0x90e0ef, emissive: 0x00b4d8, transparent: true, opacity: 0.7 });
    const cockpit = new THREE.Mesh(glassGeo, glassMat);
    cockpit.position.set(0, 0.2, -0.6);
    cockpit.scale.set(1.1, 0.6, 1.6);
    this.mesh.add(cockpit);

    // Wide wings
    const wingGeo = new THREE.BoxGeometry(5.2, 0.08, 1.6);
    const wingMat = new THREE.MeshPhongMaterial({ color: 0xf4a261, emissive: 0xffd166, emissiveIntensity: 0.2 });
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 0, -0.2);
    this.mesh.add(wing);

    // Wing tips
    const tipGeo = new THREE.BoxGeometry(0.2, 0.4, 0.6);
    const tipMat = new THREE.MeshPhongMaterial({ color: 0x3a0ca3 });
    const tipL = new THREE.Mesh(tipGeo, tipMat);
    tipL.position.set(2.6, 0.1, -0.2);
    this.mesh.add(tipL);
    const tipR = new THREE.Mesh(tipGeo, tipMat);
    tipR.position.set(-2.6, 0.1, -0.2);
    this.mesh.add(tipR);

    // Rear fins
    const finGeo = new THREE.BoxGeometry(0.8, 0.4, 0.1);
    const finMat = new THREE.MeshPhongMaterial({ color: 0x2a9d8f });
    const finL = new THREE.Mesh(finGeo, finMat);
    finL.position.set(0.6, 0.2, 1.0);
    this.mesh.add(finL);
    const finR = new THREE.Mesh(finGeo, finMat);
    finR.position.set(-0.6, 0.2, 1.0);
    this.mesh.add(finR);

    // Side pods for steam vents
    const podGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8);
    podGeo.rotateX(Math.PI / 2);
    const podMat = new THREE.MeshPhongMaterial({ color: 0x343a40 });
    this.leftEng = new THREE.Mesh(podGeo, podMat);
    this.leftEng.position.set(1.0, 0, 0.6);
    this.mesh.add(this.leftEng);
    this.rightEng = new THREE.Mesh(podGeo, podMat);
    this.rightEng.position.set(-1.0, 0, 0.6);
    this.mesh.add(this.rightEng);
  }
}
