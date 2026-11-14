import * as THREE from "three";
import { BLOCKS, WORLD_W, WORLD_H, WORLD_D, PAD_X, PAD_Y, PAD_Z } from "./constants";
import { MATERIALS } from "./TextureGen";
import { VoxelWorld } from "./VoxelWorld";
import { RaycastHit } from "./types";

export class Player {
  public camera: THREE.PerspectiveCamera;
  public world: VoxelWorld;
  public scene: THREE.Scene;

  public pos: THREE.Vector3;
  public vel: THREE.Vector3;
  public yaw: number = 0;
  public pitch: number = 0;
  public eyeHeight: number = 1.62;
  public isFlying: boolean = true;
  public keys: Record<string, boolean> = {};

  public handGroup!: THREE.Group;
  public handMesh!: THREE.Mesh;
  public selectionBox!: THREE.LineSegments;
  public target: RaycastHit | null = null;

  constructor(
    camera: THREE.PerspectiveCamera,
    world: VoxelWorld,
    scene: THREE.Scene
  ) {
    this.camera = camera;
    this.world = world;
    this.scene = scene;

    this.pos = new THREE.Vector3(PAD_X, PAD_Y + 2, PAD_Z + 8);
    this.vel = new THREE.Vector3(0, 0, 0);

    this.createHandViewmodel();
    this.createSelectionBox();
  }

  public createHandViewmodel() {
    this.handGroup = new THREE.Group();
    this.camera.add(this.handGroup);

    const handGeo = new THREE.BoxGeometry(0.2, 0.2, 0.35);
    const initialMat =
      MATERIALS[BLOCKS.BUS_FRAME] ||
      new THREE.MeshLambertMaterial({ color: 0x64748b });
    this.handMesh = new THREE.Mesh(handGeo, initialMat);
    this.handMesh.position.set(0.35, -0.28, -0.5);
    this.handMesh.rotation.set(0.2, -0.3, 0.1);
    this.handGroup.add(this.handMesh);
  }

  public updateHandBlock(type: number) {
    if (this.handMesh && MATERIALS[type]) {
      this.handMesh.material = MATERIALS[type];
    }
  }

  public createSelectionBox() {
    const box = new THREE.BoxGeometry(1.004, 1.004, 1.004);
    const edges = new THREE.EdgesGeometry(box);
    this.selectionBox = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
    );
    this.selectionBox.visible = false;
    this.scene.add(this.selectionBox);
  }

  public update(dt: number) {
    dt = Math.min(dt, 0.05);

    const forward = new THREE.Vector3(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw)
    );
    const right = new THREE.Vector3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    );

    let mx = 0,
      mz = 0;
    if (this.keys["KeyW"]) {
      mx += forward.x;
      mz += forward.z;
    }
    if (this.keys["KeyS"]) {
      mx -= forward.x;
      mz -= forward.z;
    }
    if (this.keys["KeyD"]) {
      mx += right.x;
      mz += right.z;
    }
    if (this.keys["KeyA"]) {
      mx -= right.x;
      mz -= right.z;
    }

    const len = Math.hypot(mx, mz);
    if (len > 0.001) {
      mx /= len;
      mz /= len;
    }

    const speed = this.isFlying ? 14 : 5.5;

    if (this.isFlying) {
      this.vel.x = mx * speed;
      this.vel.z = mz * speed;
      this.vel.y = 0;
      if (this.keys["Space"]) this.vel.y = 9;
      if (this.keys["ShiftLeft"]) this.vel.y = -9;

      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
      this.pos.z += this.vel.z * dt;
    } else {
      this.vel.x = mx * speed;
      this.vel.z = mz * speed;
      this.vel.y -= 24 * dt;
      if (this.pos.y <= PAD_Y + 1) {
        this.pos.y = PAD_Y + 1;
        this.vel.y = 0;
        if (this.keys["Space"]) this.vel.y = 8;
      }
      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
      this.pos.z += this.vel.z * dt;
    }

    this.pos.x = Math.max(1, Math.min(WORLD_W - 1, this.pos.x));
    this.pos.z = Math.max(1, Math.min(WORLD_D - 1, this.pos.z));
    this.pos.y = Math.max(1, Math.min(WORLD_H - 1, this.pos.y));

    this.camera.position.set(
      this.pos.x,
      this.pos.y + this.eyeHeight,
      this.pos.z
    );
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    this.updateRaycast();
  }

  public updateRaycast() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    let hit: RaycastHit | null = null;
    const maxDist = 8.0;
    const step = 0.05;

    for (let d = 0.2; d <= maxDist; d += step) {
      const tp = this.camera.position.clone().addScaledVector(dir, d);
      const bx = Math.floor(tp.x);
      const by = Math.floor(tp.y);
      const bz = Math.floor(tp.z);

      const bType = this.world.getBlock(bx, by, bz);
      if (bType !== BLOCKS.AIR) {
        const dx = tp.x - (bx + 0.5);
        const dy = tp.y - (by + 0.5);
        const dz = tp.z - (bz + 0.5);
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        const adz = Math.abs(dz);

        const normal = new THREE.Vector3(0, 1, 0);
        if (adx >= ady && adx >= adz) normal.set(dx > 0 ? 1 : -1, 0, 0);
        else if (ady >= adx && ady >= adz) normal.set(0, dy > 0 ? 1 : -1, 0);
        else normal.set(0, 0, dz > 0 ? 1 : -1);

        hit = {
          block: { x: bx, y: by, z: bz, type: bType },
          adjacent: { x: bx + normal.x, y: by + normal.y, z: bz + normal.z },
          normal: { x: normal.x, y: normal.y, z: normal.z },
        };
        break;
      }
    }

    this.target = hit;

    if (hit) {
      this.selectionBox.visible = true;
      this.selectionBox.position.set(
        hit.block.x + 0.5,
        hit.block.y + 0.5,
        hit.block.z + 0.5
      );
    } else {
      this.selectionBox.visible = false;
    }
  }

  public destroy() {
    if (this.selectionBox && this.selectionBox.parent) {
      this.scene.remove(this.selectionBox);
    }
    if (this.handGroup && this.handGroup.parent) {
      this.camera.remove(this.handGroup);
    }
  }
}
