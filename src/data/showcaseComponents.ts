import * as THREE from "three";

export interface ShowcaseComponent {
  id: string;
  name: string;
  subsystem: string;
  category: "ALL" | "PROPULSION" | "POWER" | "COMMS" | "PAYLOAD" | "BUS" | "ROCKET";
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
      whiteRocketTexture: null,
      cryoTexture: null,
      circuitTexture: null,
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
    ctx.fillStyle = "#38bdf8"; // specular line
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

  // White Aerospace Rocket Skin Texture
  const whiteRocketTexture = createPixelCanvasTexture(16, 16, (ctx, w, h) => {
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 15, 16, 1);
    ctx.fillStyle = "#0284c7"; // NASA blue accent stripe
    ctx.fillRect(0, 7, 16, 2);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(2, 2, 1, 1);
    ctx.fillRect(13, 2, 1, 1);
    ctx.fillRect(2, 13, 1, 1);
    ctx.fillRect(13, 13, 1, 1);
  });

  // Cryogenic Orange Foam Texture
  const cryoTexture = createPixelCanvasTexture(16, 16, (ctx, w, h) => {
    ctx.fillStyle = "#d97706";
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < 16; x += 2) {
      for (let y = 0; y < 16; y += 2) {
        ctx.fillStyle = (x * 3 + y * 7) % 5 === 0 ? "#b45309" : "#f59e0b";
        ctx.fillRect(x, y, 2, 2);
      }
    }
  });

  // FR-4 PCB Circuit Texture
  const circuitTexture = createPixelCanvasTexture(16, 16, (ctx, w, h) => {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(2, 2, 12, 1);
    ctx.fillRect(2, 6, 8, 1);
    ctx.fillRect(6, 10, 8, 1);
    ctx.fillRect(2, 14, 12, 1);
    ctx.fillStyle = "#f59e0b"; // Gold solder pads
    ctx.fillRect(3, 3, 2, 2);
    ctx.fillRect(11, 3, 2, 2);
    ctx.fillRect(7, 7, 2, 2);
    ctx.fillRect(3, 11, 2, 2);
    ctx.fillRect(11, 11, 2, 2);
  });

  return {
    solarTexture,
    mliTexture,
    metalTexture,
    batteryTexture,
    whiteRocketTexture,
    cryoTexture,
    circuitTexture,
  };
}

