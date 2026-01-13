# 🌀 Vortex & Singularity: Interactive Particle Study

An interactive 3D particle simulation exploring the beauty of mathematical structures and chaotic dynamics through real-time WebGL visualization.

![Three.js](https://img.shields.io/badge/Three.js-0.160-black?logo=three.js)
![License](https://img.shields.io/badge/License-MIT-blue)
![HTML5](https://img.shields.io/badge/HTML5-Single_File-orange?logo=html5)

## ✨ Features

- **150,000 particles** rendered in real-time
- **Two visualization modes:**
  - 🔵 **Torus (Free Energy)** — Particles flow around a torus surface, demonstrating continuous energy circulation
  - ⚫ **Black Hole (Aizawa Attractor)** — Chaotic strange attractor creating mesmerizing, unpredictable motion
- **Doppler effect simulation** for enhanced visual depth
- **Fully customizable** — Adjust speed, color, and particle count
- **Interactive 3D camera** — Rotate, pan, and zoom
- **Single HTML file** — No build process, no dependencies to install

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari).

### Option 2: GitHub Pages
1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → main → root
4. Access your site at `https://[username].github.io/[repo-name]/`

### Option 3: Local Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```
Then open `http://localhost:8000/`

## 🎮 Controls

| Input | Action |
|-------|--------|
| Left Click + Drag | Rotate camera |
| Right Click + Drag | Pan camera |
| Scroll Wheel | Zoom in/out |
| Play/Pause | Start/stop simulation |
| Reset | Reset particles to initial positions |
| Auto-Rotate | Toggle automatic camera rotation |

## 🔬 Technical Background

### Torus Mode
Particles are distributed on a [torus](https://en.wikipedia.org/wiki/Torus) surface and flow through the structure following procedural animation rules. The visualization represents energy circulation patterns in a donut-shaped manifold.

### Black Hole Mode (Aizawa Attractor)
This mode implements the **Aizawa Attractor**, a chaotic dynamical system discovered by Japanese mathematician **Yoji Aizawa**. The system is defined by the following differential equations:

```
dx/dt = (z - b)x - dy
dy/dt = dx + (z - b)y  
dz/dt = c + az - z³/3 - (x² + y²)(1 + ez) + fzx³
```

With parameters: `a=0.95, b=0.7, c=0.6, d=3.5, e=0.25, f=0.1`

The attractor produces bounded but non-repeating trajectories, creating the appearance of particles being drawn into a gravitational singularity.

### Visual Effects
- **Doppler Shift**: Particles moving toward the camera appear brighter, while those moving away appear dimmer
- **Additive Blending**: Overlapping particles create a glowing effect
- **Exponential Fog**: Adds depth to the 3D scene

## 🛠 Technology Stack

- **[Three.js](https://threejs.org/)** (v0.160) — 3D rendering engine
- **WebGL** — Hardware-accelerated graphics
- **Vanilla JavaScript** — No frameworks required
- **CSS3** — Modern styling with glassmorphism effects

## 📁 Project Structure

```
├── index.html      # Main application (single-file)
├── LICENSE         # MIT License
└── README.md       # This file
```

## ⚠️ Health Notice

This visualization contains:
- Continuous rotation effects
- Intense light patterns
- Rapid particle movement

**Long viewing sessions may cause eye strain or motion sickness. Please take regular breaks.**

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Yoji Aizawa** — For the discovery of the Aizawa Attractor
- **[Three.js](https://threejs.org/)** — For the excellent 3D library
- Mathematical visualization community for inspiration

---

<p align="center">
  Made with ❤️ by <strong>GNSS</strong> | © 2026
</p>
