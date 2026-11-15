"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { SpacecraftSimulator } from "../../engine/minecraft/Simulator";
import { MISSIONS } from "../../engine/minecraft/constants";
import {
  DevStage,
  MissionDef,
  TelemetryData,
  TimeOfDay,
} from "../../engine/minecraft/types";
import { CockpitHud } from "./CockpitHud";
import { Hotbar } from "./Hotbar";
import { ComponentTooltip } from "./ComponentTooltip";
import { WorldBlockHoverHud } from "./WorldBlockHoverHud";
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
import { MissionStoryIntroModal } from "./MissionStoryIntroModal";
import { MissionDebriefModal } from "./MissionDebriefModal";
import { MissionDebriefScore } from "../../engine/minecraft/types";
import { GameInitLoading } from "./GameInitLoading";
import { ProjectStoryIntro } from "./ProjectStoryIntro";
import { MinecraftMainMenu } from "./MinecraftMainMenu";
import { MissionLaunchBriefingHud } from "./MissionLaunchBriefingHud";
import { OrbitalMissionSimulator } from "./OrbitalMissionSimulator";

export type ScreenPhase =
  | "INIT_LOADING"
  | "PROJECT_STORY"
  | "MAIN_MENU"
  | "LAUNCH_BRIEFING"
  | "PLAYING"
  | "ORBIT_SIMULATION";

const INITIAL_TELEMETRY: TelemetryData = {
  blocksCount: 0,
  rocketBlocksCount: 0,
  satelliteBlocksCount: 0,
  totalCostM: 0,
  totalBudgetM: 350,
  budgetRemaining: 350,
  isOverBudget: false,
  overBudgetAmount: 0,
  rocketCostM: 0,
  rocketBudgetM: 150,
  rocketBudgetRemaining: 150,
  isRocketOverBudget: false,
  rocketMass: 0,
  satelliteCostM: 0,
  satelliteBudgetM: 200,
  satelliteBudgetRemaining: 200,
  isSatelliteOverBudget: false,
  satelliteMass: 0,
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
  hasPayloadContainer: false,
  isStructurallyConnected: false,
  hasAerodynamicNose: false,
  hasPadEngine: false,
  structuralIssues: [],
  stage1Certified: false,
  stage2Certified: false,
  devStage: "STAGE_1_ROCKET",
};

