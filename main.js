/**
 * WebGL Particle Simulation - Main Script
 * © 2026 GNSS | MIT License
 * 
 * Interactive 3D particle simulation featuring Torus and Black Hole
 * (Aizawa Attractor) visualizations using Three.js
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ========================================
// Scene Setup
// ========================================
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = false; // Initially disabled
controls.autoRotateSpeed = 0.5;

// ========================================
// Particle Configuration
// ========================================
const MAX_POINTS = 150000;
let particleCount = MAX_POINTS;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(MAX_POINTS * 3);
const colors = new Float32Array(MAX_POINTS * 3);

// Simulation state array
const currentStates = new Float32Array(MAX_POINTS * 3);

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Color palette for particle visualization
const colCore = new THREE.Color(0xffffff);   // Core: Bright white
const colInner = new THREE.Color(0xaaaaaa);  // Inner ring: Light gray
const colOuter = new THREE.Color(0x555555);  // Outer ring: Dark gray
const colEdge = new THREE.Color(0x000000);   // Edge: Black
const tempColor = new THREE.Color();

// Torus geometry parameters
const R_MAJOR = 8.0;  // Major radius (distance from center to tube center)
const R_MINOR = 4.0;  // Minor radius (tube radius)

// Aizawa Attractor parameters (for Black Hole mode)
const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
const dt = 0.012;  // Time step for integration

let currentMode = 'torus'; // Current visualization mode: 'torus' or 'blackhole'

// ========================================
// Particle Initialization / Reset
// ========================================
function initParticles() {
    for (let i = 0; i < MAX_POINTS; i++) {
        let x, y, z;

        if (currentMode === 'torus') {
            // Torus mode: Distribute particles on torus surface
            const u = Math.random() * Math.PI * 2;  // Angle around tube
            const v = Math.random() * Math.PI * 2;  // Angle around torus
            const rOffset = (Math.random() - 0.5) * 2.0;  // Random thickness variation

            const r = (R_MAJOR + (R_MINOR + rOffset) * Math.cos(u));
            x = r * Math.cos(v);
            y = (R_MINOR + rOffset) * Math.sin(u);
            z = r * Math.sin(v);
        } else {
            // Black Hole mode: Random cloud distribution with flat disk shape
            const angle = Math.random() * Math.PI * 2;
            const r = 0.1 + Math.random() * 10.0;
            x = Math.cos(angle) * r;
            y = Math.sin(angle) * r;
            z = (Math.random() - 0.5) * 2.0;
            // Scale down for Aizawa attractor calculations
            x *= 0.2; y *= 0.2; z *= 0.2;
        }

        currentStates[i * 3] = x;
        currentStates[i * 3 + 1] = y;
        currentStates[i * 3 + 2] = z;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        updateColor(i, x, y, z, 1.0);
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
}

// ========================================
// Color Calculation based on Position
// ========================================
function updateColor(i, x, y, z, doppler) {
    let intensity = Math.max(0.1, doppler);

    if (currentMode === 'torus') {
        // Torus coloring: Higher energy/brightness near central axis
        const r = Math.sqrt(x * x + z * z);
        const energy = Math.max(0, 1.0 - (r / R_MAJOR));

        if (energy > 0.6) {
            tempColor.copy(colInner).lerp(colCore, (energy - 0.6) / 0.4);
        } else {
            tempColor.copy(colOuter).lerp(colInner, energy / 0.6);
        }
        // Darken edges for depth perception
        if (Math.abs(y) > 4.0) tempColor.lerp(colEdge, 0.3);

    } else {
        // Black Hole coloring: Dark center (event horizon) with glowing accretion disk
        const r = Math.sqrt(x * x + y * y);  // Distance in XY plane
        const ringRadius = 5.0;  // Accretion disk ring position

        if (r < 1.5) {
            // Event horizon: Complete darkness
            tempColor.setHex(0x000000);
            intensity = 0;
        } else {
            // Accretion disk: Brightness based on distance from ring
            const dist = Math.abs(r - ringRadius);
            const glow = Math.max(0, 1.0 - dist / 4.0);
            tempColor.copy(colOuter).lerp(colInner, glow);
            // Inner region closer to center is brighter (gravitational heating)
            if (r < ringRadius) tempColor.lerp(colCore, 0.5);
        }
    }

    // Apply Doppler effect (brightness modulation based on velocity)
    colors[i * 3] = tempColor.r * intensity;
    colors[i * 3 + 1] = tempColor.g * intensity;
    colors[i * 3 + 2] = tempColor.b * intensity;
}

// ========================================
// Simulation State
// ========================================
let isPlaying = false;
let speed = 0.01;

// ========================================
// UI Event Handlers
// ========================================
const btnPlay = document.getElementById('btn-play');
const btnPause = document.getElementById('btn-pause');
const btnRotate = document.getElementById('btn-rotate');

btnRotate.addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    btnRotate.textContent = `🔄 Auto-Rotate: ${controls.autoRotate ? 'ON' : 'OFF'}`;
    btnRotate.classList.toggle('active', controls.autoRotate);
});

// About panel toggle
const aboutBtn = document.getElementById('about-btn');
const aboutPanel = document.getElementById('about-panel');

aboutBtn.addEventListener('click', () => {
    aboutPanel.classList.toggle('open');
    aboutBtn.classList.toggle('active');
});

// Close about panel when clicking outside
document.addEventListener('click', (e) => {
    if (!aboutPanel.contains(e.target) && !aboutBtn.contains(e.target)) {
        aboutPanel.classList.remove('open');
        aboutBtn.classList.remove('active');
    }
});

// Mode selection handler
const modeDesc = document.getElementById('mode-desc');
document.getElementById('inp-mode').addEventListener('change', (e) => {
    currentMode = e.target.value;
    modeDesc.textContent = currentMode === 'torus' ? 'Free Energy Torus' : 'Black Hole (Aizawa Attractor)';

    // Reset simulation state when switching modes
    isPlaying = false;
    controls.autoRotate = false;
    btnRotate.textContent = '🔄 Auto-Rotate: OFF';
    btnRotate.classList.remove('active');
    btnPlay.classList.remove('active');
    initParticles();
    renderer.render(scene, camera);
});

btnPlay.addEventListener('click', () => {
    isPlaying = true;
    btnPlay.classList.add('active');
    btnPause.classList.remove('active');
});

btnPause.addEventListener('click', () => {
    isPlaying = false;
    btnPause.classList.add('active');
    btnPlay.classList.remove('active');
});

document.getElementById('btn-reset').addEventListener('click', () => {
    isPlaying = false;
    controls.autoRotate = false;
    btnRotate.textContent = '🔄 Auto-Rotate: OFF';
    btnRotate.classList.remove('active');
    btnPlay.classList.remove('active');
    btnPause.classList.remove('active');
    initParticles();
    renderer.render(scene, camera);
});

document.getElementById('inp-speed').addEventListener('input', (e) => {
    speed = parseFloat(e.target.value);
});

document.getElementById('inp-count').addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    geometry.setDrawRange(0, particleCount);
});

document.getElementById('inp-color').addEventListener('input', (e) => {
    const hex = e.target.value;
    colInner.set(hex);
    // Derive related colors from base color for aesthetic harmony
    colCore.set(hex).lerp(new THREE.Color(0xffffff), 0.7);
    colOuter.set(hex).offsetHSL(0.5, 0, -0.2);  // Complementary hue shift
    colEdge.set(hex).offsetHSL(0.7, 0, -0.4);

    if (!isPlaying) {
        refreshColors();
    }
});

function refreshColors() {
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < MAX_POINTS; i++) {
        updateColor(i, pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], 1.0);
    }
    geometry.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
}

// ========================================
// Particle Physics Update Loop
// ========================================
function updateParticles() {
    if (!isPlaying) return;

    const pos = geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
        // Store previous position for velocity calculation
        const oldX = currentStates[i * 3];
        const oldY = currentStates[i * 3 + 1];
        const oldZ = currentStates[i * 3 + 2];

        let x = currentStates[i * 3];
        let y = currentStates[i * 3 + 1];
        let z = currentStates[i * 3 + 2];

        if (currentMode === 'torus') {
            // --------------------------------
            // Torus Mode: Procedural flow animation
            // Particles flow around the torus tube surface
            // --------------------------------
            let r = Math.sqrt(x * x + z * z);
            let theta = Math.atan2(x, z);

            let dr = r - R_MAJOR;
            let dy = y;

            const distFromTubeCenter = Math.sqrt(dr * dr + dy * dy);
            const flowSpeed = speed * (1.0 + 2.0 / (distFromTubeCenter + 0.5));

            let nextDr = dr - dy * flowSpeed;
            let nextDy = dy + dr * flowSpeed;

            theta += speed * 0.25 + 0.01 / (distFromTubeCenter + 0.1);

            r = R_MAJOR + nextDr;
            y = nextDy;

            x = r * Math.sin(theta);
            z = r * Math.cos(theta);

        } else {
            // --------------------------------
            // Black Hole Mode: Aizawa Attractor chaos dynamics
            // Differential equations create unpredictable yet bounded motion
            // dx/dt = (z - b)x - dy
            // dy/dt = dx + (z - b)y
            // dz/dt = c + az - z^3/3 - (x^2 + y^2)(1 + ez) + fzx^3
            // --------------------------------
            const dx = (z - b) * x - d * y;
            const dy = d * x + (z - b) * y;
            const dz = c + a * z - (z * z * z) / 3.0 - (x * x + y * y) * (1.0 + e * z) + f * z * x * x * x;

            // Apply speed scaling for attractor dynamics
            const s = speed * 20.0;
            x += dx * dt * s;
            y += dy * dt * s;
            z += dz * dt * s;

            // Reset particles that escape to infinity
            const distSq = x * x + y * y + z * z;
            if (distSq > 20.0 || isNaN(distSq)) {
                const angle = Math.random() * Math.PI * 2;
                const r = 0.1 + Math.random() * 2.0;
                x = Math.cos(angle) * r;
                y = Math.sin(angle) * r;
                z = (Math.random() - 0.5) * 2.0;
            }
        }

        // --------------------------------
        // Visual Effects: Doppler shift simulation
        // Particles moving toward camera appear brighter
        // --------------------------------
        const vx = x - oldX;
        const vy = y - oldY;
        const vz = z - oldZ;

        // Calculate display coordinates (scale for rendering)
        let drawX, drawY, drawZ;
        if (currentMode === 'torus') {
            drawX = x; drawY = y; drawZ = z;
        } else {
            // Scale up for display, compress Z for disk-like appearance
            drawX = x * 6.0; drawY = y * 6.0; drawZ = z * 2.0;
        }

        // Compute view direction for Doppler effect
        const viewX = camera.position.x - drawX;
        const viewY = camera.position.y - drawY;
        const viewZ = camera.position.z - drawZ;

        const dot = vx * viewX + vy * viewY + vz * viewZ;
        const doppler = 1.0 + dot * 0.2;  // Intensity modulation coefficient

        // Update simulation state
        currentStates[i * 3] = x;
        currentStates[i * 3 + 1] = y;
        currentStates[i * 3 + 2] = z;

        // Update render positions
        pos[i * 3] = drawX;
        pos[i * 3 + 1] = drawY;
        pos[i * 3 + 2] = drawZ;

        updateColor(i, drawX, drawY, drawZ, doppler);
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
}

// ========================================
// Point Cloud Material Setup
// ========================================
const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// Initialize particle system
initParticles();

// ========================================
// Animation Loop
// ========================================
function animate() {
    requestAnimationFrame(animate);
    updateParticles();
    controls.update();
    renderer.render(scene, camera);
}

// Hide loading screen and start animation
setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
}, 500);

animate();

// ========================================
// Window Resize Handler
// ========================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
