"use client";

import React from "react";
import { COMPONENT_DEFS } from "../../engine/minecraft/constants";

interface ComponentTooltipProps {
  blockType: number | null;
}

export function ComponentTooltip({ blockType }: ComponentTooltipProps) {
  if (blockType === null) return null;
  const def = COMPONENT_DEFS[blockType];
  if (!def) return null;

  return (
    <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 z-25 bg-slate-900/95 border border-sky-400 shadow-2xl shadow-sky-500/20 rounded-md p-2.5 w-[380px] max-w-[90vw] pointer-events-none font-mono">
      <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-1.5">
        <span className="text-xs sm:text-sm font-bold text-slate-100">
          {def.name}
        </span>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase text-white"
          style={{ backgroundColor: def.color }}
        >
          {def.subsystem}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 mb-1.5 text-[10px]">
        <div className="bg-slate-950 border border-slate-800 p-1 rounded text-center">
          <span className="text-amber-400">Cost:</span>{" "}
          <strong className="text-white">
            ${def.cost_m ?? 0}M
          </strong>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-1 rounded text-center">
          <span className="text-purple-400">Mass:</span>{" "}
          <strong className="text-white">{def.mass_kg} kg</strong>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-1 rounded text-center">
          <span className="text-emerald-400">Power:</span>{" "}
          <strong className="text-white">
            {def.power_w >= 0 ? "+" : ""}
            {def.power_w} W
          </strong>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-1 rounded text-center">
          <span className="text-sky-400">Data:</span>{" "}
          <strong className="text-white">
            {def.data_mbps >= 0 ? "+" : ""}
            {def.data_mbps} MBps
          </strong>
        </div>
      </div>

      <p className="text-[11px] text-slate-300 leading-snug">{def.desc}</p>
    </div>
  );
}
