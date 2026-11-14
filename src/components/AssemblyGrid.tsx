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
  Box,
  Zap,
  Wind,
  Magnet,
  Sparkles,
} from "lucide-react";

// Map icon name to Lucide component
export function ComponentIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  switch (name) {
    case "Rocket":
      return <Rocket className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Wind":
      return <Wind className={className} />;
    case "Box":
      return <Box className={className} />;
    case "Cpu":
      return <Cpu className={className} />;
    case "Sun":
      return <Sun className={className} />;
    case "Battery":
      return <Battery className={className} />;
    case "Radio":
      return <Radio className={className} />;
    case "Camera":
      return <Camera className={className} />;
    case "Magnet":
      return <Magnet className={className} />;
    default:
      return <Cpu className={className} />;
  }
}

export function AssemblyGrid() {
  const {
    grid,
    placeComponent,
    clearGrid,
    loadPreset,
    selectedComponent,
    draggedComponent,
    setDraggedComponent,
    hoveredIndex,
    setHoveredIndex,
  } = useGame();

  const handleSlotClick = (index: number) => {
    if (grid[index]) {
      // Remove item in this slot
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
      setDraggedComponent(null);
    }
    setHoveredIndex(null);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* VAB Header Controls */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Box className="h-4 w-4 text-cyan-400" /> 5x5 Vehicle Assembly Bay (VAB)
          </span>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Click empty slot or drag-and-drop to mount. Click placed module to remove.
          </p>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => loadPreset("artemis")}
            className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-[11px] flex items-center gap-1 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            <span>Preset</span>
          </button>
          <button
            onClick={clearGrid}
            className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/60 text-rose-300 text-[11px] flex items-center gap-1 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 5x5 Assembly Grid Matrix */}
      <div className="flex justify-center p-2">
        <div className="grid grid-cols-5 gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner">
          {grid.map((slot, index) => {
            const isHovered = hoveredIndex === index;
            const isOccupied = slot !== null;

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSlotClick(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={() => setHoveredIndex(null)}
                onDrop={(e) => handleDrop(e, index)}
                className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl border-2 flex flex-col items-center justify-center p-1.5 cursor-pointer select-none transition-all relative overflow-hidden ${
                  isOccupied
                    ? `${slot.borderColor} bg-slate-900 shadow-md ${slot.glowColor}`
                    : isHovered
                    ? "border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20"
                    : "border-slate-800/90 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                {slot ? (
                  <>
                    <div className={`p-1.5 rounded-lg mb-1 ${slot.color}`}>
                      <ComponentIcon name={slot.iconName} className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-white line-clamp-1 text-center w-full">
                      {slot.name.split(" ")[0]}
                    </span>
                    <span className="text-[8px] font-mono text-cyan-400 font-semibold">
                      ${slot.cost_m.toFixed(1)}M
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-700">
                    <span className="text-lg leading-none font-light">+</span>
                    <span className="text-[8px] font-mono text-slate-600 mt-1">
                      {index + 1}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
