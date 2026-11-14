"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
import {
  SpacecraftComponent,
  GridSlot,
  TelemetryState,
  MissionScenario,
  LaunchStage,
  ValidationReport,
} from "../types/game";
import { COMPONENT_CATALOG } from "../data/components";
import { MISSIONS } from "../data/missions";

interface GameContextType {
  grid: GridSlot[];
  telemetry: TelemetryState;
  activeMission: MissionScenario;
  selectedComponent: SpacecraftComponent | null;
  draggedComponent: SpacecraftComponent | null;
  hoveredIndex: number | null;
  isLaunching: boolean;
  launchStage: LaunchStage;
  validationReport: ValidationReport | null;
  showModal: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setSelectedComponent: (comp: SpacecraftComponent | null) => void;
  setDraggedComponent: (comp: SpacecraftComponent | null) => void;
  setHoveredIndex: (idx: number | null) => void;
  placeComponent: (index: number, component: SpacecraftComponent | null) => void;
  clearGrid: () => void;
  selectMission: (missionId: string) => void;
  loadPreset: (presetKey: "balanced" | "minimal" | "science") => void;
  launchMission: () => void;
  closeModal: () => void;
  playSound: (type: "place" | "remove" | "launch" | "success" | "fail") => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GRID_SIZE = 5;

// Web Audio API Sound Synthesizer for high-tech sci-fi feedback
class SoundFX {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playPlace() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  playRemove() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  playLaunch() {
    const ctx = this.getContext();
    if (!ctx) return;
    // Low frequency rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(65, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  }

  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
    });
  }

  playFail() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [311.13, 293.66, 277.18]; // Eb4, D4, C#4
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.14 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.14);
      osc.stop(ctx.currentTime + idx * 0.14 + 0.35);
    });
  }
}

const sfx = new SoundFX();

