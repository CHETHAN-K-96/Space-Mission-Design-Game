"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import { COMPONENT_CATALOG } from "../data/components";
import { ComponentIcon } from "./AssemblyGrid";
import { Cpu, MousePointerClick, GripVertical } from "lucide-react";

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
          <Cpu className="h-4 w-4 text-cyan-400" /> CubeSat Subsystem Palette (Drag & Drop)
        </span>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1">
          <MousePointerClick className="h-3 w-3 text-cyan-400" />
          {selectedComponent
            ? `Active: ${selectedComponent.name}`
            : "Drag module or click to select"}
        </span>
      </div>

      {/* Grid of Components with Drag & Drop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {COMPONENT_CATALOG.map((comp) => {
          const isSelected = selectedComponent?.id === comp.id;

          return (
            <div
              key={comp.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", comp.id);
                setDraggedComponent(comp);
                setSelectedComponent(comp);
              }}
              onClick={() => setSelectedComponent(comp)}
              className={`p-2.5 rounded-xl border cursor-grab active:cursor-grabbing transition-all select-none flex flex-col items-center text-center relative group ${
                isSelected
                  ? "border-cyan-400 bg-slate-850 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400"
                  : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center mb-1.5 shadow-sm ${comp.color}`}
              >
                <ComponentIcon name={comp.iconName} className="h-4 w-4" />
              </div>

              <span className="text-[11px] font-bold text-white line-clamp-1">
                {comp.name}
              </span>

              <div className="mt-1 flex items-center gap-1 font-mono text-[9px] text-slate-400">
                <span className="text-cyan-400 font-semibold">${comp.cost_m.toFixed(1)}M</span>
                <span>•</span>
                <span>{comp.mass_kg}kg</span>
              </div>

              <div className="mt-0.5 font-mono text-[9px]">
                {comp.power_w > 0 && <span className="text-amber-400">+{comp.power_w}W</span>}
                {comp.power_w < 0 && <span className="text-rose-400">{comp.power_w}W</span>}
                {comp.power_w === 0 && <span className="text-slate-500">0W</span>}
              </div>

              {/* Category Tag */}
              <div className="mt-1 text-[8px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {comp.category}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
