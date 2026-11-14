import * as THREE from "three";
import confetti from "canvas-confetti";
import {
  BLOCKS,
  COMPONENT_DEFS,
  MISSIONS,
  PAD_X,
  PAD_Y,
  PAD_Z,
} from "./constants";
import { initMaterials, MATERIALS } from "./TextureGen";
import { soundEngine } from "./SoundEngine";
import { VoxelWorld } from "./VoxelWorld";
import { Player } from "./Player";
import { DevStage, MissionDef, TelemetryData, TimeOfDay } from "./types";

export interface SimulatorCallbacks {
  onTelemetryChange?: (telem: TelemetryData) => void;
  onNotification?: (msg: string) => void;
  onHotbarChange?: (slots: number[], activeIdx: number) => void;
  onTimeChange?: (time: TimeOfDay) => void;
  onFlightModeChange?: (isFlying: boolean) => void;
  onBlueprintChange?: (visible: boolean) => void;
  onBlueprintModeChange?: (mode: "SATELLITE" | "FULL_VEHICLE") => void;
  onDevStageChange?: (stage: DevStage) => void;
  onShroudChange?: (cutaway: boolean) => void;
  onLockChange?: (locked: boolean) => void;
  onLaunchTelemetry?: (
    alt: string,
    vel: string,
    stage: string,
    met?: string,
    gForce?: string,
    altKm?: number,
    velKmh?: number,
    mach?: number
  ) => void;
  onLaunchFinish?: () => void;
  onHoverBlock?: (
    blockType: number | null,
    worldPos: [number, number, number] | null
  ) => void;
}

export class SpacecraftSimulator {
  public canvas: HTMLCanvasElement;
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public ambientLight!: THREE.AmbientLight;
  public sunLight!: THREE.DirectionalLight;
  public gantrySpot!: THREE.SpotLight;

  public world!: VoxelWorld;
  public player!: Player;

  public activeMissionKey: string = "earth_sentinel";
  public activeMission: MissionDef = MISSIONS["earth_sentinel"];
  public timeOfDayMode: TimeOfDay = "DAY";
  public fairingCutaway: boolean = false;
  public devStage: DevStage = "STAGE_1_ROCKET";

  public stage1Hotbar: number[] = [
    BLOCKS.MERLIN_CLUSTER,
    BLOCKS.LIQUID_FUEL_TANK,
    BLOCKS.UPPER_STAGE_TANK,
    BLOCKS.VACUUM_ENGINE,
    BLOCKS.INTERSTAGE_RING,
    BLOCKS.SOLID_BOOSTER,
    BLOCKS.GRID_FIN,
    BLOCKS.SAT_PAYLOAD_CONTAINER,
    BLOCKS.PAYLOAD_FAIRING,
  ];

  public stage2Hotbar: number[] = [
    BLOCKS.BUS_FRAME,
    BLOCKS.AVIONICS_C_DH,
    BLOCKS.SOLAR_ARRAY,
    BLOCKS.SOLAR_WING,
    BLOCKS.BATTERY_PACK,
    BLOCKS.HIGH_GAIN_DISH,
    BLOCKS.MULTISPECTRAL_CAM,
    BLOCKS.MAGNETOMETER,
    BLOCKS.REACTION_WHEEL,
  ];

  public hotbarSlots: number[] = [
    BLOCKS.MERLIN_CLUSTER,
    BLOCKS.LIQUID_FUEL_TANK,
    BLOCKS.UPPER_STAGE_TANK,
    BLOCKS.VACUUM_ENGINE,
    BLOCKS.INTERSTAGE_RING,
    BLOCKS.SOLID_BOOSTER,
    BLOCKS.GRID_FIN,
    BLOCKS.SAT_PAYLOAD_CONTAINER,
    BLOCKS.PAYLOAD_FAIRING,
  ];
  public activeSlotIdx: number = 0;

  public isLocked: boolean = false;
  public isMouseDown: boolean = false;
  public isLaunching: boolean = false;
  public launchAscentY: number = 0;
  public launchTimeSec: number = 0;
  public launchStageName: string = "PAD_IGNITION";
  public exhaustParticles: {
    mesh: THREE.Mesh;
    vel: THREE.Vector3;
    life: number;
  }[] = [];

  public blueprintGroup!: THREE.Group;
  public blueprintVisible: boolean = true;
  public blueprintMode: "SATELLITE" | "FULL_VEHICLE" = "FULL_VEHICLE";

  public callbacks: SimulatorCallbacks;
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;

  private lastHoveredType: number | null = null;
  private lastHoveredPosKey: string = "";

  constructor(canvas: HTMLCanvasElement, callbacks: SimulatorCallbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    initMaterials();
    this.initThree();

    this.world = new VoxelWorld(this.scene);
    this.player = new Player(this.camera, this.world, this.scene);

    this.world.generateVABEnvironment();
    this.initBlueprintGuide();
    this.buildFlightReadyCraft("earth_sentinel");

    this.setupEvents();
    this.triggerHUDUpdate();

    this.loop(performance.now());
  }

