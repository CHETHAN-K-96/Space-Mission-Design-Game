"use client";

import React from "react";
import { COMPONENT_DEFS } from "../../engine/minecraft/constants";
import {
  Rocket,
  Zap,
  Radio,
  Compass,
  Cpu,
  Layers,
  Box,
  Atom,
} from "lucide-react";

interface WorldBlockHoverHudProps {
  blockType: number | null;
  worldPos?: [number, number, number];
}

function getSubsystemIcon(subsystem: string, category: string) {
  const s = (subsystem || category || "").toUpperCase();
  if (s.includes("PROPULSION") || s.includes("ROCKET")) {
    return <Rocket className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
  }
  if (s.includes("POWER") || s.includes("EPS")) {
    return <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  }
  if (s.includes("COMMS")) {
    return <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
  }
  if (s.includes("ADCS")) {
    return <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
  }
  if (s.includes("AVIONICS")) {
    return <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
  }
  if (s.includes("SCIENCE") || s.includes("PAYLOAD")) {
    return <Atom className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  }
  if (s.includes("STRUCTURE") || s.includes("BUS")) {
    return <Layers className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
  }
  return <Box className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
}

export function WorldBlockHoverHud({
  blockType,
  worldPos,
}: WorldBlockHoverHudProps) {
  if (blockType === null) return null;

  // Filter out ground, launchpad, gantry, tower, concrete, hazard, grass, water
  if (blockType >= 17 && blockType <= 22) return null;

  const def = COMPONENT_DEFS[blockType];
  if (!def) return null;

  const icon = getSubsystemIcon(def.subsystem, def.category);

  const categoryLabel =
    def.category === "ROCKET"
      ? "ROCKET PROPULSION"
      : def.category === "SCIENCE"
      ? "SCIENCE PAYLOAD"
      : def.category === "POWER"
      ? "POWER (EPS)"
      : def.category === "COMMS"
      ? "COMMS & BUS"
      : def.subsystem;

  return (
    <div className="absolute top-[56%] left-1/2 -translate-x-1/2 z-30 pointer-events-none font-mono flex flex-col items-center">
      <div className="bg-slate-950/92 border border-sky-400/80 shadow-[0_0_30px_rgba(56,189,248,0.4)] backdrop-blur-md rounded-lg p-2.5 min-w-[290px] max-w-[360px] text-left transition-all">
        {/* Header: Name and Subsystem Badge */}
        <div className="flex justify-between items-center gap-2 border-b border-slate-700/80 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-wide truncate">
            {icon}
            <span className="truncate">{def.name}</span>
          </div>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase text-white shadow-sm shrink-0"
            style={{ backgroundColor: def.color || "#0284c7" }}
          >
            {categoryLabel}
          </span>
        </div>

        {/* Physical Specifications Grid */}
        <div className="grid grid-cols-4 gap-1.5 text-[10px]">
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded text-center">
            <span className="text-amber-400 block text-[9px]">COST</span>
            <strong className="text-white font-bold">${def.cost_m ?? 0}M</strong>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded text-center">
            <span className="text-purple-400 block text-[9px]">MASS</span>
            <strong className="text-white font-bold">{def.mass_kg}kg</strong>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded text-center">
            <span className="text-emerald-400 block text-[9px]">POWER</span>
            <strong
              className={`font-bold ${
                def.power_w > 0
                  ? "text-emerald-400"
                  : def.power_w < 0
                  ? "text-rose-400"
                  : "text-slate-300"
              }`}
            >
              {def.power_w > 0 ? `+${def.power_w}` : def.power_w}W
            </strong>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded text-center">
            <span className="text-sky-400 block text-[9px]">THRUST</span>
            <strong className="text-white font-bold">{def.thrust_kn}kN</strong>
          </div>
        </div>

        {/* World Coordinate Position */}
        {worldPos && (
          <div className="mt-1.5 text-[9px] text-slate-500 font-mono flex justify-between">
            <span>GRID COORD:</span>
            <span>
              [{worldPos[0]}, {worldPos[1]}, {worldPos[2]}]
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
