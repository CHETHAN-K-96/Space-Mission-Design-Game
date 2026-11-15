"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { soundEngine } from "../../engine/minecraft/SoundEngine";
import { MissionDef, MissionDebriefScore } from "../../engine/minecraft/types";
import {
  OFFICIAL_ORBITAL_DATA,
  OfficialMissionTrajectoryData,
} from "../../data/orbitalTrajectoryData";
import {
  Rocket,
  Globe,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Compass,
  Radio,
  CheckCircle2,
  ChevronRight,
  Eye,
  Layers,
  ShieldCheck,
  ArrowUpRight,
  Gauge,
  Clock,
  Sparkles,
  Orbit,
  ExternalLink,
  Database,
  FileText,
  Copy,
  Check,
  X,
  Target,
} from "lucide-react";

interface OrbitalMissionSimulatorProps {
  missionKey: string;
  mission: MissionDef;
  debriefScore: MissionDebriefScore | null;
  onReturnToLaunchPad: () => void;
  onViewDebrief: () => void;
}

interface GroundStation {
  name: string;
  lat: number;
  lon: number;
  color: number;
}

const GROUND_STATIONS: GroundStation[] = [
  { name: "SpaceLink-Alpha (KSC)", lat: 28.57, lon: -80.65, color: 0xeab308 },
  { name: "SpaceLink-Beta (Vandenberg)", lat: 34.74, lon: -120.57, color: 0x22c55e },
  { name: "SpaceLink-3 (Canberra)", lat: -35.4, lon: 148.98, color: 0xa855f7 },
  { name: "DSN Madrid", lat: 40.43, lon: -4.25, color: 0x38bdf8 },
  { name: "DSN Goldstone", lat: 35.42, lon: -116.89, color: 0xf97316 },
];

