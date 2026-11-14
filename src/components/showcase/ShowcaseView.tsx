"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  createShowcaseComponents,
  ShowcaseComponent,
} from "../../data/showcaseComponents";
import { ShowcaseCard } from "./ShowcaseCard";

type CategoryFilter =
  | "ALL"
  | "PROPULSION"
  | "POWER"
  | "COMMS"
  | "PAYLOAD"
  | "BUS"
  | "ROCKET";

const FILTER_TABS: { label: string; value: CategoryFilter }[] = [
  { label: "All Subsystems", value: "ALL" },
  { label: "Rocket Stages", value: "ROCKET" },
  { label: "Propulsion & Engines", value: "PROPULSION" },
  { label: "Power & Solar (EPS)", value: "POWER" },
  { label: "Communications", value: "COMMS" },
  { label: "Science Instruments", value: "PAYLOAD" },
  { label: "Avionics & Bus", value: "BUS" },
];

export function ShowcaseView() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");

  const components = useMemo<ShowcaseComponent[]>(() => {
    return createShowcaseComponents();
  }, []);

  const filteredComponents = useMemo(() => {
    if (activeCategory === "ALL") return components;
    return components.filter((comp) => comp.category === activeCategory);
  }, [components, activeCategory]);

  // Card canvas elements registry
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  // Individual card rotation states (drag & idle spin)
  const cardRotations = useRef<
    Record<
      string,
      {
        rotX: number;
        rotY: number;
        isDragging: boolean;
        lastPos: { x: number; y: number };
      }
    >
  >({});

  const draggingCardRef = useRef<string | null>(null);

  const registerCanvas = useCallback(
    (id: string, el: HTMLCanvasElement | null) => {
      canvasRefs.current[id] = el;
      if (el && !cardRotations.current[id]) {
        cardRotations.current[id] = {
          rotX: 0,
          rotY: Math.random() * Math.PI * 2,
          isDragging: false,
          lastPos: { x: 0, y: 0 },
        };
      }
    },
    []
  );

  const handleCardMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    draggingCardRef.current = id;
    if (cardRotations.current[id]) {
      cardRotations.current[id].isDragging = true;
      cardRotations.current[id].lastPos = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleCardTouchStart = useCallback((id: string, e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      draggingCardRef.current = id;
      if (cardRotations.current[id]) {
        cardRotations.current[id].isDragging = true;
        cardRotations.current[id].lastPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    }
  }, []);

  // Global window listeners for mouse/touch move and up
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const activeId = draggingCardRef.current;
      if (!activeId || !cardRotations.current[activeId]) return;
      const state = cardRotations.current[activeId];
      if (!state.isDragging) return;

      const deltaX = e.clientX - state.lastPos.x;
      const deltaY = e.clientY - state.lastPos.y;
      state.rotY += deltaX * 0.015;
      state.rotX += deltaY * 0.015;
      state.lastPos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      const activeId = draggingCardRef.current;
      if (activeId && cardRotations.current[activeId]) {
        cardRotations.current[activeId].isDragging = false;
      }
      draggingCardRef.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      const activeId = draggingCardRef.current;
      if (!activeId || !cardRotations.current[activeId] || e.touches.length === 0)
        return;
      const state = cardRotations.current[activeId];
      if (!state.isDragging) return;

      const deltaX = e.touches[0].clientX - state.lastPos.x;
      const deltaY = e.touches[0].clientY - state.lastPos.y;
      state.rotY += deltaX * 0.015;
      state.rotX += deltaY * 0.015;
      state.lastPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchEnd = () => {
      const activeId = draggingCardRef.current;
      if (activeId && cardRotations.current[activeId]) {
        cardRotations.current[activeId].isDragging = false;
      }
      draggingCardRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Shared High-Performance Offscreen WebGL Rendering Engine
  useEffect(() => {
    const renderWidth = 360;
    const renderHeight = 250;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(renderWidth, renderHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0); // Transparent background
    } catch (err) {
      console.error("Failed to initialize WebGLRenderer:", err);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      renderWidth / renderHeight,
      0.1,
      100
    );
    camera.position.set(1.6, 1.25, 1.8);
    camera.lookAt(0, 0, 0);

    // High quality PBR lighting setup
    const ambLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    // 1 Block Blueprint Grid Platform
    const gridHelper = new THREE.GridHelper(1.4, 4, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Build and cache 3D models with centered bounding boxes
    const models: Record<string, THREE.Group> = {};
    components.forEach((comp) => {
      try {
        const mesh = comp.buildModel();
        const box = new THREE.Box3().setFromObject(mesh);
        const center = new THREE.Vector3();
        box.getCenter(center);
        mesh.position.sub(center);

        // Normalize scale for tall / wide components
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 1.25) {
          const s = 1.25 / maxDim;
          mesh.scale.set(s, s, s);
        }

        const pivot = new THREE.Group();
        pivot.add(mesh);
        models[comp.id] = pivot;
      } catch (err) {
        console.warn("Failed to create model for component:", comp.id, err);
      }
    });

    let animationId: number;

    const renderLoop = () => {
      animationId = requestAnimationFrame(renderLoop);

      filteredComponents.forEach((comp) => {
        const canvas = canvasRefs.current[comp.id];
        const model = models[comp.id];
        if (!canvas || !model) return;

        // Skip render if canvas is not in document
        if (!canvas.isConnected) return;

        const rotState = cardRotations.current[comp.id];
        if (rotState) {
          if (!rotState.isDragging) {
            rotState.rotY += 0.01; // Smooth idle rotation
          }
          model.rotation.y = rotState.rotY;
          model.rotation.x = rotState.rotX;
        }

        scene.add(model);
        renderer.render(scene, camera);
        scene.remove(model);

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            renderer.domElement,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      });
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [components, filteredComponents]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900/95 border-b-2 border-sky-600 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xl sticky top-0 z-50 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase bg-red-600 px-2 py-0.5 rounded">
              NASA JPL
            </span>
            <span className="text-xs font-mono text-cyan-400">
              3D Voxel Models
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold font-mono text-sky-400 tracking-wider flex items-center gap-2 mt-1">
            <span>🚀</span> NASA AEROSPACE VOXEL COMPONENT SHOWCASE
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Procedural compound pixelated 3D models with physical systems engineering constraints (1 Block = 1U Form Factor Envelope)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white border border-sky-400 font-mono text-xs font-bold shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
          >
            🎮 ENTER 3D SPACEPORT & LAUNCH COMPLEX
          </Link>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-3.5 bg-slate-900 border-b border-slate-800 sticky top-[76px] z-40 backdrop-blur-md">
        <span className="text-xs font-mono font-bold text-slate-400 mr-2">
          FILTER:
        </span>
        {FILTER_TABS.map((tab) => {
          const isActive = activeCategory === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveCategory(tab.value)}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-all ${
                isActive
                  ? "bg-sky-600 text-white border border-sky-400 shadow-md shadow-sky-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-sky-400 hover:text-slate-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of 3D Model Cards */}
      <main className="p-6 max-w-[1600px] mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredComponents.map((comp) => (
            <ShowcaseCard
              key={comp.id}
              component={comp}
              registerCanvas={registerCanvas}
              onCardMouseDown={handleCardMouseDown}
              onCardTouchStart={handleCardTouchStart}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
