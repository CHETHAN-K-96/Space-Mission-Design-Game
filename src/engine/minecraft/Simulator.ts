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
import { MissionDef, TelemetryData, TimeOfDay } from "./types";

export interface SimulatorCallbacks {
  onTelemetryChange?: (telem: TelemetryData) => void;
  onNotification?: (msg: string) => void;
  onHotbarChange?: (slots: number[], activeIdx: number) => void;
  onTimeChange?: (time: TimeOfDay) => void;
  onFlightModeChange?: (isFlying: boolean) => void;
  onBlueprintChange?: (visible: boolean) => void;
  onShroudChange?: (cutaway: boolean) => void;
  onLockChange?: (locked: boolean) => void;
  onLaunchTelemetry?: (alt: string, vel: string, stage: string) => void;
  onLaunchFinish?: () => void;
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

  public activeMissionKey: string = "artemis_lunar";
  public activeMission: MissionDef = MISSIONS["artemis_lunar"];
  public timeOfDayMode: TimeOfDay = "DAY";
  public fairingCutaway: boolean = false;

  public hotbarSlots: number[] = [
    BLOCKS.MERLIN_CLUSTER,
    BLOCKS.LIQUID_FUEL_TANK,
    BLOCKS.INTERSTAGE_RING,
    BLOCKS.VACUUM_ENGINE,
    BLOCKS.UPPER_STAGE_TANK,
    BLOCKS.DOCKING_PORT,
    BLOCKS.ROCKET_BODY_SHROUD,
    BLOCKS.PAYLOAD_FAIRING,
    BLOCKS.SOLID_BOOSTER,
  ];
  public activeSlotIdx: number = 0;

  public isLocked: boolean = false;
  public isMouseDown: boolean = false;
  public isLaunching: boolean = false;
  public launchAscentY: number = 0;
  public launchStageName: string = "PAD_IGNITION";
  public exhaustParticles: {
    mesh: THREE.Mesh;
    vel: THREE.Vector3;
    life: number;
  }[] = [];

  public blueprintGroup!: THREE.Group;
  public blueprintVisible: boolean = true;

  public callbacks: SimulatorCallbacks;
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;

  constructor(canvas: HTMLCanvasElement, callbacks: SimulatorCallbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    initMaterials();
    this.initThree();

    this.world = new VoxelWorld(this.scene);
    this.player = new Player(this.camera, this.world, this.scene);

    this.world.generateVABEnvironment();
    this.initBlueprintGuide();
    this.buildFlightReadyCraft("artemis_lunar");

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
    let totalXP = 0;
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
      totalXP += def.cost_xp ?? (def.cost_m ? Math.round(def.cost_m * 10) : 0);
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
    const budgetCap = this.activeMission.budget_m ?? this.activeMission.budget_xp ?? 100;
    const budgetRemaining = parseFloat((budgetCap - totalCostM).toFixed(1));

    return {
      blocksCount: blocks.length,
      totalXP: Math.round(totalXP),
      totalCostM: parseFloat(totalCostM.toFixed(1)),
      budgetRemaining,
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
    };
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
    if (MATERIALS[BLOCKS.ROCKET_BODY_SHROUD]) {
      MATERIALS[BLOCKS.ROCKET_BODY_SHROUD].transparent = this.fairingCutaway;
      MATERIALS[BLOCKS.ROCKET_BODY_SHROUD].opacity = this.fairingCutaway ? 0.35 : 1.0;
      MATERIALS[BLOCKS.ROCKET_BODY_SHROUD].needsUpdate = true;
    }
    this.world.rebuildMeshes();
    this.callbacks.onShroudChange?.(this.fairingCutaway);
    this.callbacks.onNotification?.(
      `Fairing Shroud Mode: ${
        this.fairingCutaway
          ? "X-Ray Cutaway (Payload Visible)"
          : "Solid Aerodynamic Rocket Hull"
      }`
    );
    return this.fairingCutaway;
  }

