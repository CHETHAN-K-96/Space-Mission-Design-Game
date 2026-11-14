import * as THREE from "three";
import { BLOCKS } from "./constants";
import { MATERIALS } from "./TextureGen";

export function addZeroGapDockingPlates(
  group: THREE.Group,
  width = 0.88,
  depth = 0.88,
  frameColor = 0x64748b
) {
  const frameMat = new THREE.MeshStandardMaterial({
    color: frameColor,
    metalness: 0.7,
    roughness: 0.3,
  });

  // Top Docking Plate reaching y = +0.50 (flush mating to block above with zero gap)
  const topPlate = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.05, depth),
    frameMat
  );
  topPlate.position.y = 0.475;
  group.add(topPlate);

  // Bottom Docking Plate reaching y = -0.50 (flush mating to block below with zero gap)
  const botPlate = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.05, depth),
    frameMat
  );
  botPlate.position.y = -0.475;
  group.add(botPlate);

  // 4 Corner Structural Load-Bearing Columns bridging the full 1.0 unit height
  const colGeo = new THREE.BoxGeometry(0.08, 0.95, 0.08);
  const hx = width / 2 - 0.04;
  const hz = depth / 2 - 0.04;
  [
    [-hx, -hz],
    [-hx, hz],
    [hx, -hz],
    [hx, hz],
  ].forEach(([px, pz]) => {
    const col = new THREE.Mesh(colGeo, frameMat);
    col.position.set(px, 0, pz);
    group.add(col);
  });
}

export function addCylindricalDockingRims(
  group: THREE.Group,
  radius = 0.49,
  color = 0x334155
) {
  const rimMat = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.8,
    roughness: 0.2,
  });

  // Top Docking Rim Collar ending at y = +0.50
  const topRim = new THREE.Mesh(
    new THREE.CylinderGeometry(radius + 0.006, radius + 0.006, 0.06, 24),
    rimMat
  );
  topRim.position.y = 0.47;
  group.add(topRim);

  // Bottom Docking Rim Collar starting at y = -0.50
  const botRim = new THREE.Mesh(
    new THREE.CylinderGeometry(radius + 0.006, radius + 0.006, 0.06, 24),
    rimMat
  );
  botRim.position.y = -0.47;
  group.add(botRim);
}

