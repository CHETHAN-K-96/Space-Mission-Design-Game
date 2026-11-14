"use client";

import React from "react";
import { ShowcaseComponent } from "../../data/showcaseComponents";
import { Wrench } from "lucide-react";

interface ShowcaseCardProps {
  component: ShowcaseComponent;
  registerCanvas: (id: string, el: HTMLCanvasElement | null) => void;
  onCardMouseDown: (id: string, e: React.MouseEvent) => void;
  onCardTouchStart: (id: string, e: React.TouchEvent) => void;
}

export function ShowcaseCard({
  component,
  registerCanvas,
  onCardMouseDown,
  onCardTouchStart,
}: ShowcaseCardProps) {
  const heritageBadgeText = (() => {
    const parts = component.flightHeritage.split(" ");
    return `${parts[0]} ${parts[1] || ""}`;
  })();

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400">
      {/* 3D Viewport with 2D Canvas fed by Shared Offscreen WebGL Engine */}
      <div className="w-full h-[250px] relative bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#020617_100%)] overflow-hidden">
        <canvas
          ref={(el) => registerCanvas(component.id, el)}
          width={360}
          height={250}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => onCardMouseDown(component.id, e)}
          onTouchStart={(e) => onCardTouchStart(component.id, e)}
        />
        <span className="absolute top-3 left-3 bg-slate-900/90 border border-cyan-600 text-cyan-400 px-2 py-1 text-[10px] font-bold rounded font-mono tracking-wider z-10 pointer-events-none">
          {component.subsystem}
        </span>
        <span className="absolute top-3 right-3 bg-emerald-950/70 border border-emerald-500 text-emerald-400 px-2 py-1 text-[10px] font-bold rounded font-mono z-10 pointer-events-none">
          {heritageBadgeText}
        </span>
      </div>

      {/* Card Info */}
      <div className="p-4 flex flex-col gap-2.5 bg-slate-900 border-t border-slate-800 flex-1">
        <div className="text-base font-bold text-slate-100 flex items-center justify-between">
          <span>{component.name}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {component.description}
        </p>

        {/* Voxel Assembly Recipe */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300">
          <div className="font-bold text-cyan-400 mb-1 font-mono text-[11px] flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-cyan-400" /> VOXEL ASSEMBLY BLUEPRINT:
          </div>
          <div>{component.recipe}</div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-4 gap-1.5 mt-1 font-mono">
          <div className="bg-slate-800/80 p-1.5 rounded text-center text-[10px] text-slate-400 border border-slate-700/60">
            MASS
            <strong className="block text-xs text-slate-100 mt-0.5">
              {component.specs.mass}
            </strong>
          </div>
          <div className="bg-slate-800/80 p-1.5 rounded text-center text-[10px] text-slate-400 border border-slate-700/60">
            POWER
            <strong className="block text-xs text-slate-100 mt-0.5">
              {component.specs.power}
            </strong>
          </div>
          <div className="bg-slate-800/80 p-1.5 rounded text-center text-[10px] text-slate-400 border border-slate-700/60">
            THRUST
            <strong className="block text-xs text-slate-100 mt-0.5">
              {component.specs.thrust}
            </strong>
          </div>
          <div className="bg-slate-800/80 p-1.5 rounded text-center text-[10px] text-slate-400 border border-slate-700/60">
            COST
            <strong className="block text-xs text-slate-100 mt-0.5">
              {component.specs.cost}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