  public buildFlightReadyCraft(missionKey: string = this.activeMissionKey) {
    this.world.clearSpacecraft();
    const cx = PAD_X,
      cz = PAD_Z,
      cy = PAD_Y + 1;

    if (missionKey === "earth_sentinel") {
      // --- FALCON 9 2-STAGE LAUNCH VEHICLE WITH FULL BODY SHROUD & SATELLITE ---
      this.world.setBlock(cx, cy, cz, BLOCKS.MERLIN_CLUSTER);
      this.world.setBlock(cx, cy + 1, cz, BLOCKS.LIQUID_FUEL_TANK);
      this.world.setBlock(cx + 1, cy + 1, cz, BLOCKS.GRID_FIN);
      this.world.setBlock(cx - 1, cy + 1, cz, BLOCKS.GRID_FIN);
      this.world.setBlock(cx, cy + 2, cz, BLOCKS.LIQUID_FUEL_TANK);
      this.world.setBlock(cx, cy + 3, cz, BLOCKS.INTERSTAGE_RING);
      this.world.setBlock(cx, cy + 4, cz, BLOCKS.VACUUM_ENGINE);
      this.world.setBlock(cx, cy + 5, cz, BLOCKS.UPPER_STAGE_TANK);
      this.world.setBlock(cx, cy + 6, cz, BLOCKS.PAYLOAD_ADAPTER);
      this.world.setBlock(cx, cy + 7, cz, BLOCKS.ROCKET_BODY_SHROUD);
      this.world.setBlock(cx, cy + 8, cz, BLOCKS.PAYLOAD_FAIRING);
    } else if (missionKey === "asteroid_scout") {
      // --- FALCON HEAVY DEEP SPACE PROBE ARCHITECTURE WITH DOCKED BOOSTERS ---
      this.world.setBlock(cx, cy, cz, BLOCKS.MERLIN_CLUSTER);
      this.world.setBlock(cx, cy + 1, cz, BLOCKS.LIQUID_FUEL_TANK);
      this.world.setBlock(cx, cy + 2, cz, BLOCKS.LIQUID_FUEL_TANK);
      this.world.setBlock(cx + 1, cy, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx - 1, cy, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx + 1, cy + 1, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx - 1, cy + 1, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx + 1, cy + 2, cz, BLOCKS.PAYLOAD_FAIRING);
      this.world.setBlock(cx - 1, cy + 2, cz, BLOCKS.PAYLOAD_FAIRING);
      this.world.setBlock(cx, cy + 3, cz, BLOCKS.INTERSTAGE_RING);
      this.world.setBlock(cx, cy + 4, cz, BLOCKS.VACUUM_ENGINE);
      this.world.setBlock(cx, cy + 5, cz, BLOCKS.UPPER_STAGE_TANK);
      this.world.setBlock(cx, cy + 6, cz, BLOCKS.DOCKING_PORT);
      this.world.setBlock(cx, cy + 7, cz, BLOCKS.ROCKET_BODY_SHROUD);
      this.world.setBlock(cx, cy + 8, cz, BLOCKS.PAYLOAD_FAIRING);
    } else if (missionKey === "space_telescope") {
      // --- SLS HEAVY LAUNCH VEHICLE WITH ORANGE CRYOTANK & ENCLOSED OBSERVATORY ---
      this.world.setBlock(cx, cy, cz, BLOCKS.RS25_ENGINE);
      this.world.setBlock(cx, cy + 1, cz, BLOCKS.CRYOGENIC_TANK);
      this.world.setBlock(cx, cy + 2, cz, BLOCKS.CRYOGENIC_TANK);
      this.world.setBlock(cx + 1, cy, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx - 1, cy, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx + 1, cy + 1, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx - 1, cy + 1, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx + 1, cy + 2, cz, BLOCKS.PAYLOAD_FAIRING);
      this.world.setBlock(cx - 1, cy + 2, cz, BLOCKS.PAYLOAD_FAIRING);
      this.world.setBlock(cx, cy + 3, cz, BLOCKS.INTERSTAGE_RING);
      this.world.setBlock(cx, cy + 4, cz, BLOCKS.VACUUM_ENGINE);
      this.world.setBlock(cx, cy + 5, cz, BLOCKS.UPPER_STAGE_TANK);
      this.world.setBlock(cx, cy + 6, cz, BLOCKS.PAYLOAD_ADAPTER);
      this.world.setBlock(cx, cy + 7, cz, BLOCKS.ROCKET_BODY_SHROUD);
      this.world.setBlock(cx, cy + 8, cz, BLOCKS.PAYLOAD_FAIRING);
    } else {
      // --- ARTEMIS III LUNAR LAUNCH VEHICLE (Default) ---
      this.world.setBlock(cx, cy, cz, BLOCKS.RS25_ENGINE);
      this.world.setBlock(cx, cy + 1, cz, BLOCKS.CRYOGENIC_TANK);
      this.world.setBlock(cx, cy + 2, cz, BLOCKS.CRYOGENIC_TANK);
      this.world.setBlock(cx + 1, cy, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx - 1, cy, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx + 1, cy + 1, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx - 1, cy + 1, cz, BLOCKS.SOLID_BOOSTER);
      this.world.setBlock(cx + 1, cy + 2, cz, BLOCKS.PAYLOAD_FAIRING);
      this.world.setBlock(cx - 1, cy + 2, cz, BLOCKS.PAYLOAD_FAIRING);
      this.world.setBlock(cx, cy + 3, cz, BLOCKS.INTERSTAGE_RING);
      this.world.setBlock(cx, cy + 4, cz, BLOCKS.VACUUM_ENGINE);
      this.world.setBlock(cx, cy + 5, cz, BLOCKS.UPPER_STAGE_TANK);
      this.world.setBlock(cx, cy + 6, cz, BLOCKS.DOCKING_PORT);
      this.world.setBlock(cx, cy + 7, cz, BLOCKS.ROCKET_BODY_SHROUD);
      this.world.setBlock(cx, cy + 8, cz, BLOCKS.PAYLOAD_FAIRING);
    }

    this.callbacks.onNotification?.(
      `Loaded 100% Flight-Ready Spacecraft for ${this.activeMission.name}!`
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

    const cx = PAD_X,
      cz = PAD_Z,
      cy = PAD_Y + 1;
    let blueprintTargets: { x: number; y: number; z: number; type: number }[] =
      [];

    if (this.activeMissionKey === "earth_sentinel") {
      blueprintTargets = [
        { x: cx, y: cy, z: cz, type: BLOCKS.MERLIN_CLUSTER },
        { x: cx, y: cy + 1, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx + 1, y: cy + 1, z: cz, type: BLOCKS.GRID_FIN },
        { x: cx - 1, y: cy + 1, z: cz, type: BLOCKS.GRID_FIN },
        { x: cx, y: cy + 2, z: cz, type: BLOCKS.LIQUID_FUEL_TANK },
        { x: cx, y: cy + 3, z: cz, type: BLOCKS.INTERSTAGE_RING },
        { x: cx, y: cy + 4, z: cz, type: BLOCKS.VACUUM_ENGINE },
        { x: cx, y: cy + 5, z: cz, type: BLOCKS.UPPER_STAGE_TANK },
        { x: cx, y: cy + 6, z: cz, type: BLOCKS.PAYLOAD_ADAPTER },
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
    } else if (this.activeMissionKey === "asteroid_scout") {
      blueprintTargets = [
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
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
    } else if (this.activeMissionKey === "space_telescope") {
      blueprintTargets = [
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
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
    } else {
      // Artemis III Lunar Vehicle
      blueprintTargets = [
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
        { x: cx, y: cy + 7, z: cz, type: BLOCKS.ROCKET_BODY_SHROUD },
        { x: cx, y: cy + 8, z: cz, type: BLOCKS.PAYLOAD_FAIRING },
      ];
    }

    blueprintTargets.forEach((tgt) => {
      if (this.world.getBlock(tgt.x, tgt.y, tgt.z) === tgt.type) return;

      const boxGeo = new THREE.BoxGeometry(0.98, 0.98, 0.98);
      const edges = new THREE.EdgesGeometry(boxGeo);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
        linewidth: 2,
      });
      const wire = new THREE.LineSegments(edges, wireMat);
      wire.position.set(tgt.x + 0.5, tgt.y + 0.5, tgt.z + 0.5);

      const ghostMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
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
    this.launchStageName = "PAD_IGNITION";

    this.camera.position.set(PAD_X + 16, PAD_Y + 8, PAD_Z + 20);
    this.camera.lookAt(PAD_X, PAD_Y + 4, PAD_Z);

    soundEngine.playLaunchRumble();
    this.callbacks.onNotification?.(
      "🚀 T-00:00: MAIN ENGINE IGNITION! ROCKET ASCENDING THROUGH THE ATMOSPHERE!"
    );
    this.callbacks.onLaunchTelemetry?.("0.0 km", "0.00 km/s", "BOOSTER IGNITION");

    confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });

    // Stage 1: Max-Q
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.launchStageName = "MAX_Q_THROTTLE";
      this.callbacks.onNotification?.(
        "T+00:45: VEHICLE PASSING THROUGH MAX-Q DYNAMIC PRESSURE!"
      );
    }, 1500);

    // Stage 2: Stage Separation
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.launchStageName = "STAGE_SEPARATION";
      this.callbacks.onNotification?.(
        "T+02:20: MECO CONFIRMED! FIRST STAGE SEPARATED! VACUUM UPPER ENGINE IGNITED!"
      );
      this.setTimeOfDay("NIGHT");
    }, 3200);

    // Stage 2.5: Fairing Separation (Atmospheric Exit)
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.callbacks.onNotification?.(
        "T+03:15: PAYLOAD FAIRING JETTISONED! SPACECRAFT EXPOSED TO SPACE VACUUM!"
      );
      if (MATERIALS[BLOCKS.ROCKET_BODY_SHROUD]) {
        MATERIALS[BLOCKS.ROCKET_BODY_SHROUD].transparent = true;
        MATERIALS[BLOCKS.ROCKET_BODY_SHROUD].opacity = 0.2;
        MATERIALS[BLOCKS.ROCKET_BODY_SHROUD].needsUpdate = true;
      }
      this.world.rebuildMeshes();
    }, 4200);

    // Stage 3: Orbital Insertion
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.launchStageName = "ORBITAL_INSERTION";
      this.callbacks.onNotification?.(
        "T+04:30: ORBITAL INSERTION ACHIEVED! SOLAR WINGS DEPLOYED!"
      );
      confetti({ particleCount: 220, spread: 130, origin: { y: 0.5 } });
    }, 5200);

    // Finish
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.isLaunching = false;
      this.callbacks.onLaunchFinish?.();
      this.callbacks.onNotification?.(
        "MISSION SUCCESS: CML-3 POINT DESIGN OPERATIONAL IN SPACE!"
      );
    }, 7500);
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

  private onMouseDown = (e: MouseEvent) => {
    if (e.target === this.canvas) {
      this.isMouseDown = true;
    }
    if (!this.isLocked || this.isLaunching) return;

    if (e.button === 0) {
      // Left click: break block
      const target = this.player.target;
      if (target && target.block) {
        const b = target.block;
        if (
          b.type !== BLOCKS.CONCRETE_TILES &&
          b.type !== BLOCKS.GRASS_PLAINS &&
          b.type !== BLOCKS.OCEAN_WATER
        ) {
          this.world.setBlock(b.x, b.y, b.z, BLOCKS.AIR);
          soundEngine.playBreak();
          this.triggerHUDUpdate();
        }
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

    if (this.isLaunching) {
      this.launchAscentY += dt * (12 + this.launchAscentY * 0.45);

      const craftBlocks = this.world.getSpacecraftBlocks();
      craftBlocks.forEach((b) => {
        const key = `${b.x},${b.y},${b.z}`;
        const mesh = this.world.blockMeshMap.get(key);
        if (mesh) {
          mesh.position.y = b.y + 0.5 + this.launchAscentY;
        }
      });

      this.camera.lookAt(PAD_X, PAD_Y + this.launchAscentY, PAD_Z);

      const altKm = (this.launchAscentY * 1.5).toFixed(1);
      const velKmS = (this.launchAscentY * 0.12).toFixed(2);
      this.callbacks.onLaunchTelemetry?.(
        `${altKm} km`,
        `${velKmS} km/s`,
        this.launchStageName
      );

      this.spawnExhaustPlume();

      this.camera.position.x += (Math.random() - 0.5) * 0.08;
      this.camera.position.z += (Math.random() - 0.5) * 0.08;
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