export const VoxelModelFactory = {
  createMeshForBlock(type: number): THREE.Object3D {
    if (type === BLOCKS.SOLAR_ARRAY || type === BLOCKS.SOLAR_WING) {
      const group = new THREE.Group();
      addZeroGapDockingPlates(group, 0.6, 0.6, 0x475569);

      const hingeGeo = new THREE.BoxGeometry(0.25, 0.25, 0.35);
      const hingeMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.7,
      });
      group.add(new THREE.Mesh(hingeGeo, hingeMat));

      const boomGeo = new THREE.BoxGeometry(0.45, 0.06, 0.06);
      const boomMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const bL = new THREE.Mesh(boomGeo, boomMat);
      bL.position.x = -0.32;
      const bR = new THREE.Mesh(boomGeo, boomMat);
      bR.position.x = 0.32;
      group.add(bL, bR);

      const span = type === BLOCKS.SOLAR_WING ? 0.95 : 0.7;
      const panelGeo = new THREE.BoxGeometry(span, 0.04, 0.85);
      const pMat =
        MATERIALS[type] || new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      const pL = new THREE.Mesh(panelGeo, pMat);
      pL.position.x = -0.32 - span / 2;
      pL.position.y = 0.02;
      const pR = new THREE.Mesh(panelGeo, pMat);
      pR.position.x = 0.32 + span / 2;
      pR.position.y = 0.02;
      group.add(pL, pR);
      return group;
    }

    if (type === BLOCKS.ION_THRUSTER) {
      const group = new THREE.Group();
      const mountGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.08, 16);
      const mountMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.8,
      });
      const mount = new THREE.Mesh(mountGeo, mountMat);
      mount.position.y = 0.46;
      group.add(mount);

      const bodyGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.55, 16);
      const bodyMat =
        MATERIALS[type] || new THREE.MeshStandardMaterial({ color: 0x06b6d4 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.15;
      group.add(body);

      const gridGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.08, 16);
      const gridMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.8,
      });
      const grid = new THREE.Mesh(gridGeo, gridMat);
      grid.position.y = -0.16;
      group.add(grid);

      const beamGeo = new THREE.ConeGeometry(0.32, 0.45, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = -0.38;
      beam.rotation.x = Math.PI;
      group.add(beam);
      return group;
    }

    if (type === BLOCKS.SOLID_BOOSTER) {
      const group = new THREE.Group();
      const cylGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.94, 20);
      const cylMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
      group.add(new THREE.Mesh(cylGeo, cylMat));

      addCylindricalDockingRims(group, 0.44, 0x0f172a);

      const ringGeo = new THREE.CylinderGeometry(0.448, 0.448, 0.1, 20);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.2;
      group.add(ring);

      const strutGeo = new THREE.BoxGeometry(0.45, 0.08, 0.12);
      const strutMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.8,
      });
      const strutUpper = new THREE.Mesh(strutGeo, strutMat);
      strutUpper.position.set(0.38, 0.28, 0);
      const strutLower = new THREE.Mesh(strutGeo, strutMat);
      strutLower.position.set(0.38, -0.28, 0);
      const strutUpperL = new THREE.Mesh(strutGeo, strutMat);
      strutUpperL.position.set(-0.38, 0.28, 0);
      const strutLowerL = new THREE.Mesh(strutGeo, strutMat);
      strutLowerL.position.set(-0.38, -0.28, 0);
      group.add(strutUpper, strutLower, strutUpperL, strutLowerL);

      const nozGeo = new THREE.CylinderGeometry(0.24, 0.48, 0.35, 16, 1, true);
      const nozMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        metalness: 0.7,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      const noz = new THREE.Mesh(nozGeo, nozMat);
      noz.position.y = -0.45;
      group.add(noz);
      return group;
    }

    if (type === BLOCKS.MERLIN_CLUSTER) {
      const group = new THREE.Group();
      const puckGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.12, 24);
      const puckMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.3,
      });
      const puck = new THREE.Mesh(puckGeo, puckMat);
      puck.position.y = 0.44;
      group.add(puck);

      const baseGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.16, 24);
      const baseMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.25;
      group.add(base);

      const nozMat = new THREE.MeshStandardMaterial({
        color: 0x9a3412,
        metalness: 0.8,
        side: THREE.DoubleSide,
      });
      const nozGeo = new THREE.CylinderGeometry(0.14, 0.32, 0.52, 16, 1, true);
      const nozCenter = new THREE.Mesh(nozGeo, nozMat);
      nozCenter.position.y = -0.18;
      group.add(nozCenter);

      const smallNozGeo = new THREE.CylinderGeometry(
        0.09,
        0.2,
        0.42,
        12,
        1,
        true
      );
      const r = 0.32;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const m = new THREE.Mesh(smallNozGeo, nozMat);
        m.position.set(Math.cos(angle) * r, -0.16, Math.sin(angle) * r);
        group.add(m);
      }
      return group;
    }

    if (type === BLOCKS.RS25_ENGINE) {
      const group = new THREE.Group();
      const puckGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.12, 24);
      const puckMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
      });
      const puck = new THREE.Mesh(puckGeo, puckMat);
      puck.position.y = 0.44;
      group.add(puck);

      const headGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.22, 16);
      const headMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.25;
      group.add(head);

      const nozGeo = new THREE.CylinderGeometry(0.12, 0.32, 0.62, 16, 1, true);
      const nozMat = new THREE.MeshStandardMaterial({
        color: 0xb91c1c,
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide,
      });
      const offsets = [
        [0.18, 0.18],
        [-0.18, 0.18],
        [0.18, -0.18],
        [-0.18, -0.18],
      ];
      offsets.forEach(([ox, oz]) => {
        const m = new THREE.Mesh(nozGeo, nozMat);
        m.position.set(ox, -0.16, oz);
        group.add(m);
      });
      return group;
    }

    if (type === BLOCKS.VACUUM_ENGINE) {
      const group = new THREE.Group();
      
      // Covered cylindrical aerospace fuselage shroud to match outer rocket structure seamlessly
      const shroudGeo = new THREE.CylinderGeometry(0.485, 0.485, 0.96, 24, 1, false);
      const shroudMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({
          color: 0x334155,
          metalness: 0.7,
          roughness: 0.3,
        });
      const shroud = new THREE.Mesh(shroudGeo, shroudMat);
      group.add(shroud);

      addCylindricalDockingRims(group, 0.485, 0x1e293b);

      // Gold thermal service access panels
      const panelGeo = new THREE.BoxGeometry(0.04, 0.35, 0.25);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.85,
        roughness: 0.2,
      });
      const p1 = new THREE.Mesh(panelGeo, panelMat);
      p1.position.set(0.47, 0, 0);
      const p2 = new THREE.Mesh(panelGeo, panelMat);
      p2.position.set(-0.47, 0, 0);
      group.add(p1, p2);

      // Recessed interstage expansion vacuum bell nozzle (visible from bottom/vent)
      const bellGeo = new THREE.CylinderGeometry(0.12, 0.42, 0.65, 20, 1, true);
      const bellMat = new THREE.MeshStandardMaterial({
        color: 0x9a3412,
        metalness: 0.9,
        roughness: 0.25,
        side: THREE.DoubleSide,
      });
      const bell = new THREE.Mesh(bellGeo, bellMat);
      bell.position.y = -0.16;
      group.add(bell);

      return group;
    }

    if (type === BLOCKS.ROCKET_FUSELAGE || type === BLOCKS.LIQUID_FUEL_TANK) {
      const group = new THREE.Group();
      const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
      const cylMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      group.add(new THREE.Mesh(cylGeo, cylMat));

      addCylindricalDockingRims(group, 0.49, 0x0284c7);

      const pipeGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.0, 12);
      const pipeMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.7,
      });
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.x = 0.49;
      group.add(pipe);

      const bandGeo = new THREE.CylinderGeometry(0.494, 0.494, 0.3, 24);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      group.add(new THREE.Mesh(bandGeo, bandMat));
      return group;
    }

    if (type === BLOCKS.CRYOGENIC_TANK) {
      const group = new THREE.Group();
      const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
      const cylMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
      group.add(new THREE.Mesh(cylGeo, cylMat));

      addCylindricalDockingRims(group, 0.49, 0x9a3412);

      const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12);
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.x = 0.49;
      group.add(pipe);
      return group;
    }

    if (type === BLOCKS.UPPER_STAGE_TANK) {
      const group = new THREE.Group();
      const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
      const cylMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
      group.add(new THREE.Mesh(cylGeo, cylMat));

      addCylindricalDockingRims(group, 0.49, 0x334155);

      const sphereGeo = new THREE.SphereGeometry(0.1, 12, 12);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.8,
      });
      const s1 = new THREE.Mesh(sphereGeo, sphereMat);
      s1.position.set(0.47, 0.15, 0.1);
      const s2 = new THREE.Mesh(sphereGeo, sphereMat);
      s2.position.set(-0.47, 0.15, -0.1);
      group.add(s1, s2);
      return group;
    }

    if (type === BLOCKS.INTERSTAGE_RING) {
      const group = new THREE.Group();
      const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
      const cylMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
      group.add(new THREE.Mesh(cylGeo, cylMat));

      addCylindricalDockingRims(group, 0.49, 0x1e293b);

      const bandGeo = new THREE.CylinderGeometry(0.495, 0.495, 0.18, 24);
      const bandMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.9,
      });
      group.add(new THREE.Mesh(bandGeo, bandMat));

      const pushGeo = new THREE.BoxGeometry(0.06, 0.45, 0.06);
      const pushMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      const p1 = new THREE.Mesh(pushGeo, pushMat);
      p1.position.x = 0.47;
      const p2 = new THREE.Mesh(pushGeo, pushMat);
      p2.position.x = -0.47;
      const p3 = new THREE.Mesh(pushGeo, pushMat);
      p3.position.z = 0.47;
      const p4 = new THREE.Mesh(pushGeo, pushMat);
      p4.position.z = -0.47;
      group.add(p1, p2, p3, p4);
      return group;
    }

    if (type === BLOCKS.DOCKING_PORT) {
      const group = new THREE.Group();
      const baseGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.06, 24);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.8,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -0.47;
      group.add(base);

      const ringGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.16, 24);
      const ringMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = -0.28;
      group.add(ring);

      const petalGeo = new THREE.BoxGeometry(0.12, 0.14, 0.04);
      const petalMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
      });
      for (let i = 0; i < 3; i++) {
        const angle = (i * 2 * Math.PI) / 3;
        const p = new THREE.Mesh(petalGeo, petalMat);
        p.position.set(Math.cos(angle) * 0.42, -0.2, Math.sin(angle) * 0.42);
        p.rotation.y = -angle;
        p.rotation.x = 0.4;
        group.add(p);
      }

      const topTrussGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.06, 24);
      const topTruss = new THREE.Mesh(topTrussGeo, baseMat);
      topTruss.position.y = 0.47;
      group.add(topTruss);

      const colGeo = new THREE.BoxGeometry(0.06, 0.8, 0.06);
      [
        [-0.38, -0.38],
        [-0.38, 0.38],
        [0.38, -0.38],
        [0.38, 0.38],
      ].forEach(([cx, cz]) => {
        const col = new THREE.Mesh(colGeo, baseMat);
        col.position.set(cx, 0.05, cz);
        group.add(col);
      });
      return group;
    }

    if (type === BLOCKS.PAYLOAD_ADAPTER) {
      const group = new THREE.Group();
      const coneGeo = new THREE.CylinderGeometry(0.42, 0.49, 0.35, 24);
      const coneMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = -0.32;
      group.add(cone);

      const clampGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.08, 24);
      const clampMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
      });
      const clamp = new THREE.Mesh(clampGeo, clampMat);
      clamp.position.y = -0.15;
      group.add(clamp);

      const topRingGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.06, 24);
      const topRing = new THREE.Mesh(
        topRingGeo,
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
      );
      topRing.position.y = 0.47;
      group.add(topRing);

      const trussGeo = new THREE.BoxGeometry(0.08, 0.6, 0.08);
      const t1 = new THREE.Mesh(trussGeo, clampMat);
      t1.position.set(0.28, 0.16, 0);
      const t2 = new THREE.Mesh(trussGeo, clampMat);
      t2.position.set(-0.28, 0.16, 0);
      group.add(t1, t2);
      return group;
    }

    if (type === BLOCKS.ROCKET_BODY_SHROUD) {
      const group = new THREE.Group();
      const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
      const cylMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      group.add(cyl);

      addCylindricalDockingRims(group, 0.49, 0x475569);

      const seamGeo = new THREE.BoxGeometry(0.02, 0.94, 0.99);
      const seamMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      group.add(new THREE.Mesh(seamGeo, seamMat));

      const bandGeo = new THREE.CylinderGeometry(0.493, 0.493, 0.15, 24);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      bandGeo.translate(0, 0.2, 0);
      group.add(new THREE.Mesh(bandGeo, bandMat));

      return group;
    }

    if (type === BLOCKS.PAYLOAD_FAIRING) {
      const group = new THREE.Group();
      const baseGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.1, 24);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.8,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -0.45;
      group.add(base);

      const coneGeo = new THREE.ConeGeometry(0.49, 0.9, 24);
      const coneMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 0.05;
      group.add(cone);

      const seamGeo = new THREE.BoxGeometry(0.02, 0.9, 0.98);
      const seamMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      group.add(new THREE.Mesh(seamGeo, seamMat));
      return group;
    }

    if (type === BLOCKS.GRID_FIN) {
      const group = new THREE.Group();
      const hGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const hMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      group.add(new THREE.Mesh(hGeo, hMat));

      const finGeo = new THREE.BoxGeometry(0.65, 0.45, 0.06);
      const finMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.9,
        roughness: 0.2,
      });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.x = 0.4;
      group.add(fin);
      return group;
    }

    if (type === BLOCKS.HIGH_GAIN_DISH) {
      const group = new THREE.Group();
      addZeroGapDockingPlates(group, 0.7, 0.7, 0x475569);

      const baseGeo = new THREE.CylinderGeometry(0.15, 0.22, 0.2, 12);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -0.28;
      group.add(base);

      const strutGeo = new THREE.BoxGeometry(0.08, 0.35, 0.08);
      const strut = new THREE.Mesh(strutGeo, baseMat);
      strut.position.y = -0.1;
      group.add(strut);

      const dishGeo = new THREE.CylinderGeometry(
        0.65,
        0.18,
        0.25,
        12,
        1,
        true
      );
      const dishMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
        });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.position.set(0, 0.15, 0);
      dish.rotation.x = 0.4;
      group.add(dish);

      const hornGeo = new THREE.ConeGeometry(0.06, 0.25, 8);
      const hornMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.8,
      });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.position.set(0, 0.25, 0.04);
      horn.rotation.x = 0.4;
      group.add(horn);
      return group;
    }

    if (
      type === BLOCKS.MULTISPECTRAL_CAM ||
      type === BLOCKS.SPECTROMETER_IR
    ) {
      const group = new THREE.Group();
      addZeroGapDockingPlates(group, 0.82, 0.82, 0x475569);

      const bodyGeo = new THREE.BoxGeometry(0.65, 0.55, 0.65);
      const bodyMat =
        MATERIALS[type] || new THREE.MeshStandardMaterial({ color: 0xd97706 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      const barGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.35, 16);
      const barMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.2,
      });
      const barrel = new THREE.Mesh(barGeo, barMat);
      barrel.position.y = 0.32;
      group.add(barrel);

      const lensGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16);
      const lensColor =
        type === BLOCKS.SPECTROMETER_IR ? 0xd946ef : 0x1d4ed8;
      const lensMat = new THREE.MeshStandardMaterial({
        color: lensColor,
        emissive: lensColor,
        emissiveIntensity: 0.4,
        metalness: 0.9,
        roughness: 0.1,
      });
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.y = 0.48;
      group.add(lens);
      return group;
    }

    if (type === BLOCKS.REACTION_WHEEL) {
      const group = new THREE.Group();
      addZeroGapDockingPlates(group, 0.82, 0.82, 0x334155);

      const cubeGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const cubeMat =
        MATERIALS[type] || new THREE.MeshStandardMaterial({ color: 0x334155 });
      group.add(new THREE.Mesh(cubeGeo, cubeMat));

      const wGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16);
      const wMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.8,
        roughness: 0.2,
      });
      const wx = new THREE.Mesh(wGeo, wMat);
      wx.position.x = 0.32;
      wx.rotation.z = Math.PI / 2;
      const wy = new THREE.Mesh(wGeo, wMat);
      wy.position.y = 0.32;
      const wz = new THREE.Mesh(wGeo, wMat);
      wz.position.z = 0.32;
      wz.rotation.x = Math.PI / 2;
      group.add(wx, wy, wz);
      return group;
    }

    if (type === BLOCKS.BATTERY_PACK) {
      const group = new THREE.Group();
      addZeroGapDockingPlates(group, 0.84, 0.84, 0x064e3b);

      const caseGeo = new THREE.BoxGeometry(0.72, 0.72, 0.72);
      const caseMat =
        MATERIALS[type] || new THREE.MeshStandardMaterial({ color: 0x059669 });
      group.add(new THREE.Mesh(caseGeo, caseMat));

      const termGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8);
      const tP = new THREE.Mesh(
        termGeo,
        new THREE.MeshStandardMaterial({ color: 0xef4444 })
      );
      tP.position.set(0.18, 0.42, 0.15);
      const tN = new THREE.Mesh(
        termGeo,
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      tN.position.set(-0.18, 0.42, 0.15);
      group.add(tP, tN);
      return group;
    }

    if (type === BLOCKS.AVIONICS_C_DH) {
      const group = new THREE.Group();
      addZeroGapDockingPlates(group, 0.82, 0.82, 0x1e3a8a);

      const caseGeo = new THREE.BoxGeometry(0.72, 0.72, 0.72);
      const caseMat =
        MATERIALS[type] || new THREE.MeshStandardMaterial({ color: 0x1d4ed8 });
      group.add(new THREE.Mesh(caseGeo, caseMat));

      const chipGeo = new THREE.BoxGeometry(0.32, 0.08, 0.32);
      const chipMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.85,
      });
      const chip = new THREE.Mesh(chipGeo, chipMat);
      chip.position.y = 0.4;
      group.add(chip);
      return group;
    }

    if (type === BLOCKS.SAT_PAYLOAD_CONTAINER) {
      const group = new THREE.Group();

      // Outer cylindrical fairing barrel matching outer rocket fuselage envelope
      const barrelGeo = new THREE.CylinderGeometry(0.485, 0.485, 0.96, 24, 1, false);
      const barrelMat =
        MATERIALS[type] ||
        new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.25,
          metalness: 0.1,
        });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      group.add(barrel);

      addCylindricalDockingRims(group, 0.485, 0x0284c7);

      // NASA payload integration indicator stripe
      const stripeGeo = new THREE.CylinderGeometry(0.488, 0.488, 0.12, 24);
      const stripeMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.8,
        roughness: 0.3,
      });
      stripeGeo.translate(0, 0.25, 0);
      group.add(new THREE.Mesh(stripeGeo, stripeMat));

      // Gold payload placeholder core inside
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
      });
      const core = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.42, 0.42),
        coreMat
      );
      group.add(core);

      // 4 guide alignment latches
      const latchMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.8,
      });
      [
        [-0.4, 0],
        [0.4, 0],
        [0, -0.4],
        [0, 0.4],
      ].forEach(([lx, lz]) => {
        const latch = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.16, 0.08),
          latchMat
        );
        latch.position.set(lx, 0.42, lz);
        group.add(latch);
      });
      return group;
    }

    if (type === BLOCKS.BUS_FRAME) {
      const group = new THREE.Group();
      addZeroGapDockingPlates(group, 0.94, 0.94, 0x64748b);
      const innerGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.6,
      });
      group.add(new THREE.Mesh(innerGeo, innerMat));
      return group;
    }

    // Standard structural/terrain block
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    return new THREE.Mesh(
      boxGeo,
      MATERIALS[type] ||
        MATERIALS[BLOCKS.LAUNCH_PAD_STEEL] ||
        new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
  },
};
