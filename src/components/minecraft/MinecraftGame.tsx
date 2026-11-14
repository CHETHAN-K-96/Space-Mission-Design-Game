"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { SpacecraftSimulator } from "../../engine/minecraft/Simulator";
import { MISSIONS } from "../../engine/minecraft/constants";
import {
  MissionDef,
  TelemetryData,
  TimeOfDay,
} from "../../engine/minecraft/types";
import { CockpitHud } from "./CockpitHud";
import { Hotbar } from "./Hotbar";
import { ComponentTooltip } from "./ComponentTooltip";
import { Crosshair } from "./Crosshair";
import { NotificationToast } from "./NotificationToast";
import { PauseOverlay } from "./PauseOverlay";
import { InventoryModal } from "./InventoryModal";
import { LaunchReviewModal } from "./LaunchReviewModal";
import { LaunchTelemetryHud } from "./LaunchTelemetryHud";
import { MissionDossierModal } from "./MissionDossierModal";
import { SandboxModal } from "./SandboxModal";
import { TeamModal } from "./TeamModal";
import { ResourcesModal } from "./ResourcesModal";

const INITIAL_TELEMETRY: TelemetryData = {
  blocksCount: 0,
  totalXP: 0,
  totalCostM: 0,
  budgetRemaining: 145,
  totalMass: 0,
  powerGen: 0,
  powerDraw: 0,
  netPower: 0,
  totalThrust: 0,
  minLiftThrust: 0,
  twr: 0,
  dataGen: 0,
  dataDownlink: 0,
  batteryCount: 0,
  payloadCount: 0,
  sciencePts: 0,
};