export function OrbitalMissionSimulator({
  missionKey,
  mission,
  debriefScore,
  onReturnToLaunchPad,
  onViewDebrief,
}: OrbitalMissionSimulatorProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Official trajectory and orbital parameters
  const officialData: OfficialMissionTrajectoryData =
    OFFICIAL_ORBITAL_DATA[missionKey] || OFFICIAL_ORBITAL_DATA.sandbox_mode;

  // Time Warp State
  const [timeWarp, setTimeWarp] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [cameraFocus, setCameraFocus] = useState<"EARTH" | "SATELLITE" | "TARGET" | "MARS">("EARTH");

  // Flight Phase & Target Completion State
  const [targetReached, setTargetReached] = useState<boolean>(
    officialData.flightProfileType === "EARTH_LEO_ORBIT"
  );
  const [isOperationalOrbit, setIsOperationalOrbit] = useState<boolean>(
    officialData.flightProfileType === "EARTH_LEO_ORBIT"
  );
  const [showBanner, setShowBanner] = useState<boolean>(true);

  // Official Data Drawer State
  const [showDataDrawer, setShowDataDrawer] = useState<boolean>(false);
  const [copiedTle, setCopiedTle] = useState<boolean>(false);

  // Telemetry DOM Refs for 60fps updates without React re-render freeze
  const altTextRef = useRef<HTMLSpanElement>(null);
  const velTextRef = useRef<HTMLSpanElement>(null);
  const metTextRef = useRef<HTMLSpanElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const stationTextRef = useRef<HTMLSpanElement>(null);
  const dsnLockTextRef = useRef<HTMLSpanElement>(null);
  const phaseTextRef = useRef<HTMLSpanElement>(null);

  // Mutable refs for animation loop
  const timeWarpRef = useRef<number>(1);
  const isPausedRef = useRef<boolean>(false);
  const cameraFocusRef = useRef<"EARTH" | "SATELLITE" | "TARGET" | "MARS">("EARTH");
  const targetReachedRef = useRef<boolean>(officialData.flightProfileType === "EARTH_LEO_ORBIT");
  const isOperationalOrbitRef = useRef<boolean>(
    officialData.flightProfileType === "EARTH_LEO_ORBIT"
  );
  const resetTransferRef = useRef<boolean>(false);

  useEffect(() => {
    timeWarpRef.current = timeWarp;
  }, [timeWarp]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    cameraFocusRef.current = cameraFocus;
  }, [cameraFocus]);

  const copyTleToClipboard = () => {
    if (officialData.rawTle) {
      const tleString = `${officialData.officialName}\n${officialData.rawTle.line1}\n${officialData.rawTle.line2}`;
      navigator.clipboard.writeText(tleString);
      setCopiedTle(true);
      try {
        soundEngine.playUiClick();
      } catch {}
      setTimeout(() => setCopiedTle(false), 2000);
    }
  };

  const handleReplayTransfer = () => {
    resetTransferRef.current = true;
    setIsOperationalOrbit(false);
    isOperationalOrbitRef.current = false;
    setTargetReached(false);
    targetReachedRef.current = false;
    setShowBanner(true);
    try {
      soundEngine.playUiClick();
    } catch {}
  };

  // Convert lat/lon to 3D Cartesian coordinates on sphere of radius R
  const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Helper to generate procedural vibrant Earth texture
  const createEarthTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Rich deep ocean blue
    ctx.fillStyle = "#0c2b54";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ocean gradients
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#081d38");
    grad.addColorStop(0.5, "#14447a");
    grad.addColorStop(1, "#081d38");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Continents
    ctx.fillStyle = "#1e5e34";

    // North & South America
    ctx.beginPath();
    ctx.ellipse(250, 160, 80, 110, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(320, 340, 55, 95, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Europe, Africa & Middle East
    ctx.beginPath();
    ctx.ellipse(540, 150, 70, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(540, 280, 65, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // Asia, India & Australia
    ctx.beginPath();
    ctx.ellipse(750, 180, 110, 85, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(820, 360, 50, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Land highlights
    ctx.fillStyle = "#2d7a46";
    ctx.beginPath();
    ctx.ellipse(730, 200, 70, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ice caps
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, 0, canvas.width, 24);
    ctx.fillRect(0, canvas.height - 24, canvas.width, 24);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  };

  // Helper to generate procedural Moon texture
  const createMoonTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#8c92ac";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dark lunar maria
    ctx.fillStyle = "#63697e";
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        15 + Math.random() * 45,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Impact craters
    ctx.fillStyle = "#b4b9cb";
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        4 + Math.random() * 12,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  };

  // Helper to generate procedural Mars texture (Red Planet with polar caps and volcanic plains)
  const createMarsTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Base Martian Rust Orange/Red
    ctx.fillStyle = "#b45309";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Martian dust gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#78350f");
    grad.addColorStop(0.5, "#c2410c");
    grad.addColorStop(1, "#78350f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dark basaltic plains (Syrtis Major & Valles Marineris)
    ctx.fillStyle = "#451a03";
    ctx.beginPath();
    ctx.ellipse(180, 140, 75, 45, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(360, 130, 90, 50, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Valles Marineris canyon rift
    ctx.strokeStyle = "#290c00";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(140, 145);
    ctx.lineTo(260, 150);
    ctx.stroke();

    // Brilliant white Polar Ice Caps (Water ice & Dry ice)
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 8, 48, 0, Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 8, 40, Math.PI, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  };

  // Helper to generate metallic Asteroid (16) Psyche texture
  const createPsycheTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Metallic iron-nickel stone tone
    ctx.fillStyle = "#71717a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Metallic silicate patches
    ctx.fillStyle = "#52525b";
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        10 + Math.random() * 30,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // High-reflectance metallic ridges
    ctx.fillStyle = "#a1a1aa";
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        3 + Math.random() * 8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Viewport dimensions
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 720;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010206); // Deep space dark void

    const camera = new THREE.PerspectiveCamera(45, Math.max(0.1, w / h), 0.1, 5000);
    camera.position.set(0, 26, 62);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Sun & Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(90, 50, 70);
    scene.add(sunLight);

    const backFillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    backFillLight.position.set(-90, -30, -70);
    scene.add(backFillLight);

    // =========================================================================
    // 1. IMMERSIVE DEEP SPACE STARFIELD (NO ARTIFICIAL GRID)
    // =========================================================================
    // Layer A: 4,000 Distant Tiny Background Stars
    const bgStarGeo = new THREE.BufferGeometry();
    const bgStarCount = 4000;
    const bgStarPos = new Float32Array(bgStarCount * 3);
    for (let i = 0; i < bgStarCount * 3; i += 3) {
      bgStarPos[i] = (Math.random() - 0.5) * 2200;
      bgStarPos[i + 1] = (Math.random() - 0.5) * 2200;
      bgStarPos[i + 2] = (Math.random() - 0.5) * 2200;
    }
    bgStarGeo.setAttribute("position", new THREE.BufferAttribute(bgStarPos, 3));
    const bgStarMat = new THREE.PointsMaterial({
      color: 0xdbeafe,
      size: 1.2,
      sizeAttenuation: false,
    });
    const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
    scene.add(bgStars);

    // Layer B: 1,500 Prominent Stars with Real Astronomical Spectral Colors
    const brightStarGeo = new THREE.BufferGeometry();
    const brightStarCount = 1500;
    const brightStarPos = new Float32Array(brightStarCount * 3);
    const brightStarColors = new Float32Array(brightStarCount * 3);

    // Spectral class colors: O/B Blue, A/F White, G Yellow, M Red
    const spectralPalettes = [
      new THREE.Color(0x93c5fd), // O/B Hot Blue
      new THREE.Color(0xffffff), // A Pure White
      new THREE.Color(0xfef08a), // G Solar Warm Yellow
      new THREE.Color(0xfba5a5), // M Red Giant
    ];

    for (let i = 0; i < brightStarCount; i++) {
      const idx = i * 3;
      brightStarPos[idx] = (Math.random() - 0.5) * 1800;
      brightStarPos[idx + 1] = (Math.random() - 0.5) * 1800;
      brightStarPos[idx + 2] = (Math.random() - 0.5) * 1800;

      const c = spectralPalettes[Math.floor(Math.random() * spectralPalettes.length)];
      brightStarColors[idx] = c.r;
      brightStarColors[idx + 1] = c.g;
      brightStarColors[idx + 2] = c.b;
    }
    brightStarGeo.setAttribute("position", new THREE.BufferAttribute(brightStarPos, 3));
    brightStarGeo.setAttribute("color", new THREE.BufferAttribute(brightStarColors, 3));
    const brightStarMat = new THREE.PointsMaterial({
      vertexColors: true,
      size: 2.2,
      sizeAttenuation: false,
    });
    const brightStars = new THREE.Points(brightStarGeo, brightStarMat);
    scene.add(brightStars);

    // Layer C: Cosmic Dust / Galactic Nebula Plane Haze
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 800;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      const rad = 200 + Math.random() * 800;
      const angle = Math.random() * Math.PI * 2;
      dustPos[i] = rad * Math.cos(angle);
      dustPos[i + 1] = (Math.random() - 0.5) * 120;
      dustPos[i + 2] = rad * Math.sin(angle);
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 3.5,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // =========================================================================
    // 2. CELESTIAL BODIES: EARTH, MOON, MARS & ASTEROID (16) PSYCHE
    // =========================================================================
    // A. EARTH SPHERE
    const earthRadius = 7.5;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthTex = createEarthTexture();
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.5,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // Earth Atmosphere Halo Aura (Radius 7.9)
    const auraGeo = new THREE.SphereGeometry(earthRadius * 1.05, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    earthMesh.add(auraMesh);

    // Dynamic Celestial Target Meshes
    let moonMesh: THREE.Mesh | null = null;
    let marsMesh: THREE.Mesh | null = null;
    let targetMesh: THREE.Mesh | null = null;

    let targetPos = new THREE.Vector3(38, 8, -26);
    let marsPos = new THREE.Vector3(34, 4, 16);

    // Target operational orbit points (DRO, L2 Halo, Asteroid orbit)
    const targetOrbitPoints: THREE.Vector3[] = [];

    if (missionKey === "artemis_lunar") {
      // 3D MOON
      const moonRadius = 2.4;
      const moonGeo = new THREE.SphereGeometry(moonRadius, 32, 32);
      const moonTex = createMoonTexture();
      const moonMat = new THREE.MeshStandardMaterial({
        map: moonTex,
        roughness: 0.8,
      });
      moonMesh = new THREE.Mesh(moonGeo, moonMat);
      targetPos.set(36, 8, -26);
      moonMesh.position.copy(targetPos);
      scene.add(moonMesh);

      // Moon Lunar Orbit Track around Earth
      const moonDist = targetPos.length();
      const moonOrbitCurve = new THREE.EllipseCurve(
        0,
        0,
        moonDist,
        moonDist,
        0,
        2 * Math.PI,
        false,
        0
      );
      const mPts = moonOrbitCurve.getPoints(120).map((p) => new THREE.Vector3(p.x, 0, p.y));
      const mGeo = new THREE.BufferGeometry().setFromPoints(mPts);
      const mMat = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.5,
      });
      const mLine = new THREE.Line(mGeo, mMat);
      scene.add(mLine);

      // DISTANT RETROGRADE ORBIT (DRO) RING AROUND THE MOON
      const droRadius = 4.8;
      const numDro = 80;
      for (let i = 0; i <= numDro; i++) {
        const theta = (i / numDro) * Math.PI * 2;
        // Retrograde inclination relative to Moon
        targetOrbitPoints.push(
          new THREE.Vector3(
            targetPos.x + droRadius * Math.cos(theta),
            targetPos.y + droRadius * Math.sin(theta) * 0.35,
            targetPos.z - droRadius * Math.sin(theta)
          )
        );
      }
      const droGeo = new THREE.BufferGeometry().setFromPoints(targetOrbitPoints);
      const droMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8, // Sky Blue Lunar DRO
        linewidth: 2,
      });
      const droLine = new THREE.Line(droGeo, droMat);
      scene.add(droLine);
    } else if (missionKey === "space_telescope") {
      // Sun-Earth L2 Lagrange Halo Marker
      targetPos.set(46, 12, -30);
      const l2Geo = new THREE.OctahedronGeometry(1.6, 0);
      const l2Mat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        wireframe: true,
      });
      targetMesh = new THREE.Mesh(l2Geo, l2Mat);
      targetMesh.position.copy(targetPos);
      scene.add(targetMesh);

      // L2 3D HALO ORBIT RING (Lissajous Saddle Loop around L2)
      const haloRx = 4.2;
      const haloRy = 3.2;
      const numHalo = 80;
      for (let i = 0; i <= numHalo; i++) {
        const theta = (i / numHalo) * Math.PI * 2;
        targetOrbitPoints.push(
          new THREE.Vector3(
            targetPos.x + haloRx * Math.cos(theta),
            targetPos.y + haloRy * Math.sin(theta),
            targetPos.z + haloRx * Math.sin(theta) * 0.45
          )
        );
      }
      const haloGeo = new THREE.BufferGeometry().setFromPoints(targetOrbitPoints);
      const haloMat = new THREE.LineBasicMaterial({
        color: 0xfacc15, // Golden Halo Orbit
        linewidth: 2,
      });
      const haloLine = new THREE.Line(haloGeo, haloMat);
      scene.add(haloLine);
    } else if (missionKey === "asteroid_scout") {
      // =======================================================================
      // 3. 3D MARS MODEL FOR GRAVITY ASSIST SLINGSHOT
      // =======================================================================
      const marsRadius = 4.2;
      const marsGeo = new THREE.SphereGeometry(marsRadius, 48, 48);
      const marsTex = createMarsTexture();
      const marsMat = new THREE.MeshStandardMaterial({
        map: marsTex,
        roughness: 0.6,
        metalness: 0.1,
      });
      marsMesh = new THREE.Mesh(marsGeo, marsMat);
      marsPos.set(34, 4, 16);
      marsMesh.position.copy(marsPos);
      scene.add(marsMesh);

      // Mars Atmosphere Halo (Thin orange/salmon haze)
      const marsAuraGeo = new THREE.SphereGeometry(marsRadius * 1.05, 32, 32);
      const marsAuraMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.22,
        wireframe: true,
      });
      const marsAura = new THREE.Mesh(marsAuraGeo, marsAuraMat);
      marsMesh.add(marsAura);

      // Mars Orbit Line around Solar Reference
      const marsDist = marsPos.length();
      const marsOrbitCurve = new THREE.EllipseCurve(
        0,
        0,
        marsDist,
        marsDist,
        0,
        2 * Math.PI,
        false,
        0
      );
      const marsOrbitPts = marsOrbitCurve.getPoints(120).map((p) => new THREE.Vector3(p.x, 0, p.y));
      const marsOrbitGeo = new THREE.BufferGeometry().setFromPoints(marsOrbitPts);
      const marsOrbitMat = new THREE.LineBasicMaterial({
        color: 0xb45309,
        transparent: true,
        opacity: 0.4,
      });
      const marsOrbitLine = new THREE.Line(marsOrbitGeo, marsOrbitMat);
      scene.add(marsOrbitLine);

      // =======================================================================
      // 3D ASTEROID BELT (BETWEEN MARS & OUTER BOUNDARY)
      // =======================================================================
      targetPos.set(72, 6, -34); // Position of target asteroid (16) Psyche

      // Swarm of 3,000 Rocky Asteroid Particles
      const astBeltCount = 3000;
      const astBeltGeo = new THREE.BufferGeometry();
      const astBeltPos = new Float32Array(astBeltCount * 3);
      const astBeltColors = new Float32Array(astBeltCount * 3);

      const rockPalette = [
        new THREE.Color(0x78716c), // Stone Grey
        new THREE.Color(0xa8a29e), // Nickel-Iron Reflective Grey
        new THREE.Color(0x57534e), // Carbonaceous Dark Brown
        new THREE.Color(0x44403c), // Dark Basalt
      ];

      let validBeltCount = 0;
      for (let i = 0; i < astBeltCount; i++) {
        // Toroidal ring radius from 58 to 92
        const rBelt = 58 + Math.random() * 34;
        const thetaBelt = Math.random() * Math.PI * 2;
        const xB = rBelt * Math.cos(thetaBelt);
        const yB = (Math.random() - 0.5) * 8.0;
        const zB = rBelt * Math.sin(thetaBelt);

        // Clearance / Exclusion Zone around Psyche & Trajectory path
        const distToPsyche = Math.hypot(xB - targetPos.x, yB - targetPos.y, zB - targetPos.z);
        if (distToPsyche < 10.0) {
          continue; // Keep Psyche orbital approach 100% collision-free
        }

        const idx = validBeltCount * 3;
        astBeltPos[idx] = xB;
        astBeltPos[idx + 1] = yB;
        astBeltPos[idx + 2] = zB;

        const c = rockPalette[Math.floor(Math.random() * rockPalette.length)];
        astBeltColors[idx] = c.r;
        astBeltColors[idx + 1] = c.g;
        astBeltColors[idx + 2] = c.b;
        validBeltCount++;
      }

      astBeltGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(astBeltPos.subarray(0, validBeltCount * 3), 3)
      );
      astBeltGeo.setAttribute(
        "color",
        new THREE.BufferAttribute(astBeltColors.subarray(0, validBeltCount * 3), 3)
      );

      const astBeltMat = new THREE.PointsMaterial({
        vertexColors: true,
        size: 1.8,
        sizeAttenuation: true,
      });
      const astBeltPoints = new THREE.Points(astBeltGeo, astBeltMat);
      scene.add(astBeltPoints);

      // Discrete 3D Irregular Rocky Asteroid Meshes Scattered in the Belt
      for (let i = 0; i < 45; i++) {
        const rRock = 60 + Math.random() * 30;
        const thRock = Math.random() * Math.PI * 2;
        const xr = rRock * Math.cos(thRock);
        const yr = (Math.random() - 0.5) * 6.0;
        const zr = rRock * Math.sin(thRock);

        if (Math.hypot(xr - targetPos.x, yr - targetPos.y, zr - targetPos.z) < 12.0) {
          continue;
        }

        const rockRadius = 0.6 + Math.random() * 0.9;
        const rGeo = new THREE.DodecahedronGeometry(rockRadius, 0);
        const rMat = new THREE.MeshStandardMaterial({
          color: 0x78716c,
          roughness: 0.8,
          metalness: 0.3,
        });
        const rockMesh = new THREE.Mesh(rGeo, rMat);
        rockMesh.position.set(xr, yr, zr);
        rockMesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        scene.add(rockMesh);
      }

      // =======================================================================
      // TARGET ASTEROID (16) PSYCHE (PROMINENT METALLIC ASTEROID)
      // =======================================================================
      const psycheRadius = 2.4;
      const psycheGeo = new THREE.DodecahedronGeometry(psycheRadius, 1);
      const psycheTex = createPsycheTexture();
      const psycheMat = new THREE.MeshStandardMaterial({
        map: psycheTex,
        metalness: 0.85,
        roughness: 0.3,
      });
      targetMesh = new THREE.Mesh(psycheGeo, psycheMat);
      targetMesh.position.copy(targetPos);
      scene.add(targetMesh);

      // Science Orbit Ring around Asteroid Psyche (Clear radius 4.4, zero collisions)
      const astRadius = 4.4;
      const numAst = 80;
      for (let i = 0; i <= numAst; i++) {
        const theta = (i / numAst) * Math.PI * 2;
        targetOrbitPoints.push(
          new THREE.Vector3(
            targetPos.x + astRadius * Math.cos(theta),
            targetPos.y + astRadius * Math.sin(theta) * 0.5,
            targetPos.z + astRadius * Math.sin(theta)
          )
        );
      }
      const astOrbitGeo = new THREE.BufferGeometry().setFromPoints(targetOrbitPoints);
      const astOrbitMat = new THREE.LineBasicMaterial({
        color: 0xec4899,
        linewidth: 2,
      });
      const astOrbitLine = new THREE.Line(astOrbitGeo, astOrbitMat);
      scene.add(astOrbitLine);
    }

    // 4. GROUND STATIONS ON EARTH
    const stationMeshes: { name: string; mesh: THREE.Mesh; pos: THREE.Vector3 }[] = [];
    GROUND_STATIONS.forEach((gs) => {
      const gsPos = latLonToVector3(gs.lat, gs.lon, earthRadius + 0.15);
      const dotGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: gs.color });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.copy(gsPos);
      earthMesh.add(dotMesh);
      stationMeshes.push({ name: gs.name, mesh: dotMesh, pos: gsPos });
    });

    // =========================================================================
    // 5. AUTHENTIC MULTI-REVOLUTION TRAJECTORIES (NASA MOMENTUM BUILDING)
    // =========================================================================
    const parkingRadius = earthRadius + 2.8;

    // Green/Cyan: Earth LEO Parking Orbit Reference Ring
    const parkingCurve = new THREE.EllipseCurve(
      0,
      0,
      parkingRadius,
      parkingRadius,
      0,
      2 * Math.PI,
      false,
      0
    );
    const parkingPts = parkingCurve.getPoints(120).map((p) => new THREE.Vector3(p.x, 0, p.y));
    const parkingGeo = new THREE.BufferGeometry().setFromPoints(parkingPts);
    const parkingMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4, // Cyan LEO
      linewidth: 2,
      transparent: true,
      opacity: 0.7,
    });
    const parkingLine = new THREE.Line(parkingGeo, parkingMat);
    parkingLine.rotation.x = Math.PI * 0.15;
    scene.add(parkingLine);

    // Array of 3D Transfer Trajectory Points
    const transferPoints: THREE.Vector3[] = [];
    const continuousOrbitPoints: THREE.Vector3[] = [];

    if (missionKey === "earth_sentinel") {
      // AUTHENTIC CELESTRAK NORAD 46984: 66.04° High-Inclination Polar LEO Orbit
      const incRad = 66.0399 * (Math.PI / 180);
      const r = earthRadius + 3.2; // 1,336 km altitude scaled
      const numPts = 180;
      for (let i = 0; i <= numPts; i++) {
        const theta = (i / numPts) * Math.PI * 2;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta) * Math.sin(incRad);
        const z = r * Math.sin(theta) * Math.cos(incRad);
        continuousOrbitPoints.push(new THREE.Vector3(x, y, z));
      }
    } else if (missionKey === "artemis_lunar") {
      // =======================================================================
      // ARTEMIS: 2+ EARTH PHASING ORBITS (MOMENTUM BUILD) -> TLI -> MOON DRO
      // =======================================================================
      // Revolution 1: Initial LEO parking orbit (~250 km, radius ~10.4)
      const numRev1 = 60;
      for (let i = 0; i < numRev1; i++) {
        const th = (i / numRev1) * Math.PI * 2;
        const r = parkingRadius;
        transferPoints.push(
          new THREE.Vector3(
            r * Math.cos(th),
            r * Math.sin(th) * Math.sin(0.3),
            r * Math.sin(th) * Math.cos(0.3)
          )
        );
      }

      // Revolution 2: Apogee-raising phasing orbit (momentum accumulation, r: 10.4 -> 14.8)
      const numRev2 = 80;
      for (let i = 0; i < numRev2; i++) {
        const th = (i / numRev2) * Math.PI * 2;
        // Elliptical expansion to build momentum towards Moon intercept
        const a = parkingRadius + 2.4;
        const b = parkingRadius + 1.2;
        transferPoints.push(
          new THREE.Vector3(
            a * Math.cos(th),
            b * Math.sin(th) * Math.sin(0.4) + 1.2 * Math.sin(th),
            b * Math.sin(th) * Math.cos(0.4)
          )
        );
      }

      // TLI Escape Kick & Outbound Cislunar Arc to Moon
      const pEscape = new THREE.Vector3(-parkingRadius, 1.2, 0);
      const pMid1 = new THREE.Vector3(-parkingRadius * 0.2, 12, 16);
      const pMid2 = new THREE.Vector3(targetPos.x * 0.5, targetPos.y + 6, targetPos.z * 0.5);
      const pMoonApproach = targetPos.clone().add(new THREE.Vector3(-4.8, 0, 0));
      const tliBezier = new THREE.CubicBezierCurve3(pEscape, pMid1, pMid2, pMoonApproach);
      const outboundPts = tliBezier.getPoints(90);
      outboundPts.forEach((pt) => transferPoints.push(new THREE.Vector3(pt.x, pt.y, pt.z)));
    } else if (missionKey === "space_telescope") {
      // JWST: 2 Earth parking loops + high-energy escape injection to L2
      const numPhasing = 60;
      for (let i = 0; i < numPhasing; i++) {
        const th = (i / numPhasing) * Math.PI * 2;
        transferPoints.push(
          new THREE.Vector3(
            parkingRadius * Math.cos(th),
            parkingRadius * Math.sin(th) * 0.2,
            parkingRadius * Math.sin(th)
          )
        );
      }
      const p0 = new THREE.Vector3(0, parkingRadius, 1.0);
      const p1 = new THREE.Vector3(14, 12, -8);
      const p2 = new THREE.Vector3(28, 14, -18);
      const p3 = targetPos.clone().add(new THREE.Vector3(-4.2, 0, 0));
      const bezier = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
      const outbound = bezier.getPoints(120);
      outbound.forEach((pt) => transferPoints.push(new THREE.Vector3(pt.x, pt.y, pt.z)));
    } else if (missionKey === "asteroid_scout") {
      // =======================================================================
      // PSYCHE: EARTH PHASING -> MARS GRAVITY ASSIST BOOST -> ASTEROID (16) PSYCHE
      // =======================================================================
      // 1. Earth Phasing Orbits (Momentum Accumulation out of Earth's gravity well)
      const numEarthPhasing = 70;
      for (let i = 0; i < numEarthPhasing; i++) {
        const th = (i / numEarthPhasing) * Math.PI * 2;
        const a = parkingRadius + (i / numEarthPhasing) * 2.2;
        transferPoints.push(
          new THREE.Vector3(a * Math.cos(th), a * Math.sin(th) * 0.25, a * Math.sin(th))
        );
      }

      // 2. Outbound Hyperbolic Arc from Earth to Mars
      const pEarthEject = new THREE.Vector3(parkingRadius + 2.2, 0, 0);
      const pEarthToMars1 = new THREE.Vector3(16, 4, 8);
      const pEarthToMars2 = new THREE.Vector3(26, 5, 14);
      const pMarsFlybyIn = marsPos.clone().add(new THREE.Vector3(-6.2, 0, -2.0)); // Approaching Mars
      const toMarsBezier = new THREE.CubicBezierCurve3(
        pEarthEject,
        pEarthToMars1,
        pEarthToMars2,
        pMarsFlybyIn
      );
      const toMarsPts = toMarsBezier.getPoints(60);
      toMarsPts.forEach((pt) => transferPoints.push(new THREE.Vector3(pt.x, pt.y, pt.z)));

      // 3. Mars Gravity Assist Slingshot Swing-by (Hyperbolic deflection close to Mars)
      // Slingshot curves tightly around Mars (clear of surface by 2.0 units)
      const numMarsSlingshot = 24;
      for (let i = 0; i <= numMarsSlingshot; i++) {
        const angle = -Math.PI * 0.6 + (i / numMarsSlingshot) * Math.PI * 1.1;
        const rFlyby = 6.2;
        transferPoints.push(
          new THREE.Vector3(
            marsPos.x + rFlyby * Math.cos(angle),
            marsPos.y + (i / numMarsSlingshot) * 1.8,
            marsPos.z + rFlyby * Math.sin(angle)
          )
        );
      }

      // 4. Boosted Slingshot Trajectory outward into the Asteroid Belt to (16) Psyche
      const pMarsFlybyOut = transferPoints[transferPoints.length - 1];
      const pMidBelt1 = new THREE.Vector3(48, 6, 4);
      const pMidBelt2 = new THREE.Vector3(60, 6, -18);
      const pPsycheApproach = targetPos.clone().add(new THREE.Vector3(-4.4, 0, 0));
      const toPsycheBezier = new THREE.CubicBezierCurve3(
        pMarsFlybyOut,
        pMidBelt1,
        pMidBelt2,
        pPsycheApproach
      );
      const toPsychePts = toPsycheBezier.getPoints(70);
      toPsychePts.forEach((pt) => transferPoints.push(new THREE.Vector3(pt.x, pt.y, pt.z)));
    } else {
      // SANDBOX / ISS REFERENCE: 51.64° LEO Orbit
      const incRad = 51.64 * (Math.PI / 180);
      const r = earthRadius + 2.4; // 420 km altitude scaled
      const numPts = 180;
      for (let i = 0; i <= numPts; i++) {
        const theta = (i / numPts) * Math.PI * 2;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta) * Math.sin(incRad);
        const z = r * Math.sin(theta) * Math.cos(incRad);
        continuousOrbitPoints.push(new THREE.Vector3(x, y, z));
      }
    }

    // Render Trajectory Line
    const isLeoContinuous = officialData.flightProfileType === "EARTH_LEO_ORBIT";
    const primaryPoints = isLeoContinuous ? continuousOrbitPoints : transferPoints;

    const trajGeo = new THREE.BufferGeometry().setFromPoints(primaryPoints);
    const trajMat = new THREE.LineBasicMaterial({
      color: isLeoContinuous ? 0x22c55e : 0xd946ef, // Green for LEO, Electric Magenta for Deep Space
      linewidth: 3,
    });
    const trajLine = new THREE.Line(trajGeo, trajMat);
    scene.add(trajLine);

    // Periapsis (Pe) & Apoapsis (Ap) Marker Dots
    if (primaryPoints.length > 10) {
      const pePt = primaryPoints[0];
      const apPt = primaryPoints[Math.floor(primaryPoints.length / 2)];

      const peGeo = new THREE.SphereGeometry(0.5, 12, 12);
      const peMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Green Periapsis
      const peMesh = new THREE.Mesh(peGeo, peMat);
      peMesh.position.copy(pePt);
      scene.add(peMesh);

      const apGeo = new THREE.SphereGeometry(0.5, 12, 12);
      const apMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b }); // Yellow Apoapsis
      const apMesh = new THREE.Mesh(apGeo, apMat);
      apMesh.position.copy(apPt);
      scene.add(apMesh);
    }

    // =========================================================================
    // 6. 3D SATELLITE SPACECRAFT MODEL WITH GMAT COORDINATE TRIAD
    // =========================================================================
    const satGroup = new THREE.Group();

    // Central Gold Foil Bus (Properly sized 0.9 x 0.9 x 1.2 to avoid collision)
    const busGeo = new THREE.BoxGeometry(0.9, 0.9, 1.2);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Gold metallic foil
      metalness: 0.85,
      roughness: 0.2,
    });
    const busMesh = new THREE.Mesh(busGeo, busMat);
    satGroup.add(busMesh);

    // Solar Wings (Sized 1.8 x 0.6)
    const wingGeo = new THREE.BoxGeometry(1.8, 0.06, 0.7);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Deep blue solar cells
      metalness: 0.6,
      roughness: 0.3,
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-1.4, 0, 0);
    satGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(1.4, 0, 0);
    satGroup.add(rightWing);

    // Parabolic High-Gain Dish
    const dishGeo = new THREE.ConeGeometry(0.55, 0.3, 20, 1, true);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = -Math.PI / 2;
    dish.position.set(0, 0.65, 0.55);
    satGroup.add(dish);

    // Attitude Axes (Red X = Velocity, Green Y = Normal, Blue Z = Co-normal)
    const axesHelper = new THREE.AxesHelper(2.0);
    satGroup.add(axesHelper);

    // Spacecraft Beacon Halo
    const beaconGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    satGroup.add(beacon);

    scene.add(satGroup);

    // Ground Station Comms Line-of-sight Laser
    const commsLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const commsLineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      linewidth: 2,
    });
    const commsLine = new THREE.Line(commsLineGeo, commsLineMat);
    scene.add(commsLine);

    // 3D Camera Orbit & Pan Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 56, theta: Math.PI / 3.2, phi: Math.PI / 3.0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= dx * 0.007;
      spherical.phi = Math.max(0.12, Math.min(Math.PI - 0.12, spherical.phi - dy * 0.007));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      spherical.radius = Math.max(16, Math.min(240, spherical.radius + e.deltaY * 0.05));
    };

    const dom = canvasRef.current;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: true });

    // =========================================================================
    // 7. ROBUST NON-LOOPING FLIGHT SIMULATION LOOP
    // =========================================================================
    let animId: number;
    let lastTime = performance.now();
    let transferProgress = 0; // 0.0 to 1.0 (Outbound Transfer)
    let orbitAngle = 0; // Continuous orbital progression in rad
    let metSeconds = isLeoContinuous ? 3600 * 24 * 12 : 180;
    let lastUiUpdate = 0;

    const loop = (nowTimestamp: number) => {
      try {
        const now =
          typeof nowTimestamp === "number" && !isNaN(nowTimestamp)
            ? nowTimestamp
            : performance.now();
        const dt = Math.max(0, Math.min((now - lastTime) / 1000, 0.1));
        lastTime = now;

        // Reset command if user triggered "Replay Transfer Flight"
        if (resetTransferRef.current) {
          resetTransferRef.current = false;
          transferProgress = 0;
          metSeconds = 180;
          orbitAngle = 0;
        }

        // Planetary rotations
        earthMesh.rotation.y += dt * 0.05 * (isPausedRef.current ? 0 : Math.min(timeWarpRef.current, 100));

        if (moonMesh) {
          moonMesh.rotation.y += dt * 0.03;
        }
        if (marsMesh) {
          marsMesh.rotation.y += dt * 0.04;
        }
        if (targetMesh) {
          targetMesh.rotation.y += dt * 0.08;
        }

        // Flight Phase Resolution
        let currentPos = new THREE.Vector3();
        let currentVelHeading = new THREE.Vector3(0, 0, 1);
        let liveAltKm = officialData.keplerian.perigeeAltitudeKm;
        let liveVelKmS = officialData.keplerian.orbitalVelocityKmS;
        let displayPhaseName = "OPERATIONAL ORBIT";
        let displayProgressPct = 100;

        if (isLeoContinuous) {
          // CONTINUOUS EARTH LEO ORBIT (Sentinel-6 / ISS)
          if (!isPausedRef.current) {
            const revRate = (Math.PI * 2) / (officialData.keplerian.orbitalPeriodMin * 0.4);
            orbitAngle += dt * revRate * timeWarpRef.current;
            metSeconds += dt * timeWarpRef.current * 36;
          }

          const ptsLen = continuousOrbitPoints.length;
          const normalizedTheta = ((orbitAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const floatIdx = (normalizedTheta / (Math.PI * 2)) * (ptsLen - 1);
          const idx0 = Math.max(0, Math.min(ptsLen - 1, Math.floor(floatIdx)));
          const idx1 = Math.max(0, Math.min(ptsLen - 1, idx0 + 1));
          const frac = Math.max(0, Math.min(1, floatIdx - idx0));

          const p0 = continuousOrbitPoints[idx0] || continuousOrbitPoints[0];
          const p1 = continuousOrbitPoints[idx1] || continuousOrbitPoints[ptsLen - 1] || p0;
          currentPos.lerpVectors(p0, p1, frac);

          currentVelHeading.subVectors(p1, p0).normalize();
          liveAltKm = officialData.keplerian.perigeeAltitudeKm;
          liveVelKmS = officialData.keplerian.orbitalVelocityKmS;
          displayPhaseName = "OPERATIONAL LEO TOPOGRAPHY PASS";
          displayProgressPct = 100;
        } else {
          // DEEP SPACE MISSIONS: Cruise Phase (0 -> 1.0) then LOCK into Target Operational Orbit
          if (!isOperationalOrbitRef.current) {
            // TRANSFER FLIGHT PHASE
            if (!isPausedRef.current) {
              const baseRate = 0.018; // ~55s for transfer cruise at 1x
              transferProgress += dt * baseRate * timeWarpRef.current;
              metSeconds += dt * timeWarpRef.current * 80;

              if (transferProgress >= 1.0) {
                // MILESTONE REACHED: LOCK INTO OPERATIONAL TARGET ORBIT!
                transferProgress = 1.0;
                isOperationalOrbitRef.current = true;
                setIsOperationalOrbit(true);
                targetReachedRef.current = true;
                setTargetReached(true);
                setShowBanner(true);
                try {
                  confetti({ particleCount: 220, spread: 110, origin: { y: 0.6 } });
                  soundEngine.playUiClick();
                } catch {}
              }
            }

            const trajLen = transferPoints.length;
            const safeProgress = Math.max(0, Math.min(0.99999, transferProgress));
            const floatIdx = safeProgress * (trajLen - 1);
            const idx0 = Math.max(0, Math.min(trajLen - 1, Math.floor(floatIdx)));
            const idx1 = Math.max(0, Math.min(trajLen - 1, idx0 + 1));
            const frac = Math.max(0, Math.min(1, floatIdx - idx0));

            const p0 = transferPoints[idx0] || transferPoints[0];
            const p1 = transferPoints[idx1] || transferPoints[trajLen - 1] || p0;
            currentPos.lerpVectors(p0, p1, frac);
            currentVelHeading.subVectors(p1, p0).normalize();

            displayProgressPct = Math.round(safeProgress * 100);

            // Dynamic Keplerian climb calculations for each mission
            if (missionKey === "artemis_lunar") {
              if (safeProgress < 0.25) {
                // Phasing Orbit 1: LEO Parking & momentum building
                liveAltKm = Math.round(250 + safeProgress * 400);
                liveVelKmS = 7.82;
                displayPhaseName = "LEO PARKING ORBIT - REV 1";
              } else if (safeProgress < 0.5) {
                // Phasing Orbit 2: Apogee raise
                const f = (safeProgress - 0.25) / 0.25;
                liveAltKm = Math.round(250 + f * 3250);
                liveVelKmS = parseFloat((8.5 - f * 0.8).toFixed(2));
                displayPhaseName = "APOGEE RAISING - REV 2 (MOMENTUM BUILD)";
              } else if (safeProgress < 0.6) {
                // TLI Burn
                liveAltKm = 3500;
                liveVelKmS = 10.15;
                displayPhaseName = "TRANSLUNAR INJECTION (TLI) BURN";
              } else if (safeProgress < 0.9) {
                // Cislunar Coast
                const f = (safeProgress - 0.6) / 0.3;
                liveAltKm = Math.round(3500 + Math.pow(f, 1.4) * 380900);
                liveVelKmS = parseFloat((10.15 - Math.pow(f, 0.6) * 8.3).toFixed(2));
                displayPhaseName = "CISLUNAR OUTBOUND CRUISE";
              } else {
                liveAltKm = Math.round(384400 + (safeProgress - 0.9) * 47810);
                liveVelKmS = 2.38;
                displayPhaseName = "OUTBOUND POWERED FLYBY & DRO CAPTURE";
              }
            } else if (missionKey === "space_telescope") {
              liveAltKm = Math.round(300 + Math.pow(safeProgress, 1.3) * 1499700);
              liveVelKmS = parseFloat((9.8 - Math.pow(safeProgress, 0.6) * 9.5 + 0.28).toFixed(2));
              displayPhaseName =
                safeProgress < 0.25
                  ? "ARIANE 5 HIGH-ENERGY INJECTION"
                  : safeProgress < 0.8
                  ? "SUN-EARTH L2 OUTBOUND CRUISE"
                  : "MCC-2 HALO INSERTION";
            } else {
              // Psyche mission with Mars gravity assist
              if (safeProgress < 0.25) {
                // Earth phasing
                liveAltKm = Math.round(250 + safeProgress * 600);
                liveVelKmS = 11.2;
                displayPhaseName = "EARTH GRAVITY EXIT PHASING";
              } else if (safeProgress < 0.55) {
                // Outbound to Mars
                const f = (safeProgress - 0.25) / 0.3;
                liveAltKm = Math.round(50000 + f * 224950000);
                liveVelKmS = parseFloat((24.2 - f * 4.0).toFixed(2));
                displayPhaseName = "HELIOCENTRIC CRUISE TO MARS";
              } else if (safeProgress < 0.68) {
                // Mars Gravity Assist Slingshot
                liveAltKm = 225000000;
                liveVelKmS = 28.6; // Slingshot boost!
                displayPhaseName = "MARS GRAVITY ASSIST SLINGSHOT";
              } else {
                // Cruising into Asteroid Belt to Psyche
                const f = (safeProgress - 0.68) / 0.32;
                liveAltKm = Math.round(225000000 + f * 179000000);
                liveVelKmS = parseFloat((28.6 - f * 28.48).toFixed(2));
                displayPhaseName = "ASTEROID BELT CRUISE TO (16) PSYCHE";
              }
            }
          } else {
            // OPERATIONAL TARGET ORBIT PHASE (PERMANENT, NEVER LOOPS BACK TO EARTH!)
            if (!isPausedRef.current) {
              const targetOrbitSpeed = 0.25;
              orbitAngle += dt * targetOrbitSpeed * timeWarpRef.current;
              metSeconds += dt * timeWarpRef.current * 120;
            }

            const targetPtsLen = targetOrbitPoints.length;
            if (targetPtsLen >= 2) {
              const normalizedTheta =
                ((orbitAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
              const floatIdx = (normalizedTheta / (Math.PI * 2)) * (targetPtsLen - 1);
              const idx0 = Math.max(0, Math.min(targetPtsLen - 1, Math.floor(floatIdx)));
              const idx1 = Math.max(0, Math.min(targetPtsLen - 1, idx0 + 1));
              const frac = Math.max(0, Math.min(1, floatIdx - idx0));

              const p0 = targetOrbitPoints[idx0] || targetOrbitPoints[0];
              const p1 = targetOrbitPoints[idx1] || targetOrbitPoints[targetPtsLen - 1] || p0;
              currentPos.lerpVectors(p0, p1, frac);
              currentVelHeading.subVectors(p1, p0).normalize();
            } else {
              currentPos.copy(targetPos);
            }

            displayProgressPct = 100;
            if (missionKey === "artemis_lunar") {
              liveAltKm = 432210; // Lunar DRO Altitude
              liveVelKmS = 0.62;
              displayPhaseName = "LUNAR DISTANT RETROGRADE ORBIT (DRO) [LOCKED]";
            } else if (missionKey === "space_telescope") {
              liveAltKm = 1500000; // Sun-Earth L2 Distance
              liveVelKmS = 0.28;
              displayPhaseName = "SUN-EARTH L2 HALO ORBIT [LOCKED]";
            } else {
              liveAltKm = 404000000;
              liveVelKmS = 0.12;
              displayPhaseName = "ASTEROID (16) PSYCHE SCIENCE ORBIT [LOCKED]";
            }
          }
        }

        // Apply Position & Orientation to Spacecraft
        if (
          typeof currentPos.x === "number" &&
          !isNaN(currentPos.x) &&
          typeof currentPos.y === "number" &&
          !isNaN(currentPos.y)
        ) {
          satGroup.position.copy(currentPos);
          if (currentVelHeading.lengthSq() > 0.0001) {
            satGroup.quaternion.setFromUnitVectors(
              new THREE.Vector3(0, 0, 1),
              currentVelHeading
            );
          }
        }

        // Ground Station Comms Tracking Laser Beam
        earthMesh.updateMatrixWorld(true);
        let bestDist = Infinity;
        let activeGsName = "SpaceLink-Alpha (KSC)";
        let activeWorldPos = new THREE.Vector3();

        stationMeshes.forEach((st) => {
          const wPos = st.pos.clone().applyMatrix4(earthMesh.matrixWorld);
          const toSat = new THREE.Vector3().subVectors(satGroup.position, wPos);
          const d = toSat.length();
          const normal = wPos.clone().normalize();
          if (toSat.dot(normal) > 0 && d < bestDist) {
            bestDist = d;
            activeGsName = st.name;
            activeWorldPos = wPos;
          }
        });

        if (bestDist < 120) {
          commsLine.visible = true;
          const posAttr = commsLineGeo.attributes.position as THREE.BufferAttribute;
          posAttr.setXYZ(0, activeWorldPos.x, activeWorldPos.y, activeWorldPos.z);
          posAttr.setXYZ(1, satGroup.position.x, satGroup.position.y, satGroup.position.z);
          posAttr.needsUpdate = true;
        } else {
          commsLine.visible = false;
        }

        // Throttled Direct DOM Telemetry updates (every 60ms)
        if (now - lastUiUpdate > 60) {
          lastUiUpdate = now;

          if (altTextRef.current) {
            altTextRef.current.textContent = `${liveAltKm.toLocaleString()} km`;
          }
          if (velTextRef.current) {
            velTextRef.current.textContent = `${liveVelKmS} km/s`;
          }
          if (progressTextRef.current) {
            progressTextRef.current.textContent = `${displayProgressPct}%`;
          }
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${displayProgressPct}%`;
          }
          if (stationTextRef.current) {
            stationTextRef.current.textContent = activeGsName;
          }
          if (phaseTextRef.current) {
            phaseTextRef.current.textContent = displayPhaseName;
          }
          if (dsnLockTextRef.current) {
            const lockPct = Math.max(90, Math.min(100, Math.round(100 - bestDist * 0.1)));
            dsnLockTextRef.current.textContent = `${lockPct}% LOCK`;
          }
          if (metTextRef.current) {
            const totalSec = Math.floor(metSeconds);
            const days = Math.floor(totalSec / 86400);
            const hours = Math.floor((totalSec % 86400) / 3600);
            const mins = Math.floor((totalSec % 3600) / 60);
            const secs = totalSec % 60;
            metTextRef.current.textContent = `T+ ${days > 0 ? `${days}d ` : ""}${String(
              hours
            ).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(
              2,
              "0"
            )}s`;
          }
        }

        // Camera Tracking Modes
        let targetCenter = new THREE.Vector3(0, 0, 0);
        if (cameraFocusRef.current === "SATELLITE") {
          targetCenter.copy(satGroup.position);
        } else if (cameraFocusRef.current === "TARGET") {
          targetCenter.copy(targetPos);
        } else if (cameraFocusRef.current === "MARS" && marsMesh) {
          targetCenter.copy(marsPos);
        }

        const camX =
          targetCenter.x +
          spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        const camY = targetCenter.y + spherical.radius * Math.cos(spherical.phi);
        const camZ =
          targetCenter.z +
          spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
        camera.position.set(camX, camY, camZ);
        camera.lookAt(targetCenter);

        renderer.render(scene, camera);
      } catch (err) {
        console.error("Orbit loop error:", err);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Responsive window resize
    const onResize = () => {
      const newW = window.innerWidth || 1280;
      const newH = window.innerHeight || 720;
      camera.aspect = Math.max(0.1, newW / newH);
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [missionKey]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-50 bg-[#010206] font-mono select-none overflow-hidden flex flex-col justify-between"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* ========================================================================= */}
      {/* TOP HUD: MISSION IDENTIFICATION & DSN COMM NETWORK                        */}
      {/* ========================================================================= */}
      <div className="relative z-10 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-none">
        {/* Mission Identification Card */}
        <div className="bg-slate-950/90 border border-sky-500/60 shadow-[0_0_25px_rgba(14,165,233,0.35)] rounded-xl p-3.5 flex items-center gap-3 backdrop-blur-md pointer-events-auto">
          <div className="w-10 h-10 rounded-lg bg-sky-950 border border-sky-400/60 flex items-center justify-center shadow-inner">
            <Orbit className="w-6 h-6 text-sky-400 animate-spin" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded tracking-widest uppercase">
                {officialData.sourceAuthority === "CELESTRAK_NORAD" ? "NORAD / CELESTRAK" : "NASA JPL"}
              </span>
              <span className="text-sm font-extrabold text-white tracking-wide">
                {officialData.officialName}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-sky-300 font-semibold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                Target: {officialData.targetBody}
              </span>
              <span className="text-slate-600">•</span>
              <span
                ref={phaseTextRef}
                className="text-[11px] text-amber-300 font-bold uppercase tracking-wider truncate max-w-[260px] sm:max-w-none"
              >
                {isOperationalOrbit ? "OPERATIONAL TARGET ORBIT" : "MOMENTUM PHASING ORBIT"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Ribbon: Ground Station Comms + Official Data Drawer Trigger */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Official Orbital Data Button */}
          <button
            onClick={() => {
              setShowDataDrawer(true);
              try {
                soundEngine.playUiClick();
              } catch {}
            }}
            className="bg-slate-950/90 hover:bg-slate-900 border border-amber-500/60 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] rounded-xl px-3.5 py-2.5 flex items-center gap-2 backdrop-blur-md text-amber-300 text-xs font-bold transition-all hover:scale-105"
            title="Inspect Official CelesTrak TLE & NASA Trajectory Data"
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Official Ephemeris & TLE</span>
            <span className="sm:hidden">Data</span>
          </button>

          {/* Live Ground Station Comms Telemetry */}
          <div className="bg-slate-950/90 border border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.3)] rounded-xl px-4 py-2.5 flex items-center gap-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <Radio className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                  DSN CARRIER UPLINK
                </span>
                <span
                  ref={stationTextRef}
                  className="text-xs text-emerald-300 font-bold truncate max-w-[140px] sm:max-w-[180px]"
                >
                  SpaceLink-Alpha (KSC)
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                LINK MARGIN
              </span>
              <span ref={dsnLockTextRef} className="text-xs font-bold text-sky-400">
                98% LOCK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RIGHT-SIDE FLOATING TARGET ACHIEVED NOTIFICATION (CENTER UNBLOCKED)    */}
      {/* ========================================================================= */}
      {targetReached && showBanner && (
        <div className="fixed top-24 right-4 sm:right-6 z-40 max-w-sm w-full bg-gradient-to-b from-slate-950/95 via-emerald-950/90 to-slate-950/95 border-2 border-emerald-400/90 rounded-2xl p-4 shadow-[0_0_40px_rgba(52,211,153,0.4)] backdrop-blur-xl pointer-events-auto transition-all animate-in slide-in-from-right duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-emerald-400 font-black tracking-widest uppercase">
                  TARGET OBJECTIVE ACHIEVED
                </span>
                <span className="text-xs font-bold text-white">
                  Spacecraft In Operational Orbit
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Minimize Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            {officialData.operationalOrbitDescription}
          </p>

          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800">
            {officialData.flightProfileType !== "EARTH_LEO_ORBIT" && (
              <button
                onClick={handleReplayTransfer}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Flight</span>
              </button>
            )}

            <button
              onClick={onViewDebrief}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md transition-all hover:scale-105 ml-auto"
            >
              View Mission Debrief
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM CONTROL DECK: TELEMETRY METRICS, TIME WARP & ACTIONS               */}
      {/* ========================================================================= */}
      <div className="relative z-10 p-4 sm:p-6 flex flex-col gap-3 pointer-events-none">
        {/* Real-time Velocity & Altitude Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl mx-auto w-full pointer-events-auto">
          {/* Metric 1: Altitude */}
          <div className="bg-slate-950/90 border border-sky-500/50 p-2.5 rounded-xl shadow-lg backdrop-blur-md">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
              <span>Orbital Altitude</span>
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-white mt-1">
              <span ref={altTextRef}>{officialData.keplerian.perigeeAltitudeKm.toLocaleString()} km</span>
            </div>
          </div>

          {/* Metric 2: Orbital Velocity */}
          <div className="bg-slate-950/90 border border-purple-500/50 p-2.5 rounded-xl shadow-lg backdrop-blur-md">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
              <span>Orbital Velocity</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-white mt-1">
              <span ref={velTextRef}>{officialData.keplerian.orbitalVelocityKmS} km/s</span>
            </div>
          </div>

          {/* Metric 3: Mission Elapsed Time */}
          <div className="bg-slate-950/90 border border-amber-500/50 p-2.5 rounded-xl shadow-lg backdrop-blur-md">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
              <span>Mission Elapsed Time</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xs sm:text-sm font-black text-amber-300 mt-1.5 truncate">
              <span ref={metTextRef}>T+ 00h 03m 00s</span>
            </div>
          </div>

          {/* Metric 4: Trajectory Milestone */}
          <div className="bg-slate-950/90 border border-emerald-500/50 p-2.5 rounded-xl shadow-lg backdrop-blur-md">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
              <span>Trajectory Goal</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-300 mt-1 flex items-baseline justify-between">
              <span ref={progressTextRef}>{isOperationalOrbit ? "100%" : "0%"}</span>
              <span className="text-xs font-normal text-slate-400">
                {isOperationalOrbit ? "OPERATIONAL" : "EN ROUTE"}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-sm mt-1.5 overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full bg-emerald-400 transition-all duration-100"
                style={{ width: isOperationalOrbit ? "100%" : "0%" }}
              />
            </div>
          </div>
        </div>

        {/* Master Control Deck Panel */}
        <div className="w-full max-w-4xl mx-auto bg-slate-950/95 border-2 border-sky-500/70 shadow-[0_0_40px_rgba(14,165,233,0.4)] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl pointer-events-auto">
          {/* Time Warp Speed Multipliers */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider flex items-center gap-1">
              <FastForward className="w-4 h-4 text-sky-400" />
              Time Warp:
            </span>

            {/* Pause / Play */}
            <button
              onClick={() => {
                try {
                  soundEngine.playUiClick();
                } catch {}
                setIsPaused(!isPaused);
              }}
              className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                isPaused
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
              title="Pause or Resume Simulation"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Time Warp Factor Buttons */}
            {[1, 5, 25, 100, 1000].map((warp) => (
              <button
                key={warp}
                onClick={() => {
                  try {
                    soundEngine.playUiClick();
                  } catch {}
                  setTimeWarp(warp);
                  setIsPaused(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-extrabold transition-all ${
                  timeWarp === warp && !isPaused
                    ? "bg-sky-500 text-slate-950 border-sky-300 shadow-md shadow-sky-500/40 scale-105"
                    : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                }`}
              >
                {warp}x
              </button>
            ))}
          </div>

          {/* Camera View Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Focus:
            </span>
            <button
              onClick={() => setCameraFocus("EARTH")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                cameraFocus === "EARTH"
                  ? "bg-sky-600 text-white border-sky-400"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              Earth
            </button>
            <button
              onClick={() => setCameraFocus("SATELLITE")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                cameraFocus === "SATELLITE"
                  ? "bg-purple-600 text-white border-purple-400"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              Satellite
            </button>
            {missionKey === "asteroid_scout" && (
              <button
                onClick={() => setCameraFocus("MARS")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                  cameraFocus === "MARS"
                    ? "bg-orange-600 text-white border-orange-400"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                }`}
              >
                Mars
              </button>
            )}
            <button
              onClick={() => setCameraFocus("TARGET")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                cameraFocus === "TARGET"
                  ? "bg-amber-600 text-white border-amber-400"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              Destination
            </button>
          </div>

          {/* Return & Review Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onViewDebrief}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition-colors"
            >
              Debrief
            </button>
            <button
              onClick={onReturnToLaunchPad}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-sky-600/30 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return to Launchpad</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OFFICIAL ORBITAL DATA & CELESTRAK EPHEMERIS MODAL DRAWER                  */}
      {/* ========================================================================= */}
      {showDataDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-slate-950 border-2 border-amber-500/80 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Official Orbital Data & Ephemeris
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono">
                      {officialData.cosparId}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sourced from CelesTrak NORAD GP and NASA Open Data Portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDataDrawer(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 font-mono">
              {/* Mission & Spacecraft Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] tracking-wider">Spacecraft Name:</span>
                  <div className="text-sm font-bold text-white">{officialData.spacecraftName}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] tracking-wider">Launch Vehicle:</span>
                  <div className="text-sm font-bold text-sky-300">{officialData.launchVehicle}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] tracking-wider">Launch Site:</span>
                  <div className="text-xs font-semibold text-slate-300">{officialData.launchSite}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] tracking-wider">Orbital Regime:</span>
                  <div className="text-xs font-semibold text-emerald-300">{officialData.orbitRegime}</div>
                </div>
              </div>

              {/* Keplerian Elements Table */}
              <div>
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Orbit className="w-4 h-4 text-sky-400" />
                  Keplerian Orbital Elements
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px]">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Semi-Major Axis (a):</span>
                    <div className="text-white font-bold">{officialData.keplerian.semiMajorAxisKm.toLocaleString()} km</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Eccentricity (e):</span>
                    <div className="text-white font-bold">{officialData.keplerian.eccentricity}</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Inclination (i):</span>
                    <div className="text-amber-300 font-bold">{officialData.keplerian.inclinationDeg}°</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Orbital Period (T):</span>
                    <div className="text-emerald-300 font-bold">{officialData.keplerian.orbitalPeriodMin} min</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Perigee / Periapsis:</span>
                    <div className="text-white font-bold">{officialData.keplerian.perigeeAltitudeKm.toLocaleString()} km</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Apogee / Apoapsis:</span>
                    <div className="text-white font-bold">{officialData.keplerian.apogeeAltitudeKm.toLocaleString()} km</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Mean Motion (n):</span>
                    <div className="text-white font-bold">{officialData.keplerian.meanMotionRevsPerDay} rev/d</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Orbital Speed (v):</span>
                    <div className="text-purple-300 font-bold">{officialData.keplerian.orbitalVelocityKmS} km/s</div>
                  </div>
                </div>
              </div>

              {/* Raw Two-Line Element (TLE) Set */}
              {officialData.rawTle && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-400" />
                      Authentic Two-Line Element Set (TLE)
                    </h4>
                    <button
                      onClick={copyTleToClipboard}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-bold"
                    >
                      {copiedTle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTle ? "Copied" : "Copy TLE"}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono select-text text-amber-200 space-y-1">
                    <div className="text-slate-400 text-[10px]"># {officialData.officialName} (NORAD CATNR: {officialData.noradCatId || "N/A"})</div>
                    <div className="overflow-x-auto whitespace-pre">{officialData.rawTle.line1}</div>
                    <div className="overflow-x-auto whitespace-pre">{officialData.rawTle.line2}</div>
                  </div>
                </div>
              )}

              {/* Official Web Addresses & Citations */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Official Online Addresses & Catalogs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={officialData.celestrakUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-sky-400 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-sky-300 font-bold flex items-center gap-1">
                        <span>CelesTrak NORAD Catalog</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">https://celestrak.org/NORAD/elements/</div>
                    </div>
                    <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded">
                      CATNR {officialData.noradCatId || "GP"}
                    </span>
                  </a>

                  <a
                    href={officialData.nasaDataPortalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-emerald-400 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-emerald-300 font-bold flex items-center gap-1">
                        <span>NASA Open Data Trajectory</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">https://data.nasa.gov/dataset/?q=trajectory</div>
                    </div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                      NASA Portal
                    </span>
                  </a>
                </div>
              </div>

              {/* Trajectory Flight Milestones */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Flight Profile Milestones
                </h4>
                <div className="space-y-1.5">
                  {officialData.missionMilestones.map((ms, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-white text-[11px]">{ms.phase}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{ms.description}</div>
                      </div>
                      <div className="flex sm:flex-col items-end shrink-0 text-[10px] font-mono">
                        <span className="text-sky-300 font-bold">{ms.altitudeKm.toLocaleString()} km</span>
                        <span className="text-slate-400 ml-2 sm:ml-0">{ms.velocityKmS} km/s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDataDrawer(false)}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors"
              >
                Close Ephemeris Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
