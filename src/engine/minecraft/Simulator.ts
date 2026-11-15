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
import { DevStage, MissionDef, MissionDebriefScore, TelemetryData, TimeOfDay } from "./types";

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
  onCountdown?: (count: number | null) => void;
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
  onLaunchComplete?: (debrief: MissionDebriefScore, mission: MissionDef) => void;
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

  // Dedicated independent block sets for Stage 1 (Aircraft Launcher) and Stage 2 (Mission Satellite)
  public rocketCraftBlocks: { x: number; y: number; z: number; type: number }[] = [];
  public satelliteCraftBlocks: { x: number; y: number; z: number; type: number }[] = [];

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
    } else {
      // NIGHT
      this.scene.background = new THREE.Color(0x020617);
      this.scene.fog = new THREE.FogExp2(0x020617, 0.015);
      this.ambientLight.intensity = 0.2;
      this.sunLight.intensity = 0.25;
      this.sunLight.color.set(0x38bdf8);
      this.sunLight.position.set(-20, 60, -40);
    }
  }

  public cycleTimeOfDay() {
    const nextMode: TimeOfDay = this.timeOfDayMode === "DAY" ? "NIGHT" : "DAY";
    this.setTimeOfDay(nextMode);
    this.callbacks.onNotification?.(`Environment Lighting: ${nextMode}`);
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
    // Synchronize currently active world blocks to their respective stage set
    if (this.devStage === "STAGE_1_ROCKET") {
      this.rocketCraftBlocks = this.world.getSpacecraftBlocks();
    } else {
      this.satelliteCraftBlocks = this.world.getSpacecraftBlocks();
    }

    // 1. Stage 1 (Aircraft Launcher / Rocket) metrics
    let rocketCostM = 0;
    let rocketMass = 0;
    let totalThrust = 0;
    this.rocketCraftBlocks.forEach((b) => {
      const def = COMPONENT_DEFS[b.type];
      if (!def) return;
      rocketCostM += def.cost_m ?? 0;
      rocketMass += def.mass_kg;
      totalThrust += def.thrust_kn;
    });

    // 2. Stage 2 (Mission Satellite) metrics
    let satelliteCostM = 0;
    let satelliteMass = 0;
    let powerGen = 0;
    let powerDraw = 0;
    let dataGen = 0;
    let dataDownlink = 0;
    let batteryCount = 0;
    let payloadCount = 0;
    let sciencePts = 0;
    this.satelliteCraftBlocks.forEach((b) => {
      const def = COMPONENT_DEFS[b.type];
      if (!def) return;
      satelliteCostM += def.cost_m ?? 0;
      satelliteMass += def.mass_kg;
      if (def.power_w > 0) powerGen += def.power_w;
      else powerDraw += Math.abs(def.power_w);
      if (def.data_mbps > 0) dataGen += def.data_mbps;
      else dataDownlink += Math.abs(def.data_mbps);
      if (def.is_battery) batteryCount++;
      if (def.is_payload) payloadCount++;
      sciencePts += def.science_pts;
    });

    const gMult = this.activeMission.gravityMultiplier || 1.0;
    const netPower = powerGen - powerDraw;
    const totalMass = rocketMass + satelliteMass;
    const minLiftThrust = Math.ceil(totalMass * 0.0098 * gMult);
    const twr =
      totalMass > 0
        ? parseFloat(
          (totalThrust / Math.max(totalMass * 0.0098 * gMult, 0.01)).toFixed(1)
        )
        : 0;

    // Separate budgets for aircraft and satellite
    const rocketBudgetM =
      this.activeMission.rocket_budget_m ??
      Math.round((this.activeMission.budget_m || 160) * 0.4);
    const satelliteBudgetM =
      this.activeMission.satellite_budget_m ??
      Math.round((this.activeMission.budget_m || 160) * 0.6);
    const totalBudgetM = rocketBudgetM + satelliteBudgetM;

    rocketCostM = parseFloat(rocketCostM.toFixed(1));
    satelliteCostM = parseFloat(satelliteCostM.toFixed(1));
    const totalCostM = parseFloat((rocketCostM + satelliteCostM).toFixed(1));

    const isRocketOverBudget = rocketCostM > rocketBudgetM;
    const rocketBudgetRemaining = Math.max(
      0,
      parseFloat((rocketBudgetM - rocketCostM).toFixed(1))
    );

    const isSatelliteOverBudget = satelliteCostM > satelliteBudgetM;
    const satelliteBudgetRemaining = Math.max(
      0,
      parseFloat((satelliteBudgetM - satelliteCostM).toFixed(1))
    );

    const isOverBudget =
      isRocketOverBudget ||
      isSatelliteOverBudget ||
      totalCostM > totalBudgetM;
    const overBudgetAmount = isOverBudget
      ? parseFloat(
          (
            Math.max(0, rocketCostM - rocketBudgetM) +
            Math.max(0, satelliteCostM - satelliteBudgetM)
          ).toFixed(1)
        )
      : 0;
    const budgetRemaining = Math.max(
      0,
      parseFloat((totalBudgetM - totalCostM).toFixed(1))
    );

    const hasPayloadContainer = this.rocketCraftBlocks.some(
      (b) =>
        b.type === BLOCKS.SAT_PAYLOAD_CONTAINER ||
        b.type === BLOCKS.PAYLOAD_ADAPTER ||
        b.type === BLOCKS.DOCKING_PORT ||
        b.type === BLOCKS.BUS_FRAME
    );

    const structuralIssues: string[] = [];

    // 1. Pad Grounding & Primary Liftoff Engine Validation (Stage 1 Rocket)
    const padBlocks = this.rocketCraftBlocks.filter((b) => b.y === PAD_Y + 1);
    const hasPadEngine = padBlocks.some(
      (b) =>
        b.type === BLOCKS.MERLIN_CLUSTER ||
        b.type === BLOCKS.RS25_ENGINE ||
        b.type === BLOCKS.SOLID_BOOSTER ||
        (COMPONENT_DEFS[b.type]?.thrust_kn ?? 0) > 0
    );

    if (this.rocketCraftBlocks.length > 0 && padBlocks.length === 0) {
      structuralIssues.push(
        "Vehicle is not docked to the launch pad (no components touch pad at ground level)."
      );
    } else if (this.rocketCraftBlocks.length > 0 && !hasPadEngine) {
      structuralIssues.push(
        "Propulsion Failure: No primary liftoff engine installed at launch pad level."
      );
    }

    // 2. 3D Adjacency Contiguity (Docking without Air Gaps / Floating Blocks)
    let isStructurallyConnected = false;
    if (this.rocketCraftBlocks.length > 0 && padBlocks.length > 0) {
      const posMap = new Map<string, { x: number; y: number; z: number; type: number }>();
      this.rocketCraftBlocks.forEach((b) => posMap.set(`${b.x},${b.y},${b.z}`, b));

      const queue = [...padBlocks];
      const visited = new Set<string>(padBlocks.map((b) => `${b.x},${b.y},${b.z}`));

      while (queue.length > 0) {
        const cur = queue.shift()!;
        const neighbors = [
          [cur.x + 1, cur.y, cur.z],
          [cur.x - 1, cur.y, cur.z],
          [cur.x, cur.y + 1, cur.z],
          [cur.x, cur.y - 1, cur.z],
          [cur.x, cur.y, cur.z + 1],
          [cur.x, cur.y, cur.z - 1],
        ];
        for (const [nx, ny, nz] of neighbors) {
          const key = `${nx},${ny},${nz}`;
          if (posMap.has(key) && !visited.has(key)) {
            visited.add(key);
            queue.push(posMap.get(key)!);
          }
        }
      }

      const unattachedBlocks = this.rocketCraftBlocks.filter(
        (b) => !visited.has(`${b.x},${b.y},${b.z}`)
      );
      if (unattachedBlocks.length > 0) {
        isStructurallyConnected = false;
        structuralIssues.push(
          `Structural Discontinuity: ${unattachedBlocks.length} disconnected floating module(s) detected. All stages must be docked and physically connected without air gaps.`
        );
      } else {
        isStructurallyConnected = true;
      }
    } else if (this.rocketCraftBlocks.length === 0) {
      isStructurallyConnected = false;
    }

    // 3. Aerodynamic Nosecone / Fairing Capping Validation
    let hasAerodynamicNose = false;
    if (this.rocketCraftBlocks.length > 0) {
      const centralBlocks = this.rocketCraftBlocks.filter(
        (b) => b.x === PAD_X && b.z === PAD_Z
      );
      let topCentralBlock: { x: number; y: number; z: number; type: number } | null = null;
      if (centralBlocks.length > 0) {
        centralBlocks.sort((a, b) => b.y - a.y);
        topCentralBlock = centralBlocks[0];
      }

      const overallHighestBlock = this.rocketCraftBlocks.reduce(
        (max, b) => (b.y > max.y ? b : max),
        this.rocketCraftBlocks[0]
      );

      const isTopAero =
        topCentralBlock?.type === BLOCKS.PAYLOAD_FAIRING ||
        topCentralBlock?.type === BLOCKS.ROCKET_BODY_SHROUD ||
        overallHighestBlock.type === BLOCKS.PAYLOAD_FAIRING ||
        overallHighestBlock.type === BLOCKS.ROCKET_BODY_SHROUD;

      if (isTopAero) {
        hasAerodynamicNose = true;
      } else {
        hasAerodynamicNose = false;
        structuralIssues.push(
          "Aerodynamic Violation: Rocket is missing an aerodynamic nosecone fairing on top. Atmospheric Max-Q dynamic pressure will tear apart an unshielded blunt payload."
        );
      }
    }

    // 4. Propellant & Staging Verification
    const hasFuelTanks = this.rocketCraftBlocks.some(
      (b) =>
        b.type === BLOCKS.LIQUID_FUEL_TANK ||
        b.type === BLOCKS.CRYOGENIC_TANK ||
        b.type === BLOCKS.UPPER_STAGE_TANK
    );
    if (this.rocketCraftBlocks.length > 0 && !hasFuelTanks) {
      structuralIssues.push(
        "Fuel Shortfall: No liquid propellant or cryogenic fuel tanks installed to feed engines."
      );
    }

    if (this.rocketCraftBlocks.length > 0 && !hasPayloadContainer) {
      structuralIssues.push(
        "Payload Missing: No satellite payload container block installed in the payload bay."
      );
    }

    const stage1Certified =
      !isRocketOverBudget &&
      twr >= 1.0 &&
      totalThrust >= (this.activeMission.min_thrust_kn * 0.75) &&
      hasPayloadContainer &&
      hasPadEngine &&
      isStructurallyConnected &&
      hasAerodynamicNose &&
      hasFuelTanks &&
      structuralIssues.length === 0 &&
      this.rocketCraftBlocks.length >= 4;

    const stage2Certified =
      !isSatelliteOverBudget &&
      netPower >= 0 &&
      batteryCount >= (this.activeMission.min_batteries || 1) &&
      payloadCount >= (this.activeMission.min_payloads || 1) &&
      (!this.activeMission.require_closed_comms || dataDownlink >= dataGen) &&
      this.satelliteCraftBlocks.length >= 1;

    return {
      blocksCount:
        this.devStage === "STAGE_1_ROCKET"
          ? this.rocketCraftBlocks.length
          : this.satelliteCraftBlocks.length,
      rocketBlocksCount: this.rocketCraftBlocks.length,
      satelliteBlocksCount: this.satelliteCraftBlocks.length,
      totalCostM,
      totalBudgetM,
      budgetRemaining,
      isOverBudget,
      overBudgetAmount,
      rocketCostM,
      rocketBudgetM,
      rocketBudgetRemaining,
      isRocketOverBudget,
      rocketMass,
      satelliteCostM,
      satelliteBudgetM,
      satelliteBudgetRemaining,
      isSatelliteOverBudget,
      satelliteMass,
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
      isStructurallyConnected,
      hasAerodynamicNose,
      hasPadEngine,
      structuralIssues,
      stage1Certified,
      stage2Certified,
      devStage: this.devStage,
    };
  }

  public setDevStage(stage: DevStage) {
    if (this.devStage === stage) return;

    // 1. Save current world blocks into current stage
    if (this.devStage === "STAGE_1_ROCKET") {
      this.rocketCraftBlocks = this.world.getSpacecraftBlocks();
    } else {
      this.satelliteCraftBlocks = this.world.getSpacecraftBlocks();
    }

    this.devStage = stage;

    // 2. Clear world and load the new stage's blocks
    this.world.clearSpacecraft();

    if (stage === "STAGE_1_ROCKET") {
      this.rocketCraftBlocks.forEach((t) => this.world.setBlock(t.x, t.y, t.z, t.type));
      this.hotbarSlots = [...this.stage1Hotbar];
      this.setBlueprintMode("FULL_VEHICLE");
      this.callbacks.onNotification?.(
        "STAGE 1 ACTIVE: AIRCRAFT LAUNCH VEHICLE BUILDER\nBuild rocket engines, tanks, and top satellite payload container."
      );
    } else {
      this.satelliteCraftBlocks.forEach((t) => this.world.setBlock(t.x, t.y, t.z, t.type));
      this.hotbarSlots = [...this.stage2Hotbar];
      this.setBlueprintMode("SATELLITE");
      this.callbacks.onNotification?.(
        "STAGE 2 ACTIVE: MISSION SATELLITE PAYLOAD INTEGRATION\nInstall solar wings, scientific instruments, batteries, and communications."
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
      `Fairing Shroud Mode: ${this.fairingCutaway
        ? "CUTAWAY (Inner Satellite Instruments Visible)"
        : "SOLID AERODYNAMIC ROCKET SHROUD"
      }`
    );
    return this.fairingCutaway;
  }

  public setBlueprintMode(mode: "SATELLITE" | "FULL_VEHICLE") {
    this.blueprintMode = mode;
    this.updateBlueprintGuide();
    this.callbacks.onBlueprintModeChange?.(mode);
    this.callbacks.onNotification?.(
      `Blueprint Mode: ${mode === "SATELLITE"
        ? "INNER SATELLITE CORE"
        : "COMPLETE LAUNCH VEHICLE"
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
      // Falcon 9 (Sentinel-6 Michael Freilich)
      // Sleek, tall, slender single-stick rocket (NO side boosters!)
      rocketTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.MERLIN_CLUSTER },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 3, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 4, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 5, z: cz, type: BLOCKS.INTERSTAGE_RING },
        { x: cx, y: cy + 6, z: cz, type: BLOCKS.VACUUM_ENGINE },
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.UPPER_STAGE_TANK },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.SAT_PAYLOAD_CONTAINER },
        { x: cx, y: cy + 9, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
      // Stage 2: Sentinel-6 Ocean Altimetry Satellite (assembled on satellite stand)
      satelliteTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.BUS_FRAME },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.AVIONICS_C_DH },
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.SOLAR_ARRAY },
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLAR_ARRAY },
        { x: cx, y: cy, z: cz + 1, type: BLOCKS.RADAR_SAR },
        { x: cx, y: cy, z: cz - 1, type: BLOCKS.MULTISPECTRAL_CAM },
        { x: cx, y: cy + 1, z: cz + 1, type: BLOCKS.PATCH_ANTENNA },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.BATTERY_PACK },
      ];
      shroudTargets = [];
    } else if (missionKey === "space_telescope") {
      // Ariane 5 ECA (James Webb Space Telescope)
      // Core: Vulcain 2 engine + 4 cryogenic tanks + interstage + upper stage + payload + fairing
      // Twin EAP Solid Boosters: 6 BLOCKS TALL
      rocketTargets = [
        // Center Core
        { x: cx, y: cy, z: cz, type: BLOCKS.RS25_ENGINE },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 3, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 4, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 5, z: cz, type: BLOCKS.INTERSTAGE_RING },
        { x: cx, y: cy + 6, z: cz, type: BLOCKS.VACUUM_ENGINE },
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.UPPER_STAGE_TANK },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.SAT_PAYLOAD_CONTAINER },
        { x: cx, y: cy + 9, z: cz, type: BLOCKS.PAYLOAD_FAIRING },

        // Left Solid Rocket Booster (EAP)
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 1, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 2, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 3, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 4, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 5, z: cz, type: BLOCKS.PAYLOAD_FAIRING },

        // Right Solid Rocket Booster (EAP)
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 1, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 2, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 3, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 4, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 5, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
      // Stage 2: JWST Infrared Space Observatory (assembled on satellite stand)
      satelliteTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.BUS_FRAME },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.AVIONICS_C_DH },
        { x: cx, y: cy, z: cz + 1, type: BLOCKS.SPECTROMETER_IR },
        { x: cx, y: cy, z: cz - 1, type: BLOCKS.MULTISPECTRAL_CAM },
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.RADIATOR_PANEL },
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLAR_ARRAY },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 2, z: cz - 1, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 2, z: cz + 1, type: BLOCKS.HIGH_GAIN_DISH },
        { x: cx, y: cy + 1, z: cz + 1, type: BLOCKS.REACTION_WHEEL },
      ];
      shroudTargets = [];
    } else if (missionKey === "asteroid_scout") {
      // Falcon Heavy (NASA Psyche Asteroid Scout)
      rocketTargets = [
        // Center Core
        { x: cx, y: cy, z: cz, type: BLOCKS.MERLIN_CLUSTER },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 3, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 4, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 5, z: cz, type: BLOCKS.INTERSTAGE_RING },
        { x: cx, y: cy + 6, z: cz, type: BLOCKS.VACUUM_ENGINE },
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.UPPER_STAGE_TANK },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.SAT_PAYLOAD_CONTAINER },
        { x: cx, y: cy + 9, z: cz, type: BLOCKS.PAYLOAD_FAIRING },

        // Left Falcon Heavy Side Booster
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 1, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx - 1, y: cy + 2, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx - 1, y: cy + 3, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx - 1, y: cy + 4, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx - 1, y: cy + 5, z: cz, type: BLOCKS.PAYLOAD_FAIRING },

        // Right Falcon Heavy Side Booster
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 1, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx + 1, y: cy + 2, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx + 1, y: cy + 3, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx + 1, y: cy + 4, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx + 1, y: cy + 5, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
      // Stage 2: Psyche Deep Space Asteroid Scout Probe
      satelliteTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.BUS_FRAME },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.AVIONICS_C_DH },
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.SOLAR_WING },
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLAR_WING },
        { x: cx, y: cy, z: cz + 1, type: BLOCKS.MAGNETOMETER },
        { x: cx, y: cy, z: cz - 1, type: BLOCKS.SPECTROMETER_IR },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 2, z: cz - 1, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 2, z: cz + 1, type: BLOCKS.HIGH_GAIN_DISH },
        { x: cx, y: cy - 1, z: cz, type: BLOCKS.ION_THRUSTER },
      ];
      shroudTargets = [];
    } else if (missionKey === "artemis_lunar") {
      // SLS Block 1 (Artemis III Lunar Transfer Vehicle)
      rocketTargets = [
        // Center Core
        { x: cx, y: cy, z: cz, type: BLOCKS.RS25_ENGINE },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 3, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 4, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 5, z: cz, type: BLOCKS.CRYOGENIC_TANK },
        { x: cx, y: cy + 6, z: cz, type: BLOCKS.INTERSTAGE_RING },
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.VACUUM_ENGINE },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.UPPER_STAGE_TANK },
        { x: cx, y: cy + 9, z: cz, type: BLOCKS.SAT_PAYLOAD_CONTAINER },
        { x: cx, y: cy + 10, z: cz, type: BLOCKS.PAYLOAD_FAIRING },

        // Left 5-Segment Solid Rocket Booster
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 1, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 2, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 3, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 4, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 5, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx - 1, y: cy + 6, z: cz, type: BLOCKS.PAYLOAD_FAIRING },

        // Right 5-Segment Solid Rocket Booster
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 1, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 2, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 3, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 4, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 5, z: cz, type: BLOCKS.SOLID_BOOSTER },
        { x: cx + 1, y: cy + 6, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
      // Stage 2: Orion Lunar Spacecraft & Trans-Lunar Payload
      satelliteTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.BUS_FRAME },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.AVIONICS_C_DH },
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.SOLAR_WING },
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLAR_WING },
        { x: cx, y: cy, z: cz + 1, type: BLOCKS.RADAR_SAR },
        { x: cx, y: cy, z: cz - 1, type: BLOCKS.MULTISPECTRAL_CAM },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.BATTERY_PACK },
        { x: cx - 1, y: cy + 1, z: cz, type: BLOCKS.BATTERY_PACK },
        { x: cx + 1, y: cy + 1, z: cz, type: BLOCKS.BATTERY_PACK },
        { x: cx, y: cy + 2, z: cz + 1, type: BLOCKS.HIGH_GAIN_DISH },
        { x: cx, y: cy, z: cz - 2, type: BLOCKS.RCS_THRUSTER },
      ];
      shroudTargets = [];
    } else {
      // Sandbox Mode: Modular Prototype
      rocketTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.MERLIN_CLUSTER },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 3, z: cz, type: BLOCKS.INTERSTAGE_RING },
        { x: cx, y: cy + 4, z: cz, type: BLOCKS.VACUUM_ENGINE },
        { x: cx, y: cy + 5, z: cz, type: BLOCKS.UPPER_STAGE_TANK },
        { x: cx, y: cy + 6, z: cz, type: BLOCKS.SAT_PAYLOAD_CONTAINER },
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
      satelliteTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.BUS_FRAME },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.AVIONICS_C_DH },
        { x: cx - 1, y: cy, z: cz, type: BLOCKS.SOLAR_ARRAY },
        { x: cx + 1, y: cy, z: cz, type: BLOCKS.SOLAR_ARRAY },
        { x: cx, y: cy, z: cz + 1, type: BLOCKS.MULTISPECTRAL_CAM },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.BATTERY_PACK },
      ];
      shroudTargets = [];
    }

    return { rocketTargets, satelliteTargets, shroudTargets };
  }

  public wrapWithFairingShroud(): boolean {
    const blocks = this.world.getSpacecraftBlocks();
    const satBlocks = blocks.filter((b) => b.y >= PAD_Y + 7);
    if (satBlocks.length === 0) {
      this.callbacks.onNotification?.(
        "[WARNING] No satellite payload core found on the upper stage to enclose!"
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
      "Spacecraft successfully enclosed within Aerodynamic Fairing Shroud!"
    );
    return true;
  }

  public buildFlightReadyCraft(missionKey: string = this.activeMissionKey) {
    const { rocketTargets, satelliteTargets, shroudTargets } =
      this.getBlueprintTargets(missionKey);

    this.rocketCraftBlocks = [...rocketTargets, ...shroudTargets];
    this.satelliteCraftBlocks = [...satelliteTargets];

    this.world.clearSpacecraft();

    if (this.devStage === "STAGE_1_ROCKET") {
      this.rocketCraftBlocks.forEach((t) =>
        this.world.setBlock(t.x, t.y, t.z, t.type)
      );
    } else {
      this.satelliteCraftBlocks.forEach((t) =>
        this.world.setBlock(t.x, t.y, t.z, t.type)
      );
    }

    this.callbacks.onNotification?.(
      `Loaded Flight-Ready Craft for ${this.activeMission.name}!`
    );
    this.triggerHUDUpdate();
  }

  public clearActiveStageCraft() {
    this.world.clearSpacecraft();
    if (this.devStage === "STAGE_1_ROCKET") {
      this.rocketCraftBlocks = [];
    } else {
      this.satelliteCraftBlocks = [];
    }
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
      `Holographic Blueprint Guide: ${this.blueprintVisible ? "ENABLED" : "DISABLED"
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

  public isCountdown: boolean = false;
  public isStageSeparated: boolean = false;
  public stageSeparationSec: number = 0;
  public separationAscentY: number = 0;

  public startLaunchSequence() {
    if (this.isLaunching || this.isCountdown) return;

    // Sync active world blocks first
    if (this.devStage === "STAGE_1_ROCKET") {
      this.rocketCraftBlocks = this.world.getSpacecraftBlocks();
    } else {
      this.satelliteCraftBlocks = this.world.getSpacecraftBlocks();
    }

    // Flight certification gate - only require Stage 1 rocket aircraft launcher certification!
    // One can launch without developing or entering Stage 2. Stage 2 violations do not block launch.
    const telem = this.computeTelemetry();
    if (!telem.stage1Certified || (telem.structuralIssues && telem.structuralIssues.length > 0)) {
      const issueMsg =
        (telem.structuralIssues && telem.structuralIssues[0]) ||
        (telem.isRocketOverBudget
          ? "Stage 1 Aircraft budget ceiling breached!"
          : telem.twr < 1.0
          ? "TWR < 1.0: Vehicle cannot overcome gravity."
          : !telem.hasPayloadContainer
          ? "Rocket is missing a payload container block!"
          : "Aircraft launcher failed flight readiness certification!");
      this.callbacks.onNotification?.(`[FLIGHT ABORT] ${issueMsg}`);
      soundEngine.playBreak();
      return;
    }

    // Launch ONLY the rocket aircraft with payload container - DO NOT add or depict the stage 2 satellite blocks during launch animation!
    this.world.clearSpacecraft();
    this.rocketCraftBlocks.forEach((t) => this.world.setBlock(t.x, t.y, t.z, t.type));

    this.isCountdown = true;
    this.isStageSeparated = false;
    this.stageSeparationSec = 0;
    this.separationAscentY = 0;
    this.launchStageName = "COUNTDOWN";

    // Set clear hero pre-ignition camera position looking North along South crawlerway
    this.camera.position.set(PAD_X, PAD_Y + 1.8, PAD_Z - 15);
    this.camera.lookAt(PAD_X, PAD_Y + 3.5, PAD_Z);

    // T-3
    this.callbacks.onCountdown?.(3);
    this.callbacks.onNotification?.("T-03: TERMINAL COUNTDOWN. FLIGHT COMPUTER AUTONOMOUS.");
    soundEngine.playPlace();

    // T-2
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.callbacks.onCountdown?.(2);
      this.callbacks.onNotification?.("T-02: ENGINE RECIRCULATION CHILL & TURBOPUMP SPIN-UP.");
    }, 1000);

    // T-1
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.callbacks.onCountdown?.(1);
      this.callbacks.onNotification?.("T-01: MAIN ENGINE IGNITION! PAD SOUND SUPPRESSION ACTIVE!");
      // Spool pre-ignition smoke at pad
      for (let i = 0; i < 20; i++) {
        this.spawnExhaustPlume();
      }
    }, 2000);

    // T-0: LIFTOFF!
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.isCountdown = false;
      this.isLaunching = true;
      this.launchAscentY = 0;
      this.launchTimeSec = 0;
      this.launchStageName = "LIFTOFF";

      soundEngine.playLaunchRumble();
      this.callbacks.onCountdown?.(0);
      this.callbacks.onNotification?.(
        "T+00:00: LIFTOFF! THE ROCKET HAS CLEARED THE LAUNCH COMPLEX!"
      );

      confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });

      // Dismiss countdown badge shortly after liftoff
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.callbacks.onCountdown?.(null);
        }
      }, 1200);

      // Stage 1: Liftoff & Max-Q
      setTimeout(() => {
        if (this.isDestroyed) return;
        this.launchStageName = "MAX_Q_TRANSONIC";
        this.callbacks.onNotification?.(
          "T+00:45: VEHICLE PASSING THROUGH MAX-Q DYNAMIC PRESSURE (MACH 1.4)!"
        );
      }, 3000);

      // Stage 2: Upper Stage Burn
      setTimeout(() => {
        if (this.isDestroyed) return;
        this.launchStageName = "UPPER_STAGE_BURN";
        this.callbacks.onNotification?.(
          "T+02:20: MECO CONFIRMED! UPPER STAGE VACUUM ENGINE FULL POWER!"
        );
        for (let i = 0; i < 15; i++) {
          this.spawnExhaustPlume();
        }
      }, 6000);

      // Stage 3: Space Vacuum Entry
      setTimeout(() => {
        if (this.isDestroyed) return;
        this.launchStageName = "SPACE_INSERTION";
        this.callbacks.onNotification?.(
          "T+03:30: ATMOSPHERIC EXIT! VEHICLE COMMITTED TO TARGET TRAJECTORY!"
        );
      }, 9000);

      // Stage 4: Orbital Trajectory Commitment
      setTimeout(() => {
        if (this.isDestroyed) return;
        this.launchStageName = "ORBITAL_INSERTION";
        this.callbacks.onNotification?.(
          `T+04:45: ORBITAL INSERTION ACHIEVED! SATELLITE COMMITTED TO ${this.activeMission.target}!`
        );
        confetti({ particleCount: 220, spread: 130, origin: { y: 0.5 } });
      }, 11500);

      // Finish & Systems Engineering Debrief Score
      setTimeout(() => {
        if (this.isDestroyed) return;
        this.isLaunching = false;

        // Reset spacecraft blocks back to current active stage
        this.world.clearSpacecraft();
        if (this.devStage === "STAGE_1_ROCKET") {
          this.rocketCraftBlocks.forEach((b) => {
            this.world.setBlock(b.x, b.y, b.z, b.type);
          });
        } else {
          this.satelliteCraftBlocks.forEach((b) => {
            this.world.setBlock(b.x, b.y, b.z, b.type);
          });
        }
        this.triggerHUDUpdate();

        this.callbacks.onLaunchFinish?.();
        this.callbacks.onNotification?.(
          "MISSION SUCCESS: 100% FLIGHT READINESS OBJECTIVES ACHIEVED!"
        );

        // Generate Systems Engineering Debrief Score
        const telem = this.computeTelemetry();
        const maxBudget = telem.rocketBudgetM || 160;
        const budgetPct = Math.max(0, Math.min(1, telem.rocketBudgetRemaining / maxBudget));
        const budgetScore = Math.round(budgetPct * 20);

        const massScore = Math.max(12, Math.min(20, Math.round(20 - Math.max(0, (telem.rocketMass - 3000) / 400))));
        const twrScore = telem.twr >= 1.2 && telem.twr <= 2.5 ? 20 : telem.twr >= 1.0 ? 16 : 5;
        const powerScore = telem.stage2Certified ? 20 : 16;
        const scienceScore = telem.hasPayloadContainer ? 20 : 15;

        const totalScore = Math.min(100, budgetScore + massScore + twrScore + powerScore + scienceScore);
        const grade: "A+" | "A" | "B" | "C" | "FAIL" =
          totalScore >= 90 ? "A+" : totalScore >= 80 ? "A" : totalScore >= 70 ? "B" : totalScore >= 60 ? "C" : "FAIL";

        const debrief: MissionDebriefScore = {
          totalScore,
          grade,
          verdict:
            totalScore >= 75
              ? "MISSION SUCCESS: FLIGHT OPERATIONS CERTIFIED (LEVEL 3 POINT DESIGN)"
              : "SUB-OPTIMAL DESIGN: BUDGET OR PROPULSION MARGINS NARROW",
          breakdown: {
            budgetEfficiency: budgetScore,
            structuralMass: massScore,
            propulsionTWR: twrScore,
            powerBalance: powerScore,
            scienceAlignment: scienceScore,
          },
          telemetrySnapshot: {
            finalAltKm: Math.round(this.launchAscentY * 0.42),
            maxVelKmh: Math.round(Math.min(7800, this.launchAscentY * 9.5 + this.launchTimeSec * 110) * 3.6),
            maxG: (1.0 + Math.min(3.5, this.launchTimeSec * 0.3)).toFixed(1) + " G",
            flightDurationSec: 15,
            costSpentM: telem.rocketCostM,
            massKg: telem.rocketMass,
            twr: telem.twr,
          },
        };

        this.callbacks.onLaunchComplete?.(debrief, this.activeMission);
      }, 15000);
    }, 3000);
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
        "[WARNING] Launchpad and environment structures are indestructible!"
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

      // Launch the EXACT aircraft built by the user on the launchpad:
      // Every single block that the user placed ascends smoothly together!
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

      // SMOOTH ATMOSPHERIC SKY COLOR DARKENING INTO DEEP SPACE:
      // Smooth gradient from daylight sky blue into deep starry space void without sudden flashes
      const spaceProgress = Math.min(1.0, altKm / 65);
      const dayColor = new THREE.Color(0x38bdf8);
      const spaceColor = new THREE.Color(0x020617);
      const dynamicSky = dayColor.clone().lerp(spaceColor, Math.pow(spaceProgress, 0.65));
      this.scene.background = dynamicSky;
      if (this.scene.fog) {
        this.scene.fog.color = dynamicSky;
        (this.scene.fog as THREE.FogExp2).density = Math.max(0.0001, 0.0035 * (1 - spaceProgress));
      }

      // CINEMATIC TRACKING CAMERA (Unobstructed South Crawlerway Axis):
      const t = this.launchTimeSec;
      const targetRocketY = PAD_Y + 4.0 + this.launchAscentY;
      const camDist = 20.0 + Math.min(22.0, this.launchAscentY * 0.12);
      this.camera.position.set(
        PAD_X + 5.0,
        PAD_Y + 2.5 + this.launchAscentY * 0.85,
        PAD_Z - camDist
      );
      this.camera.lookAt(PAD_X, targetRocketY, PAD_Z);

      // Acoustic vibration rumble during liftoff clearing the pad
      if (t < 2.0) {
        this.camera.position.x += (Math.random() - 0.5) * 0.15;
        this.camera.position.y += (Math.random() - 0.5) * 0.15;
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
