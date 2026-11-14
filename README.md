# NASA Space Mission Design Game (SMDG)
### Systems Engineering & CubeSat 101 Spacecraft VAB Simulator
**2026 NASA Space Apps Challenge**

[![NASA Space Apps](https://img.shields.io/badge/NASA-Space_Apps_Challenge_2026-blue.svg)](https://www.spaceappschallenge.org)
[![Tech Stack](https://img.shields.io/badge/Tech_Stack-Next.js_14_%E2%80%A2_TypeScript_%E2%80%A2_Tailwind_CSS-blue.svg)](#tech-stack)
[![Engineering Standard](https://img.shields.io/badge/Standard-NASA_CubeSat_101_%E2%80%A2_JPL_CML_1--3-cyan.svg)](#nasa-frameworks)
[![Dataset](https://img.shields.io/badge/Dataset-NASA_JPL_Horizons_%2B_LRO-emerald.svg)](#nasa-dataset-integration)

---

## Quick Start (Next.js)

To run the application locally in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To build and run in production mode:
```bash
npm run build
npm start
```

---

## Overview

Designing a space mission requires concurrent systems engineering: making calculated trade-offs across competing disciplines: **Power (EPS)**, **Propulsion (Delta-V)**, **Mass Budget**, **Communications (Downlink Bandwidth)**, and **Real Budget ($M)**.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**, this application provides a modern, interactive systems-engineering workbench:

1. **Flow Control Difficulty Settings:**
   - **EASY (Cadet):** $+50\%$ budget cap ($15.0M), $-20\%$ thrust requirement. Ideal for beginners learning spaceflight trade-offs.
   - **NORMAL (Engineer):** Standard baseline NASA flight margin ($10.0M budget, $\text{TWR} \ge 1.0$).
   - **HARD (Flight Director):** $-15\%$ budget cap, $+25\%$ thrust requirements with strict engineering tolerances.
2. **Earth-to-Space Trajectory Canvas Simulation:**
   - Real-time animated canvas tracking the spacecraft from Cape Canaveral Pad 39A through Max-Q ($14.2\text{ km}$), staging at $85\text{ km}$, entering 250 km LEO, and executing the Trans-Lunar Injection (TLI at $11.18\text{ km/s}$) Hohmann transfer to the Moon.
3. **Subsystem Component Modeling:**
   - **Engines:** Solid Rocket Booster (120 kN chemical ascent), Hall-Effect Ion Thruster (50 kN electric xenon cruise), Cold-Gas RCS Microthrusters (25 kN attitude control).
   - **Payloads:** Multispectral Surface Imager (+50 MBps, 80 pts), Fluxgate Magnetometer (+15 MBps, 50 pts).
   - **Structure & Avionics:** 1U CubeSat aluminum-6061 frame and NASA Goddard Core Flight System (cFS) avionics computer.
   - **Power & Comms:** Triple-junction GaAs solar arrays (+50W), LiFePO4 battery pack (35-min eclipse umbra), High-Gain X-band DSN dish (-50 MBps), and omni patch antenna (-15 MBps).
4. **Real Budget ($M):**
   - Replaced artificial XP with actual aerospace project economics ($M).
5. **Drag-and-Drop & Click Placement:**
   - Drag any component from the subsystem palette directly onto the 5x5 assembly bay.
6. **Official NASA Dataset Integration:**
   - Integrated parameters from the **NASA JPL Horizons On-Line Ephemeris System** and **NASA Lunar Reconnaissance Orbiter (LRO)** catalog:
     - Earth Gravitational Parameter ($\mu$): $398,600.4418\text{ km}^3/\text{s}^2$
     - Moon Gravitational Parameter ($\mu_{\text{moon}}$): $4,902.8000\text{ km}^3/\text{s}^2$
     - Trans-Lunar Injection (TLI) $\Delta V$: $3,120\text{ m/s}$
     - Earth Escape Velocity: $11.18\text{ km/s}$
     - Lunar Capture $\Delta V$ (LOI to 100 km polar orbit): $820\text{ m/s}$
     - Mean Earth-Moon Distance: $384,400\text{ km}$
7. **3D Minecraft Spaceport Integration:**
   - Single-click toggle to open the full 3D Minecraft voxel spaceport (`/minecraft.html`) with 4-player concurrent multiplayer across tabs.

---

## Project Structure

```
├── public/
│   ├── index.html          # Standalone 2D workbench
│   └── minecraft.html      # 3D Minecraft voxel spaceport simulator
├── src/
│   ├── app/
│   │   ├── globals.css     # Tailwind CSS styles & starfield animations
│   │   ├── layout.tsx      # Next.js root layout & metadata
│   │   └── page.tsx        # Main application page & modals
│   ├── components/
│   │   ├── AssemblyGrid.tsx    # 5x5 VAB drag-and-drop matrix
│   │   ├── InventoryHotbar.tsx # Subsystem component palette
│   │   ├── LaunchConsole.tsx   # Pre-flight checklist & launch trigger
│   │   ├── MissionBriefing.tsx # Mission profile selector & tips
│   │   ├── MissionVizModal.tsx # Trajectory canvas & flight diagnostics
│   │   └── TelemetryHud.tsx    # Live telemetry gauges & difficulty flow
│   ├── context/
│   │   └── GameContext.tsx # Systems engineering state & formulas
│   ├── data/
│   │   ├── components.ts   # Component specifications & NASA heritage
│   │   └── missions.ts     # Mission objectives & baseline constraints
│   └── types/
│       └── game.ts         # TypeScript interfaces & types
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
