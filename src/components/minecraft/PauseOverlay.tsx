"use client";

import React from "react";
import Link from "next/link";
import { TimeOfDay } from "../../engine/minecraft/types";
import { Play, Sparkles, Box, Sun, Moon, BookOpen } from "lucide-react";

interface PauseOverlayProps {
  isVisible: boolean;
  timeOfDay: TimeOfDay;
  onEnterGame: () => void;
  onLoadCertifiedCraft: () => void;
  onCycleTime: () => void;
  onOpenStory?: () => void;
}

export function PauseOverlay({
  isVisible,
  timeOfDay,
  onEnterGame,
  onLoadCertifiedCraft,
  onCycleTime,
  onOpenStory,
}: PauseOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_40px_rgba(2,132,199,0.4)] rounded-lg p-6 w-[520px] max-w-[95vw] flex flex-col gap-4 text-center">
        {/* Title Group */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest">
            NASA SPACE APPS CHALLENGE 2026
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-sky-400 tracking-wide mt-1">
            SPACE MISSION DESIGN GAME
          </h1>
          <p className="text-xs text-slate-400">
            3D Systems Engineering VAB & Flight Readiness Simulator
          </p>
        </div>

        {/* Buttons Group */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onEnterGame}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold text-sm py-3 px-4 border border-emerald-400 rounded-md shadow-lg shadow-emerald-600/40 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> ENTER LAUNCH COMPLEX (LOCK MOUSE)
          </button>
          {onOpenStory && (
            <button
              onClick={onOpenStory}
              className="bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 py-2 px-3 rounded-md text-xs font-semibold transition-all hover:border-indigo-400 flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> MISSION STORYLINE & HISTORICAL FLIGHT
            </button>
          )}
          <button
            onClick={onLoadCertifiedCraft}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-3 rounded-md text-xs font-semibold transition-all hover:border-sky-400 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" /> LOAD CERTIFIED SPACECRAFT
          </button>
          <button
            onClick={onCycleTime}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-3 rounded-md text-xs font-semibold transition-all hover:border-sky-400 flex items-center justify-center gap-1.5"
          >
            {timeOfDay === "NIGHT" ? (
              <Moon className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            TIME OF DAY: {timeOfDay}
          </button>
          <div className="grid grid-cols-1 gap-2 mt-1">
            <Link
              href="/showcase"
              className="bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 py-2.5 px-3 rounded-md text-xs font-semibold transition-all hover:border-purple-400 text-center flex items-center justify-center gap-2"
            >
              <Box className="w-4 h-4 text-purple-400" /> BROWSE ALL 3D AEROSPACE VOXEL MODELS
            </Link>
          </div>
        </div>

        {/* Instructions / Keybinds */}
        <div className="bg-slate-950 border border-slate-800 rounded-md p-3 text-[11px] leading-relaxed text-slate-300 text-left flex flex-col gap-1">
          <div>
            <span className="text-sky-400 font-bold">MOUSE:</span> Look around (Pointer Lock)
          </div>
          <div>
            <span className="text-sky-400 font-bold">RIGHT-CLICK:</span> Place Selected Component |{" "}
            <span className="text-sky-400 font-bold">LEFT-CLICK:</span> Disassemble
          </div>
          <div>
            <span className="text-sky-400 font-bold">WASD:</span> Fly Around Spaceport |{" "}
            <span className="text-sky-400 font-bold">SPACE/SHIFT:</span> Ascend/Descend
          </div>
          <div>
            <span className="text-sky-400 font-bold">1-9 / SCROLL:</span> Select Component |{" "}
            <span className="text-sky-400 font-bold">E:</span> Component Catalog
          </div>
          <div>
            <span className="text-sky-400 font-bold">X:</span> Toggle Fairing Shroud (Cutaway / Solid) |{" "}
            <span className="text-sky-400 font-bold">V:</span> Satellite / Rocket View |{" "}
            <span className="text-sky-400 font-bold">B:</span> Blueprint Guide
          </div>
          <div>
            <span className="text-sky-400 font-bold">L:</span> Launch Spacecraft Review |{" "}
            <span className="text-sky-400 font-bold">ESC:</span> Pause Menu
          </div>
        </div>
      </div>
    </div>
  );
}
