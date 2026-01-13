/**
 * Common Utilities and Math Functions
 */

export class Utils {
  /**
   * Linear Interpolation
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Clamp value between min and max
   */
  static clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Perlin Noise implementation (Classic)
   */
  static Perlin = (() => {
    const p = new Uint8Array(512);
    const perm = new Uint8Array(256);
    for (let i = 0; i < 256; i++) perm[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = perm[i];
      perm[i] = perm[j];
      perm[j] = t;
    }
    for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (hash, x, y, z) => {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    const noise = (x, y, z) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
      const u = fade(x);
      const v = fade(y);
      const w = fade(z);
      const A = p[X] + Y;
      const AA = p[A] + Z;
      const AB = p[A + 1] + Z;
      const B = p[X + 1] + Y;
      const BA = p[B] + Z;
      const BB = p[B + 1] + Z;
      return Utils.lerp(
        Utils.lerp(
          Utils.lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u),
          Utils.lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u),
          v
        ),
        Utils.lerp(
          Utils.lerp(
            grad(p[AA + 1], x, y, z - 1),
            grad(p[BA + 1], x - 1, y, z - 1),
            u
          ),
          Utils.lerp(
            grad(p[AB + 1], x, y - 1, z - 1),
            grad(p[BB + 1], x - 1, y - 1, z - 1),
            u
          ),
          v
        ),
        w
      );
    };

    const fbm = (x, y, z, oct = 4) => {
      let amp = 0.5;
      let f = 1;
      let s = 0;
      for (let i = 0; i < oct; i++) {
        s += amp * noise(x * f, y * f, z * f);
        f *= 2;
        amp *= 0.5;
      }
      return s;
    };

    return { noise, fbm };
  })();
}