export function createShowcaseComponents(): ShowcaseComponent[] {
  const {
    solarTexture,
    mliTexture,
    metalTexture,
    batteryTexture,
    whiteRocketTexture,
    cryoTexture,
    circuitTexture,
  } = getShowcaseTextures();

  return [
    // =========================================================================
    // 1. ROCKET STAGES & LAUNCH VEHICLE PROPULSION
    // =========================================================================
    {
      id: "merlin_cluster",
      name: "Falcon 9 Merlin 1D Octaweb Engine",
      subsystem: "PROPULSION",
      category: "ROCKET",
      flightHeritage: "FAA-AST / NASA Launch Services Program (LSP) Category 3",
      description:
        "Nine turbopump-driven RP-1/LOX engines arranged in an aerodynamic octaweb cluster with thrust vector gimbaling for liftoff and re-entry burns.",
      recipe: "9x Merlin 1D Engines + 1x Octaweb Thrust Puck + Titanium Gimbal Actuators",
      specs: { mass: "280 kg", power: "-15 W", thrust: "845 kN", cost: "$20.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        // Mounting puck
        const puckGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 24);
        const puckMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x1e293b,
          metalness: 0.8,
          roughness: 0.3,
        });
        const puck = new THREE.Mesh(puckGeo, puckMat);
        puck.position.y = 0.44;
        group.add(puck);

        // Core base plate
        const baseGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.16, 24);
        const baseMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          metalness: 0.85,
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.25;
        group.add(base);

        // Center Engine Nozzle
        const nozMat = new THREE.MeshStandardMaterial({
          color: 0x9a3412,
          metalness: 0.8,
          roughness: 0.25,
          side: THREE.DoubleSide,
        });
        const centerNozGeo = new THREE.CylinderGeometry(0.14, 0.32, 0.52, 16, 1, true);
        const centerNoz = new THREE.Mesh(centerNozGeo, nozMat);
        centerNoz.position.y = -0.18;
        group.add(centerNoz);

        // 8 Octaweb Outer Nozzles
        const smallNozGeo = new THREE.CylinderGeometry(0.09, 0.2, 0.42, 12, 1, true);
        const r = 0.32;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const m = new THREE.Mesh(smallNozGeo, nozMat);
          m.position.set(Math.cos(angle) * r, -0.16, Math.sin(angle) * r);
          group.add(m);
        }
        return group;
      },
    },

    {
      id: "rs25_engine",
      name: "RS-25 Cryogenic Hydrolox Engine",
      subsystem: "PROPULSION",
      category: "ROCKET",
      flightHeritage: "NASA Space Launch System (SLS) Core Propulsion standard",
      description:
        "High-performance staged-combustion engine burning Liquid H2 and Liquid O2 with high-expansion regenerative cooling bell delivering 1100 kN liftoff thrust.",
      recipe: "1x Cryo Hydrolox Powerhead + 4x Regenerative Bell Nozzles + High-Pressure Turbopump",
      specs: { mass: "320 kg", power: "-20 W", thrust: "1100 kN", cost: "$40.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const puckGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.12, 24);
        const puckMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x0f172a,
          metalness: 0.85,
        });
        const puck = new THREE.Mesh(puckGeo, puckMat);
        puck.position.y = 0.44;
        group.add(puck);

        const headGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.22, 16);
        const headMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.8,
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.25;
        group.add(head);

        const nozGeo = new THREE.CylinderGeometry(0.12, 0.32, 0.62, 16, 1, true);
        const nozMat = new THREE.MeshStandardMaterial({
          color: 0xb91c1c,
          metalness: 0.85,
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
      },
    },

    {
      id: "solid_booster",
      name: "SLS 5-Segment Solid Rocket Booster",
      subsystem: "PROPULSION",
      category: "ROCKET",
      flightHeritage: "NASA Artemis Program Heavy-Lift Booster Standard",
      description:
        "Strap-on high-thrust solid rocket motor packed with PBAN propellant delivering 900 kN initial impulse to break through Earth's dense atmospheric gravity well.",
      recipe: "5x Solid Propellant Segments + Forward Aerodynamic Nosecap + Gimbaled Aft Nozzle",
      specs: { mass: "350 kg", power: "0 W", thrust: "900 kN", cost: "$25.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const cylGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.94, 24);
        const cylMat = new THREE.MeshStandardMaterial({
          map: whiteRocketTexture ?? undefined,
          color: whiteRocketTexture ? undefined : 0xf8fafc,
          roughness: 0.35,
        });
        group.add(new THREE.Mesh(cylGeo, cylMat));

        // Segment joint rings
        const ringGeo = new THREE.CylinderGeometry(0.448, 0.448, 0.08, 24);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
        [-0.25, 0, 0.25].forEach((yPos) => {
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.y = yPos;
          group.add(ring);
        });

        // Aft high-expansion nozzle
        const nozGeo = new THREE.CylinderGeometry(0.24, 0.48, 0.35, 20, 1, true);
        const nozMat = new THREE.MeshStandardMaterial({
          color: 0xb45309,
          metalness: 0.75,
          roughness: 0.3,
          side: THREE.DoubleSide,
        });
        const noz = new THREE.Mesh(nozGeo, nozMat);
        noz.position.y = -0.45;
        group.add(noz);
        return group;
      },
    },

    {
      id: "vacuum_engine",
      name: "Merlin 1D Vacuum Upper Engine",
      subsystem: "PROPULSION",
      category: "ROCKET",
      flightHeritage: "NASA LSP Category 3 Second Stage Injection Propulsion",
      description:
        "Radiation-cooled niobium alloy vacuum engine with high expansion ratio bell delivering vacuum specific impulse for orbital injection and trans-lunar maneuvers.",
      recipe: "1x Niobium Expansion Bell + 1x Turbopump Gas Generator + Thrust Vector Gimbal",
      specs: { mass: "180 kg", power: "-10 W", thrust: "520 kN", cost: "$12.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const puckGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.1, 24);
        const puckMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x1e293b,
          metalness: 0.85,
        });
        const puck = new THREE.Mesh(puckGeo, puckMat);
        puck.position.y = 0.45;
        group.add(puck);

        const headGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.22, 16);
        const headMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          metalness: 0.9,
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.28;
        group.add(head);

        // Huge vacuum bell
        const bellGeo = new THREE.CylinderGeometry(0.14, 0.46, 0.72, 24, 1, true);
        const bellMat = new THREE.MeshStandardMaterial({
          color: 0xea580c,
          metalness: 0.85,
          roughness: 0.25,
          side: THREE.DoubleSide,
        });
        const bell = new THREE.Mesh(bellGeo, bellMat);
        bell.position.y = -0.12;
        group.add(bell);
        return group;
      },
    },

    {
      id: "liquid_fuel_tank",
      name: "Falcon 9 RP-1/LOX Core Fuel Tank",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "NASA Fracture Control Standard (NASA-STD-5019)",
      description:
        "High-capacity lithium-aluminum rocket propellant tank featuring internal anti-vortex baffles, external LOX feedline pipe, and flush-docking mating collars.",
      recipe: "Lithium-Aluminum Alloy Skin + LOX Feedline Plumbing + Internal Slosh Baffles",
      specs: { mass: "130 kg", power: "0 W", thrust: "0 kN", cost: "$5.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
        const cylMat = new THREE.MeshStandardMaterial({
          map: whiteRocketTexture ?? undefined,
          color: whiteRocketTexture ? undefined : 0xf8fafc,
          roughness: 0.3,
        });
        group.add(new THREE.Mesh(cylGeo, cylMat));

        // External LOX transfer pipe
        const pipeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.95, 12);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.position.x = 0.49;
        group.add(pipe);

        // Center blue accent stripe
        const bandGeo = new THREE.CylinderGeometry(0.494, 0.494, 0.25, 24);
        const bandMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
        group.add(new THREE.Mesh(bandGeo, bandMat));
        return group;
      },
    },

    {
      id: "cryogenic_tank",
      name: "SLS Core Liquid H2/O2 Cryo Tank",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "NASA Marshall Cryogenic Pressure Vessel Standard",
      description:
        "Heavy-lift cryogenic liquid hydrogen and oxygen propellant tank insulated with spray-on polyurethane orange thermal foam to minimize boil-off.",
      recipe: "Spray-on Polyurethane Foam + Orthogrid Structural Shell + Cryogenic Feed Domes",
      specs: { mass: "180 kg", power: "0 W", thrust: "0 kN", cost: "$10.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
        const cylMat = new THREE.MeshStandardMaterial({
          map: cryoTexture ?? undefined,
          color: cryoTexture ? undefined : 0xd97706,
          roughness: 0.8,
        });
        group.add(new THREE.Mesh(cylGeo, cylMat));

        // Pressurization feedline
        const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.96, 12);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.position.x = 0.49;
        group.add(pipe);
        return group;
      },
    },

    {
      id: "upper_stage_tank",
      name: "Second-Stage Orbital Propellant Tank",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "AIAA S-081 Composite Overwrapped Pressure Vessels (COPV)",
      description:
        "Lightweight second-stage fuel tank fitted with external titanium-wrapped helium COPV pressurization spheres and attitude thruster mounting points.",
      recipe: "Carbon-Composite Cylindrical Hull + 2x Helium COPV Spheres + Mating Collars",
      specs: { mass: "95 kg", power: "0 W", thrust: "0 kN", cost: "$4.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
        const cylMat = new THREE.MeshStandardMaterial({
          map: whiteRocketTexture ?? undefined,
          color: whiteRocketTexture ? undefined : 0xf1f5f9,
          roughness: 0.3,
        });
        group.add(new THREE.Mesh(cylGeo, cylMat));

        // External helium pressurization spheres
        const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 });
        const s1 = new THREE.Mesh(sphereGeo, sphereMat);
        s1.position.set(0.46, 0.15, 0.1);
        const s2 = new THREE.Mesh(sphereGeo, sphereMat);
        s2.position.set(-0.46, 0.15, -0.1);
        group.add(s1, s2);
        return group;
      },
    },

    {
      id: "rocket_fuselage",
      name: "Falcon 9 Carbon-Composite Fuselage",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "NASA Standard Materials and Processes (NASA-STD-6016)",
      description:
        "Aerospace carbon-fiber composite booster hull housing propellant feed conduits, electrical cable raceways, and interstage connection points.",
      recipe: "Carbon Fiber Outer Weave + Avionics Cable Raceway Spine + Joint Couplers",
      specs: { mass: "120 kg", power: "0 W", thrust: "0 kN", cost: "$5.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
        const cylMat = new THREE.MeshStandardMaterial({
          map: whiteRocketTexture ?? undefined,
          color: whiteRocketTexture ? undefined : 0xf8fafc,
          roughness: 0.3,
        });
        group.add(new THREE.Mesh(cylGeo, cylMat));

        // Cable raceway channel down side
        const racewayGeo = new THREE.BoxGeometry(0.06, 0.94, 0.08);
        const racewayMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        const raceway = new THREE.Mesh(racewayGeo, racewayMat);
        raceway.position.x = 0.48;
        group.add(raceway);
        return group;
      },
    },

    {
      id: "interstage_ring",
      name: "Pneumatic Interstage Ring & Pushers",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "NASA Stage Separation Pyrotechnics Standard (NASA-STD-5009)",
      description:
        "Stage separation adapter ring engineered with four high-pressure pneumatic pusher cylinders and redundant pyrotechnic separation mechanisms.",
      recipe: "1x High-Tensile Separation Ring + 4x Pneumatic Pushers + Separation Hardpoints",
      specs: { mass: "85 kg", power: "0 W", thrust: "0 kN", cost: "$2.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
        const cylMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x0f172a,
          metalness: 0.85,
        });
        group.add(new THREE.Mesh(cylGeo, cylMat));

        // 4 Pneumatic separation pushers
        const pushGeo = new THREE.BoxGeometry(0.07, 0.5, 0.07);
        const pushMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7 });
        [
          [0.46, 0],
          [-0.46, 0],
          [0, 0.46],
          [0, -0.46],
        ].forEach(([px, pz]) => {
          const p = new THREE.Mesh(pushGeo, pushMat);
          p.position.set(px, 0, pz);
          group.add(p);
        });
        return group;
      },
    },

    {
      id: "payload_fairing",
      name: "Aerodynamic Fairing Half-Shell",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "NASA Payload Fairing Acoustic Environment Standard",
      description:
        "Biconic carbon-fiber acoustic payload fairing nose clamshell protecting satellite sensors through atmospheric ascent and dynamic Max-Q pressure.",
      recipe: "Carbon-Fiber Acoustic Clamshell + Separation Thruster Pistons + Splitline Latches",
      specs: { mass: "95 kg", power: "0 W", thrust: "0 kN", cost: "$2.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const baseGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.1, 24);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -0.45;
        group.add(base);

        const coneGeo = new THREE.ConeGeometry(0.49, 0.9, 24);
        const coneMat = new THREE.MeshStandardMaterial({
          map: whiteRocketTexture ?? undefined,
          color: whiteRocketTexture ? undefined : 0xf8fafc,
          roughness: 0.3,
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.y = 0.05;
        group.add(cone);

        // Fairing splitline seam
        const seamGeo = new THREE.BoxGeometry(0.02, 0.92, 0.98);
        const seamMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        group.add(new THREE.Mesh(seamGeo, seamMat));
        return group;
      },
    },

    {
      id: "rocket_body_shroud",
      name: "Aerodynamic Rocket Body Shroud",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "NASA Composite Structures Design Guide (NASA-CR-112275)",
      description:
        "Aerodynamic cylindrical rocket body shroud that completely encloses and shields the inner satellite bus and delicate sensors during ascent.",
      recipe: "Lightweight Cylindrical Composite Shroud + Umbilical Service Door + Acoustic Tiles",
      specs: { mass: "85 kg", power: "0 W", thrust: "0 kN", cost: "$2.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const cylGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.94, 24);
        const cylMat = new THREE.MeshStandardMaterial({
          map: whiteRocketTexture ?? undefined,
          color: whiteRocketTexture ? undefined : 0xf8fafc,
          roughness: 0.25,
        });
        group.add(new THREE.Mesh(cylGeo, cylMat));

        // Splitline seams and stiffening ring
        const seamGeo = new THREE.BoxGeometry(0.02, 0.94, 0.99);
        const seamMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        group.add(new THREE.Mesh(seamGeo, seamMat));

        const bandGeo = new THREE.CylinderGeometry(0.494, 0.494, 0.15, 24);
        const bandMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
        bandGeo.translate(0, 0.2, 0);
        group.add(new THREE.Mesh(bandGeo, bandMat));
        return group;
      },
    },

    {
      id: "grid_fin",
      name: "Titanium Hypersonic Grid Steering Fin",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "FAA Commercial Space Transportation Regulations §417.209",
      description:
        "High-temperature forged titanium open-grid waffle fin with high-speed hydraulic steering actuator for hypersonic control during atmospheric booster descent.",
      recipe: "Forged Titanium Lattice Fin + High-Torque Hydraulic Actuator Pivot Base",
      specs: { mass: "40 kg", power: "-8 W", thrust: "15 kN", cost: "$1.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const hGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const hMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        group.add(new THREE.Mesh(hGeo, hMat));

        // Grid waffle fin
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
      },
    },

    {
      id: "docking_port",
      name: "NASA Docking System (NDS) Ring",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "International Docking System Standard (IDSS) / NASA NDS-Rev-E",
      description:
        "Precision low-profile androgynous docking collar equipped with guide petals, soft-capture magnetic latching, and high-reliability umbilical pass-through.",
      recipe: "3x Androgynous Petals + Magnetic Soft-Capture Collar + Pass-Through Umbilicals",
      specs: { mass: "30 kg", power: "-2 W", thrust: "0 kN", cost: "$2.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const baseGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.06, 24);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -0.47;
        group.add(base);

        const ringGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.16, 24);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = -0.28;
        group.add(ring);

        // 3 Petals
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
        return group;
      },
    },

    {
      id: "payload_adapter",
      name: "Conical Payload Adapter Ring",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "EELV Standard Payload Interface (ESPA) Standard",
      description:
        "Truncated cone adapter ring mounting the satellite securely to the launcher upper stage with low-shock clamp band separation mechanism.",
      recipe: "Truncated Conical Fairing Adapter + Pyrotechnic Separation Clamp Band",
      specs: { mass: "40 kg", power: "0 W", thrust: "0 kN", cost: "$1.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const coneGeo = new THREE.CylinderGeometry(0.42, 0.49, 0.35, 24);
        const coneMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.y = -0.32;
        group.add(cone);

        const clampGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.08, 24);
        const clampMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
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
        return group;
      },
    },

    {
      id: "sat_payload_container",
      name: "Standardized Satellite Payload Bay Slot",
      subsystem: "STRUCTURE",
      category: "ROCKET",
      flightHeritage: "NASA SmallSat Standard Interface & CubeSat 101 Standard",
      description:
        "Standardized 1U/3U envelope slot for Stage 1 rocket planning. Holds the satellite payload for Stage 2 integration with androgynous alignment latches.",
      recipe: "Composite Cradle Frame + Androgynous Alignment Latches + Gold Payload Core",
      specs: { mass: "35 kg", power: "0 W", thrust: "0 kN", cost: "$1.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          metalness: 0.8,
          roughness: 0.3,
        });
        const topPlate = new THREE.Mesh(
          new THREE.BoxGeometry(0.96, 0.05, 0.96),
          frameMat
        );
        topPlate.position.y = 0.475;
        group.add(topPlate);
        const botPlate = new THREE.Mesh(
          new THREE.BoxGeometry(0.96, 0.05, 0.96),
          frameMat
        );
        botPlate.position.y = -0.475;
        group.add(botPlate);

        const cageMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.35,
          roughness: 0.2,
          metalness: 0.8,
        });
        const cage = new THREE.Mesh(
          new THREE.BoxGeometry(0.78, 0.78, 0.78),
          cageMat
        );
        group.add(cage);

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
      },
    },

    // =========================================================================
    // 2. SPACECRAFT PROPULSION & ATTITUDE THRUSTERS
    // =========================================================================
    {
      id: "ion_thruster",
      name: "NEXT Xenon Ion Plasma Thruster",
      subsystem: "PROPULSION",
      category: "PROPULSION",
      flightHeritage: "NASA Evolutionary Xenon Thruster (NEXT) Flight Standard",
      description:
        "High-Isp Hall-effect electric propulsion engine accelerating xenon plasma ions to deliver 65 kN cruise thrust with exceptional fuel efficiency.",
      recipe: "1x Ceramic Discharge Chamber + Molybdenum Ion Grids + Xenon Gas Feedline",
      specs: { mass: "22 kg", power: "-45 W", thrust: "65 kN", cost: "$8.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const mountGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.08, 16);
        const mountMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        const mount = new THREE.Mesh(mountGeo, mountMat);
        mount.position.y = 0.46;
        group.add(mount);

        const bodyGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.55, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.15;
        group.add(body);

        // Ion grid
        const gridGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.08, 16);
        const gridMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.8,
        });
        const grid = new THREE.Mesh(gridGeo, gridMat);
        grid.position.y = -0.16;
        group.add(grid);

        // Glowing plasma beam
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
      },
    },

    {
      id: "rcs_thruster",
      name: "Cold-Gas 4-Way RCS Quads",
      subsystem: "PROPULSION",
      category: "PROPULSION",
      flightHeritage: "NASA SP-8088 Liquid Rocket Metal Bellows & Thrusters",
      description:
        "High-response cold-gas nitrogen thruster quad package providing fine pulse impulses for precise 3-axis station-keeping and attitude stabilization.",
      recipe: "4x Micro-Nozzles + 1x Solenoid Valve Block + Nitrogen Plenums",
      specs: { mass: "8 kg", power: "-5 W", thrust: "25 kN", cost: "$1.8M" },
      buildModel: () => {
        const group = new THREE.Group();
        const blockGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const blockMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x475569,
          metalness: 0.8,
        });
        group.add(new THREE.Mesh(blockGeo, blockMat));

        const nozGeo = new THREE.ConeGeometry(0.08, 0.22, 8);
        const nozMat = new THREE.MeshStandardMaterial({ color: 0xfb923c, metalness: 0.8 });
        // 4 canted nozzles
        const dirs = [
          [0.2, 0, 0, 0, 0, -Math.PI / 2],
          [-0.2, 0, 0, 0, 0, Math.PI / 2],
          [0, 0, 0.2, Math.PI / 2, 0, 0],
          [0, 0, -0.2, -Math.PI / 2, 0, 0],
        ];
        dirs.forEach(([x, y, z, rx, ry, rz]) => {
          const noz = new THREE.Mesh(nozGeo, nozMat);
          noz.position.set(x, y, z);
          noz.rotation.set(rx, ry, rz);
          group.add(noz);
        });
        return group;
      },
    },

    {
      id: "hydrazine_thruster",
      name: "Monopropellant Hydrazine Thruster",
      subsystem: "PROPULSION",
      category: "PROPULSION",
      flightHeritage: "NASA Goddard SmallSat Chemical Propulsion Standard",
      description:
        "Catalytic decomposition hydrazine monopropellant engine delivering rapid velocity increments for precise orbital insertion and orbit-raising maneuvers.",
      recipe: "1x Platinum Catalyst Bed + 1x High-Temp Chamber + Thermal Heatshield",
      specs: { mass: "10 kg", power: "-5 W", thrust: "35 kN", cost: "$3.2M" },
      buildModel: () => {
        const group = new THREE.Group();
        const chamberGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16);
        const chamberMat = new THREE.MeshStandardMaterial({
          map: mliTexture ?? undefined,
          color: mliTexture ? undefined : 0xd97706,
          metalness: 0.7,
        });
        const chamber = new THREE.Mesh(chamberGeo, chamberMat);
        group.add(chamber);

        const nozGeo = new THREE.ConeGeometry(0.22, 0.35, 16);
        const nozMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, metalness: 0.85 });
        const noz = new THREE.Mesh(nozGeo, nozMat);
        noz.position.y = -0.32;
        noz.rotation.x = Math.PI;
        group.add(noz);
        return group;
      },
    },

    // =========================================================================
    // 3. ELECTRICAL POWER & THERMAL SYSTEMS (EPS)
    // =========================================================================
    {
      id: "solar_array",
      name: "Triple-Junction GaAs Solar Wing",
      subsystem: "POWER",
      category: "POWER",
      flightHeritage: "CubeSat 101 §4.3 Photovoltaic Power Systems",
      description:
        "Deployable Gallium Arsenide solar wing with articulated gold busbars. Generates reliable baseline electrical power in direct sunlight (+50W).",
      recipe: "1x Deployment Hinge + 2x GaAs Solar Panels + Gold Wiring Busbars",
      specs: { mass: "5 kg", power: "+50 W", thrust: "0 kN", cost: "$2.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const hingeGeo = new THREE.BoxGeometry(0.25, 0.25, 0.35);
        const hingeMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x334155,
          metalness: 0.7,
        });
        group.add(new THREE.Mesh(hingeGeo, hingeMat));

        const panelGeo = new THREE.BoxGeometry(0.7, 0.04, 0.85);
        const panelMat = new THREE.MeshStandardMaterial({
          map: solarTexture ?? undefined,
          color: solarTexture ? undefined : 0x0284c7,
          roughness: 0.2,
        });
        const pL = new THREE.Mesh(panelGeo, panelMat);
        pL.position.x = -0.65;
        const pR = new THREE.Mesh(panelGeo, panelMat);
        pR.position.x = 0.65;
        group.add(pL, pR);
        return group;
      },
    },

    {
      id: "solar_wing",
      name: "Heavy Accordion Solar Array",
      subsystem: "POWER",
      category: "POWER",
      flightHeritage: "NASA Commercial SmallSat MegaFlex Architecture",
      description:
        "Multi-panel deep space folding accordion solar array delivering high continuous electrical wattage (+120W) for energy-demanding radar and science payloads.",
      recipe: "4x Accordion Multi-Panels + Spring-Loaded Truss Boom + Gold Contacts",
      specs: { mass: "12 kg", power: "+120 W", thrust: "0 kN", cost: "$4.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const hingeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.4);
        const hingeMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x475569,
          roughness: 0.5,
        });
        group.add(new THREE.Mesh(hingeGeo, hingeMat));

        const panelGeo = new THREE.BoxGeometry(0.95, 0.04, 0.85);
        const panelMat = new THREE.MeshStandardMaterial({
          map: solarTexture ?? undefined,
          color: solarTexture ? undefined : 0x0369a1,
          roughness: 0.2,
        });
        const pL = new THREE.Mesh(panelGeo, panelMat);
        pL.position.x = -0.8;
        const pR = new THREE.Mesh(panelGeo, panelMat);
        pR.position.x = 0.8;
        group.add(pL, pR);
        return group;
      },
    },

    {
      id: "battery_pack",
      name: "LiFePO4 Eclipse Battery Matrix",
      subsystem: "POWER",
      category: "POWER",
      flightHeritage: "NASA Goddard SmallSat Battery Safety Standard (GSFC-STD-7000)",
      description:
        "Lithium-Iron-Phosphate cell matrix equipped with battery charge regulators and thermal runaway shielding. Sustains spacecraft bus during 35-minute orbital shadow eclipse.",
      recipe: "32x Cylindrical 18650 LiFePO4 Cells + Battery Balancer PCB + Aluminum Enclosure",
      specs: { mass: "10 kg", power: "0 W", thrust: "0 kN", cost: "$1.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const caseGeo = new THREE.BoxGeometry(0.72, 0.72, 0.72);
        const caseMat = new THREE.MeshStandardMaterial({
          map: batteryTexture ?? undefined,
          color: batteryTexture ? undefined : 0x059669,
          roughness: 0.4,
        });
        group.add(new THREE.Mesh(caseGeo, caseMat));

        // Terminal contacts
        const termGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12);
        const tP = new THREE.Mesh(termGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        tP.position.set(0.18, 0.42, 0.15);
        const tN = new THREE.Mesh(termGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        tN.position.set(-0.18, 0.42, 0.15);
        group.add(tP, tN);
        return group;
      },
    },

    {
      id: "radiator_panel",
      name: "Deployable Thermal Louver Radiator",
      subsystem: "THERMAL",
      category: "POWER",
      flightHeritage: "NASA Thermal Control Systems Best Practices (NASA-SP-8105)",
      description:
        "Deployable radiative heat rejection panels with optical solar reflectors dumping waste heat generated by avionics and radar into deep space.",
      recipe: "Dual Radiative Panels + Silver Quartz Mirrors + Ammonia Loop Heat Pipes",
      specs: { mass: "7 kg", power: "0 W", thrust: "0 kN", cost: "$1.2M" },
      buildModel: () => {
        const group = new THREE.Group();
        const panelGeo = new THREE.BoxGeometry(0.85, 0.04, 0.85);
        const panelMat = new THREE.MeshStandardMaterial({
          color: 0xcbd5e1,
          metalness: 0.9,
          roughness: 0.1,
        });
        group.add(new THREE.Mesh(panelGeo, panelMat));

        // Louver slats
        const slatGeo = new THREE.BoxGeometry(0.8, 0.02, 0.06);
        const slatMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        for (let i = -3; i <= 3; i++) {
          const slat = new THREE.Mesh(slatGeo, slatMat);
          slat.position.set(0, 0.04, i * 0.1);
          slat.rotation.x = 0.3;
          group.add(slat);
        }
        return group;
      },
    },

    // =========================================================================
    // 4. COMMUNICATIONS SUBSYSTEMS (COMMS)
    // =========================================================================
    {
      id: "high_gain_dish",
      name: "Gimbaled Parabolic Dish (DSN)",
      subsystem: "COMMS",
      category: "COMMS",
      flightHeritage: "Deep Space Network (DSN) SmallSat Standard 810-005",
      description:
        "Steerable parabolic reflector dish downlinking high-rate scientific observation data directly to NASA Deep Space Network ground antennas (-60 MBps).",
      recipe: "1x Carbon Parabolic Dish + 1x Feedhorn Subreflector + 2-Axis Az/El Gimbal",
      specs: { mass: "12 kg", power: "-18 W", thrust: "0 kN", cost: "$3.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const baseGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.2, 16);
        const baseMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x64748b,
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -0.25;
        group.add(base);

        // Steerable parabolic dish
        const dishGeo = new THREE.CylinderGeometry(0.65, 0.18, 0.25, 20, 1, true);
        const dishMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          metalness: 0.85,
          side: THREE.DoubleSide,
        });
        const dish = new THREE.Mesh(dishGeo, dishMat);
        dish.position.set(0, 0.15, 0);
        dish.rotation.x = 0.4;
        group.add(dish);

        // Feedhorn antenna
        const hornGeo = new THREE.ConeGeometry(0.06, 0.25, 12);
        const hornMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 });
        const horn = new THREE.Mesh(hornGeo, hornMat);
        horn.position.set(0, 0.25, 0.04);
        horn.rotation.x = 0.4;
        group.add(horn);
        return group;
      },
    },

    {
      id: "patch_antenna",
      name: "Omni S-Band Patch Antenna",
      subsystem: "COMMS",
      category: "COMMS",
      flightHeritage: "NASA Near Earth Network (NEN) User Guide §3.2",
      description:
        "Broad-beam omnidirectional microstrip patch antenna delivering continuous beacon health and command uplink/downlink without requiring precise pointing.",
      recipe: "Gold-Plated Dielectric Patch + Ground Plane Plate + SMA Coaxial Connector",
      specs: { mass: "3 kg", power: "-5 W", thrust: "0 kN", cost: "$0.8M" },
      buildModel: () => {
        const group = new THREE.Group();
        const baseGeo = new THREE.BoxGeometry(0.7, 0.1, 0.7);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
        group.add(new THREE.Mesh(baseGeo, baseMat));

        const patchGeo = new THREE.BoxGeometry(0.48, 0.04, 0.48);
        const patchMat = new THREE.MeshStandardMaterial({
          map: mliTexture ?? undefined,
          color: mliTexture ? undefined : 0x60a5fa,
          metalness: 0.85,
        });
        const patch = new THREE.Mesh(patchGeo, patchMat);
        patch.position.y = 0.07;
        group.add(patch);
        return group;
      },
    },

    {
      id: "uhf_antenna",
      name: "UHF Cross-Link Whip Antenna",
      subsystem: "COMMS",
      category: "COMMS",
      flightHeritage: "CubeSat Specification Rev 14.1 (Cal Poly SLO)",
      description:
        "Spring-deployed beryllium-copper whip antenna element for inter-satellite cross-links, low-rate telemetry, and ground amateur radio bands.",
      recipe: "1x Beryllium-Copper Tape Spring + Deployment Resistor Burn Wire + RF Balun",
      specs: { mass: "1.5 kg", power: "-3 W", thrust: "0 kN", cost: "$0.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const baseGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.12, 12);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        group.add(new THREE.Mesh(baseGeo, baseMat));

        const whipGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.85, 8);
        const whipMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
        const whip = new THREE.Mesh(whipGeo, whipMat);
        whip.position.set(0, 0.45, 0);
        group.add(whip);
        return group;
      },
    },

    // =========================================================================
    // 5. SCIENCE PAYLOADS & SENSORS
    // =========================================================================
    {
      id: "multispectral_cam",
      name: "Multispectral Earth/Moon Imager",
      subsystem: "PAYLOAD",
      category: "PAYLOAD",
      flightHeritage: "NASA Earth Science Technology Office (ESTO) Advanced Imager",
      description:
        "Multi-band optical telescope wrapped in protective gold MLI foil. Captures high-resolution planetary surface imagery, mineral spectra, and vegetative indices.",
      recipe: "Telescope Optical Barrel + 16-Band Spectral CCD Sensor + Gold MLI Thermal Jacket",
      specs: { mass: "16 kg", power: "-30 W", thrust: "0 kN", cost: "$12.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(0.65, 0.55, 0.65);
        const bodyMat = new THREE.MeshStandardMaterial({
          map: mliTexture ?? undefined,
          color: mliTexture ? undefined : 0xd97706,
          metalness: 0.7,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Lens Barrel
        const barGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.35, 16);
        const barMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
        const barrel = new THREE.Mesh(barGeo, barMat);
        barrel.position.y = 0.32;
        group.add(barrel);

        // Optical Lens
        const lensGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16);
        const lensMat = new THREE.MeshStandardMaterial({
          color: 0x1d4ed8,
          emissive: 0x1d4ed8,
          emissiveIntensity: 0.5,
          metalness: 0.9,
          roughness: 0.1,
        });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.y = 0.48;
        group.add(lens);
        return group;
      },
    },

    {
      id: "spectrometer_ir",
      name: "Atmospheric Infrared Spectrometer",
      subsystem: "PAYLOAD",
      category: "PAYLOAD",
      flightHeritage: "NASA AIRS / Sounder Flight Instrument Standard",
      description:
        "Cryo-cooled grating spectrometer detecting atmospheric trace gases, ozone layer profiles, and polar water ice (+80 MBps science generation).",
      recipe: "Cryogenic Cooling Stirling Cooler + Diffraction Grating Bench + IR Detectors",
      specs: { mass: "22 kg", power: "-45 W", thrust: "0 kN", cost: "$15.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(0.65, 0.55, 0.65);
        const bodyMat = new THREE.MeshStandardMaterial({
          map: mliTexture ?? undefined,
          color: mliTexture ? undefined : 0xd946ef,
          metalness: 0.75,
        });
        group.add(new THREE.Mesh(bodyGeo, bodyMat));

        const barGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.35, 16);
        const barMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
        const barrel = new THREE.Mesh(barGeo, barMat);
        barrel.position.y = 0.32;
        group.add(barrel);

        const lensGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16);
        const lensMat = new THREE.MeshStandardMaterial({
          color: 0xd946ef,
          emissive: 0xd946ef,
          emissiveIntensity: 0.5,
        });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.y = 0.48;
        group.add(lens);
        return group;
      },
    },

    {
      id: "magnetometer",
      name: "Deployable Fluxgate Magnetometer",
      subsystem: "PAYLOAD",
      category: "PAYLOAD",
      flightHeritage: "NASA Planetary Science Magnetometer Instrument Heritage",
      description:
        "Extendable carbon-composite boom sensor measuring faint planetary and interplanetary magnetic fields isolated from the spacecraft's electrical bus.",
      recipe: "Deployable Carbon-Fiber Boom Mast + Triaxial Fluxgate Sensor Heads",
      specs: { mass: "6 kg", power: "-8 W", thrust: "0 kN", cost: "$3.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const baseGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        group.add(new THREE.Mesh(baseGeo, baseMat));

        // Long boom
        const boomGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8);
        const boomMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
        const boom = new THREE.Mesh(boomGeo, boomMat);
        boom.position.y = 0.45;
        group.add(boom);

        // Sensor head
        const headGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const headMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          emissive: 0xa855f7,
          emissiveIntensity: 0.3,
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.88;
        group.add(head);
        return group;
      },
    },

    {
      id: "radar_sar",
      name: "Synthetic Aperture Radar (SAR)",
      subsystem: "PAYLOAD",
      category: "PAYLOAD",
      flightHeritage: "NASA-ISRO SAR (NISAR) Mission Architecture",
      description:
        "Active microwave phased array antenna penetrating dense cloud cover and orbital darkness for high-precision 3D topographic radar mapping (+110 MBps).",
      recipe: "Phased Array Antenna Mesh + High-Power T/R Microwave Modules + Backplane Truss",
      specs: { mass: "32 kg", power: "-65 W", thrust: "0 kN", cost: "$20.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const baseGeo = new THREE.BoxGeometry(0.5, 0.2, 0.5);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        group.add(new THREE.Mesh(baseGeo, baseMat));

        // Wide flat planar phased array
        const panelGeo = new THREE.BoxGeometry(0.95, 0.05, 0.95);
        const panelMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0xf43f5e,
          metalness: 0.85,
          roughness: 0.3,
        });
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.y = 0.15;
        group.add(panel);

        // Radar feed conduits
        const feedGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8);
        const feedMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
        const feed = new THREE.Mesh(feedGeo, feedMat);
        feed.position.y = 0.25;
        group.add(feed);
        return group;
      },
    },

    {
      id: "retroreflector",
      name: "Laser Retroreflector Array (LRA)",
      subsystem: "PAYLOAD",
      category: "PAYLOAD",
      flightHeritage: "ILRS Laser Ranging Instrument Standard",
      description:
        "Precision fused-silica corner cube prisms mounted in a hemispherical dome for ground-based satellite laser ranging (SLR) providing sub-centimeter orbital tracking.",
      recipe: "Hemispherical Aluminum Mount + 9x Fused-Silica Corner Cube Prisms",
      specs: { mass: "2 kg", power: "0 W", thrust: "0 kN", cost: "$1.2M" },
      buildModel: () => {
        const group = new THREE.Group();
        const domeGeo = new THREE.SphereGeometry(0.38, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = -0.1;
        group.add(dome);

        // Corner cubes
        const prismGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        const prismMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.5,
          metalness: 0.9,
          roughness: 0.1,
        });
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const prism = new THREE.Mesh(prismGeo, prismMat);
          prism.position.set(Math.cos(angle) * 0.25, 0.15, Math.sin(angle) * 0.25);
          group.add(prism);
        }
        return group;
      },
    },

    // =========================================================================
    // 6. AVIONICS, BUS & ATTITUDE DETERMINATION (ADCS)
    // =========================================================================
    {
      id: "bus_frame",
      name: "1U Aluminum Bus Frame",
      subsystem: "BUS",
      category: "BUS",
      flightHeritage: "Cal Poly CubeSat Design Specification (CDS)",
      description:
        "Precision CNC-machined aerospace aluminum 6061-T6 spaceframe chassis with hard-anodized corner deployment guide rails.",
      recipe: "Aerospace Aluminum 6061-T6 Extrusions + Hard-Anodized Guide Rails + Helicoil Inserts",
      specs: { mass: "4 kg", power: "0 W", thrust: "0 kN", cost: "$0.8M" },
      buildModel: () => {
        const group = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x64748b,
          metalness: 0.7,
        });

        // Corner columns
        const colGeo = new THREE.BoxGeometry(0.08, 0.95, 0.08);
        [
          [-0.4, -0.4],
          [-0.4, 0.4],
          [0.4, -0.4],
          [0.4, 0.4],
        ].forEach(([cx, cz]) => {
          const col = new THREE.Mesh(colGeo, frameMat);
          col.position.set(cx, 0, cz);
          group.add(col);
        });

        // Top and bottom plates
        const plateGeo = new THREE.BoxGeometry(0.88, 0.06, 0.88);
        const topP = new THREE.Mesh(plateGeo, frameMat);
        topP.position.y = 0.46;
        const botP = new THREE.Mesh(plateGeo, frameMat);
        botP.position.y = -0.46;
        group.add(topP, botP);
        return group;
      },
    },

    {
      id: "avionics_cdh",
      name: "C&DH Rad-Hard Flight Computer",
      subsystem: "AVIONICS",
      category: "BUS",
      flightHeritage: "NASA Goddard Core Flight System (cFS) Architecture",
      description:
        "Radiation-hardened onboard processor running NASA Core Flight System (cFS) with dual-redundant memory busses and hardware watchdog timer.",
      recipe: "Rad-Hard RISC-V Processor + MRAM Storage + MIL-STD-1553 Avionics Bus PCB",
      specs: { mass: "6 kg", power: "-10 W", thrust: "0 kN", cost: "$3.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const caseGeo = new THREE.BoxGeometry(0.72, 0.72, 0.72);
        const caseMat = new THREE.MeshStandardMaterial({
          map: circuitTexture ?? undefined,
          color: circuitTexture ? undefined : 0x1d4ed8,
          roughness: 0.35,
        });
        group.add(new THREE.Mesh(caseGeo, caseMat));

        // Processor chip
        const chipGeo = new THREE.BoxGeometry(0.32, 0.08, 0.32);
        const chipMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85 });
        const chip = new THREE.Mesh(chipGeo, chipMat);
        chip.position.y = 0.4;
        group.add(chip);
        return group;
      },
    },

    {
      id: "reaction_wheel",
      name: "3-Axis Titanium Reaction Wheels",
      subsystem: "ADCS",
      category: "BUS",
      flightHeritage: "NASA High-Precision ADCS Wheel Heritage",
      description:
        "Orthogonal cluster of three precision titanium flywheels driven by brushless DC motors to exchange angular momentum for sub-arcsecond pointing.",
      recipe: "3x Titanium Flywheel Rotors + Brushless DC Motors + Micro-Vibration Isolators",
      specs: { mass: "9 kg", power: "-12 W", thrust: "0 kN", cost: "$2.5M" },
      buildModel: () => {
        const group = new THREE.Group();
        const cubeGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const cubeMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x334155,
        });
        group.add(new THREE.Mesh(cubeGeo, cubeMat));

        // 3 orthogonal titanium wheels
        const wGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16);
        const wMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          metalness: 0.85,
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
      },
    },

    {
      id: "star_tracker",
      name: "Autonomous Optical Star Tracker",
      subsystem: "ADCS",
      category: "BUS",
      flightHeritage: "NASA JPL Autonomous Star Identification Standard",
      description:
        "High-accuracy celestial navigation camera matching star constellations to internal stellar catalogs for real-time sub-arcsecond attitude orientation.",
      recipe: "Baffled Stray-Light Hood + High-Sensitivity CMOS Star Sensor + Real-Time DSP",
      specs: { mass: "4 kg", power: "-8 W", thrust: "0 kN", cost: "$3.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        // Camera base housing
        const baseGeo = new THREE.BoxGeometry(0.48, 0.3, 0.48);
        const baseMat = new THREE.MeshStandardMaterial({
          map: metalTexture ?? undefined,
          color: metalTexture ? undefined : 0x1e293b,
          metalness: 0.8,
        });
        group.add(new THREE.Mesh(baseGeo, baseMat));

        // Conical stray-light baffle hood
        const baffleGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.45, 16, 1, true);
        const baffleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        const baffle = new THREE.Mesh(baffleGeo, baffleMat);
        baffle.position.y = 0.35;
        group.add(baffle);

        // Focal plane lens
        const lensGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 16);
        const lensMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.6,
          metalness: 0.9,
          roughness: 0.1,
        });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.y = 0.16;
        group.add(lens);
        return group;
      },
    },

    {
      id: "star_tracker_mini",
      name: "Mini-Star Tracker Attitude Sensor",
      subsystem: "ADCS",
      category: "BUS",
      flightHeritage: "ESA Micro-Star Sensor Qualification Standard",
      description:
        "Ultra-compact 0.5U celestial attitude determination sensor with integrated miniature sunshade and high-speed star pattern recognition.",
      recipe: "Compact Micro-Optics Assembly + Low-Power CMOS Detector + Miniature Baffle",
      specs: { mass: "2 kg", power: "-4 W", thrust: "0 kN", cost: "$1.8M" },
      buildModel: () => {
        const group = new THREE.Group();
        const baseGeo = new THREE.BoxGeometry(0.35, 0.25, 0.35);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        group.add(new THREE.Mesh(baseGeo, baseMat));

        const bafGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.3, 16);
        const bafMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
        const baf = new THREE.Mesh(bafGeo, bafMat);
        baf.position.y = 0.25;
        group.add(baf);
        return group;
      },
    },

    {
      id: "imu_gyro",
      name: "Fiber Optic Gyroscope IMU",
      subsystem: "AVIONICS",
      category: "BUS",
      flightHeritage: "NASA Spacecraft Inertial Measurement Standard",
      description:
        "3-axis closed-loop fiber optic gyroscope (FOG) with triaxial MEMS accelerometers delivering continuous drift-free angular rate telemetry.",
      recipe: "3x Fiber Optic Coil Windings + Superluminescent Diode + Mu-Metal Shield",
      specs: { mass: "3 kg", power: "-6 W", thrust: "0 kN", cost: "$2.2M" },
      buildModel: () => {
        const group = new THREE.Group();
        const caseGeo = new THREE.BoxGeometry(0.5, 0.35, 0.5);
        const caseMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 });
        group.add(new THREE.Mesh(caseGeo, caseMat));

        // 3 Gyro Coils
        const coilGeo = new THREE.TorusGeometry(0.14, 0.03, 8, 16);
        const coilMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
        const c1 = new THREE.Mesh(coilGeo, coilMat);
        c1.position.y = 0.2;
        c1.rotation.x = Math.PI / 2;
        group.add(c1);
        return group;
      },
    },

    {
      id: "sun_sensor",
      name: "Fine Guidance Sun Sensor Cluster",
      subsystem: "ADCS",
      category: "BUS",
      flightHeritage: "CubeSat 101 ADCS Standard §6.1",
      description:
        "Pyramidal quadrant photodiode optical sensor assembly with neutral density filter mask for micro-radian solar vector pointing.",
      recipe: "Pyramidal Sensor Mount + 4x Quadrant Photodiodes + Precision Aperture Mask",
      specs: { mass: "1.5 kg", power: "-2 W", thrust: "0 kN", cost: "$1.0M" },
      buildModel: () => {
        const group = new THREE.Group();
        const baseGeo = new THREE.ConeGeometry(0.3, 0.25, 4);
        const baseMat = new THREE.MeshStandardMaterial({
          map: mliTexture ?? undefined,
          color: mliTexture ? undefined : 0xf59e0b,
          metalness: 0.8,
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.rotation.y = Math.PI / 4;
        group.add(base);

        const tipGeo = new THREE.SphereGeometry(0.06, 12, 12);
        const tipMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xfef08a,
          emissiveIntensity: 0.5,
        });
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.y = 0.15;
        group.add(tip);
        return group;
      },
    },
  ];
}
