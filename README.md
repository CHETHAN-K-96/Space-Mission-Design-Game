# NASA Space Mission Design Game (SMDG)
### Systems Engineering & CubeSat 101 Crafting Simulator
**2026 NASA Space Apps Challenge**

[![NASA Space Apps](https://img.shields.io/badge/NASA-Space_Apps_Challenge_2026-blue.svg)](https://www.spaceappschallenge.org)
[![Tech Stack](https://img.shields.io/badge/Tech_Stack-Next.js_14_•_React_18_•_Tailwind_CSS_•_Framer_Motion-cyan.svg)](#tech-stack)
[![Engineering Standard](https://img.shields.io/badge/Standard-NASA_CubeSat_101_•_JPL_CML_1--3-emerald.svg)](#nasa-frameworks)

---

## 🚀 Overview

Designing a space mission requires concurrent systems engineering—making calculated trade-offs across competing disciplines: **Power (EPS)**, **Propulsion (Delta-V)**, **Mass Budget**, **Communications (Data Rates)**, and **Cost (XP)**.

Inspired by *Kerbal Space Program*, *Spaceflight Simulator*, and *Minecraft*, this web application provides an intuitive **2D 5x5 Voxel Vehicle Assembly Grid** where players design CubeSats and validate flight readiness against actual NASA mission constraints before launch.

---

## 🛠 Tech Stack & Architecture

- **Framework:** Next.js 14+ (App Router, TypeScript) & React 18
- **Styling:** Tailwind CSS with high-tech CRT dark space aesthetic (`bg-slate-950`, neon cyan/amber/emerald telemetry accents, glassmorphism panels)
- **State Management:** React Context API (`GameContext.tsx`) with pure-function derived telemetry calculations
- **Animations:** Framer Motion (stage transitions, rocket trajectory progress)
- **Icons & Visuals:** Lucide React & Canvas Confetti
- **Audio Synthesizer:** Zero-dependency Web Audio API sound engine (sine/sawtooth oscillators for placement clicks, thruster rumble, alarms, and mission success fanfares)

---

## 🛰 Real NASA Engineering Frameworks Incorporated

### 1. Concept Maturity Levels (CML)
Developed by NASA Jet Propulsion Laboratory (JPL) to quantify mission maturity prior to formal project formulation:
- **CML 1 (Concept Feasibility):** Verifies first-order physical requirements (lift-off thrust, positive solar margin).
- **CML 2 (Trade Studies):** Compares alternative subsystem configurations (e.g., camera resolution vs. high-gain antenna bandwidth).
- **CML 3 (Point Design Validated):** Full systems engineering integration certified upon completing the simulated launch.

### 2. NASA Mission Design Lab (MDL) Trades
Simulates concurrent design sessions where changes to one subsystem immediately propagate to all others:
- Adding a **Multispectral Camera** increases science score, but adds $+15\text{ kg}$ mass, draws $-30\text{ W}$, and produces $+50\text{ MBps}$ of untransmitted data.
- Downlinking that data requires a **High-Gain Antenna**, which adds cost, mass, and further power draw.
- Compensating with an **Ion Thruster** requires $+50\text{W}$ solar generation to prevent bus brownouts.

### 3. CubeSat 101 Standard (NASA CSLI)
- Standardized form-factor blocks represent 1U subsystem allocations.
- **Eclipse Umbra Logic:** In low Earth orbit (LEO), spacecraft spend ~35 minutes per orbit in Earth's shadow. Solar cells produce 0W during eclipse; without **Battery Blocks**, the spacecraft suffers catastrophic thermal/electrical brownout.

### 4. Lift & Thrust-to-Weight (TWR) Physics Engine
- Gravitational force calculation:
  $$\text{Required Minimum Thrust (kN)} = \text{Total Spacecraft Mass (kg)} \times 0.0098\text{ kN/kg}$$
- The pre-flight checklist enforces:
  $$\text{TWR} = \frac{\text{Total Thrust (kN)}}{\text{Total Mass (kg)} \times 0.0098} \ge 1.0$$

---

## 📦 Component Database (NASA CubeSat 101 Data)

| Subsystem Block | Mass (kg) | Power (W) | Cost (XP) | Thrust (kN) | Data Rate | Engineering Purpose |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Solar Array Block** | 5 kg | **+50 W** | 10 XP | 0 kN | 0 MBps | Triple-junction GaAs photovoltaic generation in sunlight. |
| **Battery Block** | 10 kg | 0 W | 5 XP | 0 kN | 0 MBps | Li-Fe-PO4 storage cell; buffers eclipse and high-pulse loads. |
| **Multispectral Camera** | 15 kg | **-30 W** | 20 XP | 0 kN | **+50 MBps** | Science payload observing Earth/lunar surface spectral bands. |
| **High-Gain Antenna** | 10 kg | **-15 W** | 15 XP | 0 kN | **-50 MBps** | X-band directional dish; downlinks packets to NASA DSN. |
| **Ion Thruster** | 20 kg | **-40 W** | 25 XP | **50 kN** | 0 MBps | High-Isp electric Hall-effect engine for orbital escape burns. |

---

## 🎮 How to Play

1. **Select Mission Profile:** Choose between *Artemis Path: Lunar Orbiter*, *Earth Observation Sentinel*, or *Deep Space Asteroid Scout*.
2. **Assemble Spacecraft:** Drag blocks from the hotbar into the 5x5 Vehicle Assembly Grid, or click a hotbar item and click any grid coordinate.
3. **Monitor Live Telemetry:** Watch the real-time HUD gauges (Budget, Mass, Net Power, Thrust TWR, Data Comms).
4. **Pre-Flight Diagnostics:** Check the status indicators on the right console.
5. **Launch Mission:** Click **LAUNCH MISSION** to execute the NASA Flight Readiness Review. Watch the multi-stage launch visualization and earn your CML Mission Scorecard!

---

## ⚡ Quick Start Options

### Option A: Instant Python Web Server (Recommended)
Python is already installed on your system (`Python 3.13`):
```powershell
cd "c:\Users\Chethan\.gemini\antigravity\scratch\space-mission-design-game"
python -m http.server 3000
```
Open your browser to:
- **3D Minecraft First-Person Simulation:** [http://localhost:3000/minecraft.html](http://localhost:3000/minecraft.html)
- **NASA Space Mission Design Game (VAB):** [http://localhost:3000/index.html](http://localhost:3000/index.html)

### Option B: Direct Browser Opening (Zero Web Server Required)
You can double-click or open either file directly in Google Chrome, Microsoft Edge, or Firefox:
- `C:\Users\Chethan\.gemini\antigravity\scratch\space-mission-design-game\minecraft.html`
- `C:\Users\Chethan\.gemini\antigravity\scratch\space-mission-design-game\index.html`

### Option C: Full Next.js Development Server (Requires Node.js)
If you install Node.js:
```powershell
npm install
npm run dev
```

---

## ⛏️ 3D First-Person Minecraft Simulation Features

- **Game Perspective:** True 3D first-person camera with Pointer Lock mouse look, authentic crosshair (`+`), eye height at 1.62 blocks, and 3D hand/block viewmodel with walking bobbing and punch animations.
- **Physics Engine:** Full voxel AABB collision detection, gravity, jumping, sneak speed, and Creative Flight mode (`F` key).
- **Mining & Placing:** 
  - **Left-Click:** Break blocks with 3D debris particle burst and crunchy sound effects.
  - **Right-Click:** Place blocks against targeted face with solid placement sound.
  - **TNT Explosions:** Detonate TNT blocks with shockwave particles, crater damage, and bass audio boom!
- **Procedural World & Textures:** Rolling hills, deep stone caverns, ore veins (Diamond, Gold, Iron, Coal), sand beaches, and oak trees generated with 16x16 pixel-perfect textures.
- **Hotbar & Inventory:** 9-slot classic hotbar (Keys 1-9 & Scroll Wheel), plus a full Creative Block Palette (`E` key).
- **F3 Debug Screen:** Real-time FPS, XYZ coordinates, facing compass, and targeted block telemetry.
- **World Persistence:** Save and load custom worlds directly to browser `localStorage`.

---

## 🏆 Project Structure

```
space-mission-design-game/
├── index.html                   # Zero-dependency instant playable web version
├── package.json                 # Next.js 14 project manifest & dependencies
├── tsconfig.json                # TypeScript compiler config
├── tailwind.config.ts           # Tailwind CRT space theme configuration
├── postcss.config.mjs
├── next.config.mjs
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Dark mode HTML root layout
│   │   ├── page.tsx             # Main application entry point
│   │   └── globals.css          # CRT scanline effects & space scrollbar
│   ├── components/
│   │   ├── TelemetryHud.tsx     # Top telemetry progress HUD & preset loaders
│   │   ├── MissionBriefing.tsx  # Left panel with CML profiles & constraints
│   │   ├── AssemblyGrid.tsx     # 5x5 Minecraft-style VAB crafting matrix
│   │   ├── InventoryHotbar.tsx  # Bottom component hotbar
│   │   ├── LaunchConsole.tsx    # Right diagnostics panel & Launch button
│   │   └── MissionVizModal.tsx  # Animated multi-stage launch & scorecard
│   ├── context/
│   │   └── GameContext.tsx      # Global physics & telemetry state + Web Audio SFX
│   ├── data/
│   │   ├── components.ts        # NASA CubeSat 101 component specs
│   │   └── missions.ts          # Mission scenarios & objective data
│   └── types/
│       └── game.ts              # TypeScript interfaces & types
└── README.md                    # Project documentation
```
