"use client";

import React, { useEffect, useRef } from "react";
import { COMPONENT_DEFS } from "../../engine/minecraft/constants";
import { CANVAS_MAP } from "../../engine/minecraft/TextureGen";

interface HotbarProps {
  hotbarSlots: number[];
  activeSlotIdx: number;
  onSelectSlot: (idx: number) => void;
  onHoverSlot: (blockType: number | null) => void;
}

export function Hotbar({
  hotbarSlots,
  activeSlotIdx,
  onSelectSlot,
  onHoverSlot,
}: HotbarProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    hotbarSlots.forEach((type, i) => {
      const canv = canvasRefs.current[i];
      if (canv && CANVAS_MAP[type]) {
        const ctx = canv.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, 32, 32);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(CANVAS_MAP[type], 0, 0, 32, 32);
        }
      }
    });
  }, [hotbarSlots]);

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-auto font-mono">
      <div className="flex bg-slate-900/95 border-2 border-sky-400/40 rounded-md p-1 gap-1 shadow-2xl">
        {hotbarSlots.map((type, i) => {
          const isActive = i === activeSlotIdx;
          const def = COMPONENT_DEFS[type];
          return (
            <div
              key={i}
              onClick={() => onSelectSlot(i)}
              onMouseEnter={() => onHoverSlot(type)}
              onMouseLeave={() => onHoverSlot(null)}
              className={`w-12 h-12 bg-slate-800 rounded border-2 flex flex-col items-center justify-center relative cursor-pointer transition-all ${
                isActive
                  ? "border-sky-400 bg-[#0f2744] scale-110 shadow-lg shadow-sky-500/50 z-10"
                  : "border-slate-700 hover:border-sky-400"
              }`}
            >
              {/* Slot Keybind Number */}
              <span className="absolute top-0.5 left-1 text-[8px] text-slate-400 font-bold">
                {i + 1}
              </span>

              {/* Pixel Art icon */}
              <canvas
                ref={(el) => {
                  canvasRefs.current[i] = el;
                }}
                width={32}
                height={32}
                className="w-7 h-7 [image-rendering:pixelated]"
              />

              {/* Cost badge */}
              {def && (
                <span className="absolute bottom-0.5 right-1 text-[8px] text-amber-400 font-bold">
                  {def.cost_m ? `$${def.cost_m}M` : `${def.cost_xp}XP`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
