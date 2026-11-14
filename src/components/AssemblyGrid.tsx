"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { SpacecraftComponent } from "../types/game";
import {
  Sun,
  Battery,
  Camera,
  Radio,
  Rocket,
  Cpu,
  Trash2,
} from "lucide-react";

// Map icon name to Lucide component
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

export function AssemblyGrid() {
  const {
    grid,
    placeComponent,
    clearGrid,
    selectedComponent,
    draggedComponent,
    setDraggedComponent,
    hoveredIndex,
    setHoveredIndex,
  } = useGame();

  const handleSlotClick = (index: number) => {
    if (grid[index]) {
      // Deconstruct item in this slot
      placeComponent(index, null);
    } else if (selectedComponent) {
      // Place selected item into empty slot
      placeComponent(index, selectedComponent);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setHoveredIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedComponent) {
      placeComponent(index, draggedComponent);
    }
    setDraggedComponent(null);
    setHoveredIndex(null);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      {/* VAB Header Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
            Vehicle Assembly Grid (5x5 Voxel Matrix)
          </h3>
        </div>
        <button
          onClick={clearGrid}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-md border border-slate-800 hover:border-rose-900/50 bg-slate-950/70 transition-colors"
          title="Clear all spacecraft blocks from grid"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear VAB
        </button>
      </div>

      {/* 5x5 Crafting Grid Container */}
      <div className="relative p-3 sm:p-4 bg-slate-950 rounded-xl border border-slate-800/80 shadow-inner">
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5 aspect-square max-w-[440px] mx-auto">
          {grid.map((slot, idx) => {
            const isHovered = hoveredIndex === idx;
            const row = Math.floor(idx / 5);
            const col = idx % 5;

            return (
              <div
                key={idx}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => handleSlotClick(idx)}
                className={`relative group rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer select-none ${
                  slot
                    ? `${slot.color} ${slot.borderColor} shadow-lg ${slot.glowColor}`
                    : isHovered
                    ? "border-cyan-400 bg-cyan-950/30 scale-[1.02]"
                    : "border-slate-800/90 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
              >
                {/* Coordinate Index */}
                <span className="absolute top-1 left-1.5 text-[9px] font-mono text-slate-600 group-hover:text-slate-400 pointer-events-none">
                  [{row},{col}]
                </span>

                {slot ? (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="flex flex-col items-center p-1 text-center"
                  >
                    <ComponentIcon
                      name={slot.iconName}
                      className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-md"
                    />
                    <span className="text-[10px] font-mono font-bold mt-1 line-clamp-1">
                      {slot.name.split(" ")[0]}
                    </span>
                    <span className="text-[8px] font-mono opacity-80 uppercase">
                      {slot.subsystem}
                    </span>
                  </motion.div>
                ) : (
                  <div className="h-4 w-4 rounded-sm border border-slate-800 group-hover:border-cyan-800/50 opacity-30" />
                )}

                {/* Hover Tooltip */}
                {slot && (
                  <div className="absolute z-30 bottom-full mb-2 hidden group-hover:block w-48 p-2.5 bg-slate-950 text-slate-200 text-[10px] font-mono rounded-lg border border-slate-700 shadow-2xl pointer-events-none">
                    <p className="font-bold text-white mb-1">{slot.name}</p>
                    <div className="text-slate-400 space-y-0.5">
                      <div>Mass: {slot.mass_kg} kg | Cost: {slot.cost_m} XP</div>
                      <div>
                        Power: {slot.power_w > 0 ? `+${slot.power_w}` : slot.power_w} W
                      </div>
                      {slot.thrust_kn > 0 && <div>Thrust: {slot.thrust_kn} kN</div>}
                      {slot.data_mbps !== 0 && <div>Data: {slot.data_mbps} MBps</div>}
                    </div>
                    <p className="text-[9px] text-cyan-400 mt-1.5 border-t border-slate-800 pt-1">
                      Click slot to deconstruct
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tip Footer */}
        <div className="mt-3 text-center text-[11px] font-mono text-slate-500">
          Tip: Drag components into slots, or select from the hotbar below and click any slot.
        </div>
      </div>
    </div>
  );
}