export function MinecraftGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SpacecraftSimulator | null>(null);

  // Screen Phase state for gaming flow
  const [screenPhase, setScreenPhase] = useState<ScreenPhase>("INIT_LOADING");

  // Game UI State
  const [telemetry, setTelemetry] = useState<TelemetryData>(INITIAL_TELEMETRY);
  const [activeMissionKey, setActiveMissionKey] = useState("artemis_lunar");
  const [activeMission, setActiveMission] = useState<MissionDef>(
    MISSIONS["artemis_lunar"]
  );
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("DAY");
  const [isFlying, setIsFlying] = useState(true);
  const [blueprintVisible, setBlueprintVisible] = useState(true);
  const [blueprintMode, setBlueprintMode] = useState<"SATELLITE" | "FULL_VEHICLE">("FULL_VEHICLE");
  const [fairingCutaway, setFairingCutaway] = useState(false);
  const [devStage, setDevStage] = useState<DevStage>("STAGE_1_ROCKET");
  const [isLocked, setIsLocked] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Hotbar & Tooltip
  const [hotbarSlots, setHotbarSlots] = useState<number[]>([
    23, 34, 26, 33, 35, 31, 30, 27, 7,
  ]);
  const [activeSlotIdx, setActiveSlotIdx] = useState(0);
  const [hoveredBlockType, setHoveredBlockType] = useState<number | null>(null);
  const [hoveredWorldBlock, setHoveredWorldBlock] = useState<{
    blockType: number;
    worldPos?: [number, number, number];
  } | null>(null);

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
  const [showStoryIntro, setShowStoryIntro] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [debriefScore, setDebriefScore] = useState<MissionDebriefScore | null>(null);
  const [launchFlightSec, setLaunchFlightSec] = useState(0);

  // Launch Telemetry overlay
  const [countdown, setCountdown] = useState<number | null>(null);
  const [launchTelem, setLaunchTelem] = useState<{
    isVisible: boolean;
    altitude: string;
    velocity: string;
    stageName: string;
    met?: string;
    gForce?: string;
    altKm?: number;
    velKmh?: number;
    mach?: number;
  }>({
    isVisible: false,
    altitude: "0.0 km",
    velocity: "0.00 km/s",
    stageName: "BOOSTER IGNITION",
    met: "T+00:00",
    gForce: "1.0 G",
    altKm: 0,
    velKmh: 0,
    mach: 0,
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
      onBlueprintModeChange: (mode) => setBlueprintMode(mode),
      onDevStageChange: (stage) => setDevStage(stage),
      onShroudChange: (cutaway) => setFairingCutaway(cutaway),
      onLockChange: (locked) => setIsLocked(locked),
      onHoverBlock: (blockType, worldPos) => {
        if (blockType !== null && (blockType < 17 || blockType > 22)) {
          setHoveredWorldBlock({
            blockType,
            worldPos: worldPos ?? undefined,
          });
        } else {
          setHoveredWorldBlock(null);
        }
      },
      onCountdown: (count) => {
        setCountdown(count);
      },
      onLaunchTelemetry: (
        alt,
        vel,
        stage,
        met = "T+00:00",
        gForce = "1.0 G",
        altKm = 0,
        velKmh = 0,
        mach = 0
      ) => {
        setLaunchTelem({
          isVisible: true,
          altitude: alt,
          velocity: vel,
          stageName: stage,
          met,
          gForce,
          altKm,
          velKmh,
          mach,
        });
        setLaunchFlightSec((prev) => prev + 0.1);
      },
      onLaunchComplete: (debrief) => {
        document.exitPointerLock?.();
        setDebriefScore(debrief);
        setScreenPhase("ORBIT_SIMULATION");
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
    showResources ||
    showStoryIntro ||
    showDebrief;

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
          setShowStoryIntro(false);
          setShowDebrief(false);
          return;
        }

        if (screenPhase === "LAUNCH_BRIEFING") {
          // ESC skips briefing and enters game
          handleBriefingComplete();
          return;
        }

        if (screenPhase === "PROJECT_STORY") {
          setScreenPhase("MAIN_MENU");
          return;
        }

        if (screenPhase === "ORBIT_SIMULATION") {
          setScreenPhase("PLAYING");
          return;
        }

        if (screenPhase === "PLAYING") {
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

      // In-Game hotkeys only
      if (screenPhase !== "PLAYING") return;

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

      if (e.code === "KeyO") {
        e.preventDefault();
        document.exitPointerLock?.();
        setScreenPhase("ORBIT_SIMULATION");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnyModalOpen, screenPhase]);

  // Transition from Main Menu to Mission Launch Briefing
  const handleStartFromMenu = () => {
    setScreenPhase("LAUNCH_BRIEFING");
  };

  // Transition from Mission Launch Briefing into live 3D game
  const handleBriefingComplete = () => {
    setScreenPhase("PLAYING");
    setGameStarted(true);
    setIsPaused(false);
    try {
      canvasRef.current?.requestPointerLock?.();
    } catch {
      // ignore
    }
    showNotification(
      "Entered Launch Complex! Click canvas to lock mouse, ESC for Pause Menu."
    );
  };

  const handleSelectMission = (missionKey: string) => {
    setActiveMissionKey(missionKey);
    if (missionKey === "sandbox_mode") {
      document.exitPointerLock?.();
      setShowSandbox(true);
    } else {
      const m = MISSIONS[missionKey];
      setActiveMission(m);
      simRef.current?.setMission(missionKey);
      showNotification(`Mission Selected: ${m.name}`);
    }
  };

  const handleMissionChangeInGame = (missionKey: string) => {
    setActiveMissionKey(missionKey);
    if (missionKey === "sandbox_mode") {
      document.exitPointerLock?.();
      setShowSandbox(true);
    } else {
      const m = MISSIONS[missionKey];
      setActiveMission(m);
      simRef.current?.setMission(missionKey);
      document.exitPointerLock?.();
      setScreenPhase("LAUNCH_BRIEFING");
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

  const handleEncloseFairing = () => {
    if (simRef.current) {
      simRef.current.wrapWithFairingShroud();
      showNotification("Enclosed payload in aerodynamic fairing shroud!");
    }
  };

  const handleToggleBlueprintMode = () => {
    if (simRef.current) {
      simRef.current.toggleBlueprintMode();
    }
  };

  const handleToggleDevStage = () => {
    if (simRef.current) {
      simRef.current.toggleDevStage();
    }
  };

  const handleLaunchReview = () => {
    document.exitPointerLock?.();
    setShowLaunchReview(true);
  };

  const handleConfirmLaunch = () => {
    setShowLaunchReview(false);
    setLaunchFlightSec(0);
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
    simRef.current?.clearActiveStageCraft();
    showNotification(
      devStage === "STAGE_1_ROCKET"
        ? "Aircraft launcher assembly bay cleared."
        : "Mission satellite assembly bay cleared."
    );
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

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#020617] font-mono">
      {/* Three.js WebGL Canvas (always alive in background) */}
      <canvas
        ref={canvasRef}
        id="webgl-canvas"
        className="absolute inset-0 w-full h-full block z-[1]"
      />

      {/* 1. INITIAL MINECRAFT INITIALIZATION SCREEN */}
      {screenPhase === "INIT_LOADING" && (
        <GameInitLoading
          onComplete={() => setScreenPhase("PROJECT_STORY")}
        />
      )}

      {/* 2. TUTORIAL / STORY TIME SENTENCE-WISE INTRO */}
      {screenPhase === "PROJECT_STORY" && (
        <ProjectStoryIntro
          onComplete={() => setScreenPhase("MAIN_MENU")}
        />
      )}

      {/* 3. REDESIGNED MINECRAFT HOME PAGE */}
      {screenPhase === "MAIN_MENU" && (
        <MinecraftMainMenu
          activeMissionKey={activeMissionKey}
          activeMission={activeMission}
          timeOfDay={timeOfDay}
          onEnterLaunchComplex={handleStartFromMenu}
          onSelectMission={handleSelectMission}
          onCycleTime={handleCycleTime}
          onReplayStory={() => setScreenPhase("PROJECT_STORY")}
          onViewOrbitalTrajectory={() => setScreenPhase("ORBIT_SIMULATION")}
        />
      )}

      {/* 4. SENTENCE-WISE MISSION BRIEFING ON ENTERING LAUNCH COMPLEX */}
      {screenPhase === "LAUNCH_BRIEFING" && (
        <MissionLaunchBriefingHud
          missionKey={activeMissionKey}
          mission={activeMission}
          onComplete={handleBriefingComplete}
        />
      )}

      {/* 5. IN-GAME ACTIVE HUD & OVERLAYS (ONLY ACTIVE WHEN PLAYING) */}
      {screenPhase === "PLAYING" && (
        <>
          {/* Crosshair */}
          <Crosshair />

          {/* 3D World Block Inspection HUD */}
          <WorldBlockHoverHud
            blockType={hoveredWorldBlock?.blockType ?? null}
            worldPos={hoveredWorldBlock?.worldPos}
          />

          {/* Top Telemetry Cockpit HUD */}
          <CockpitHud
            telemetry={telemetry}
            activeMissionKey={activeMissionKey}
            activeMission={activeMission}
            timeOfDay={timeOfDay}
            isFlying={isFlying}
            blueprintVisible={blueprintVisible}
            blueprintMode={blueprintMode}
            fairingCutaway={fairingCutaway}
            devStage={devStage}
            onMissionChange={handleMissionChangeInGame}
            onAutoBuild={handleAutoBuild}
            onEncloseFairing={handleEncloseFairing}
            onToggleBlueprint={handleToggleBlueprint}
            onToggleBlueprintMode={handleToggleBlueprintMode}
            onToggleCutaway={handleToggleCutaway}
            onToggleDevStage={handleToggleDevStage}
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
            onOpenStory={() => {
              document.exitPointerLock?.();
              setScreenPhase("LAUNCH_BRIEFING");
            }}
            onToggleFlight={handleToggleFlight}
            onClearCraft={handleClearCraft}
            onOpenOrbitSim={() => {
              document.exitPointerLock?.();
              setScreenPhase("ORBIT_SIMULATION");
            }}
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

          {/* In-game Pause Overlay (Triggered by ESC while playing) */}
          <PauseOverlay
            isVisible={isPaused && !isAnyModalOpen}
            timeOfDay={timeOfDay}
            activeMissionName={activeMission.name}
            onResumeGame={() => {
              setIsPaused(false);
              try {
                canvasRef.current?.requestPointerLock?.();
              } catch {}
            }}
            onOpenBriefing={() => {
              setIsPaused(false);
              setScreenPhase("LAUNCH_BRIEFING");
            }}
            onSwitchMission={() => {
              setIsPaused(false);
              setScreenPhase("MAIN_MENU");
            }}
            onCycleTime={handleCycleTime}
            onReturnToMainMenu={() => {
              setIsPaused(false);
              setScreenPhase("MAIN_MENU");
            }}
          />
        </>
      )}

      {/* 6. 3D INTERACTIVE ORBITAL TRAJECTORY SIMULATION (AFTER LAUNCH OR VIA O) */}
      {screenPhase === "ORBIT_SIMULATION" && (
        <OrbitalMissionSimulator
          missionKey={activeMissionKey}
          mission={activeMission}
          debriefScore={debriefScore}
          onReturnToLaunchPad={() => {
            setScreenPhase("PLAYING");
            try {
              canvasRef.current?.requestPointerLock?.();
            } catch {}
          }}
          onViewDebrief={() => {
            setShowDebrief(true);
          }}
        />
      )}

      {/* Global Notification Toast */}
      <NotificationToast message={toastMessage} />

      {/* Cinematic 3-2-1 Launch Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[2px] transition-all">
          <div className="relative flex flex-col items-center">
            <div className="w-56 h-56 rounded-full border-4 border-sky-500/30 border-t-emerald-400 animate-spin" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-sky-400 tracking-widest uppercase mb-1">
                TERMINAL COUNTDOWN
              </span>
              <span className="text-7xl font-black text-white tracking-tight drop-shadow-[0_0_35px_rgba(16,185,129,0.85)] animate-pulse">
                {countdown === 0 ? "LIFTOFF!" : countdown}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold tracking-wider mt-2 bg-slate-900/90 px-3.5 py-0.5 rounded-full border border-emerald-500/40">
                {countdown === 0 ? "VEHICLE COMMITTED" : `T-00:0${countdown}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Launch Ascent Telemetry HUD Overlay */}
      <LaunchTelemetryHud
        isVisible={launchTelem.isVisible}
        altitude={launchTelem.altitude}
        velocity={launchTelem.velocity}
        stageName={launchTelem.stageName}
        met={launchTelem.met}
        gForce={launchTelem.gForce}
        altKm={launchTelem.altKm}
        velKmh={launchTelem.velKmh}
        mach={launchTelem.mach}
      />

      {/* Modals */}
      <MissionStoryIntroModal
        isOpen={showStoryIntro}
        onClose={() => setShowStoryIntro(false)}
        mission={activeMission}
        onEnterVab={() => {
          setShowStoryIntro(false);
          setGameStarted(true);
          setIsPaused(false);
          try {
            canvasRef.current?.requestPointerLock?.();
          } catch {}
        }}
      />

      <MissionDebriefModal
        isOpen={showDebrief}
        onClose={() => setShowDebrief(false)}
        mission={activeMission}
        debriefScore={debriefScore}
        onReturnToVab={() => {
          setShowDebrief(false);
          try {
            canvasRef.current?.requestPointerLock?.();
          } catch {}
        }}
      />

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
        devStage={devStage}
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