  private initThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // Daylight
    this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.012);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.scene.add(this.camera);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfffbe8, 0.95);
    this.sunLight.position.set(40, 80, 30);
    this.scene.add(this.sunLight);

    this.gantrySpot = new THREE.SpotLight(
      0x38bdf8,
      1.5,
      60,
      Math.PI / 4,
      0.4
    );
    this.gantrySpot.position.set(PAD_X - 5, PAD_Y + 14, PAD_Z - 5);
    this.gantrySpot.target.position.set(PAD_X, PAD_Y + 2, PAD_Z);
    this.scene.add(this.gantrySpot);
    this.scene.add(this.gantrySpot.target);

    this.setTimeOfDay("DAY");
  }

  public setTimeOfDay(mode: TimeOfDay) {
    this.timeOfDayMode = mode;
    this.callbacks.onTimeChange?.(mode);

    if (mode === "DAY") {
      this.scene.background = new THREE.Color(0x38bdf8);
      this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.012);
      this.ambientLight.intensity = 0.75;
      this.sunLight.intensity = 0.95;
      this.sunLight.color.set(0xfffbe8);
      this.sunLight.position.set(40, 80, 30);
    } else if (mode === "SUNSET") {
      this.scene.background = new THREE.Color(0xc2410c);
      this.scene.fog = new THREE.FogExp2(0x9a3412, 0.012);
      this.ambientLight.intensity = 0.45;
      this.sunLight.intensity = 0.8;
      this.sunLight.color.set(0xf97316);
      this.sunLight.position.set(80, 15, 30);
    } else if (mode === "NIGHT") {
      this.scene.background = new THREE.Color(0x020617);
      this.scene.fog = new THREE.FogExp2(0x020617, 0.015);
      this.ambientLight.intensity = 0.2;
      this.sunLight.intensity = 0.25;
      this.sunLight.color.set(0x38bdf8);
      this.sunLight.position.set(-20, 60, -40);
    } else if (mode === "SUNRISE") {
      this.scene.background = new THREE.Color(0xf472b6);
      this.scene.fog = new THREE.FogExp2(0xfb7185, 0.012);
      this.ambientLight.intensity = 0.5;
      this.sunLight.intensity = 0.7;
      this.sunLight.color.set(0xfde047);
      this.sunLight.position.set(-70, 18, 30);
    }
  }

  public cycleTimeOfDay() {
    const modes: TimeOfDay[] = ["DAY", "SUNSET", "NIGHT", "SUNRISE"];
    const nextIdx = (modes.indexOf(this.timeOfDayMode) + 1) % modes.length;
    this.setTimeOfDay(modes[nextIdx]);
    this.callbacks.onNotification?.(`Time of Day set to ${modes[nextIdx]}`);
  }

  public setMission(missionKey: string, customMission?: MissionDef) {
    this.activeMissionKey = missionKey;
    if (customMission) {
      this.activeMission = customMission;
    } else if (MISSIONS[missionKey]) {
      this.activeMission = MISSIONS[missionKey];
      this.buildFlightReadyCraft(missionKey);
    }
    this.triggerHUDUpdate();
  }

  public computeTelemetry(): TelemetryData {
    const blocks = this.world.getSpacecraftBlocks();
    let totalCostM = 0;
    let totalMass = 0;
    let powerGen = 0;
    let powerDraw = 0;
    let totalThrust = 0;
    let dataGen = 0;
    let dataDownlink = 0;
    let batteryCount = 0;
    let payloadCount = 0;
    let sciencePts = 0;

    blocks.forEach((b) => {
      const def = COMPONENT_DEFS[b.type];
      if (!def) return;
      totalCostM += def.cost_m ?? 0;
      totalMass += def.mass_kg;
      if (def.power_w > 0) powerGen += def.power_w;
      else powerDraw += Math.abs(def.power_w);
      totalThrust += def.thrust_kn;
      if (def.data_mbps > 0) dataGen += def.data_mbps;
      else dataDownlink += Math.abs(def.data_mbps);
      if (def.is_battery) batteryCount++;
      if (def.is_payload) payloadCount++;
      sciencePts += def.science_pts;
    });

    const gMult = this.activeMission.gravityMultiplier || 1.0;
    const netPower = powerGen - powerDraw;
    const minLiftThrust = Math.ceil(totalMass * 0.0098 * gMult);
    const twr =
      totalMass > 0
        ? parseFloat(
            (totalThrust / Math.max(totalMass * 0.0098 * gMult, 0.01)).toFixed(1)
          )
        : 0;

    const budgetCap = this.activeMission.budget_m ?? 160;
    const isOverBudget = totalCostM > budgetCap;
    const overBudgetAmount = isOverBudget
      ? parseFloat((totalCostM - budgetCap).toFixed(1))
      : 0;
    const budgetRemaining = Math.max(
      0,
      parseFloat((budgetCap - totalCostM).toFixed(1))
    );

    const hasPayloadContainer = blocks.some(
      (b) =>
        b.type === BLOCKS.SAT_PAYLOAD_CONTAINER ||
        b.type === BLOCKS.PAYLOAD_ADAPTER ||
        b.type === BLOCKS.DOCKING_PORT ||
        b.type === BLOCKS.BUS_FRAME
    );

    const stage1Certified =
      !isOverBudget &&
      twr >= 1.2 &&
      totalThrust >= (this.activeMission.min_thrust_kn * 0.75) &&
      hasPayloadContainer &&
      blocks.length >= 3;

    const stage2Certified =
      stage1Certified &&
      netPower >= 0 &&
      batteryCount >= (this.activeMission.min_batteries || 1) &&
      payloadCount >= (this.activeMission.min_payloads || 1) &&
      (!this.activeMission.require_closed_comms || dataDownlink >= dataGen);

    return {
      blocksCount: blocks.length,
      totalCostM: parseFloat(totalCostM.toFixed(1)),
      budgetRemaining,
      isOverBudget,
      overBudgetAmount,
      totalMass,
      powerGen,
      powerDraw,
      netPower,
      totalThrust,
      minLiftThrust,
      twr,
      dataGen,
      dataDownlink,
      batteryCount,
      payloadCount,
      sciencePts,
      hasPayloadContainer,
      stage1Certified,
      stage2Certified,
      devStage: this.devStage,
    };
  }

  public setDevStage(stage: DevStage) {
    this.devStage = stage;
    if (stage === "STAGE_1_ROCKET") {
      this.hotbarSlots = [...this.stage1Hotbar];
      this.setBlueprintMode("FULL_VEHICLE");
      this.callbacks.onNotification?.(
        "🚀 STAGE 1 ACTIVE: ROCKET LAUNCH VEHICLE BUILDER (EASY)\nBuild rocket engines, tanks, and top satellite payload container."
      );
    } else {
      this.hotbarSlots = [...this.stage2Hotbar];
      this.setBlueprintMode("SATELLITE");
      this.callbacks.onNotification?.(
        "🛰️ STAGE 2 ACTIVE: SATELLITE PAYLOAD INTEGRATION (INTERMEDIATE)\nInstall solar wings, scientific instruments, batteries, and communications."
      );
    }
    this.callbacks.onDevStageChange?.(stage);
    this.triggerHUDUpdate();
  }

  public toggleDevStage() {
    this.setDevStage(
      this.devStage === "STAGE_1_ROCKET"
        ? "STAGE_2_SATELLITE"
        : "STAGE_1_ROCKET"
    );
  }

  public triggerHUDUpdate() {
    const telem = this.computeTelemetry();
    this.callbacks.onTelemetryChange?.(telem);
    this.callbacks.onHotbarChange?.(this.hotbarSlots, this.activeSlotIdx);
    this.player.updateHandBlock(this.hotbarSlots[this.activeSlotIdx]);
    this.updateBlueprintGuide();
  }

  public setActiveSlot(idx: number) {
    if (idx >= 0 && idx < 9) {
      this.activeSlotIdx = idx;
      this.triggerHUDUpdate();
    }
  }

  public setSlotBlock(idx: number, blockType: number) {
    if (idx >= 0 && idx < 9) {
      this.hotbarSlots[idx] = blockType;
      this.triggerHUDUpdate();
    }
  }

  public toggleFairingCutaway(): boolean {
    this.fairingCutaway = !this.fairingCutaway;

    [BLOCKS.ROCKET_BODY_SHROUD, BLOCKS.PAYLOAD_FAIRING].forEach((bType) => {
      const mat = MATERIALS[bType];
      if (mat) {
        mat.transparent = this.fairingCutaway;
        mat.opacity = this.fairingCutaway ? 0.35 : 1.0;
        mat.depthWrite = !this.fairingCutaway;
        mat.needsUpdate = true;
      }
    });

    this.world.rebuildMeshes();
    this.callbacks.onShroudChange?.(this.fairingCutaway);
    this.callbacks.onNotification?.(
      `Fairing Shroud Mode: ${
        this.fairingCutaway
          ? "👁️ X-RAY CUTAWAY (Inner Satellite Instruments Visible)"
          : "🛡️ SOLID AERODYNAMIC ROCKET SHROUD"
      }`
    );
    return this.fairingCutaway;
  }

  public setBlueprintMode(mode: "SATELLITE" | "FULL_VEHICLE") {
    this.blueprintMode = mode;
    this.updateBlueprintGuide();
    this.callbacks.onBlueprintModeChange?.(mode);
    this.callbacks.onNotification?.(
      `Blueprint Mode: ${
        mode === "SATELLITE"
          ? "🛰️ INNER SATELLITE CORE"
          : "🚀 COMPLETE LAUNCH VEHICLE"
      }`
    );
  }

  public toggleBlueprintMode() {
    this.setBlueprintMode(
      this.blueprintMode === "SATELLITE" ? "FULL_VEHICLE" : "SATELLITE"
    );
  }

  public getBlueprintTargets(missionKey: string = this.activeMissionKey): {
    rocketTargets: { x: number; y: number; z: number; type: number }[];
    satelliteTargets: { x: number; y: number; z: number; type: number }[];
    shroudTargets: { x: number; y: number; z: number; type: number }[];
  } {
    const cx = PAD_X,
      cz = PAD_Z,
      cy = PAD_Y + 1;

    let rocketTargets: { x: number; y: number; z: number; type: number }[] = [];
    let satelliteTargets: { x: number; y: number; z: number; type: number }[] = [];
    let shroudTargets: { x: number; y: number; z: number; type: number }[] = [];

    if (missionKey === "earth_sentinel") {
      // Falcon 9 2-Stage Rocket
      rocketTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.MERLIN_CLUSTER },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx + 1, y: cy + 1, z: cz, type: BLOCKS.GRID_FIN },
        { x: cx - 1, y: cy + 1, z: cz, type: BLOCKS.GRID_FIN },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 3, z: cz, type: BLOCKS.INTERSTAGE_RING },
        { x: cx, y: cy + 4, z: cz, type: BLOCKS.VACUUM_ENGINE },
        { x: cx, y: cy + 5, z: cz, type: BLOCKS.UPPER_STAGE_TANK },
        { x: cx, y: cy + 6, z: cz, type: BLOCKS.PAYLOAD_ADAPTER },
      ];
      // Inner Earth Sentinel Satellite
      satelliteTargets = [
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.BUS_FRAME },
        { x: cx, y: cy + 7, z: cz - 1, type: BLOCKS.REACTION_WHEEL },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.AVIONICS_C_DH },
        { x: cx, y: cy + 8, z: cz + 1, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 8, z: cz - 1, type: BLOCKS.HIGH_GAIN_DISH },
        { x: cx, y: cy + 9, z: cz + 1, type: BLOCKS.SOLAR_ARRAY },
        { x: cx, y: cy + 9, z: cz, type: BLOCKS.MULTISPECTRAL_CAM },
      ];
      // Surrounding Rocket Shroud Envelope & Fairing
      shroudTargets = [
        { x: cx + 1, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx + 1, y: cy + 8, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 8, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx + 1, y: cy + 9, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 9, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx, y: cy + 10, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
    } else if (missionKey === "asteroid_scout") {
      // Falcon Heavy Booster & Core Architecture
      rocketTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.MERLIN_CLUSTER },
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 1, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 1, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 2, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
        { x: cx - 1, y: cy + 2, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 3, z: cz, type: BLOCKS.INTERSTAGE_RING },
        { x: cx, y: cy + 4, z: cz, type: BLOCKS.VACUUM_ENGINE },
        { x: cx, y: cy + 5, z: cz, type: BLOCKS.UPPER_STAGE_TANK },
        { x: cx, y: cy + 6, z: cz, type: BLOCKS.DOCKING_PORT },
      ];
      // Inner Psyche Deep Space Probe
      satelliteTargets = [
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.BUS_FRAME },
        { x: cx, y: cy + 7, z: cz - 1, type: BLOCKS.ION_THRUSTER },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.AVIONICS_C_DH },
        { x: cx, y: cy + 8, z: cz + 1, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 8, z: cz - 1, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 9, z: cz, type: BLOCKS.REACTION_WHEEL },
        { x: cx, y: cy + 9, z: cz - 1, type: BLOCKS.HIGH_GAIN_DISH },
        { x: cx, y: cy + 9, z: cz + 1, type: BLOCKS.PATCH_ANTENNA },
        { x: cx, y: cy + 10, z: cz, type: BLOCKS.SPECTROMETER_IR },
        { x: cx, y: cy + 10, z: cz - 1, type: BLOCKS.MAGNETOMETER },
        { x: cx, y: cy + 10, z: cz + 1, type: BLOCKS.SOLAR_WING },
      ];
      // Shroud
      shroudTargets = [
        { x: cx + 1, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx + 1, y: cy + 8, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 8, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx + 1, y: cy + 9, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 9, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx + 1, y: cy + 10, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 10, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx, y: cy + 11, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
    } else if (missionKey === "space_telescope") {
      // SLS Heavy Space Telescope Launcher
      rocketTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.RS25_ENGINE },
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 1, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 1, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 2, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
        { x: cx - 1, y: cy + 2, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 3, z: cz, type: BLOCKS.INTERSTAGE_RING },
        { x: cx, y: cy + 4, z: cz, type: BLOCKS.VACUUM_ENGINE },
        { x: cx, y: cy + 5, z: cz, type: BLOCKS.UPPER_STAGE_TANK },
        { x: cx, y: cy + 6, z: cz, type: BLOCKS.PAYLOAD_ADAPTER },
      ];
      // Inner James Webb Space Telescope Payload
      satelliteTargets = [
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.BUS_FRAME },
        { x: cx, y: cy + 7, z: cz - 1, type: BLOCKS.REACTION_WHEEL },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.AVIONICS_C_DH },
        { x: cx, y: cy + 8, z: cz + 1, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 8, z: cz - 1, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 9, z: cz, type: BLOCKS.HIGH_GAIN_DISH },
        { x: cx, y: cy + 9, z: cz + 1, type: BLOCKS.SOLAR_WING },
        { x: cx, y: cy + 9, z: cz - 1, type: BLOCKS.RADIATOR_PANEL },
        { x: cx, y: cy + 10, z: cz, type: BLOCKS.MULTISPECTRAL_CAM },
        { x: cx, y: cy + 10, z: cz - 1, type: BLOCKS.SPECTROMETER_IR },
        { x: cx, y: cy + 10, z: cz + 1, type: BLOCKS.HIGH_GAIN_DISH },
      ];
      // Shroud
      shroudTargets = [
        { x: cx + 1, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx + 1, y: cy + 8, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 8, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx + 1, y: cy + 9, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 9, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx + 1, y: cy + 10, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 10, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx, y: cy + 11, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
    } else {
      // Artemis III Lunar Mission
      rocketTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.RS25_ENGINE },
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 1, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 1, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 2, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
        { x: cx - 1, y: cy + 2, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 3, z: cz, type: BLOCKS.INTERSTAGE_RING },
        { x: cx, y: cy + 4, z: cz, type: BLOCKS.VACUUM_ENGINE },
        { x: cx, y: cy + 5, z: cz, type: BLOCKS.UPPER_STAGE_TANK },
        { x: cx, y: cy + 6, z: cz, type: BLOCKS.DOCKING_PORT },
      ];
      // Inner Orion / Lunar Vehicle Spacecraft
      satelliteTargets = [
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.BUS_FRAME },
        { x: cx, y: cy + 7, z: cz - 1, type: BLOCKS.RCS_THRUSTER },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.AVIONICS_C_DH },
        { x: cx, y: cy + 8, z: cz + 1, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 8, z: cz - 1, type: BLOCKS.REACTION_WHEEL },
        { x: cx, y: cy + 9, z: cz, type: BLOCKS.RADAR_SAR },
        { x: cx, y: cy + 9, z: cz + 1, type: BLOCKS.SOLAR_WING },
        { x: cx, y: cy + 9, z: cz - 1, type: BLOCKS.HIGH_GAIN_DISH },
      ];
      // Shroud
      shroudTargets = [
        { x: cx + 1, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx + 1, y: cy + 8, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 8, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx + 1, y: cy + 9, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx - 1, y: cy + 9, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx, y: cy + 10, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
    }

    return { rocketTargets, satelliteTargets, shroudTargets };
  }

  public wrapWithFairingShroud(): boolean {
    const blocks = this.world.getSpacecraftBlocks();
    const satBlocks = blocks.filter((b) => b.y >= PAD_Y + 7);
    if (satBlocks.length === 0) {
      this.callbacks.onNotification?.(
        "⚠️ No satellite payload core found on the upper stage to enclose!"
      );
      return false;
    }

    let minY = Infinity,
      maxY = -Infinity;
    satBlocks.forEach((b) => {
      if (b.y < minY) minY = b.y;
      if (b.y > maxY) maxY = b.y;
    });

    const cx = PAD_X,
      cz = PAD_Z;

    for (let y = minY; y <= maxY; y++) {
      if (this.world.getBlock(cx + 1, y, cz) === BLOCKS.AIR) {
        this.world.setBlock(cx + 1, y, cz, BLOCKS.ROCKET_BODY_SHROUD);
      }
      if (this.world.getBlock(cx - 1, y, cz) === BLOCKS.AIR) {
        this.world.setBlock(cx - 1, y, cz, BLOCKS.ROCKET_BODY_SHROUD);
      }
    }

    const noseY = maxY + 1;
    if (this.world.getBlock(cx, noseY, cz) === BLOCKS.AIR) {
      this.world.setBlock(cx, noseY, cz, BLOCKS.PAYLOAD_FAIRING);
    }

    soundEngine.playPlace();
    this.triggerHUDUpdate();
    this.callbacks.onNotification?.(
      "🛰️ Spacecraft successfully enclosed within Aerodynamic Fairing Shroud!"
    );
    return true;
  }

  public buildFlightReadyCraft(missionKey: string = this.activeMissionKey) {
    this.world.clearSpacecraft();
    const { rocketTargets, satelliteTargets, shroudTargets } =
      this.getBlueprintTargets(missionKey);

    rocketTargets.forEach((t) => this.world.setBlock(t.x, t.y, t.z, t.type));
    satelliteTargets.forEach((t) => this.world.setBlock(t.x, t.y, t.z, t.type));
    shroudTargets.forEach((t) => this.world.setBlock(t.x, t.y, t.z, t.type));

    this.callbacks.onNotification?.(
      `Loaded 100% Certified Launch Stack for ${this.activeMission.name}!`
    );
    this.triggerHUDUpdate();
  }

  public initBlueprintGuide() {
    this.blueprintGroup = new THREE.Group();
    this.scene.add(this.blueprintGroup);
    this.blueprintVisible = true;
    this.updateBlueprintGuide();
  }

  public toggleBlueprintGuide() {
    this.blueprintVisible = !this.blueprintVisible;
    this.blueprintGroup.visible = this.blueprintVisible;
    this.callbacks.onBlueprintChange?.(this.blueprintVisible);
    this.callbacks.onNotification?.(
      `Holographic Blueprint Guide: ${
        this.blueprintVisible ? "ENABLED" : "DISABLED"
      }`
    );
  }

  public updateBlueprintGuide() {
    if (!this.blueprintGroup) return;
    while (this.blueprintGroup.children.length > 0) {
      this.blueprintGroup.remove(this.blueprintGroup.children[0]);
    }

    const { rocketTargets, satelliteTargets, shroudTargets } =
      this.getBlueprintTargets(this.activeMissionKey);

    let blueprintTargets: { x: number; y: number; z: number; type: number }[] =
      [];

    if (this.devStage === "STAGE_1_ROCKET" && this.blueprintMode !== "SATELLITE") {
      // In Stage 1 Easy Rocket mode: guide guides rocket body, engines, tanks, and top satellite container
      blueprintTargets = [...rocketTargets, ...shroudTargets];
    } else if (this.blueprintMode === "SATELLITE") {
      // In Satellite mode, guide focuses on the inner payload core
      blueprintTargets = satelliteTargets;
    } else {
      // In Complete Launch Vehicle mode, guide shows full rocket + satellite + shroud
      blueprintTargets = [
        ...rocketTargets,
        ...satelliteTargets,
        ...shroudTargets,
      ];
    }

    blueprintTargets.forEach((tgt) => {
      if (this.world.getBlock(tgt.x, tgt.y, tgt.z) === tgt.type) return;

      const boxGeo = new THREE.BoxGeometry(0.98, 0.98, 0.98);
      const edges = new THREE.EdgesGeometry(boxGeo);
      const wireMat = new THREE.LineBasicMaterial({
        color: this.blueprintMode === "SATELLITE" ? 0x38bdf8 : 0x0284c7,
        transparent: true,
        opacity: 0.65,
        linewidth: 2,
      });
      const wire = new THREE.LineSegments(edges, wireMat);
      wire.position.set(tgt.x + 0.5, tgt.y + 0.5, tgt.z + 0.5);

      const ghostMat = new THREE.MeshBasicMaterial({
        color: this.blueprintMode === "SATELLITE" ? 0x0ea5e9 : 0x0284c7,
        transparent: true,
        opacity: 0.12,
        wireframe: false,
      });
      const ghost = new THREE.Mesh(boxGeo, ghostMat);
      ghost.position.set(tgt.x + 0.5, tgt.y + 0.5, tgt.z + 0.5);

      this.blueprintGroup.add(wire);
      this.blueprintGroup.add(ghost);
    });
  }

  public startLaunchSequence() {
    this.isLaunching = true;
    this.launchAscentY = 0;
    this.launchTimeSec = 0;
    this.launchStageName = "PAD_IGNITION";

    soundEngine.playLaunchRumble();
    this.callbacks.onNotification?.(
      "🚀 T-00:00: MAIN ENGINE IGNITION! ROCKET ASCENDING THROUGH THE ATMOSPHERE!"
    );

    confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });

    // Stage 1: Liftoff & Max-Q
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.launchStageName = "MAX_Q_TRANSONIC";
      this.callbacks.onNotification?.(
        "T+00:45: VEHICLE PASSING THROUGH MAX-Q DYNAMIC PRESSURE (MACH 1.4)!"
      );
    }, 2500);

    // Stage 2: Stage Separation (MECO)
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.launchStageName = "STAGE_SEPARATION";
      this.callbacks.onNotification?.(
        "T+02:20: MECO CONFIRMED! FIRST STAGE SEPARATED! VACUUM UPPER ENGINE IGNITED!"
      );
      this.setTimeOfDay("SUNSET");
    }, 5000);

    // Stage 3: Fairing Jettison (Atmospheric Exit)
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.launchStageName = "FAIRING_JETTISON";
      this.callbacks.onNotification?.(
        "T+03:15: PAYLOAD FAIRING JETTISONED! SATELLITE EXPOSED TO SPACE VACUUM!"
      );
      this.setTimeOfDay("NIGHT");
      [BLOCKS.ROCKET_BODY_SHROUD, BLOCKS.PAYLOAD_FAIRING].forEach((bType) => {
        const mat = MATERIALS[bType];
        if (mat) {
          mat.transparent = true;
          mat.opacity = 0.2;
          mat.depthWrite = false;
          mat.needsUpdate = true;
        }
      });
      this.world.rebuildMeshes();
    }, 7500);

    // Stage 4: Orbital Insertion
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.launchStageName = "ORBITAL_INSERTION";
      this.callbacks.onNotification?.(
        "T+04:30: ORBITAL INSERTION ACHIEVED! SATELLITE PAYLOAD ONLINE IN TARGET ORBIT!"
      );
      confetti({ particleCount: 220, spread: 130, origin: { y: 0.5 } });
    }, 10000);

    // Finish
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.isLaunching = false;
      this.callbacks.onLaunchFinish?.();
      this.callbacks.onNotification?.(
        "MISSION SUCCESS: 100% FLIGHT READINESS OBJECTIVES ACHIEVED!"
      );
    }, 13000);
  }

  private spawnExhaustPlume() {
    const pGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const colors = [0xff4500, 0xff8c00, 0xffd700, 0x64748b, 0x94a3b8];
    const pMat = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
    });
    const mesh = new THREE.Mesh(pGeo, pMat);
    mesh.position.set(
      PAD_X + (Math.random() - 0.5) * 1.0,
      PAD_Y + 1.2 + this.launchAscentY,
      PAD_Z + (Math.random() - 0.5) * 1.0
    );
    this.scene.add(mesh);
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      -Math.random() * 8 - 4,
      (Math.random() - 0.5) * 3
    );
    this.exhaustParticles.push({ mesh, vel, life: 0.6 });
  }

  private onPointerLockChange = () => {
    if (document.pointerLockElement === this.canvas) {
      this.isLocked = true;
      this.callbacks.onLockChange?.(true);
      soundEngine.init();
    } else {
      this.isLocked = false;
      this.callbacks.onLockChange?.(false);
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.isLaunching) return;
    const sens = 0.0022;
    if (this.isLocked) {
      this.player.yaw -= e.movementX * sens;
      this.player.pitch -= e.movementY * sens;
      this.player.pitch = Math.max(
        -Math.PI / 2 + 0.02,
        Math.min(Math.PI / 2 - 0.02, this.player.pitch)
      );
    } else if (this.isMouseDown) {
      this.player.yaw -= (e.movementX || 0) * sens;
      this.player.pitch -= (e.movementY || 0) * sens;
      this.player.pitch = Math.max(
        -Math.PI / 2 + 0.02,
        Math.min(Math.PI / 2 - 0.02, this.player.pitch)
      );
    }
  };

  public removeBlock(x: number, y: number, z: number): boolean {
    if (this.world.isIndestructible(x, y, z)) {
      this.callbacks.onNotification?.(
        "⚠️ Launchpad and environment structures are indestructible!"
      );
      return false;
    }
    this.world.setBlock(x, y, z, BLOCKS.AIR);
    soundEngine.playBreak();
    this.triggerHUDUpdate();
    return true;
  }

  private onMouseDown = (e: MouseEvent) => {
    if (e.target === this.canvas) {
      this.isMouseDown = true;
    }
    if (!this.isLocked || this.isLaunching) return;

    if (e.button === 0) {
      // Left click: break block (only destructible spacecraft blocks)
      const target = this.player.target;
      if (target && target.block) {
        const b = target.block;
        this.removeBlock(b.x, b.y, b.z);
      }
    } else if (e.button === 2) {
      // Right click: place block
      e.preventDefault();
      const target = this.player.target;
      if (target && target.adjacent) {
        const adj = target.adjacent;
        const activeType = this.hotbarSlots[this.activeSlotIdx];
        this.world.setBlock(adj.x, adj.y, adj.z, activeType);
        soundEngine.playPlace();
        this.triggerHUDUpdate();
      }
    }
  };

  private onMouseUp = () => {
    this.isMouseDown = false;
  };

  private onCanvasClick = () => {
    if (!this.isLocked && !this.isLaunching) {
      try {
        this.canvas.requestPointerLock();
      } catch (err) {
        console.warn("Pointer lock request ignored:", err);
      }
    }
  };

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "KeyB") {
      e.preventDefault();
      this.toggleBlueprintGuide();
      return;
    }
    if (e.code === "KeyX") {
      e.preventDefault();
      this.toggleFairingCutaway();
      return;
    }
    if (e.code === "KeyV") {
      e.preventDefault();
      this.toggleBlueprintMode();
      return;
    }
    if (e.code === "KeyF") {
      this.player.isFlying = !this.player.isFlying;
      this.callbacks.onFlightModeChange?.(this.player.isFlying);
      this.callbacks.onNotification?.(
        `Flight Mode: ${this.player.isFlying ? "ON" : "OFF"}`
      );
      return;
    }
    if (e.key >= "1" && e.key <= "9") {
      this.setActiveSlot(parseInt(e.key, 10) - 1);
      return;
    }
    this.player.keys[e.code] = true;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.player.keys[e.code] = false;
  };

  private onWheel = (e: WheelEvent) => {
    if (!this.isLocked || this.isLaunching) return;
    if (e.deltaY > 0)
      this.activeSlotIdx = (this.activeSlotIdx + 1) % 9;
    else
      this.activeSlotIdx = (this.activeSlotIdx - 1 + 9) % 9;
    this.triggerHUDUpdate();
  };

  private onResize = () => {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private setupEvents() {
    this.canvas.addEventListener("click", this.onCanvasClick);
    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("wheel", this.onWheel);
    window.addEventListener("resize", this.onResize);
  }

  private loop = (time: number) => {
    if (this.isDestroyed) return;
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.player.update(dt);

    // 3D Hover Raycasting Target:
    // Only detect active spacecraft/rocket blocks (y > PAD_Y). Ignore ground, pad, gantry, air.
    if (this.isLaunching || !this.player.target || !this.player.target.block) {
      if (this.lastHoveredType !== null) {
        this.lastHoveredType = null;
        this.lastHoveredPosKey = "";
        this.callbacks.onHoverBlock?.(null, null);
      }
    } else {
      const tb = this.player.target.block;
      if (this.world.isSpacecraftBlock(tb.x, tb.y, tb.z)) {
        const posKey = `${tb.x},${tb.y},${tb.z}`;
        if (
          this.lastHoveredType !== tb.type ||
          this.lastHoveredPosKey !== posKey
        ) {
          this.lastHoveredType = tb.type;
          this.lastHoveredPosKey = posKey;
          this.callbacks.onHoverBlock?.(tb.type, [tb.x, tb.y, tb.z]);
        }
      } else {
        if (this.lastHoveredType !== null) {
          this.lastHoveredType = null;
          this.lastHoveredPosKey = "";
          this.callbacks.onHoverBlock?.(null, null);
        }
      }
    }

    if (this.isLaunching) {
      this.launchTimeSec += dt;
      this.launchAscentY += dt * (8 + this.launchTimeSec * 4.5);

      const craftBlocks = this.world.getSpacecraftBlocks();
      craftBlocks.forEach((b) => {
        const key = `${b.x},${b.y},${b.z}`;
        const mesh = this.world.blockMeshMap.get(key);
        if (mesh) {
          mesh.position.y = b.y + 0.5 + this.launchAscentY;
        }
      });

      // Realistic flight telemetry calculations
      const altM = Math.round(this.launchAscentY * 420);
      const altKm = parseFloat((altM / 1000).toFixed(2));
      const velMs = Math.round(
        Math.min(7800, this.launchAscentY * 9.5 + this.launchTimeSec * 110)
      );
      const velKmh = Math.round(velMs * 3.6);
      const velKmS = (velMs / 1000).toFixed(2);
      const mach = parseFloat((velMs / 340.29).toFixed(1));
      const gForce =
        (1.0 + Math.min(3.5, this.launchTimeSec * 0.3)).toFixed(1) + " G";

      const totalSec = Math.floor(this.launchTimeSec * 22);
      const metMin = Math.floor(totalSec / 60)
        .toString()
        .padStart(2, "0");
      const metSec = (totalSec % 60).toString().padStart(2, "0");
      const met = `T+${metMin}:${metSec}`;

      this.callbacks.onLaunchTelemetry?.(
        `${altKm} km (${altM.toLocaleString()} m)`,
        `${velKmS} km/s (${velKmh.toLocaleString()} km/h | Mach ${mach})`,
        this.launchStageName,
        met,
        gForce,
        altKm,
        velKmh,
        mach
      );

      // CINEMATIC MULTI-ANGLE CAMERA TRACKING:
      const t = this.launchTimeSec;
      if (t < 2.5) {
        // Angle 1: Pad Hero Ground Shot looking up at the roaring engine nozzles
        this.camera.position.set(
          PAD_X + 11 + Math.sin(t * 1.5) * 1.2,
          PAD_Y + 1.2,
          PAD_Z + 13 + Math.cos(t * 1.5) * 1.2
        );
        this.camera.lookAt(PAD_X, PAD_Y + 2 + this.launchAscentY * 0.6, PAD_Z);
        // Heavy rocket launch vibration
        this.camera.position.x += (Math.random() - 0.5) * 0.28;
        this.camera.position.y += (Math.random() - 0.5) * 0.28;
      } else if (t < 5.0) {
        // Angle 2: Gantry Umbilical Tower Tracking Cam
        const p2T = (t - 2.5) / 2.5;
        this.camera.position.set(
          PAD_X + 18 - p2T * 5,
          PAD_Y + 10 + p2T * 22,
          PAD_Z + 19 - p2T * 5
        );
        this.camera.lookAt(PAD_X, PAD_Y + this.launchAscentY, PAD_Z);
        this.camera.position.x += (Math.random() - 0.5) * 0.12;
      } else if (t < 8.0) {
        // Angle 3: Supersonic Stratospheric Chase Cam
        const orbitAngle = (t - 5.0) * 0.5;
        const camDist = 20;
        this.camera.position.set(
          PAD_X + Math.cos(orbitAngle) * camDist,
          PAD_Y + this.launchAscentY - 5,
          PAD_Z + Math.sin(orbitAngle) * camDist
        );
        this.camera.lookAt(PAD_X, PAD_Y + this.launchAscentY + 4, PAD_Z);
      } else {
        // Angle 4: Staging & Space Orbit Cam
        this.camera.position.set(
          PAD_X + 22,
          PAD_Y + this.launchAscentY + 3,
          PAD_Z + 22
        );
        this.camera.lookAt(PAD_X, PAD_Y + this.launchAscentY, PAD_Z);
      }

      this.spawnExhaustPlume();
    }

    for (let i = this.exhaustParticles.length - 1; i >= 0; i--) {
      const p = this.exhaustParticles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.exhaustParticles.splice(i, 1);
      } else {
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.scale.multiplyScalar(0.96);
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.canvas.removeEventListener("click", this.onCanvasClick);
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("contextmenu", this.onContextMenu);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }
}
