"use client";

import React, { useState, useEffect, useRef } from "react";
import { COMPONENT_DEFS } from "../../engine/minecraft/constants";
import { CANVAS_MAP } from "../../engine/minecraft/TextureGen";

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
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  const filteredEntries = Object.entries(COMPONENT_DEFS).filter(
    ([typeStr, def]) => {
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
    }
  );

  useEffect(() => {
    if (!isOpen) return;
    filteredEntries.forEach(([typeStr]) => {
      const type = parseInt(typeStr, 10);
      const canv = canvasRefs.current[type];
      if (canv && CANVAS_MAP[type]) {
        const ctx = canv.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, 32, 32);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(CANVAS_MAP[type], 0, 0, 32, 32);
        }
      }
    });
  }, [isOpen, filter, filteredEntries]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_40px_rgba(2,132,199,0.4)] rounded-lg p-5 w-[720px] max-w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col gap-3.5 text-left">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
          <div className="text-base font-bold text-sky-400 flex items-center gap-2">
            <span>📦</span> NASA Component Catalog (Click to Equip)
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded text-xs transition-colors"
          >
            ✕
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
                    ? "bg-sky-600 text-white border border-sky-400 font-bold"
                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-sky-400 hover:text-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2 max-h-[380px] overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-md">
          {filteredEntries.map(([typeStr, def]) => {
            const type = parseInt(typeStr, 10);
            return (
              <div
                key={type}
                onClick={() => onEquip(type)}
                onMouseEnter={() => onHover(type)}
                onMouseLeave={() => onHover(null)}
                className="bg-slate-900 border border-slate-700 hover:border-sky-400 p-2 rounded flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:scale-105 hover:bg-slate-850 group relative"
                title={def.name}
              >
                <canvas
                  ref={(el) => {
                    canvasRefs.current[type] = el;
                  }}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded border border-slate-800 group-hover:border-sky-500"
                />
                <div className="text-[10px] text-slate-300 font-bold mt-1 line-clamp-1 w-full">
                  {def.name}
                </div>
                <div className="text-[9px] text-emerald-400 font-bold">
                  {def.cost_m ? `$${def.cost_m}M` : `${def.cost_xp} XP`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="text-[11px] text-slate-400 text-center">
          Click any component to equip it to your active hotbar slot.
        </div>
      </div>
    </div>
  );
}
