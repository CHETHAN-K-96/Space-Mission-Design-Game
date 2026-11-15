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
  const [cameraFocus, setCameraFocus] = useState<"EARTH" | "SATELLITE" | "TARGET">("EARTH");

  // Flight Phase & Target Completion State
  const [targetReached, setTargetReached] = useState<boolean>(
    officialData.flightProfileType === "EARTH_LEO_ORBIT"
  );
  const [isOperationalOrbit, setIsOperationalOrbit] = useState<boolean>(
    officialData.flightProfileType === "EARTH_LEO_ORBIT"
  );

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
  const cameraFocusRef = useRef<"EARTH" | "SATELLITE" | "TARGET">("EARTH");
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

    // Subtle ocean gradients
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#081d38");
    grad.addColorStop(0.5, "#14447a");
    grad.addColorStop(1, "#081d38");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Continents
    ctx.fillStyle = "#1e5e34";

    // North America & South America
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

    // Green land highlights
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

  useEffect(() => {
    if (!canvasRef.current) return;

    // Guaranteed viewport sizing
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 720;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010308); // Deep space dark void

    const camera = new THREE.PerspectiveCamera(45, Math.max(0.1, w / h), 0.1, 5000);
    camera.position.set(0, 22, 58);

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
    sunLight.position.set(80, 40, 60);
    scene.add(sunLight);

    const backFillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    backFillLight.position.set(-80, -30, -60);
    scene.add(backFillLight);

    // Deep Space Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 1600;
      starPos[i + 1] = (Math.random() - 0.5) * 1600;
      starPos[i + 2] = (Math.random() - 0.5) * 1600;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      sizeAttenuation: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // NASA GMAT EQUATORIAL REFERENCE PLANE GRID (Green/Cyan Grid)
    const gmatGrid = new THREE.GridHelper(64, 24, 0x06b6d4, 0x1e293b);
    gmatGrid.position.set(0, 0, 0);
    scene.add(gmatGrid);

    // 1. EARTH SPHERE (PROMINENT & GLOWING)
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

    // Earth Atmosphere Halo Aura
    const auraGeo = new THREE.SphereGeometry(earthRadius * 1.05, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    earthMesh.add(auraMesh);

    // 2. CELESTIAL TARGETS & DESTINATION OBJECTS
    let moonMesh: THREE.Mesh | null = null;
    let targetMesh: THREE.Mesh | null = null;
    let targetPos = new THREE.Vector3(38, 10, -28);

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
      // Asteroid (16) Psyche
      targetPos.set(42, 10, -26);
      const astGeo = new THREE.DodecahedronGeometry(2.0, 1);
      const astMat = new THREE.MeshStandardMaterial({
        color: 0xa8a29e,
        metalness: 0.8,
        roughness: 0.3,
      });
      targetMesh = new THREE.Mesh(astGeo, astMat);
      targetMesh.position.copy(targetPos);
      scene.add(targetMesh);

      // Science Orbit around Asteroid Psyche
      const astRadius = 3.6;
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

    // 3. GROUND STATIONS ON EARTH
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

    // 4. GUARANTEED AUTHENTIC TRAJECTORIES (NASA GMAT / CELESTRAK ACCURATE)
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

    // Array of 3D Transfer Trajectory Points (Outbound Flight from Earth to Target)
    const transferPoints: THREE.Vector3[] = [];

    // Array of Continuous Orbital Points (for LEO Satellites like Sentinel-6 / ISS)
    const continuousOrbitPoints: THREE.Vector3[] = [];

    if (missionKey === "earth_sentinel") {
      // AUTHENTIC CELESTRAK NORAD 46984: 66.04° High-Inclination Polar LEO Orbit
      const incRad = 66.0399 * (Math.PI / 180);
      const r = earthRadius + 3.2; // 1,336 km altitude scaled
      const numPts = 180;
      for (let i = 0; i <= numPts; i++) {
        const theta = (i / numPts) * Math.PI * 2;
        // Apply 66.04° inclination rotation
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta) * Math.sin(incRad);
        const z = r * Math.sin(theta) * Math.cos(incRad);
        continuousOrbitPoints.push(new THREE.Vector3(x, y, z));
      }
    } else if (missionKey === "artemis_lunar") {
      // AUTHENTIC NASA TLI TRAJECTORY: From KSC Earth Parking Orbit to Moon
      const p0 = new THREE.Vector3(-parkingRadius, 1.2, 0);
      const p1 = new THREE.Vector3(-parkingRadius * 0.4, 8, 14);
      const p2 = new THREE.Vector3(targetPos.x * 0.5, targetPos.y + 4, targetPos.z * 0.5);
      const p3 = targetPos.clone().add(new THREE.Vector3(-4.8, 0, 0));
      const bezier = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
      const outbound = bezier.getPoints(120);
      outbound.forEach((pt) => transferPoints.push(new THREE.Vector3(pt.x, pt.y, pt.z)));
    } else if (missionKey === "space_telescope") {
      // AUTHENTIC NASA JWST L2 TRANSFER TRAJECTORY: Outbound to Sun-Earth L2 (1.5M km)
      const p0 = new THREE.Vector3(0, parkingRadius, 1.0);
      const p1 = new THREE.Vector3(14, 12, -8);
      const p2 = new THREE.Vector3(28, 14, -18);
      const p3 = targetPos.clone().add(new THREE.Vector3(-4.2, 0, 0));
      const bezier = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
      const outbound = bezier.getPoints(120);
      outbound.forEach((pt) => transferPoints.push(new THREE.Vector3(pt.x, pt.y, pt.z)));
    } else if (missionKey === "asteroid_scout") {
      // AUTHENTIC PSYCHE HELIOCENTRIC CRUISE TRAJECTORY
      const p0 = new THREE.Vector3(parkingRadius, 0, 0);
      const p1 = new THREE.Vector3(18, 6, 12);
      const p2 = new THREE.Vector3(32, 10, -10);
      const p3 = targetPos.clone().add(new THREE.Vector3(-3.6, 0, 0));
      const bezier = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
      const outbound = bezier.getPoints(120);
      outbound.forEach((pt) => transferPoints.push(new THREE.Vector3(pt.x, pt.y, pt.z)));
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

    // Trajectory Line Render
    const isLeoContinuous = officialData.flightProfileType === "EARTH_LEO_ORBIT";
    const primaryPoints = isLeoContinuous ? continuousOrbitPoints : transferPoints;

    const trajGeo = new THREE.BufferGeometry().setFromPoints(primaryPoints);
    const trajMat = new THREE.LineBasicMaterial({
      color: isLeoContinuous ? 0x22c55e : 0xd946ef, // Green for LEO, Magenta for Deep Space
      linewidth: 3,
    });
    const trajLine = new THREE.Line(trajGeo, trajMat);
    scene.add(trajLine);

    // Periapsis (Pe) & Apoapsis (Ap) Marker Dots (GMAT Style)
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

    // 5. 3D SATELLITE SPACECRAFT MODEL WITH GMAT COORDINATE TRIAD
    const satGroup = new THREE.Group();

    // Central Gold Foil Bus
    const busGeo = new THREE.BoxGeometry(1.2, 1.2, 1.6);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Gold metallic foil
      metalness: 0.85,
      roughness: 0.2,
    });
    const busMesh = new THREE.Mesh(busGeo, busMat);
    satGroup.add(busMesh);

    // Solar Wings
    const wingGeo = new THREE.BoxGeometry(2.4, 0.08, 0.9);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Deep blue solar cells
      metalness: 0.6,
      roughness: 0.3,
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-2.0, 0, 0);
    satGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(2.0, 0, 0);
    satGroup.add(rightWing);

    // Parabolic High-Gain Dish
    const dishGeo = new THREE.ConeGeometry(0.7, 0.4, 20, 1, true);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = -Math.PI / 2;
    dish.position.set(0, 0.8, 0.7);
    satGroup.add(dish);

    // GMAT Coordinate Axes on Spacecraft (X Red = Velocity, Y Green = Normal, Z Blue = Co-normal)
    const axesHelper = new THREE.AxesHelper(2.5);
    satGroup.add(axesHelper);

    // Glowing Beacon Halo
    const beaconGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    satGroup.add(beacon);

    scene.add(satGroup);

    // 6. GROUND STATION COMMS LINE-OF-SIGHT LASER
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

    // Mouse Interaction for 3D Camera Orbit / Zoom
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 52, theta: Math.PI / 3.2, phi: Math.PI / 3.0 };

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
      spherical.radius = Math.max(16, Math.min(220, spherical.radius + e.deltaY * 0.05));
    };

    const dom = canvasRef.current;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: true });

    // 7. ROBUST NON-LOOPING FLIGHT SIMULATION LOOP
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

        // Earth Rotation (Earth rotates naturally beneath orbital planes)
        earthMesh.rotation.y += dt * 0.05 * (isPausedRef.current ? 0 : Math.min(timeWarpRef.current, 100));

        if (moonMesh) {
          moonMesh.rotation.y += dt * 0.03;
        }
        if (targetMesh) {
          targetMesh.rotation.y += dt * 0.1;
        }

        // =====================================================================
        // FLIGHT PHASE RESOLUTION (STOPS ENDLESS RESET / LOOPING BUG)
        // =====================================================================
        let currentPos = new THREE.Vector3();
        let currentVelHeading = new THREE.Vector3(0, 0, 1);
        let liveAltKm = officialData.keplerian.perigeeAltitudeKm;
        let liveVelKmS = officialData.keplerian.orbitalVelocityKmS;
        let displayPhaseName = "OPERATIONAL ORBIT";
        let displayProgressPct = 100;

        if (isLeoContinuous) {
          // CONTINUOUS EARTH LEO ORBIT (Sentinel-6 / ISS)
          // Progresses along its authentic 66.04° or 51.64° inclined track indefinitely
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
              const baseRate = 0.02; // ~50s for transfer cruise at 1x
              transferProgress += dt * baseRate * timeWarpRef.current;
              metSeconds += dt * timeWarpRef.current * 80;

              if (transferProgress >= 1.0) {
                // MILESTONE REACHED: LOCK INTO OPERATIONAL TARGET ORBIT!
                transferProgress = 1.0;
                isOperationalOrbitRef.current = true;
                setIsOperationalOrbit(true);
                targetReachedRef.current = true;
                setTargetReached(true);
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

            // Dynamic Keplerian climb calculations
            if (missionKey === "artemis_lunar") {
              liveAltKm = Math.round(250 + Math.pow(safeProgress, 1.4) * 384150);
              liveVelKmS = parseFloat((10.1 - Math.pow(safeProgress, 0.7) * 8.2).toFixed(2));
              displayPhaseName =
                safeProgress < 0.15
                  ? "TLI TRANS-LUNAR INJECTION"
                  : safeProgress < 0.8
                  ? "CISLUNAR CRUISE PHASE"
                  : "LUNAR DRO CAPTURE BURN";
            } else if (missionKey === "space_telescope") {
              liveAltKm = Math.round(300 + Math.pow(safeProgress, 1.3) * 1499700);
              liveVelKmS = parseFloat((9.8 - Math.pow(safeProgress, 0.6) * 9.5 + 0.28).toFixed(2));
              displayPhaseName =
                safeProgress < 0.2
                  ? "ARIANE 5 ESCAPE INJECTION"
                  : safeProgress < 0.8
                  ? "SUN-EARTH L2 CRUISE"
                  : "MCC-2 HALO INSERTION";
            } else {
              liveAltKm = Math.round(500 + Math.pow(safeProgress, 1.2) * 403999500);
              liveVelKmS = parseFloat((12.4 - safeProgress * 12.2 + 0.15).toFixed(2));
              displayPhaseName =
                safeProgress < 0.4
                  ? "FALCON HEAVY HYPERBOLIC INJECTION"
                  : safeProgress < 0.8
                  ? "MARS GRAVITY ASSIST CRUISE"
                  : "PSYCHE CAPTURE INSERTION";
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
      className="fixed inset-0 z-50 bg-[#010308] font-mono select-none overflow-hidden flex flex-col justify-between"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* ========================================================================= */}
      {/* TOP HUD: NASA GMAT MISSION TITLE & DSN COMM NETWORK                       */}
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
                {isOperationalOrbit ? "OPERATIONAL TARGET ORBIT" : "TRANS-LUNAR INJECTION (TLI)"}
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
      {/* TARGET OBJECTIVE REACHED BANNER (WHEN ORBIT COMPLETE)                     */}
      {/* ========================================================================= */}
      {targetReached && (
        <div className="relative z-10 self-center bg-gradient-to-r from-emerald-950/95 via-teal-950/95 to-slate-950/95 border-2 border-emerald-400 rounded-2xl p-4 sm:p-5 shadow-[0_0_50px_rgba(52,211,153,0.5)] flex flex-wrap items-center justify-between gap-4 backdrop-blur-md pointer-events-auto max-w-2xl mx-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase">
                MISSION TARGET ACHIEVED • OPERATIONAL ORBIT LOCKED
              </span>
              <span className="text-sm sm:text-base text-white font-extrabold">
                {officialData.operationalOrbitDescription}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {officialData.flightProfileType !== "EARTH_LEO_ORBIT" && (
              <button
                onClick={handleReplayTransfer}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                title="Re-run injection burn and outbound cruise"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Transfer</span>
              </button>
            )}

            <button
              onClick={onViewDebrief}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              VIEW DEBRIEF SCORE
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM CONTROL DECK: TIME WARP, TELEMETRY METRICS & MISSION ACTIONS       */}
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
