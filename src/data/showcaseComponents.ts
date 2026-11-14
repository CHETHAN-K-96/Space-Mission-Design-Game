import * as THREE from "three";

export interface ShowcaseComponent {
  id: string;
  name: string;
  subsystem: string;
  category: "ALL" | "PROPULSION" | "POWER" | "COMMS" | "PAYLOAD" | "BUS";
  flightHeritage: string;
  description: string;
  recipe: string;
  specs: {
    mass: string;
    power: string;
    thrust: string;
    cost: string;
  };
  buildModel: () => THREE.Group;
}

// Procedural Pixel Textures Generation
export function createPixelCanvasTexture(
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  drawFn(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

export function getShowcaseTextures() {
  if (typeof document === "undefined") {
    return {
      solarTexture: null,
      mliTexture: null,
      metalTexture: null,
      batteryTexture: null,
    };
  }

  // Solar Cell 16x16 Texture
  const solarTexture = createPixelCanvasTexture(16, 16, (ctx, w, h) => {
    ctx.fillStyle = "#0f2744"; // deep dark blue
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1e40af"; // blue cell
    ctx.fillRect(1, 1, 6, 6);
    ctx.fillRect(9, 1, 6, 6);
    ctx.fillRect(1, 9, 6, 6);
    ctx.fillRect(9, 9, 6, 6);
    ctx.fillStyle = "#38bdf8"; // bright specular line
    ctx.fillRect(1, 1, 6, 1);
    ctx.fillRect(9, 1, 6, 1);
    ctx.fillRect(1, 9, 6, 1);
    ctx.fillRect(9, 9, 6, 1);
    ctx.fillStyle = "#f59e0b"; // gold busbar contacts
    ctx.fillRect(7, 0, 2, 16);
    ctx.fillRect(0, 7, 16, 2);
  });

  // Gold Multi-Layer Insulation (MLI) Foil Texture
  const mliTexture = createPixelCanvasTexture(16, 16, (ctx, w, h) => {
    ctx.fillStyle = "#d97706";
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < 16; x += 2) {
      for (let y = 0; y < 16; y += 2) {
        ctx.fillStyle = (x + y) % 4 === 0 ? "#fbbf24" : "#b45309";
        ctx.fillRect(x, y, 2, 2);
      }
    }
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(4, 4, 3, 2);
    ctx.fillRect(10, 10, 3, 2);
  });

  // Dark Metal / Carbon-Fiber Texture
  const metalTexture = createPixelCanvasTexture(16, 16, (ctx, w, h) => {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 0, 1, 16);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(15, 0, 1, 16);
    ctx.fillRect(0, 15, 16, 1);
    // Rivets
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(2, 2, 1, 1);
    ctx.fillRect(13, 2, 1, 1);
    ctx.fillRect(2, 13, 1, 1);
    ctx.fillRect(13, 13, 1, 1);
  });

  // Battery Li-FePO4 Texture
  const batteryTexture = createPixelCanvasTexture(16, 16, (ctx, w, h) => {
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#059669";
    ctx.fillRect(2, 2, 12, 12);
    ctx.fillStyle = "#34d399";
    ctx.fillRect(3, 4, 10, 3);
    ctx.fillStyle = "#10b981";
    ctx.fillRect(3, 8, 10, 3);
    // Terminal contacts
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(4, 0, 2, 2);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(10, 0, 2, 2);
  });

  return { solarTexture, mliTexture, metalTexture, batteryTexture };
}

