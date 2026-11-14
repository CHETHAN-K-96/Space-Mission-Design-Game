import * as THREE from "three";
import {
  BLOCKS,
  WORLD_W,
  WORLD_H,
  WORLD_D,
  PAD_X,
  PAD_Y,
  PAD_Z,
} from "./constants";
import { VoxelModelFactory } from "./VoxelModelFactory";

export class VoxelWorld {
  public scene: THREE.Scene;
  public data: Uint8Array;
  public meshGroup: THREE.Group;
  public blockMeshMap: Map<string, THREE.Object3D>;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.data = new Uint8Array(WORLD_W * WORLD_H * WORLD_D);
    this.meshGroup = new THREE.Group();
    this.scene.add(this.meshGroup);
    this.blockMeshMap = new Map();
  }

  public getIndex(x: number, y: number, z: number): number {
    if (
      x < 0 ||
      x >= WORLD_W ||
      y < 0 ||
      y >= WORLD_H ||
      z < 0 ||
      z >= WORLD_D
    )
      return -1;
    return x + WORLD_W * (y + WORLD_H * z);
  }

  public getBlock(x: number, y: number, z: number): number {
    const idx = this.getIndex(x, y, z);
    return idx === -1 ? BLOCKS.AIR : this.data[idx];
  }

  public setBlock(x: number, y: number, z: number, type: number) {
    const idx = this.getIndex(x, y, z);
    if (idx === -1) return;
    this.data[idx] = type;
    this.updateBlockMesh(x, y, z);
  }

  public isIndestructible(x: number, y: number, z: number): boolean {
    if (y <= PAD_Y) return true;
    const b = this.getBlock(x, y, z);
    if (
      b === BLOCKS.LAUNCH_PAD_STEEL ||
      b === BLOCKS.GANTRY_TOWER ||
      b === BLOCKS.CONCRETE_TILES ||
      b === BLOCKS.HAZARD_STRIPE ||
      b === BLOCKS.GRASS_PLAINS ||
      b === BLOCKS.OCEAN_WATER
    ) {
      return true;
    }
    return false;
  }

  public isSpacecraftBlock(x: number, y: number, z: number): boolean {
    if (y <= PAD_Y) return false;
    const b = this.getBlock(x, y, z);
    return (
      b !== BLOCKS.AIR &&
      b !== BLOCKS.LAUNCH_PAD_STEEL &&
      b !== BLOCKS.GANTRY_TOWER &&
      b !== BLOCKS.CONCRETE_TILES &&
      b !== BLOCKS.HAZARD_STRIPE &&
      b !== BLOCKS.GRASS_PLAINS &&
      b !== BLOCKS.OCEAN_WATER
    );
  }

  public generateVABEnvironment() {
    this.data.fill(0);

    // Broad Terrain: Coastal Plains & Open Ocean
    for (let x = 0; x < WORLD_W; x++) {
      for (let z = 0; z < WORLD_D; z++) {
        // East edge is Atlantic ocean
        let block: number =
          z > WORLD_D - 12 ? BLOCKS.OCEAN_WATER : BLOCKS.GRASS_PLAINS;
        // Pad vicinity is concrete tarmac
        if (
          x >= PAD_X - 16 &&
          x <= PAD_X + 16 &&
          z >= PAD_Z - 16 &&
          z <= PAD_Z + 16
        ) {
          block = BLOCKS.CONCRETE_TILES;
        }
        // Dual Crawlerway roads leading South
        if (
          ((x >= PAD_X - 3 && x <= PAD_X - 1) ||
            (x >= PAD_X + 1 && x <= PAD_X + 3)) &&
          z < PAD_Z - 16
        ) {
          block = BLOCKS.CONCRETE_TILES;
        }
        this.data[this.getIndex(x, 0, z)] = block;
      }
    }

    // Raised Heavy Launch Pad (10x10)
    for (let x = PAD_X - 5; x <= PAD_X + 5; x++) {
      for (let z = PAD_Z - 5; z <= PAD_Z + 5; z++) {
        for (let y = 1; y <= PAD_Y; y++) {
          let b: number = BLOCKS.LAUNCH_PAD_STEEL;
          // Hazard warning boundary on top perimeter
          if (
            y === PAD_Y &&
            (x === PAD_X - 5 ||
              x === PAD_X + 5 ||
              z === PAD_Z - 5 ||
              z === PAD_Z + 5)
          ) {
            b = BLOCKS.HAZARD_STRIPE;
          }
          // Flame trench opening underneath center
          if (y < PAD_Y && x >= PAD_X - 2 && x <= PAD_X + 2) {
            b = BLOCKS.AIR;
          }
          this.data[this.getIndex(x, y, z)] = b;
        }
      }
    }

    // Massive Umbilical Gantry Tower (North-West corner, clear of South crawlerway)
    const gx = PAD_X - 7;
    const gz = PAD_Z - 7;
    for (let y = 1; y <= PAD_Y + 16; y++) {
      this.data[this.getIndex(gx, y, gz)] = BLOCKS.GANTRY_TOWER;
      this.data[this.getIndex(gx + 1, y, gz)] = BLOCKS.GANTRY_TOWER;
    }

    // Lightning Mast Towers set back to perimeter so they never obstruct launch tracking cameras
    const lx1 = PAD_X + 16,
      lz1 = PAD_Z + 16;
    const lx2 = PAD_X - 16,
      lz2 = PAD_Z + 16;
    for (let y = 1; y <= PAD_Y + 14; y++) {
      this.data[this.getIndex(lx1, y, lz1)] = BLOCKS.GANTRY_TOWER;
      this.data[this.getIndex(lx2, y, lz2)] = BLOCKS.GANTRY_TOWER;
    }

    this.rebuildMeshes();
  }

  public rebuildMeshes() {
    while (this.meshGroup.children.length > 0) {
      this.meshGroup.remove(this.meshGroup.children[0]);
    }
    this.blockMeshMap.clear();

    for (let x = 0; x < WORLD_W; x++) {
      for (let y = 0; y < WORLD_H; y++) {
        for (let z = 0; z < WORLD_D; z++) {
          const b = this.getBlock(x, y, z);
          if (b === BLOCKS.AIR) continue;

          const mesh = VoxelModelFactory.createMeshForBlock(b);
          mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
          mesh.userData = { vx: x, vy: y, vz: z, type: b };
          this.meshGroup.add(mesh);
          this.blockMeshMap.set(`${x},${y},${z}`, mesh);
        }
      }
    }
  }

  public updateBlockMesh(x: number, y: number, z: number) {
    const key = `${x},${y},${z}`;
    const currentMesh = this.blockMeshMap.get(key);
    const b = this.getBlock(x, y, z);

    if (b === BLOCKS.AIR) {
      if (currentMesh) {
        this.meshGroup.remove(currentMesh);
        this.blockMeshMap.delete(key);
      }
    } else {
      if (currentMesh) {
        this.meshGroup.remove(currentMesh);
        this.blockMeshMap.delete(key);
      }
      const mesh = VoxelModelFactory.createMeshForBlock(b);
      mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
      mesh.userData = { vx: x, vy: y, vz: z, type: b };
      this.meshGroup.add(mesh);
      this.blockMeshMap.set(key, mesh);
    }
  }

  public getSpacecraftBlocks(): { x: number; y: number; z: number; type: number }[] {
    const blocks: { x: number; y: number; z: number; type: number }[] = [];
    for (let x = 0; x < WORLD_W; x++) {
      for (let y = PAD_Y + 1; y < WORLD_H; y++) {
        for (let z = 0; z < WORLD_D; z++) {
          const b = this.getBlock(x, y, z);
          if (
            b !== BLOCKS.AIR &&
            b !== BLOCKS.GANTRY_TOWER &&
            b !== BLOCKS.LAUNCH_PAD_STEEL &&
            b !== BLOCKS.HAZARD_STRIPE &&
            b !== BLOCKS.CONCRETE_TILES &&
            b !== BLOCKS.GRASS_PLAINS &&
            b !== BLOCKS.OCEAN_WATER
          ) {
            blocks.push({ x, y, z, type: b });
          }
        }
      }
    }
    return blocks;
  }

  public clearSpacecraft() {
    const craft = this.getSpacecraftBlocks();
    craft.forEach((b) => this.setBlock(b.x, b.y, b.z, BLOCKS.AIR));
  }
}
