"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import {
  SpacecraftComponent,
  GridSlot,
  TelemetryState,
  MissionScenario,
  DifficultyMode,
  LaunchStage,
  ValidationReport,
} from "../types/game";
import { COMPONENT_CATALOG } from "../data/components";
import { MISSIONS } from "../data/missions";

interface GameContextType {
  grid: GridSlot[];
  telemetry: TelemetryState;
  activeMission: MissionScenario;
  difficulty: DifficultyMode;
  selectedComponent: SpacecraftComponent | null;
  draggedComponent: SpacecraftComponent | null;
  hoveredIndex: number | null;
  isLaunching: boolean;
  launchStage: LaunchStage;
  validationReport: ValidationReport | null;
  showModal: boolean;
  showDatasetModal: boolean;
  showGuideModal: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setDifficulty: (diff: DifficultyMode) => void;
  setSelectedComponent: (comp: SpacecraftComponent | null) => void;
  setDraggedComponent: (comp: SpacecraftComponent | null) => void;
  setHoveredIndex: (idx: number | null) => void;
  placeComponent: (index: number, component: SpacecraftComponent | null) => void;
  clearGrid: () => void;
  selectMission: (missionId: string) => void;
  loadPreset: (presetKey: "artemis" | "minimal" | "science") => void;
  launchMission: () => void;
  closeModal: () => void;
  setShowDatasetModal: (show: boolean) => void;
  setShowGuideModal: (show: boolean) => void;
  playSound: (type: "place" | "remove" | "launch" | "success" | "fail") => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GRID_SIZE = 5;

// Web Audio API Sound Synthesizer
class SoundFX {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  playLaunch() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(260, ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  }

  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
    });
  }

  playFail() {
    const ctx = this.getContext();
    if (!ctx) return;
    [240, 190, 150].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.14);
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
  const [difficulty, setDifficulty] = useState<DifficultyMode>("normal");
  const [grid, setGrid] = useState<GridSlot[]>(() => {
    const initialGrid: GridSlot[] = Array(GRID_SIZE * GRID_SIZE).fill(null);
    const byId = (id: string) => COMPONENT_CATALOG.find((c) => c.id === id) || null;
    initialGrid[2] = byId("avionics_cdh");
    initialGrid[7] = byId("bus_frame");
    initialGrid[6] = byId("solar_array");
    initialGrid[8] = byId("solar_array");
    initialGrid[11] = byId("battery_pack");
    initialGrid[12] = byId("patch_antenna");
    initialGrid[13] = byId("magnetometer");
    initialGrid[17] = byId("booster");
    return initialGrid;
  });
  const [selectedComponent, setSelectedComponent] = useState<SpacecraftComponent | null>(
    COMPONENT_CATALOG[0]
  );
  const [draggedComponent, setDraggedComponent] = useState<SpacecraftComponent | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStage, setLaunchStage] = useState<LaunchStage>("IDLE");
  const [showModal, setShowModal] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const playSound = (type: "place" | "remove" | "launch" | "success" | "fail") => {
    if (!soundEnabled) return;
    if (type === "place") sfx.playPlace();
    if (type === "remove") sfx.playRemove();
    if (type === "launch") sfx.playLaunch();
    if (type === "success") sfx.playSuccess();
    if (type === "fail") sfx.playFail();
  };

  // Difficulty modifiers:
  // easy: +50% budget, 0.8x thrust requirement
  // normal: 1.0x budget, 1.0x thrust requirement
  // hard: -15% budget, 1.25x thrust requirement
  const difficultyMultiplier = useMemo(() => {
    if (difficulty === "easy") return { budget: 1.5, thrust: 0.8 };
    if (difficulty === "hard") return { budget: 0.85, thrust: 1.25 };
    return { budget: 1.0, thrust: 1.0 };
  }, [difficulty]);

  // Telemetry computation using NASA CubeSat 101 formulas & Real Budget ($M)
  const telemetry = useMemo<TelemetryState>(() => {
    let mass = 0;
    let powerGen = 0;
    let powerCons = 0;
    let spentCost = 0;
    let thrust = 0;
    let dataRate = 0;
    let batteryCount = 0;
    let solarCount = 0;
    let payloadCount = 0;
    let commsCount = 0;

    grid.forEach((slot) => {
      if (!slot) return;
      mass += slot.mass_kg;
      if (slot.power_w > 0) powerGen += slot.power_w;
      else powerCons += Math.abs(slot.power_w);

      spentCost += slot.cost_m;
      thrust += slot.thrust_kn;
      dataRate += slot.data_mbps;

      if (slot.isBattery) batteryCount++;
      if (slot.id === "solar_array") solarCount++;
      if (slot.isPayload) payloadCount++;
      if (slot.subsystem === "COMMS") commsCount++;
    });

    spentCost = parseFloat(spentCost.toFixed(1));
    const budgetCap = parseFloat((activeMission.baseBudgetM * difficultyMultiplier.budget).toFixed(1));
    const budgetRemaining = parseFloat((budgetCap - spentCost).toFixed(1));

    const minRequiredThrust = parseFloat(
      (activeMission.minThrustKn * difficultyMultiplier.thrust).toFixed(0)
    );
    const twr = mass > 0 ? parseFloat((thrust / (mass * 1.8)).toFixed(2)) : 0;
    const netPower = powerGen - powerCons;
    const eclipseMinutes = Math.min(45, batteryCount * 35);

    const eclipseReady = batteryCount >= activeMission.minBatteries;
    const commsBalanced = activeMission.requireClosedComms ? dataRate <= 0 : true;
    const thrustReady = thrust >= minRequiredThrust && twr >= 1.0 && mass > 0;
    const budgetReady = spentCost <= budgetCap && spentCost > 0;
    const powerReady = netPower >= 0 && solarCount > 0;
    const scienceReady = payloadCount >= activeMission.minPayloads;

    return {
      budget_cap_m: budgetCap,
      spent_cost_m: spentCost,
      budget_remaining_m: budgetRemaining,
      total_mass_kg: mass,
      net_power_watts: netPower,
      power_generation_w: powerGen,
      power_consumption_w: powerCons,
      net_data_mbps: dataRate,
      total_thrust_kn: thrust,
      minRequiredThrust,
      twr,
      batteryCount,
      solarCount,
      payloadCount,
      commsCount,
      eclipseMinutes,
      eclipseReady,
      commsBalanced,
      thrustReady,
      budgetReady,
      powerReady,
      scienceReady,
    };
  }, [grid, activeMission, difficultyMultiplier]);

  const placeComponent = (index: number, component: SpacecraftComponent | null) => {
    setGrid((prev) => {
      const next = [...prev];
      next[index] = component;
      return next;
    });
    if (component) playSound("place");
    else playSound("remove");
  };

  const clearGrid = () => {
    setGrid(Array(GRID_SIZE * GRID_SIZE).fill(null));
    playSound("remove");
  };

  const selectMission = (missionId: string) => {
    const found = MISSIONS.find((m) => m.id === missionId);
    if (found) {
      setActiveMission(found);
    }
  };

  const loadPreset = (presetKey: "artemis" | "minimal" | "science") => {
    const newGrid: GridSlot[] = Array(GRID_SIZE * GRID_SIZE).fill(null);
    const byId = (id: string) => COMPONENT_CATALOG.find((c) => c.id === id) || null;

    if (presetKey === "artemis") {
      newGrid[2] = byId("avionics_cdh");
      newGrid[7] = byId("bus_frame");
      newGrid[6] = byId("solar_array");
      newGrid[8] = byId("solar_array");
      newGrid[11] = byId("battery_pack");
      newGrid[12] = byId("patch_antenna");
      newGrid[13] = byId("magnetometer");
      newGrid[17] = byId("booster");
    } else if (presetKey === "minimal") {
      newGrid[2] = byId("avionics_cdh");
      newGrid[7] = byId("bus_frame");
      newGrid[6] = byId("solar_array");
      newGrid[8] = byId("battery_pack");
      newGrid[12] = byId("ion_thruster");
      newGrid[13] = byId("patch_antenna");
    } else if (presetKey === "science") {
      newGrid[2] = byId("avionics_cdh");
      newGrid[7] = byId("bus_frame");
      newGrid[6] = byId("solar_array");
      newGrid[8] = byId("solar_array");
      newGrid[11] = byId("battery_pack");
      newGrid[12] = byId("high_gain_dish");
      newGrid[13] = byId("multispectral_cam");
      newGrid[17] = byId("booster");
    }

    setGrid(newGrid);
    playSound("place");
  };

  const launchMission = () => {
    const errors: string[] = [];
    const logs: string[] = [];

    logs.push("T-00:10:00 - Flight Readiness Review initiated at Cape Canaveral Pad 39A.");
    logs.push(`Target Profile: ${activeMission.name} (${activeMission.target})`);
    logs.push(`Difficulty Flow: ${difficulty.toUpperCase()} MODE.`);

    if (telemetry.spent_cost_m > telemetry.budget_cap_m) {
      errors.push(`Budget ceiling breached by $${Math.abs(telemetry.budget_remaining_m).toFixed(1)}M.`);
      logs.push(`FAIL: Cost ceiling breached ($${telemetry.spent_cost_m}M / $${telemetry.budget_cap_m}M).`);
    } else {
      logs.push(`PASS: Budget certified with $${telemetry.budget_remaining_m}M flight reserve.`);
    }

    if (telemetry.total_thrust_kn < telemetry.minRequiredThrust) {
      errors.push(`Insufficient propulsion (${telemetry.total_thrust_kn} kN < ${telemetry.minRequiredThrust} kN required).`);
      logs.push("FAIL: Spacecraft cannot achieve orbit escape velocity.");
    } else if (telemetry.twr < 1.0) {
      errors.push(`Thrust-to-weight ratio too low (${telemetry.twr}x < 1.0x). Cannot lift off.`);
      logs.push("FAIL: TWR below unity.");
    } else {
      logs.push(`PASS: Propulsion certified (${telemetry.total_thrust_kn} kN, ${telemetry.twr}x TWR).`);
    }

    if (telemetry.net_power_watts < 0) {
      errors.push(`Negative power balance (${telemetry.net_power_watts} W). Spacecraft will brown out.`);
      logs.push("FAIL: EPS power deficit.");
    } else {
      logs.push(`PASS: Electrical power margin validated (+${telemetry.net_power_watts} W net).`);
    }

    if (!telemetry.eclipseReady) {
      errors.push(`Eclipse storage insufficient (requires ${activeMission.minBatteries} battery block for 35m umbra).`);
      logs.push("FAIL: Spacecraft will power down during dark-side occultation.");
    } else {
      logs.push(`PASS: Battery storage certified for ${telemetry.eclipseMinutes} minutes of eclipse.`);
    }

    if (!telemetry.commsBalanced) {
      errors.push(`Comms downlink deficit (+${telemetry.net_data_mbps} MBps unlinked). Memory buffer overflow.`);
      logs.push("FAIL: Untransmitted telemetry packet buffer full.");
    } else {
      logs.push("PASS: RF communications link margin closed with Deep Space Network.");
    }

    if (!telemetry.scienceReady) {
      errors.push(`Science payload missing (requires >= ${activeMission.minPayloads} scientific instruments).`);
      logs.push("FAIL: Mission objectives unfulfilled.");
    } else {
      logs.push(`PASS: Scientific payload instruments integrated (${telemetry.payloadCount} sensor blocks).`);
    }

    const passed = errors.length === 0;
    const cmlAchieved = passed ? "CML Level 3 (Point Design Validated)" : "CML Level 1 (Concept Failed)";
    const score = passed
      ? Math.round(1000 + telemetry.budget_remaining_m * 50 + telemetry.twr * 100)
      : 250;

    setValidationReport({
      passed,
      errors,
      logs,
      cmlAchieved,
      score,
    });

    setIsLaunching(true);
    setShowModal(true);
    setLaunchStage("PAD_IGNITION");
    playSound(passed ? "launch" : "fail");

    // Flight sequence state machine
    if (passed) {
      setTimeout(() => setLaunchStage("MAX_Q"), 1000);
      setTimeout(() => setLaunchStage("STAGE_SEP"), 2200);
      setTimeout(() => setLaunchStage("LEO_PARKING"), 3400);
      setTimeout(() => setLaunchStage("TLI_BURN"), 4600);
      setTimeout(() => setLaunchStage("LUNAR_ORBIT"), 5800);
      setTimeout(() => {
        setLaunchStage("FINAL_REPORT");
        playSound("success");
      }, 7000);
    } else {
      setTimeout(() => {
        setLaunchStage("FINAL_REPORT");
        playSound("fail");
      }, 2000);
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
        difficulty,
        selectedComponent,
        draggedComponent,
        hoveredIndex,
        isLaunching,
        launchStage,
        validationReport,
        showModal,
        showDatasetModal,
        showGuideModal,
        soundEnabled,
        setSoundEnabled,
        setDifficulty,
        setSelectedComponent,
        setDraggedComponent,
        setHoveredIndex,
        placeComponent,
        clearGrid,
        selectMission,
        loadPreset,
        launchMission,
        closeModal,
        setShowDatasetModal,
        setShowGuideModal,
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