export function createShowcaseComponents(): ShowcaseComponent[] {
  const { solarTexture, mliTexture, metalTexture, batteryTexture } =
    getShowcaseTextures();

  return [
    {
      id: "solar_wing",
      name: "Articulated Solar Array Wing",
      subsystem: "POWER",
      category: "POWER",
      flightHeritage: "CubeSat 101 §4.3 Photovoltaic Power Systems",
      description:
        "Deployable triple-junction Gallium Arsenide (GaAs) photovoltaic cells with accordion hinge bracket and gold busbars.",
      recipe: "1x Hinge Bracket (Iron) + 2x GaAs Solar Panels + Gold Wiring",
      specs: { mass: "5 kg", power: "+50 W", thrust: "0 kN", cost: "10 XP" },
      buildModel: () => {
        const group = new THREE.Group();
        // Central hinge bracket
        const hingeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.4);
        const hingeMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x475569,
          roughness: 0.5,
        });
        const hinge = new THREE.Mesh(hingeGeo, hingeMat);
        group.add(hinge);

        // Connecting truss booms
        const boomGeo = new THREE.BoxGeometry(0.6, 0.08, 0.08);
        const boomMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.3,
        });
        const boomLeft = new THREE.Mesh(boomGeo, boomMat);
        boomLeft.position.x = -0.4;
        const boomRight = new THREE.Mesh(boomGeo, boomMat);
        boomRight.position.x = 0.4;
        group.add(boomLeft, boomRight);

        // Solar Panels (Left and Right)
        const panelGeo = new THREE.BoxGeometry(0.8, 0.04, 0.9);
        const panelMat = new THREE.MeshStandardMaterial({
          map: solarTexture ?? undefined,
          color: solarTexture ? undefined : 0x0284c7,
          roughness: 0.2,
        });

        const panelL = new THREE.Mesh(panelGeo, panelMat);
        panelL.position.x = -0.8;
        panelL.position.y = 0.02;

        const panelR = new THREE.Mesh(panelGeo, panelMat);
        panelR.position.x = 0.8;
        panelR.position.y = 0.02;

        group.add(panelL, panelR);
        return group;
      },
    },
    {
      id: "merlin_engine",
      name: "Merlin 1D Kerosene Rocket Engine",
      subsystem: "PROPULSION",
      category: "PROPULSION",
      flightHeritage: "SpaceX Falcon 9 First Stage Booster",
      description:
        "Regeneratively cooled nickel-alloy nozzle with high-pressure turbopump exhaust manifold and gimballing thrust vector actuators.",
      recipe:
        "1x Combustion Chamber + 1x Flared Nozzle Bell + 2x Gimbal Actuators",
      specs: {
        mass: "470 kg",
        power: "-20 W",
        thrust: "845 kN",
        cost: "85 XP",
      },
      buildModel: () => {
        const group = new THREE.Group();
        // Powerhead / Turbopump Dome
        const headGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.35, 12);
        const headMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x334155,
          roughness: 0.4,
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.4;
        group.add(head);

        // Throat & Combustion Chamber
        const chamberGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 12);
        const chamberMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.6,
        });
        const chamber = new THREE.Mesh(chamberGeo, chamberMat);
        chamber.position.y = 0.15;
        group.add(chamber);

        // Expansion Nozzle Bell (Flared)
        const nozzleGeo = new THREE.CylinderGeometry(
          0.2,
          0.55,
          0.65,
          16,
          1,
          true
        );
        const nozzleMat = new THREE.MeshStandardMaterial({
          color: 0xb45309,
          metalness: 0.6,
          roughness: 0.4,
          side: THREE.DoubleSide,
        });
        const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
        nozzle.position.y = -0.3;
        group.add(nozzle);

        // Turbopump exhaust pipe
        const pipeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8);
        const pipeMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          metalness: 0.8,
        });
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.position.set(0.35, 0.0, 0.1);
        pipe.rotation.z = -0.15;
        group.add(pipe);

        // Gimbal Actuators
        const actGeo = new THREE.BoxGeometry(0.08, 0.35, 0.08);
        const actMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
        const act1 = new THREE.Mesh(actGeo, actMat);
        act1.position.set(-0.35, 0.25, 0);
        act1.rotation.z = 0.2;
        group.add(act1);

        return group;
      },
    },
    {
      id: "ion_thruster",
      name: "NEXT Xenon Hall-Effect Ion Thruster",
      subsystem: "PROPULSION",
      category: "PROPULSION",
      flightHeritage: "NASA Dawn / Psyche Deep Space Mission",
      description:
        "Electrostatically accelerated xenon ions with glowing cathode neutralizer and magnetic coil confinement ring.",
      recipe:
        "1x Discharge Chamber + 1x Accelerator Grid + 1x Xenon Cathode",
      specs: { mass: "20 kg", power: "-40 W", thrust: "50 kN", cost: "25 XP" },
      buildModel: () => {
        const group = new THREE.Group();
        // Cylindrical Thruster Body
        const bodyGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.5, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x06b6d4,
          metalness: 0.8,
          roughness: 0.3,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.15;
        group.add(body);

        // Glowing Cyan Accelerator Grid
        const gridGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16);
        const gridMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.8,
          roughness: 0.2,
        });
        const grid = new THREE.Mesh(gridGeo, gridMat);
        grid.position.y = -0.15;
        group.add(grid);

        // Ion Plasma Core Beam
        const beamGeo = new THREE.ConeGeometry(0.35, 0.5, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.y = -0.45;
        beam.rotation.x = Math.PI;
        group.add(beam);

        // Hollow Cathode Neutralizer on side
        const catGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8);
        const catMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          metalness: 0.9,
        });
        const cat = new THREE.Mesh(catGeo, catMat);
        cat.position.set(0.45, 0.05, 0.2);
        group.add(cat);

        return group;
      },
    },
    {
      id: "parabolic_antenna",
      name: "Gimbaled High-Gain Parabolic Dish",
      subsystem: "COMMS",
      category: "COMMS",
      flightHeritage: "NASA Deep Space Network (DSN) X/Ka-Band",
      description:
        "Articulated parabolic mesh reflector with sub-reflector feedhorn on an azimuth/elevation dual-axis pointing gimbal.",
      recipe:
        "1x Elevation Mount + 1x Parabolic Dish Mesh + 1x Feedhorn Boom",
      specs: { mass: "10 kg", power: "-15 W", thrust: "0 kN", cost: "15 XP" },
      buildModel: () => {
        const group = new THREE.Group();
        // Gimbal Pedestal Base
        const baseGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.25, 8);
        const baseMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x64748b,
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -0.4;
        group.add(base);

        // Gimbal Yoke & Strut
        const strutGeo = new THREE.BoxGeometry(0.1, 0.35, 0.1);
        const strutMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        const strut = new THREE.Mesh(strutGeo, strutMat);
        strut.position.set(0, -0.15, 0);
        group.add(strut);

        // Parabolic Dish (Voxel octagonal curved bowl)
        const dishGeo = new THREE.CylinderGeometry(0.7, 0.2, 0.25, 8, 1, true);
        const dishMat = new THREE.MeshStandardMaterial({
          color: 0xf1f5f9,
          metalness: 0.4,
          roughness: 0.3,
          side: THREE.DoubleSide,
        });
        const dish = new THREE.Mesh(dishGeo, dishMat);
        dish.position.set(0, 0.1, 0);
        dish.rotation.x = 0.4; // tilted looking into space
        group.add(dish);

        // Central Feedhorn Boom
        const hornGeo = new THREE.ConeGeometry(0.08, 0.3, 8);
        const hornMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          metalness: 0.8,
        });
        const horn = new THREE.Mesh(hornGeo, hornMat);
        horn.position.set(0, 0.2, 0.05);
        horn.rotation.x = 0.4;
        group.add(horn);

        return group;
      },
    },
    {
      id: "spectral_imager",
      name: "Multispectral Earth Observation Camera",
      subsystem: "PAYLOAD",
      category: "PAYLOAD",
      flightHeritage: "NASA Landsat Operational Land Imager (OLI-2)",
      description:
        "Telescopic optical barrel with reflective sunshade baffle, gold thermal blanket casing, and focal plane detector array.",
      recipe:
        "1x Gold MLI Housing + 1x Telescopic Barrel + 1x Multi-Band Filter Wheel",
      specs: { mass: "15 kg", power: "-30 W", thrust: "0 kN", cost: "20 XP" },
      buildModel: () => {
        const group = new THREE.Group();
        // Gold MLI Housing Body
        const bodyGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
        const bodyMat = new THREE.MeshStandardMaterial({
          map: mliTexture ?? undefined,
          color: mliTexture ? undefined : 0xd97706,
          roughness: 0.4,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Telescopic Optical Lens Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.4, 16);
        const barrelMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.2,
        });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.position.y = 0.4;
        group.add(barrel);

        // Front Lens Glass Element (Deep Blue Specular)
        const lensGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16);
        const lensMat = new THREE.MeshStandardMaterial({
          color: 0x1d4ed8,
          emissive: 0x1e40af,
          emissiveIntensity: 0.3,
          roughness: 0.05,
          metalness: 0.9,
        });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.y = 0.59;
        group.add(lens);

        // Sunshade Aperture Baffle
        const baffleGeo = new THREE.CylinderGeometry(
          0.24,
          0.22,
          0.15,
          16,
          1,
          true
        );
        const baffleMat = new THREE.MeshStandardMaterial({
          color: 0x475569,
          side: THREE.DoubleSide,
        });
        const baffle = new THREE.Mesh(baffleGeo, baffleMat);
        baffle.position.y = 0.6;
        group.add(baffle);

        return group;
      },
    },
    {
      id: "li_battery",
      name: "Li-FePO4 Orbital Eclipse Battery Bank",
      subsystem: "STORAGE",
      category: "POWER",
      flightHeritage: "NASA Goddard SmallSat Battery Safety Standard",
      description:
        "Prismatic lithium iron phosphate cell matrix with active autonomous thermal heaters to prevent cold-soak freezing during orbital night.",
      recipe:
        "4x Lithium Prismatic Cells + 1x Thermal Heater Strip + 1x BMS Board",
      specs: { mass: "10 kg", power: "0 W (Storage)", thrust: "0 kN", cost: "5 XP" },
      buildModel: () => {
        const group = new THREE.Group();
        // Casing
        const caseGeo = new THREE.BoxGeometry(0.7, 0.6, 0.7);
        const caseMat = new THREE.MeshStandardMaterial({
          map: batteryTexture ?? undefined,
          color: batteryTexture ? undefined : 0x059669,
          roughness: 0.6,
        });
        const casing = new THREE.Mesh(caseGeo, caseMat);
        group.add(casing);

        // Positive & Negative Anode/Cathode Terminals
        const termGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8);
        const termMatPos = new THREE.MeshStandardMaterial({ color: 0xef4444 });
        const termMatNeg = new THREE.MeshStandardMaterial({ color: 0x1e293b });

        const termPos = new THREE.Mesh(termGeo, termMatPos);
        termPos.position.set(0.18, 0.35, 0.15);
        const termNeg = new THREE.Mesh(termGeo, termMatNeg);
        termNeg.position.set(-0.18, 0.35, 0.15);
        group.add(termPos, termNeg);

        // Battery Management System (BMS) Status LED
        const ledGeo = new THREE.BoxGeometry(0.06, 0.06, 0.04);
        const ledMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x10b981,
          emissiveIntensity: 1.0,
        });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, 0.1, 0.36);
        group.add(led);

        return group;
      },
    },
    {
      id: "adcs_wheels",
      name: "3-Axis Reaction Wheels (ADCS)",
      subsystem: "BUS",
      category: "BUS",
      flightHeritage: "Kepler & Hubble Precision Fine Guidance",
      description:
        "High-speed spinning titanium flywheel assemblies in orthogonal tetrahedral orientation to exchange angular momentum and point instruments without thruster fuel.",
      recipe:
        "3x Titanium Flywheels + 3x Brushless DC Motors + 1x Gyro Sensor",
      specs: { mass: "8 kg", power: "-12 W", thrust: "0 kN", cost: "12 XP" },
      buildModel: () => {
        const group = new THREE.Group();
        // Avionics Cube
        const cubeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cubeMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x334155,
        });
        const cube = new THREE.Mesh(cubeGeo, cubeMat);
        group.add(cube);

        // 3 External orthogonal Flywheels
        const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16);
        const wheelMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          metalness: 0.8,
          roughness: 0.2,
        });

        // X-wheel
        const wx = new THREE.Mesh(wheelGeo, wheelMat);
        wx.position.x = 0.28;
        wx.rotation.z = Math.PI / 2;
        // Y-wheel
        const wy = new THREE.Mesh(wheelGeo, wheelMat);
        wy.position.y = 0.28;
        // Z-wheel
        const wz = new THREE.Mesh(wheelGeo, wheelMat);
        wz.position.z = 0.28;
        wz.rotation.x = Math.PI / 2;

        group.add(wx, wy, wz);
        return group;
      },
    },
    {
      id: "sls_booster",
      name: "5-Segment Solid Rocket Booster (SRB)",
      subsystem: "PROPULSION",
      category: "PROPULSION",
      flightHeritage: "NASA Space Launch System (SLS) Artemis I",
      description:
        "Ammonium Perchlorate Composite Propellant (APCP) high-thrust solid booster segment with forward aerodynamic separation cone.",
      recipe:
        "1x Aerodynamic Nose Cone + 5x Solid Fuel Casings + 1x Vectoring Throat",
      specs: {
        mass: "730,000 kg",
        power: "0 W",
        thrust: "16,000 kN",
        cost: "150 XP",
      },
      buildModel: () => {
        const group = new THREE.Group();
        // White booster cylinder
        const cylGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.4, 16);
        const cylMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.4,
        });
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        group.add(cyl);

        // Black segments rings
        for (let y = -0.4; y <= 0.4; y += 0.25) {
          const ringGeo = new THREE.CylinderGeometry(0.285, 0.285, 0.04, 16);
          const ringMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.y = y;
          group.add(ring);
        }

        // Conical Nose Cap
        const coneGeo = new THREE.ConeGeometry(0.28, 0.4, 16);
        const coneMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.3,
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.y = 0.9;
        group.add(cone);

        // Exit Nozzle
        const nozGeo = new THREE.CylinderGeometry(0.18, 0.32, 0.25, 16, 1, true);
        const nozMat = new THREE.MeshStandardMaterial({
          color: 0x475569,
          side: THREE.DoubleSide,
        });
        const noz = new THREE.Mesh(nozGeo, nozMat);
        noz.position.y = -0.8;
        group.add(noz);

        return group;
      },
    },
  ];
}
