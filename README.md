# Steampunk Wave Flight

**Steampunk Wave Flight** is an immersive 3D flight simulator built with **Three.js** and **Vanilla JavaScript**.
Set in a retro-futuristic steampunk world, players pilot a brass-finished airship over an endless, undulating neon ocean, dodging floating obstacles and managing steam pressure.

Live at https://lastjung.github.io/wave-flight/


## 🎮 Key Features

- **Dynamic Environment**: Real-time terrain generation using **Perlin Noise** creates an endless, shifting landscape.
- **Steampunk Aesthetics**: Custome-modeled airships with rotating propellers, steam vents, and brass textures.
- **Immersive Camera System**: Chase camera with **"Trauma-based" shake** effects that react to collisions and boosts.
- **Interactive Audio**:
  - **Web Audio API** powered sound system.
  - Adaptive engine pitch based on speed.
  - Industrial drone BGM and impact sound effects.
  - **Volume Control** slider and Mute toggle.
- **Responsive UI**: Stylish HUD built with **Tailwind CSS**, featuring health bars, score counters, and control sliders.

## 🕹️ Controls

|    Control     | Action                                 |
| :------------: | :------------------------------------- |
|   **W / S**    | Pitch Up / Down                        |
|   **A / D**    | Bank Left / Right                      |
|   **SHIFT**    | **Steam Boost** (Increase Speed & FOV) |
|     **Q**      | Cycle Ammo Type                        |
| **Mouse Drag** | Mobile/Touch Pilot Control             |
|   **CLICK**    | Start Audio Engine                     |

Detailed controls: `docs/how_to_play.md`

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript (ES Modules)
- **3D Engine**: Three.js (v0.160.0)
- **Styling**: Tailwind CSS (CDN)
- **Math/Physics**: Custom implementation of Perlin Noise & Physics-based camera trauma.

## 📦 File Structure

```
/
├── index.html          # Entry Point & HUD
├── js/
│   ├── main.js         # Game Loop & Systems Orchestration
│   ├── Player.js       # Physics & Movement Logic
│   ├── SoundManager.js # Web Audio API Implementation
│   ├── environment.js  # Terrain & Sky Generation
│   ├── crafts/         # 3D Models (SpaceFighter, SteampunkPlane, Obstacles)
│   └── ...
├── docs/
│   ├── environment_prompt.md  # Original Environment Spec
│   ├── game_prompt.md         # Game Concept & Crafts
│   └── physics_spec.md        # Coordinate & Physics Rules
└── ...
```

## 🚀 How to Run

Since this project uses ES Modules, it requires a local server to run.

1. **Python (SimpleHTTPServer)**

   ```bash
   # Run in project root
   python3 -m http.server 8000
   # Open http://localhost:8000
   ```

2. **Node.js (http-server)**

   ```bash
   npx http-server .
   # Open provided URL
   ```

3. **VS Code Live Server**
   - Open folder in VS Code.
   - Click "Go Live" at the bottom right.

## 📝 License

This project is created for educational and demonstration purposes.