export function GameProvider({ children }: { children: ReactNode }) {
  const [activeMission, setActiveMission] = useState<MissionScenario>(MISSIONS[0]);
  const [grid, setGrid] = useState<GridSlot[]>(() =>
    Array(GRID_SIZE * GRID_SIZE).fill(null)
  );
  const [selectedComponent, setSelectedComponent] = useState<SpacecraftComponent | null>(
    COMPONENT_CATALOG[0]
  );
  const [draggedComponent, setDraggedComponent] = useState<SpacecraftComponent | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStage, setLaunchStage] = useState<LaunchStage>("IDLE");
  const [showModal, setShowModal] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const playSound = (type: "place" | "remove" | "launch" | "success" | "fail") => {
    if (!soundEnabled) return;
    if (type === "place") sfx.playPlace();
    if (type === "remove") sfx.playRemove();
    if (type === "launch") sfx.playLaunch();
    if (type === "success") sfx.playSuccess();
    if (type === "fail") sfx.playFail();
  };

  // Telemetry computation using NASA CubeSat 101 formulas
  const telemetry = useMemo<TelemetryState>(() => {
    let mass = 0;
    let power = 0;
    let spentCost = 0;
    let thrust = 0;
    let dataRate = 0;
    let batteryCount = 0;
    let solarCount = 0;
    let payloadCount = 0;
    let antennaCount = 0;

    grid.forEach((slot) => {
      if (!slot) return;
      mass += slot.mass_kg;
      power += slot.power_w;
      spentCost += slot.cost_m;
      thrust += slot.thrust_kn;
      dataRate += slot.data_mbps;

      if (slot.id === "battery_pack") batteryCount++;
      if (slot.id === "solar_array") solarCount++;
      if (slot.id === "spectral_camera") payloadCount++;
      if (slot.id === "high_gain_antenna") antennaCount++;
    });

    const budgetRemaining = activeMission.initialBudget - spentCost;
    // NASA Lift requirement: F_thrust >= mass_kg * 0.0098 kN (Gravity force at Earth 1g)
    const minRequiredThrust = Number((mass * 0.0098).toFixed(2));
    const twr = mass > 0 ? Number((thrust / (mass * 0.0098)).toFixed(2)) : 0;
    const eclipseReady = batteryCount >= activeMission.requiredBatteryCount;
    const commsBalanced = dataRate <= 0;

    return {
      budget_m: budgetRemaining,
      spent_cost_m: spentCost,
      total_mass_kg: mass,
      net_power_watts: power,
      net_data_mbps: dataRate,
      total_thrust_kn: thrust,
      minRequiredThrust,
      twr,
      batteryCount,
      solarCount,
      payloadCount,
      antennaCount,
      eclipseReady,
      commsBalanced,
    };
  }, [grid, activeMission]);

  const placeComponent = (index: number, component: SpacecraftComponent | null) => {
    if (component) {
      playSound("place");
    } else {
      playSound("remove");
    }
    setGrid((prev) => {
      const next = [...prev];
      next[index] = component;
      return next;
    });
  };

  const clearGrid = () => {
    playSound("remove");
    setGrid(Array(GRID_SIZE * GRID_SIZE).fill(null));
  };

  const selectMission = (missionId: string) => {
    const found = MISSIONS.find((m) => m.id === missionId);
    if (found) {
      setActiveMission(found);
    }
  };

  const loadPreset = (presetKey: "balanced" | "minimal" | "science") => {
    playSound("place");
    const newGrid: GridSlot[] = Array(GRID_SIZE * GRID_SIZE).fill(null);
    const solar = COMPONENT_CATALOG.find((c) => c.id === "solar_array")!;
    const battery = COMPONENT_CATALOG.find((c) => c.id === "battery_pack")!;
    const camera = COMPONENT_CATALOG.find((c) => c.id === "spectral_camera")!;
    const antenna = COMPONENT_CATALOG.find((c) => c.id === "high_gain_antenna")!;
    const thruster = COMPONENT_CATALOG.find((c) => c.id === "ion_thruster")!;

    if (presetKey === "minimal") {
      // 1 Solar (10), 1 Battery (5), 1 Thruster (25) = $40M
      newGrid[11] = solar;
      newGrid[12] = battery;
      newGrid[17] = thruster;
    } else if (presetKey === "balanced") {
      // Lunar Orbiter point design: 1 Solar, 1 Battery, 1 Thruster, 1 Antenna, 1 Camera
      newGrid[7] = solar;
      newGrid[11] = antenna;
      newGrid[12] = battery;
      newGrid[13] = camera;
      newGrid[17] = thruster;
    } else if (presetKey === "science") {
      // Science heavy: 2 Solars, 2 Batteries, 1 Thruster, 1 Camera, 1 Antenna
      newGrid[6] = solar;
      newGrid[8] = solar;
      newGrid[11] = battery;
      newGrid[12] = camera;
      newGrid[13] = battery;
      newGrid[17] = thruster;
      newGrid[18] = antenna;
    }
    setGrid(newGrid);
  };

  const launchMission = () => {
    playSound("launch");
    const errors: string[] = [];
    const logs: string[] = [];

    logs.push("T-00:10:00 - Flight Readiness Review (FRR) initiated by Launch Director.");
    logs.push("T-00:05:00 - Systems Engineering constraint verification running...");

    // 0. Empty Grid check
    if (telemetry.total_mass_kg === 0) {
      errors.push("Mission Abort: Vehicle Assembly Grid is empty. No spacecraft mounted.");
      logs.push("FAIL: Payload mass is 0 kg. No structural bus detected.");
    }

    // 1. Budget Check
    if (telemetry.budget_m < 0) {
      errors.push(`Mission Abort: Over Budget by $${Math.abs(telemetry.budget_m)}M.`);
      logs.push(`FAIL: Cost ceiling breached. Allocated $${activeMission.initialBudget}M, spent $${telemetry.spent_cost_m}M.`);
    } else {
      logs.push(`PASS: Budget certified with $${telemetry.budget_m}M reserve.`);
    }

    // 2. Thrust-to-Weight Check (Earth gravity lift)
    if (telemetry.total_thrust_kn < telemetry.minRequiredThrust) {
      errors.push(
        `Mission Abort: Insufficient thrust to lift vehicle mass (${telemetry.total_thrust_kn} kN < ${telemetry.minRequiredThrust} kN required).`
      );
      logs.push("FAIL: Gravity vector exceeds propulsion authority. Spacecraft stalls on pad.");
    } else if (telemetry.total_thrust_kn < activeMission.minThrustKn) {
      errors.push(
        `Mission Abort: Flight trajectory requires minimum ${activeMission.minThrustKn} kN thrust for orbital insertion.`
      );
      logs.push(`FAIL: Trajectory shortfall. Spacecraft thrust (${telemetry.total_thrust_kn} kN) cannot escape Earth orbit.`);
    } else {
      logs.push(`PASS: Propulsion sufficient. TWR = ${telemetry.twr}.`);
    }

    // 3. Power Balance Check
    if (telemetry.net_power_watts < 0) {
      errors.push(
        `Mission Abort: Spacecraft experiences brownout during operational phase (${telemetry.net_power_watts} W deficit).`
      );
      logs.push("FAIL: EPS bus collapse. Generation lower than subsystem draw.");
    } else if (telemetry.solarCount === 0 && telemetry.total_mass_kg > 0) {
      errors.push("Mission Abort: No solar generation arrays installed. Spacecraft will drain batteries.");
      logs.push("FAIL: Zero primary power source.");
    } else {
      logs.push(`PASS: Electrical power margin positive (+${telemetry.net_power_watts} W).`);
    }

    // 4. Eclipse Battery Check
    if (telemetry.batteryCount < activeMission.requiredBatteryCount && telemetry.total_mass_kg > 0) {
      errors.push(
        `Mission Abort: Insufficient energy storage. Mission demands at least ${activeMission.requiredBatteryCount} Battery Block(s) for eclipse survival.`
      );
      logs.push("FAIL: Umbra phase loss. Spacecraft freezes without battery backup.");
    } else {
      logs.push(`PASS: Battery storage adequate for orbital eclipse cycle (${telemetry.batteryCount} installed).`);
    }

    // 5. Science & Telemetry Downlink Check
    if (telemetry.payloadCount > 0 && telemetry.antennaCount === 0) {
      errors.push("Mission Abort: Multispectral payload produces un-downlinkable data. High-Gain Antenna required.");
      logs.push("FAIL: Telemetry buffer saturated. Zero science data can reach NASA Ground Station.");
    } else if (activeMission.minDataDelivered && telemetry.payloadCount === 0) {
      errors.push("Mission Abort: Mission objective requires deploying scientific imaging payload.");
      logs.push("FAIL: Primary science objective unmet.");
    } else {
      logs.push("PASS: Communications and science downlink loop closed.");
    }

    const passed = errors.length === 0;

    // Calculate score
    const score = passed
      ? Math.max(100 + telemetry.budget_m * 2 + (telemetry.payloadCount * 50) - (telemetry.total_mass_kg), 50)
      : 0;

    const cmlAchieved = passed ? "CML 3 (Point Design Validated)" : "CML 1 (Concept Abort)";

    setValidationReport({
      passed,
      errors,
      logs,
      cmlAchieved,
      score,
    });

    setIsLaunching(true);
    setShowModal(true);
    setLaunchStage("COUNTDOWN");

    if (passed) {
      setTimeout(() => setLaunchStage("MAX_Q"), 1200);
      setTimeout(() => setLaunchStage("STAGE_SEP"), 2600);
      setTimeout(() => setLaunchStage("ORBITAL_INSERTION"), 4000);
      setTimeout(() => {
        setLaunchStage("FINAL_REPORT");
        playSound("success");
      }, 5500);
    } else {
      setTimeout(() => {
        setLaunchStage("FINAL_REPORT");
        playSound("fail");
      }, 1600);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsLaunching(false);
    setLaunchStage("IDLE");
  };

  return (
    <GameContext.Provider
      value={{
        grid,
        telemetry,
        activeMission,
        selectedComponent,
        draggedComponent,
        hoveredIndex,
        isLaunching,
        launchStage,
        validationReport,
        showModal,
        soundEnabled,
        setSoundEnabled,
        setSelectedComponent,
        setDraggedComponent,
        setHoveredIndex,
        placeComponent,
        clearGrid,
        selectMission,
        loadPreset,
        launchMission,
        closeModal,
        playSound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
