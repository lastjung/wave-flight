/**
 * Input Manager for Keyboard and Touch
 */

export class Input {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      shift: false,
      space: false,
      cycle: false,
    };

    this.touch = {
      isDown: false,
      x: 0,
      y: 0,
    };

    this._initEvents();
  }

  _initEvents() {
    // Keyboard
    window.addEventListener("keydown", (e) => this._handleKey(e, true));
    window.addEventListener("keyup", (e) => this._handleKey(e, false));

    // Touch / Mouse (Simple Drag)
    window.addEventListener("pointerdown", (e) => {
      this.touch.isDown = true;
      this._updateTouch(e);
    });
    window.addEventListener("pointermove", (e) => {
      if (this.touch.isDown) this._updateTouch(e);
    });
    window.addEventListener("pointerup", () => {
      this.touch.isDown = false;
      this.touch.x = 0;
      this.touch.y = 0;
    });
  }

  _handleKey(e, isPressed) {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        this.keys.down = isPressed;
        break;
      case "ArrowDown":
      case "KeyS":
        this.keys.up = isPressed;
        break;
      case "ArrowLeft":
      case "KeyA":
        this.keys.left = isPressed;
        break;
      case "ArrowRight":
      case "KeyD":
        this.keys.right = isPressed;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this.keys.shift = isPressed;
        break;
      case "Space":
        this.keys.space = isPressed;
        break;
      case "KeyQ":
        this.keys.cycle = isPressed;
        break;
    }
  }

  _updateTouch(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    this.touch.x = nx;
    this.touch.y = ny;
  }
}
