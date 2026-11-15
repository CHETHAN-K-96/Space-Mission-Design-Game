"use client";

import React from "react";
import Link from "next/link";
import { soundEngine } from "../../engine/minecraft/SoundEngine";
import { TimeOfDay } from "../../engine/minecraft/types";
import {
  Play,
  Box,
  Sun,
  Moon,
  BookOpen,
  Compass,
  Home,
} from "lucide-react";

interface PauseOverlayProps {
  isVisible: boolean;
  timeOfDay: TimeOfDay;
  activeMissionName: string;
  onResumeGame: () => void;
  onOpenBriefing: () => void;
  onSwitchMission: () => void;
  onCycleTime: () => void;
  onReturnToMainMenu: () => void;
}

export function PauseOverlay({
  isVisible,
  timeOfDay,
  activeMissionName,
  onResumeGame,
  onOpenBriefing,
  onSwitchMission,
  onCycleTime,
  onReturnToMainMenu,
}: PauseOverlayProps) {
  if (!isVisible) return null;

  const handleAction = (cb: () => void) => {
    try {
      soundEngine.playUiClick();
    } catch {}
    cb();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-[#1e293b] border-2 border-sky-500 shadow-[0_0_40px_rgba(2,132,199,0.4)] rounded-lg p-6 w-[480px] max-w-[95vw] flex flex-col gap-4 text-center">
        {/* Title Group */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-pixel text-lg sm:text-xl text-slate-100 tracking-wider">
            GAME PAUSED
          </span>
          <p className="text-xs text-sky-400 font-mono">
            Active Mission: {activeMissionName}
          </p>
        </div>

        {/* Minecraft Style Buttons Group */}
        <div className="flex flex-col gap-2.5">
          {/* Button 1: BACK TO GAME */}
          <button
            onClick={() => handleAction(onResumeGame)}
            className="w-full bg-[#4a5568] hover:bg-[#2b6cb0] active:translate-y-0.5 text-white py-3 px-4 border-t-[3px] border-l-[3px] border-white/60 border-b-[4px] border-r-[4px] border-black/80 shadow flex items-center justify-center gap-2 font-pixel text-xs hover:text-yellow-300 transition-colors"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>BACK TO GAME</span>
          </button>

          {/* Button 2: MISSION BRIEFING & OBJECTIVES */}
          <button
            onClick={() => handleAction(onOpenBriefing)}
            className="w-full bg-[#374151] hover:bg-[#4b5563] active:translate-y-0.5 text-slate-200 py-2.5 px-4 border-t-2 border-l-2 border-white/40 border-b-[3px] border-r-[3px] border-black/70 shadow flex items-center justify-center gap-2 text-xs font-semibold hover:text-sky-300 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>MISSION DIRECTIVE & BRIEFING</span>
          </button>

          {/* Button 3: SWITCH MISSION */}
          <button
            onClick={() => handleAction(onSwitchMission)}
            className="w-full bg-[#374151] hover:bg-[#4b5563] active:translate-y-0.5 text-slate-200 py-2.5 px-4 border-t-2 border-l-2 border-white/40 border-b-[3px] border-r-[3px] border-black/70 shadow flex items-center justify-center gap-2 text-xs font-semibold hover:text-sky-300 transition-colors"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>SWITCH MISSION</span>
          </button>

          {/* Button 4: TIME OF DAY TOGGLE */}
          <button
            onClick={() => handleAction(onCycleTime)}
            className="w-full bg-[#374151] hover:bg-[#4b5563] active:translate-y-0.5 text-slate-200 py-2.5 px-4 border-t-2 border-l-2 border-white/40 border-b-[3px] border-r-[3px] border-black/70 shadow flex items-center justify-center gap-2 text-xs font-semibold hover:text-amber-300 transition-colors"
          >
            {timeOfDay === "NIGHT" ? (
              <Moon className="w-4 h-4 text-amber-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span>TIME OF DAY: {timeOfDay}</span>
          </button>

          {/* Button 5: BROWSE 3D ELEMENTS */}
          <Link
            href="/showcase"
            onClick={() => {
              try {
                soundEngine.playUiClick();
              } catch {}
            }}
            className="w-full bg-[#374151] hover:bg-[#4b5563] active:translate-y-0.5 text-purple-300 hover:text-yellow-300 py-2.5 px-4 border-t-2 border-l-2 border-white/40 border-b-[3px] border-r-[3px] border-black/70 shadow flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
          >
            <Box className="w-4 h-4 text-purple-400" />
            <span>BROWSE ALL 3D AEROSPACE MODELS</span>
          </Link>

          {/* Button 6: RETURN TO MAIN MENU */}
          <button
            onClick={() => handleAction(onReturnToMainMenu)}
            className="w-full bg-[#27272a] hover:bg-[#3f3f46] active:translate-y-0.5 text-slate-300 hover:text-white py-2.5 px-4 border-t-2 border-l-2 border-white/30 border-b-[3px] border-r-[3px] border-black/70 shadow flex items-center justify-center gap-2 text-xs font-semibold transition-colors mt-1"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>QUIT TO TITLE SCREEN</span>
          </button>
        </div>

        {/* Quick Cheatsheet / Instructions */}
        <div className="bg-slate-950/80 border border-slate-800 rounded p-3 text-[11px] leading-relaxed text-slate-400 text-left flex flex-col gap-1">
          <div>
            <span className="text-sky-400 font-bold">CLICK CANVAS:</span> Re-lock mouse cursor
          </div>
          <div>
            <span className="text-sky-400 font-bold">WASD + SPACE/SHIFT:</span> Fly around spaceport
          </div>
          <div>
            <span className="text-sky-400 font-bold">RIGHT-CLICK:</span> Place block |{" "}
            <span className="text-sky-400 font-bold">LEFT-CLICK:</span> Break block
          </div>
          <div>
            <span className="text-sky-400 font-bold">E:</span> Component catalog |{" "}
            <span className="text-sky-400 font-bold">L:</span> Launch countdown
          </div>
        </div>
      </div>
    </div>
  );
}
