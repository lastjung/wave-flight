import * as THREE from "three";

/**
 * Camera System - Chase Camera
 */
export class CameraSystem {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target; // Player instance
    
    // Chase Camera (Forward is -Z, Behind is +Z)
    this.offset = new THREE.Vector3(0, 3.2, 5); 
    this.lookAtOffset = new THREE.Vector3(0, 0, -5); 

    this.shakeIntensity = 0;
    this.trauma = 0;
    this.targetFOV = 60;
  }

  shake(intensity = 0.5) {
    // Add trauma (clamped to 1.0)
    this.trauma = Math.min(1.0, this.trauma + intensity);
  }

  update(time, dt) {
    const targetPos = this.target.getPosition();
    
    // Smooth FOV Transition
    if (this.camera.fov !== this.targetFOV) {
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFOV, 0.1);
        this.camera.updateProjectionMatrix();
    }

    // 1. Calculate ideal base position
    const idealPos = targetPos.clone().add(this.offset);
    
    // Impact Kickback (Z-axis displacement based on trauma)
    // When trauma is high, push camera back slightly + random noise
    if (this.trauma > 0) {
        // A sudden kick backwards - INCREASED 5X
        const kickAmt = this.trauma * this.trauma * 10.0; 
        idealPos.z += kickAmt; 
    }

    // Smoothly interpolate camera move (Damping)
    const lerpFactor = 0.1;
    this.camera.position.lerp(idealPos, lerpFactor);

    // 2. Look At Logic
    const lookAtPos = targetPos.clone().add(this.lookAtOffset);
    this.camera.lookAt(lookAtPos);

    // 3. Apply Shake (Rotational + Translational)
    // Usage: Shake = Trauma^2 (Non-linear fallback)
    if (this.trauma > 0) {
        const shake = this.trauma * this.trauma;
        
        // Time constant for Perlin noise
        const t = time * 20; // Faster frequency
        
        // Rotational Shake - INCREASED SIGNIFICANTLY
        const yaw = (Math.random() - 0.5) * 0.5 * shake; // +/- 0.25 rad (~15 deg)
        const pitch = (Math.random() - 0.5) * 0.5 * shake;
        const roll = (Math.random() - 0.5) * 0.8 * shake; // +/- 0.4 rad (~23 deg)
        
        // Apply rotations (Post-lookAt)
        this.camera.rotateX(pitch);
        this.camera.rotateY(yaw);
        this.camera.rotateZ(roll);

        // Positional Shake (XY Jitter) - INCREASED
        const range = 2.0 * shake; // +/- 1.0 unit
        this.camera.position.x += (Math.random() - 0.5) * range;
        this.camera.position.y += (Math.random() - 0.5) * range;

        // Decay trauma
        this.trauma = Math.max(0, this.trauma - dt * 1.5); // Faster decay for "snap" feel
    }
  }
}
