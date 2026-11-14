# NASA Space Mission Design Game (SMDG)
### Systems Engineering & CubeSat 101 Spacecraft VAB Simulator
**2026 NASA Space Apps Challenge**

[![NASA Space Apps](https://img.shields.io/badge/NASA-Space_Apps_Challenge_2026-blue.svg)](https://www.spaceappschallenge.org)
[![Aesthetic](https://img.shields.io/badge/Aesthetic-Authentic_Minecraft_Voxel_%2B_NASA_Telemetry-emerald.svg)](#features)
[![Standard](https://img.shields.io/badge/Standard-NASA_CubeSat_101_%E2%80%A2_JPL_CML_1--3-cyan.svg)](#nasa-frameworks)
[![Dataset](https://img.shields.io/badge/Dataset-NASA_JPL_Horizons_%2B_LRO-blue.svg)](#nasa-dataset-integration)

---

## Overview

Designing a space mission requires concurrent systems engineering: making calculated trade-offs across competing disciplines: **Power (EPS)**, **Propulsion (Delta-V)**, **Mass Budget**, **Communications (Downlink Bandwidth)**, and **Real Budget ($M)**.

This project delivers two synchronized simulation environments built for students, engineers, and space enthusiasts:
1. **3D Minecraft Spaceport VAB (`minecraft.html`)**: A full 3D voxel spaceport featuring Cape Canaveral launch pads, difficulty flow controls (Easy/Normal/Hard), 4-player real-time concurrent multiplayer with 3D astronaut avatars, dynamic time-of-day cycling, and an animated launch with marked trajectory arcs from Earth's surface into space and trans-lunar transfer.
2. **2D Systems Engineering Workbench (`index.html`)**: A streamlined 5x5 assembly bay with drag-and-drop component placement, live telemetry, difficulty modes, official NASA dataset integration, and an animated 2D canvas trajectory from Earth to lunar orbit.

---

## Key Features

### 1. Difficulty Flow Control (Easy, Normal, Hard)
- **EASY (Cadet):** $+50\%$ budget cap allowance, $-20\%$ thrust requirement. Ideal for beginners learning spaceflight trade-offs.
- **NORMAL (Engineer):** Real-world baseline engineering parameters and NASA CubeSat 101 standards ($10.0M budget, $\text{TWR} \ge 1.0$).
- **HARD (Flight Director):** $-15\%$ budget cap, $+25\%$ thrust requirements with strict margins.

### 2. Earth-to-Space Trajectory Visualization
- **3D Atmospheric Ascent Arc (`minecraft.html`):** Marked trajectory track line launching from Launch Pad 39A up to 85 km staging altitude, then transitioning to the orbital plane.
- **Trans-Lunar Injection & Lunar Orbit:** Hohmann transfer ellipse from 250 km LEO parking orbit, past the Moon, into a 100 km lunar polar orbit.
- **2D Trajectory Simulation Canvas (`index.html`):** Real-time animated canvas tracking the spacecraft along a flight curve from Earth's atmosphere into space and to the Moon.

### 3. Subsystem Component Representation (Engines, Payloads, Avionics)
- **Engines:** Solid Rocket Booster (high-thrust ascent), Hall-Effect Ion Thruster (high-efficiency xenon electric propulsion), Cold-Gas RCS Microthrusters (attitude maneuvering).
- **Payloads:** Multispectral Surface Imager (optical geology/agriculture), Infrared Spectrometer (gas absorption lines), Fluxgate Magnetometer (planetary magnetic fields), Synthetic Aperture Radar (SAR).
- **Power & Comms:** Triple-Junction GaAs Solar Arrays, LiFePO4 Eclipse Battery Packs (CubeSat 101 umbra standard), Deep Space Network (DSN) X-band dish, and omni patch antennas.

### 4. Real Budget ($M) Instead of Arbitrary XP
- Replaced all artificial "XP" values with actual spaceflight economics ($M millions of dollars).
- Artemis mission budget: **$10.0M** (scalable by difficulty mode).
- Components priced by aerospace flight readiness standards ($0.5M to $3.2M).

### 5. HTML5 Drag-and-Drop Assembly
- Players can drag components directly from the palette and drop them into any slot of the 5x5 Vehicle Assembly Bay.
- Traditional click-to-place remains fully supported for maximum accessibility.

### 6. Official NASA Dataset Integration (Judgement Criterion)
- Integrated the **NASA JPL Horizons On-Line Ephemeris System** and **NASA Lunar Reconnaissance Orbiter (LRO)** target catalog:
  - Earth Gravitational Parameter ($\mu$): $398,600.44\text{ km}^3/\text{s}^2$
  - Moon Gravitational Parameter ($\mu_{\text{moon}}$): $4,902.80\text{ km}^3/\text{s}^2$
  - Trans-Lunar Injection (TLI) $\Delta V$: $3,120\text{ m/s}$
  - Earth Escape Velocity ($V_{\text{esc}}$): $11.18\text{ km/s}$
  - Lunar Capture $\Delta V$ (LOI to 100 km polar orbit): $820\text{ m/s}$
  - Mean Earth-Moon Distance: $384,400\text{ km}$

### 7. Clean, Usable, and Accessible Interface
- Distilled complex systems engineering metrics into 6 focused indicators.
- One-click collapsible guides and clean modals keep the workspace uncluttered while retaining deep technical information for those who want it.

---

## How to Run

### Option 1: Direct Double-Click (Zero Setup Required)
Both HTML files are 100% self-contained and run directly from disk:
- Double-click `minecraft.html` for the **3D Minecraft Spaceport Simulator**.
- Double-click `index.html` for the **2D Systems Engineering Workbench**.

### Option 2: Local HTTP Server (Recommended for Multiplayer Testing)
Run using Python's built-in HTTP server:
```bash
python -m http.server 3000
```
Then open in your browser:
- `http://localhost:3000/minecraft.html` (Open 2 to 4 tabs to test 4-player multiplayer)
- `http://localhost:3000/index.html`

### Controls in 3D Minecraft Mode:
- **W / A / S / D**: Move astronaut
- **Mouse**: Look around (click canvas to lock pointer, ESC to release)
- **Space / Shift**: Jump & Fly Up / Crouch & Fly Down
- **Left Click**: Remove block
- **Right Click**: Place block
- **1 - 9**: Select hotbar block
- **E**: Open full component inventory
- **F**: Toggle Creative Flight mode
- **T**: Cycle Time of Day (Day $\to$ Sunset $\to$ Night $\to$ Sunrise)
- **L**: Launch Rocket & Initiate Trajectory Review
