import * as THREE from "three";

/**
 * EnemyBomber Craft Model
 * Heavy frame with bulky engines.
 */
export class EnemyBomber {
  constructor() {
    this.mesh = new THREE.Group();
    this.health = 35;
    this._build();
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  _build() {
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.6, 3.2, 8);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x4b1d1d, shininess: 60 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.mesh.add(body);

    const armorGeo = new THREE.BoxGeometry(1.4, 0.6, 1.6);
    const armorMat = new THREE.MeshPhongMaterial({ color: 0x5c2a2a });
    const armor = new THREE.Mesh(armorGeo, armorMat);
    armor.position.set(0, 0, -0.2);
    this.mesh.add(armor);

    const wingGeo = new THREE.BoxGeometry(3.6, 0.12, 1.2);
    const wingMat = new THREE.MeshPhongMaterial({ color: 0x3b0f0f });
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, -0.1, 0.4);
    this.mesh.add(wing);

    const engGeo = new THREE.CylinderGeometry(0.25, 0.3, 1.2, 10);
    engGeo.rotateX(Math.PI / 2);
    const engMat = new THREE.MeshPhongMaterial({ color: 0x1b1b1b });
    const engL = new THREE.Mesh(engGeo, engMat);
    engL.position.set(0.9, 0, 1.0);
    this.mesh.add(engL);
    const engR = new THREE.Mesh(engGeo, engMat);
    engR.position.set(-0.9, 0, 1.0);
    this.mesh.add(engR);

    const glowGeo = new THREE.CircleGeometry(0.18, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff6b6b, side: THREE.DoubleSide });
    const glowL = new THREE.Mesh(glowGeo, glowMat);
    glowL.position.set(0.9, 0, 1.55);
    this.mesh.add(glowL);
    const glowR = new THREE.Mesh(glowGeo, glowMat);
    glowR.position.set(-0.9, 0, 1.55);
    this.mesh.add(glowR);
  }
}
