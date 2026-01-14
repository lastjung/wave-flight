import * as THREE from "three";

/**
 * GyroCopter Craft Model
 * Light, agile rotorcraft with visible spinning blades.
 */
export class GyroCopter {
  constructor() {
    this.mesh = new THREE.Group();
    this.leftEng = null;
    this.rightEng = null;
    this.propeller = new THREE.Group();

    this._build();
  }

  _build() {
    // Cabin
    const bodyGeo = new THREE.BoxGeometry(1.2, 0.6, 2.2);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x3a3a3a, shininess: 60 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.z = -0.2;
    this.mesh.add(body);

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.45, 1.2, 12);
    noseGeo.rotateX(Math.PI / 2);
    const noseMat = new THREE.MeshPhongMaterial({ color: 0x1f1f1f });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = -1.6;
    this.mesh.add(nose);

    // Cockpit
    const glassGeo = new THREE.SphereGeometry(0.45, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const glassMat = new THREE.MeshPhongMaterial({ color: 0x66c2ff, transparent: true, opacity: 0.7 });
    const canopy = new THREE.Mesh(glassGeo, glassMat);
    canopy.position.set(0, 0.35, -0.5);
    canopy.scale.set(1, 0.8, 1.3);
    this.mesh.add(canopy);

    // Skids
    const skidGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8);
    skidGeo.rotateZ(Math.PI / 2);
    const skidMat = new THREE.MeshPhongMaterial({ color: 0x2b2b2b });
    const skidL = new THREE.Mesh(skidGeo, skidMat);
    skidL.position.set(0.5, -0.5, 0.2);
    this.mesh.add(skidL);
    const skidR = new THREE.Mesh(skidGeo, skidMat);
    skidR.position.set(-0.5, -0.5, 0.2);
    this.mesh.add(skidR);

    // Tail Boom
    const boomGeo = new THREE.CylinderGeometry(0.08, 0.12, 2.2, 8);
    boomGeo.rotateX(Math.PI / 2);
    const boom = new THREE.Mesh(boomGeo, bodyMat);
    boom.position.set(0, 0.05, 1.2);
    this.mesh.add(boom);

    // Top Rotor
    const rotorHubGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8);
    const rotorHub = new THREE.Mesh(rotorHubGeo, skidMat);
    rotorHub.position.set(0, 0.55, -0.1);
    this.propeller.add(rotorHub);

    const bladeGeo = new THREE.BoxGeometry(0.08, 0.02, 2.8);
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0x0f0f0f });
    const blade1 = new THREE.Mesh(bladeGeo, bladeMat);
    blade1.position.z = 1.4;
    this.propeller.add(blade1);
    const blade2 = new THREE.Mesh(bladeGeo, bladeMat);
    blade2.rotation.y = Math.PI / 2;
    blade2.position.x = 1.4;
    this.propeller.add(blade2);

    this.propeller.position.set(0, 0.55, -0.1);
    this.mesh.add(this.propeller);

    // Side pods (engines) for steam vent alignment
    const podGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.8, 10);
    podGeo.rotateX(Math.PI / 2);
    const podMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
    this.leftEng = new THREE.Mesh(podGeo, podMat);
    this.leftEng.position.set(0.7, 0.05, 0.1);
    this.mesh.add(this.leftEng);
    this.rightEng = new THREE.Mesh(podGeo, podMat);
    this.rightEng.position.set(-0.7, 0.05, 0.1);
    this.mesh.add(this.rightEng);
  }
}
