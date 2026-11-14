"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { COMPONENT_DEFS } from "../../engine/minecraft/constants";
import { initMaterials } from "../../engine/minecraft/TextureGen";
import { VoxelModelFactory } from "../../engine/minecraft/VoxelModelFactory";
import { Box, Rocket, X } from "lucide-react";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEquip: (blockType: number) => void;
  onHover: (blockType: number | null) => void;
}

type InvFilter = "ALL" | "ROCKET" | "PROPULSION" | "POWER" | "SCIENCE" | "COMMS";

const TABS: { label: string; value: InvFilter }[] = [
  { label: "ALL COMPONENTS", value: "ALL" },
  { label: "ROCKET & ENGINES", value: "ROCKET" },
  { label: "PROPULSION", value: "PROPULSION" },
  { label: "POWER (EPS)", value: "POWER" },
  { label: "SCIENCE", value: "SCIENCE" },
  { label: "COMMS & BUS", value: "COMMS" },
];

export function InventoryModal({
  isOpen,
  onClose,
  onEquip,
  onHover,
}: InventoryModalProps) {
  const [filter, setFilter] = useState<InvFilter>("ALL");
  const [selectedType, setSelectedType] = useState<number>(1); // Default to Bus Frame

  // Canvas references for each miniature 3D card
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  // Individual card rotation states (supports drag and auto-spin)
  const cardRotations = useRef<
    Record<number, { rotX: number; rotY: number; isDragging: boolean; lastPos: { x: number; y: number } }>
  >({});

  // High-def 3D inspection viewport mount ref
  const inspectMountRef = useRef<HTMLDivElement>(null);

  const filteredEntries = useMemo(() => {
    return Object.entries(COMPONENT_DEFS).filter(([typeStr, def]) => {
      const type = parseInt(typeStr, 10);
      // Skip terrain / environment infrastructure (pad, tower, concrete, hazard, grass, water)
      if (type >= 17 && type <= 22) return false;
      if (filter === "ALL") return true;
      if (filter === "ROCKET") {
        return def.category === "ROCKET" || type >= 23;
      }
      if (filter === "COMMS") {
        return (
          def.category === "COMMS" ||
          def.subsystem === "ADCS" ||
          def.subsystem === "BUS" ||
          def.subsystem === "AVIONICS"
        );
      }
      return def.category === filter;
    });
  }, [filter]);

  // Ensure selectedType is always valid in current filter
  useEffect(() => {
    if (filteredEntries.length > 0) {
      const exists = filteredEntries.some(([t]) => parseInt(t, 10) === selectedType);
      if (!exists) {
        setSelectedType(parseInt(filteredEntries[0][0], 10));
      }
    }
  }, [filter, filteredEntries, selectedType]);

  // Miniature 3D WebGL Multi-Card Rendering Engine
  useEffect(() => {
    if (!isOpen) return;

    // Ensure procedural materials and textures exist
    initMaterials();

    // Setup Shared Offscreen Three.js WebGL Renderer (Zero context exhaustion)
    const renderWidth = 80;
    const renderHeight = 80;

    const offscreenScene = new THREE.Scene();
    const offscreenCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    offscreenCamera.position.set(1.5, 1.25, 1.6);
    offscreenCamera.lookAt(0, 0, 0);

    let offscreenRenderer: THREE.WebGLRenderer;
    try {
      offscreenRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      offscreenRenderer.setSize(renderWidth, renderHeight);
      offscreenRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch {
      return;
    }

    const ambLight = new THREE.AmbientLight(0xffffff, 0.95);
    offscreenScene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(2.5, 3.5, 2.5);
    offscreenScene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.55);
    rimLight.position.set(-2.5, -1.5, -2.5);
    offscreenScene.add(rimLight);

    // Build model cache with centered bounding boxes
    const models: Record<number, THREE.Object3D> = {};
    filteredEntries.forEach(([typeStr]) => {
      const type = parseInt(typeStr, 10);
      try {
        const mesh = VoxelModelFactory.createMeshForBlock(type);
        const box = new THREE.Box3().setFromObject(mesh);
        const center = new THREE.Vector3();
        box.getCenter(center);
        mesh.position.sub(center);

        // Normalize scale for tall / wide components (tanks, fairings, antennas)
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 1.25) {
          const s = 1.25 / maxDim;
          mesh.scale.set(s, s, s);
        }

        const pivot = new THREE.Group();
        pivot.add(mesh);
        models[type] = pivot;

        if (!cardRotations.current[type]) {
          cardRotations.current[type] = {
            rotX: 0,
            rotY: Math.random() * Math.PI * 2,
            isDragging: false,
            lastPos: { x: 0, y: 0 },
          };
        }
      } catch (err) {
        console.warn("Failed to create preview for block type:", type, err);
      }
    });

    let animationId: number;

    const renderLoop = () => {
      animationId = requestAnimationFrame(renderLoop);

      filteredEntries.forEach(([typeStr]) => {
        const type = parseInt(typeStr, 10);
        const canvas = canvasRefs.current[type];
        const model = models[type];
        if (!canvas || !model) return;

        const rotState = cardRotations.current[type];
        if (rotState && !rotState.isDragging) {
          rotState.rotY += 0.016; // Smooth 3D idle spin
        }

        if (rotState) {
          model.rotation.y = rotState.rotY;
          model.rotation.x = rotState.rotX;
        }

        offscreenScene.add(model);
        offscreenRenderer.render(offscreenScene, offscreenCamera);
        offscreenScene.remove(model);

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(offscreenRenderer.domElement, 0, 0, canvas.width, canvas.height);
        }
      });
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationId);
      offscreenRenderer.dispose();
      offscreenScene.clear();
    };
  }, [isOpen, filter, filteredEntries]);

  // High-Definition Active 3D Inspection Viewport (Right Panel)
  useEffect(() => {
    if (!isOpen || !inspectMountRef.current) return;

    const container = inspectMountRef.current;
    const width = container.clientWidth || 240;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(1.6, 1.3, 1.8);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    // 1-Block Footprint Grid Platform
    const gridHelper = new THREE.GridHelper(1.4, 6, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -0.55;
    scene.add(gridHelper);

    // Create 3D Model for Selected Component
    const pivot = new THREE.Group();
    try {
      const mesh = VoxelModelFactory.createMeshForBlock(selectedType);
      const box = new THREE.Box3().setFromObject(mesh);
      const center = new THREE.Vector3();
      box.getCenter(center);
      mesh.position.sub(center);

      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 1.3) {
        const s = 1.3 / maxDim;
        mesh.scale.set(s, s, s);
      }
      pivot.add(mesh);
    } catch (err) {
      console.warn("Error creating inspection model for", selectedType, err);
    }
    scene.add(pivot);

    // Interactive mouse drag rotation
    let isDragging = false;
    let prevPos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevPos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevPos.x;
      const dy = e.clientY - prevPos.y;
      pivot.rotation.y += dx * 0.015;
      pivot.rotation.x += dy * 0.015;
      prevPos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        pivot.rotation.y += 0.008; // Smooth idle rotation
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [isOpen, selectedType]);

  if (!isOpen) return null;

  const activeDef = COMPONENT_DEFS[selectedType];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 font-mono">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_45px_rgba(2,132,199,0.45)] rounded-lg p-4 w-[920px] max-w-[96vw] max-h-[92vh] flex flex-col gap-3 text-left">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
          <div className="text-sm sm:text-base font-bold text-sky-400 flex items-center gap-2">
            <Box className="w-4 h-4 text-sky-400" /> NASA Component Catalog — 3D Interactive Previews
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded text-xs transition-colors flex items-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map((tab) => {
            const isActive = filter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-2.5 py-1 rounded text-xs transition-all ${
                  isActive
                    ? "bg-sky-600 text-white border border-sky-400 font-bold shadow-md shadow-sky-600/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-sky-400 hover:text-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area: Left Catalog Grid & Right 3D Inspection Panel */}
        <div className="flex flex-col md:flex-row gap-3 min-h-[400px] max-h-[480px]">
          {/* Left: 3D Miniature Component Grid */}
          <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 overflow-y-auto p-2.5 bg-slate-950 border border-slate-800 rounded-md">
            {filteredEntries.map(([typeStr, def]) => {
              const type = parseInt(typeStr, 10);
              const isSelected = type === selectedType;

              return (
                <div
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    onHover(type);
                  }}
                  onDoubleClick={() => onEquip(type)}
                  onMouseEnter={() => {
                    setSelectedType(type);
                    onHover(type);
                  }}
                  onMouseLeave={() => onHover(null)}
                  className={`border p-2 rounded flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:scale-105 group relative ${
                    isSelected
                      ? "bg-slate-800/90 border-sky-400 shadow-lg shadow-sky-500/30 ring-1 ring-sky-400"
                      : "bg-slate-900 border-slate-700/80 hover:border-sky-400/80 hover:bg-slate-850"
                  }`}
                  title={`${def.name} (Click to inspect, double-click to equip)`}
                >
                  {/* Miniature 3D WebGL Canvas */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <canvas
                      ref={(el) => {
                        canvasRefs.current[type] = el;
                      }}
                      width={80}
                      height={80}
                      className="w-14 h-14 rounded-md pointer-events-auto"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const rot = cardRotations.current[type];
                        if (rot) {
                          rot.isDragging = true;
                          rot.lastPos = { x: e.clientX, y: e.clientY };
                        }
                      }}
                      onMouseMove={(e) => {
                        const rot = cardRotations.current[type];
                        if (rot && rot.isDragging) {
                          e.stopPropagation();
                          const dx = e.clientX - rot.lastPos.x;
                          const dy = e.clientY - rot.lastPos.y;
                          rot.rotY += dx * 0.02;
                          rot.rotX += dy * 0.02;
                          rot.lastPos = { x: e.clientX, y: e.clientY };
                        }
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        const rot = cardRotations.current[type];
                        if (rot) rot.isDragging = false;
                      }}
                      onMouseLeave={() => {
                        const rot = cardRotations.current[type];
                        if (rot) rot.isDragging = false;
                      }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-200 font-bold mt-1 line-clamp-1 w-full">
                    {def.name}
                  </div>
                  <div className="flex justify-between items-center w-full mt-0.5 px-0.5">
                    <span className="text-[9px] text-emerald-400 font-bold">
                      ${def.cost_m ?? 0}M
                    </span>
                    <span
                      className="text-[8px] px-1 rounded text-white font-bold uppercase truncate max-w-[50px]"
                      style={{ backgroundColor: def.color || "#0284c7" }}
                    >
                      {def.subsystem}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Active Component 3D Inspection Viewport */}
          {activeDef && (
            <div className="w-full md:w-[280px] bg-slate-950 border border-slate-800 rounded-md p-3 flex flex-col justify-between shrink-0 shadow-inner">
              <div className="flex flex-col gap-2">
                {/* 3D Viewport Box */}
                <div className="relative w-full h-[180px] bg-slate-900 border border-sky-500/40 rounded overflow-hidden flex items-center justify-center shadow-lg">
                  <div
                    ref={inspectMountRef}
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                    title="Drag to orbit 3D model"
                  />
                  <span className="absolute bottom-1 right-1.5 text-[8px] text-slate-500 font-mono pointer-events-none">
                    ROTATE: DRAG 3D
                  </span>
                </div>

                {/* Component Name & Subsystem */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white tracking-wide truncate">
                      {activeDef.name}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase text-white shadow-sm shrink-0"
                      style={{ backgroundColor: activeDef.color || "#0284c7" }}
                    >
                      {activeDef.subsystem}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                    {activeDef.desc}
                  </p>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div className="bg-slate-900 border border-slate-800 p-1.5 rounded">
                    <span className="text-amber-400 block text-[9px]">FINANCIAL COST:</span>
                    <strong className="text-white">${activeDef.cost_m ?? 0}M</strong>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-1.5 rounded">
                    <span className="text-purple-400 block text-[9px]">TOTAL MASS:</span>
                    <strong className="text-white">{activeDef.mass_kg} kg</strong>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-1.5 rounded">
                    <span className="text-emerald-400 block text-[9px]">ELECTRICAL POWER:</span>
                    <strong className="text-white">
                      {activeDef.power_w >= 0 ? "+" : ""}{activeDef.power_w} W
                    </strong>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-1.5 rounded">
                    <span className="text-sky-400 block text-[9px]">
                      {activeDef.thrust_kn ? "PROPULSIVE THRUST:" : "COMMS BANDWIDTH:"}
                    </span>
                    <strong className="text-white">
                      {activeDef.thrust_kn
                        ? `${activeDef.thrust_kn} kN`
                        : `${activeDef.data_mbps} MBps`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Equip Button */}
              <button
                onClick={() => onEquip(selectedType)}
                className="mt-3 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold py-2 px-3 rounded text-xs transition-all shadow-md shadow-sky-600/30 flex items-center justify-center gap-1.5 hover:scale-[1.02]"
              >
                <Rocket className="w-3.5 h-3.5" /> EQUIP TO ACTIVE HOTBAR SLOT
              </button>
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="text-[11px] text-slate-400 text-center flex justify-between items-center px-1">
          <span>Click any card to inspect in 3D • Double click or click Equip to mount</span>
          <span className="text-sky-400 font-bold">ALL COSTS STRICTLY USD ($M)</span>
        </div>
      </div>
    </div>
  );
}