export function MinecraftGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SpacecraftSimulator | null>(null);

  // Game UI State
  const [telemetry, setTelemetry] = useState<TelemetryData>(INITIAL_TELEMETRY);
  const [activeMissionKey, setActiveMissionKey] = useState("artemis_lunar");
  const [activeMission, setActiveMission] = useState<MissionDef>(
    MISSIONS["artemis_lunar"]
  );
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("DAY");
  const [isFlying, setIsFlying] = useState(true);
  const [blueprintVisible, setBlueprintVisible] = useState(true);
  const [fairingCutaway, setFairingCutaway] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Hotbar & Tooltip
  const [hotbarSlots, setHotbarSlots] = useState<number[]>([
    23, 34, 26, 33, 35, 31, 30, 27, 7,
  ]);
  const [activeSlotIdx, setActiveSlotIdx] = useState(0);
  const [hoveredBlockType, setHoveredBlockType] = useState<number | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals
  const [showInventory, setShowInventory] = useState(false);
  const [showLaunchReview, setShowLaunchReview] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showResources, setShowResources] = useState(false);

  // Launch Telemetry overlay
  const [launchTelem, setLaunchTelem] = useState<{
    isVisible: boolean;
    altitude: string;
    velocity: string;
    stageName: string;
  }>({
    isVisible: false,
    altitude: "0.0 km",
    velocity: "0.00 km/s",
    stageName: "BOOSTER IGNITION",
  });

  const showNotification = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Initialize Simulator Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sim = new SpacecraftSimulator(canvas, {
      onTelemetryChange: (telem) => setTelemetry(telem),
      onNotification: (msg) => showNotification(msg),
      onHotbarChange: (slots, activeIdx) => {
        setHotbarSlots([...slots]);
        setActiveSlotIdx(activeIdx);
      },
      onTimeChange: (time) => setTimeOfDay(time),
      onFlightModeChange: (flying) => setIsFlying(flying),
      onBlueprintChange: (visible) => setBlueprintVisible(visible),
      onShroudChange: (cutaway) => setFairingCutaway(cutaway),
      onLockChange: (locked) => setIsLocked(locked),
      onLaunchTelemetry: (alt, vel, stage) => {
        setLaunchTelem({
          isVisible: true,
          altitude: alt,
          velocity: vel,
          stageName: stage,
        });
      },
      onLaunchFinish: () => {
        setLaunchTelem((prev) => ({ ...prev, isVisible: false }));
      },
    });

    simRef.current = sim;

    return () => {
      sim.destroy();
      simRef.current = null;
    };
  }, [showNotification]);

  // Determine if any modal is open
  const isAnyModalOpen =
    showInventory ||
    showLaunchReview ||
    showDossier ||
    showSandbox ||
    showTeam ||
    showResources;

  // Global Keydown Handler for Modals & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        if (isAnyModalOpen) {
          setShowInventory(false);
          setShowLaunchReview(false);
          setShowDossier(false);
          setShowSandbox(false);
          setShowTeam(false);
          setShowResources(false);
          return;
        }
        if (gameStarted) {
          setIsPaused((prev) => {
            const next = !prev;
            if (next) {
              document.exitPointerLock?.();
            } else {
              try {
                canvasRef.current?.requestPointerLock?.();
              } catch {}
            }
            return next;
          });
        }
        return;
      }

      if (e.code === "KeyE") {
        e.preventDefault();
        setShowInventory((prev) => {
          const next = !prev;
          if (next) {
            document.exitPointerLock?.();
          } else {
            try {
              canvasRef.current?.requestPointerLock?.();
            } catch {}
          }
          return next;
        });
        return;
      }

      if (e.code === "KeyL") {
        e.preventDefault();
        document.exitPointerLock?.();
        setShowLaunchReview(true);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnyModalOpen, gameStarted]);

  // Enter game from initial overlay or resume
  const handleEnterGame = () => {
    setGameStarted(true);
    setIsPaused(false);
    try {
      canvasRef.current?.requestPointerLock?.();
    } catch {
      // ignore
    }
    showNotification("🚀 Entered Launch Complex! Click canvas to lock mouse, ESC for Pause Menu.");
  };

  const handleLoadCertifiedCraft = () => {
    setGameStarted(true);
    setIsPaused(false);
    simRef.current?.buildFlightReadyCraft(activeMissionKey);
    try {
      canvasRef.current?.requestPointerLock?.();
    } catch {
      // ignore
    }
  };

  const handleMissionChange = (missionKey: string) => {
    setActiveMissionKey(missionKey);
    if (missionKey === "sandbox_mode") {
      document.exitPointerLock?.();
      setShowSandbox(true);
    } else {
      const m = MISSIONS[missionKey];
      setActiveMission(m);
      simRef.current?.setMission(missionKey);
      showNotification(`Switched Mission: ${m.name}`);
    }
  };

  const handleAutoBuild = () => {
    simRef.current?.buildFlightReadyCraft(activeMissionKey);
  };

  const handleToggleBlueprint = () => {
    simRef.current?.toggleBlueprintGuide();
  };

  const handleToggleCutaway = () => {
    if (simRef.current) {
      const cut = simRef.current.toggleFairingCutaway();
      setFairingCutaway(cut);
    }
  };

  const handleLaunchReview = () => {
    document.exitPointerLock?.();
    setShowLaunchReview(true);
  };

  const handleConfirmLaunch = () => {
    setShowLaunchReview(false);
    simRef.current?.startLaunchSequence();
  };

  const handleCycleTime = () => {
    simRef.current?.cycleTimeOfDay();
  };

  const handleToggleFlight = () => {
    if (simRef.current) {
      simRef.current.player.isFlying = !simRef.current.player.isFlying;
      setIsFlying(simRef.current.player.isFlying);
      showNotification(
        `Flight Mode: ${simRef.current.player.isFlying ? "ON" : "OFF"}`
      );
    }
  };

  const handleClearCraft = () => {
    simRef.current?.world.clearSpacecraft();
    simRef.current?.triggerHUDUpdate();
    showNotification("Spacecraft assembly bay cleared.");
  };

  const handleEquipComponent = (blockType: number) => {
    simRef.current?.setSlotBlock(activeSlotIdx, blockType);
    showNotification(`Equipped to Hotbar Slot ${activeSlotIdx + 1}`);
  };

  const handleApplySandbox = (customMission: MissionDef) => {
    setActiveMission(customMission);
    simRef.current?.setMission("sandbox_mode", customMission);
    showNotification("Custom Sandbox Constraints Applied!");
  };

  // Show pause overlay ONLY before game start OR when explicitly paused
  const showPauseOverlay = (!gameStarted || isPaused) && !isAnyModalOpen;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#020617] font-mono">
      {/* Three.js WebGL Canvas */}
      <canvas
        ref={canvasRef}
        id="webgl-canvas"
        className="absolute inset-0 w-full h-full block z-[1]"
      />

      {/* Crosshair */}
      <Crosshair />

      {/* Top Telemetry Cockpit HUD */}
      <CockpitHud
        telemetry={telemetry}
        activeMissionKey={activeMissionKey}
        activeMission={activeMission}
        timeOfDay={timeOfDay}
        isFlying={isFlying}
        blueprintVisible={blueprintVisible}
        fairingCutaway={fairingCutaway}
        onMissionChange={handleMissionChange}
        onAutoBuild={handleAutoBuild}
        onToggleBlueprint={handleToggleBlueprint}
        onToggleCutaway={handleToggleCutaway}
        onLaunchReview={handleLaunchReview}
        onCycleTime={handleCycleTime}
        onOpenDossier={() => {
          document.exitPointerLock?.();
          setShowDossier(true);
        }}
        onOpenTeam={() => {
          document.exitPointerLock?.();
          setShowTeam(true);
        }}
        onOpenResources={() => {
          document.exitPointerLock?.();
          setShowResources(true);
        }}
        onToggleFlight={handleToggleFlight}
        onClearCraft={handleClearCraft}
      />

      {/* Notification Toast */}
      <NotificationToast message={toastMessage} />

      {/* Launch Ascent Telemetry HUD Overlay */}
      <LaunchTelemetryHud
        isVisible={launchTelem.isVisible}
        altitude={launchTelem.altitude}
        velocity={launchTelem.velocity}
        stageName={launchTelem.stageName}
      />

      {/* Component Hover Tooltip */}
      <ComponentTooltip blockType={hoveredBlockType} />

      {/* Bottom 9-Slot Hotbar */}
      <Hotbar
        hotbarSlots={hotbarSlots}
        activeSlotIdx={activeSlotIdx}
        onSelectSlot={(idx) => simRef.current?.setActiveSlot(idx)}
        onHoverSlot={(type) => setHoveredBlockType(type)}
      />

      {/* Pause / Enter Overlay */}
      <PauseOverlay
        isVisible={showPauseOverlay}
        timeOfDay={timeOfDay}
        onEnterGame={handleEnterGame}
        onLoadCertifiedCraft={handleLoadCertifiedCraft}
        onCycleTime={handleCycleTime}
      />

      {/* Modals */}
      <InventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        onEquip={handleEquipComponent}
        onHover={(type) => setHoveredBlockType(type)}
      />

      <LaunchReviewModal
        isOpen={showLaunchReview}
        onClose={() => setShowLaunchReview(false)}
        onConfirmLaunch={handleConfirmLaunch}
        telemetry={telemetry}
        activeMission={activeMission}
      />

      <MissionDossierModal
        isOpen={showDossier}
        onClose={() => setShowDossier(false)}
        mission={activeMission}
      />

      <SandboxModal
        isOpen={showSandbox}
        onClose={() => setShowSandbox(false)}
        onApply={handleApplySandbox}
      />

      <TeamModal
        isOpen={showTeam}
        onClose={() => setShowTeam(false)}
        onRoleSelect={(roleName) =>
          showNotification(`Switched Active Role to: ${roleName}`)
        }
      />

      <ResourcesModal
        isOpen={showResources}
        onClose={() => setShowResources(false)}
      />
    </div>
  );
}
