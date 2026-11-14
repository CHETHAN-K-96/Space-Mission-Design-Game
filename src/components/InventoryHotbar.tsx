"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import { COMPONENT_CATALOG } from "../data/components";
import {
  Sun,
  Battery,
  Camera,
  Radio,
  Rocket,
  Cpu,
  MousePointerClick,
} from "lucide-react";

function ComponentIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  switch (name) {
    case "Sun":
      return <Sun className={className} />;
    case "Battery":
      return <Battery className={className} />;
    case "Camera":
      return <Camera className={className} />;
    case "Radio":
      return <Radio className={className} />;
    case "Rocket":
      return <Rocket className={className} />;
    default:
      return <Cpu className={className} />;
  }
}

export function InventoryHotbar() {
  const {
    selectedComponent,
    setSelectedComponent,
    setDraggedComponent,
  } = useGame();

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-400" /> CubeSat 101 Component Hotbar
        </span>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1">
          <MousePointerClick className="h-3 w-3 text-cyan-400" />
          {selectedComponent
            ? `Active Tool: ${selectedComponent.name}`
            : "Click or drag to place on 5x5 grid"}
        </span>
      </div>

      {/* Grid of Components */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {COMPONENT_CATALOG.map((comp) => {
          const isSelected = selectedComponent?.id === comp.id;

          return (
            <div
              key={comp.id}
              draggable
              onDragStart={() => setDraggedComponent(comp)}
              onClick={() => setSelectedComponent(comp)}
              className={`p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all select-none flex flex-col items-center text-center relative group ${
                isSelected
                  ? "border-cyan-400 bg-slate-850 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400"
                  : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center mb-2 shadow-sm ${comp.color}`}
              >
                <ComponentIcon name={comp.iconName} className="h-5 w-5" />
              </div>

              <span className="text-xs font-bold text-white line-clamp-1">
                {comp.name}
              </span>

              <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                <span className="text-amber-400 font-semibold">${comp.cost_m}M</span>
                <span>•</span>
                <span>{comp.mass_kg} kg</span>
              </div>

              <div className="mt-0.5 font-mono text-[10px]">
                {comp.power_w > 0 && <span className="text-amber-400">+{comp.power_w} W</span>}
                {comp.power_w < 0 && <span className="text-rose-400">{comp.power_w} W</span>}
                {comp.power_w === 0 && <span className="text-emerald-400">0 W (Buff)</span>}
              </div>

              {/* Subsystem Tag */}
              <div className="mt-1 text-[8px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {comp.subsystem}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
