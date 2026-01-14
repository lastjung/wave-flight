import * as THREE from "three";

/**
 * EnemyInterceptor Craft Model
 * Fast, small silhouette with sharp wings.
 */
export class EnemyInterceptor {
  constructor() {
    this.mesh = new THREE.Group();
    this.health = 12;
    this._build();
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  _build() {
    const bodyGeo = new THREE.CylinderGeometry(0.1, 0.3, 2.2, 6);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, shininess: 90 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.mesh.add(body);

    const wingGeo = new THREE.BoxGeometry(2.4, 0.05, 0.7);
    const wingMat = new THREE.MeshPhongMaterial({ color: 0x1f2937 });
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 0, -0.3);
    this.mesh.add(wing);

    const finGeo = new THREE.BoxGeometry(0.4, 0.5, 0.05);
    const finMat = new THREE.MeshPhongMaterial({ color: 0x334155 });
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.set(0, 0.25, 0.8);
    this.mesh.add(fin);

    const glowGeo = new THREE.CircleGeometry(0.12, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 0, 1.2);
    this.mesh.add(glow);
  }
}
