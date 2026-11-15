"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { soundEngine } from "../../engine/minecraft/SoundEngine";
import { MISSIONS } from "../../engine/minecraft/constants";
import { MissionDef, TimeOfDay } from "../../engine/minecraft/types";
import {
  Rocket,
  Compass,
  Box,
  Sun,
  Moon,
  HelpCircle,
  BookOpen,
  Check,
  X,
  ExternalLink,
  Orbit,
} from "lucide-react";

interface MinecraftMainMenuProps {
  activeMissionKey: string;
  activeMission: MissionDef;
  timeOfDay: TimeOfDay;
  onEnterLaunchComplex: () => void;
  onSelectMission: (missionKey: string) => void;
  onCycleTime: () => void;
  onReplayStory: () => void;
  onViewOrbitalTrajectory?: () => void;
}

const SPLASH_TEXTS = [
  "Now with real Delta-V!",
  "Don't dig straight down into cryogenic LOX!",
  "100% Voxel Flight Certified!",
  "TWR must exceed 1.0!",
  "NASA Space Apps 2026!",
  "Watch out for Max-Q!",
  "Kerbal-approved physics!",
  "To the Moon, Mars & Europa!",
  "Powered by WebGL & Next.js!",
  "Artemis, Falcon 9 & Ariane 5!",
];

export function MinecraftMainMenu({
  activeMissionKey,
  activeMission,
  timeOfDay,
  onEnterLaunchComplex,
  onSelectMission,
  onCycleTime,
  onReplayStory,
  onViewOrbitalTrajectory,
}: MinecraftMainMenuProps) {
  const [splashText, setSplashText] = useState(SPLASH_TEXTS[0]);
  const [showMissionSelectModal, setShowMissionSelectModal] = useState(false);
  const [showControlsModal, setShowControlsModal] = useState(false);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * SPLASH_TEXTS.length);
    setSplashText(SPLASH_TEXTS[randomIdx]);
  }, []);

  const handleButtonClick = (action: () => void) => {
    try {
      soundEngine.playUiClick();
    } catch { }
    action();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between items-center py-8 px-4 select-none pointer-events-auto font-mono">
      {/* Dark Vignette Overlay over the 3D Spaceport */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-slate-950/40 to-black/75 pointer-events-none" />

      {/* Top Header / Title Section */}
      <div className="relative z-10 flex flex-col items-center mt-2 sm:mt-6">
        {/* NASA Space Apps Agency Pill */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded shadow tracking-widest uppercase font-mono">
            NASA SPACE APPS CHALLENGE 2026
          </span>
          <span className="bg-sky-950/80 border border-sky-600/60 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
            3D AEROSPACE SYSTEMS VAB
          </span>
        </div>

        {/* Iconic Minecraft 3D Pixel Logo */}
        <div className="relative flex flex-col items-center">
          <div className="text-3xl sm:text-5xl md:text-6xl font-black tracking-widest font-pixel text-slate-200 drop-shadow-[0_6px_0_#1e293b] text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-slate-300 to-slate-400">
              SPACECRAFT
            </span>
          </div>
          <div className="text-xs sm:text-sm md:text-base font-pixel text-sky-400 tracking-[0.25em] uppercase font-bold mt-1.5 drop-shadow-[0_2px_0_#000]">
            SPACE MISSION EDITION
          </div>

          {/* Yellow Bouncing Splash Text */}
          <div className="absolute -bottom-5 sm:-bottom-6 right-[-20px] sm:right-[-40px] rotate-[-18deg] animate-pulse z-20 pointer-events-none">
            <span className="text-yellow-300 text-xs sm:text-sm font-pixel font-bold drop-shadow-[0_2px_0_#000] px-2 py-0.5 whitespace-nowrap">
              {splashText}
            </span>
          </div>
        </div>
      </div>

      {/* Center Main Minecraft Buttons */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[480px] gap-3 my-auto">
        {/* Button 1: ENTER LAUNCH COMPLEX (Primary) */}
        <button
          onClick={() => handleButtonClick(onEnterLaunchComplex)}
          className="w-full group relative bg-[#4a5568] hover:bg-[#2b6cb0] active:translate-y-0.5 text-white py-3.5 px-6 border-t-[3px] border-l-[3px] border-white/60 border-b-[4px] border-r-[4px] border-black/80 rounded-none shadow-[0_6px_0_rgba(0,0,0,0.5)] transition-all flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-2.5 font-pixel text-xs sm:text-sm tracking-wider uppercase group-hover:text-yellow-300">
            <Rocket className="w-4 h-4 text-emerald-400 group-hover:text-yellow-300 transition-colors" />
            <span>ENTER LAUNCH COMPLEX</span>
          </div>
          <span className="text-[10px] text-slate-300 font-mono tracking-wide mt-0.5">
            Begin Mission Briefing & Enter VAB
          </span>
        </button>

        {/* Button 2: SELECT MISSION */}
        <button
          onClick={() =>
            handleButtonClick(() => setShowMissionSelectModal(true))
          }
          className="w-full group relative bg-[#4a5568] hover:bg-[#2b6cb0] active:translate-y-0.5 text-white py-3 px-6 border-t-[3px] border-l-[3px] border-white/60 border-b-[4px] border-r-[4px] border-black/80 rounded-none shadow-[0_6px_0_rgba(0,0,0,0.5)] transition-all flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-2.5 font-pixel text-xs sm:text-sm tracking-wider uppercase group-hover:text-yellow-300">
            <Compass className="w-4 h-4 text-sky-400 group-hover:text-yellow-300 transition-colors" />
            <span>MISSION DIRECTIVES</span>
          </div>
          <span className="text-[10px] text-amber-300 font-mono tracking-wide mt-0.5">
            Active: {activeMission.name}
          </span>
        </button>

        {/* Button 3: BROWSE 3D ELEMENTS */}
        <Link
          href="/showcase"
          onClick={() => {
            try {
              soundEngine.playUiClick();
            } catch { }
          }}
          className="w-full group relative bg-[#4a5568] hover:bg-[#2b6cb0] active:translate-y-0.5 text-white py-3 px-6 border-t-[3px] border-l-[3px] border-white/60 border-b-[4px] border-r-[4px] border-black/80 rounded-none shadow-[0_6px_0_rgba(0,0,0,0.5)] transition-all flex flex-col items-center justify-center text-center"
        >
          <div className="flex items-center gap-2.5 font-pixel text-xs sm:text-sm tracking-wider uppercase group-hover:text-yellow-300">
            <Box className="w-4 h-4 text-purple-400 group-hover:text-yellow-300 transition-colors" />
            <span>BROWSE 3D ELEMENTS</span>
          </div>
          <span className="text-[10px] text-slate-300 font-mono tracking-wide mt-0.5">
            Inspect all 36+ aerospace voxel models
          </span>
        </Link>

        {/* View 3D Orbital Trajectory Button */}
        {onViewOrbitalTrajectory && (
          <button
            onClick={() => handleButtonClick(onViewOrbitalTrajectory)}
            className="w-full bg-[#1e293b] hover:bg-[#334155] text-sky-300 py-2.5 px-4 border-t-2 border-l-2 border-sky-400/50 border-b-[3px] border-r-[3px] border-black/70 rounded-none shadow-md flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all hover:scale-[1.01]"
          >
            <Orbit className="w-4 h-4 text-sky-400 animate-spin" />
            <span>VIEW 3D ORBITAL TRAJECTORY (SPACE VIEW)</span>
          </button>
        )}

        {/* Split Utility Buttons Row */}
        <div className="grid grid-cols-2 gap-3 w-full mt-1">
          {/* Time of Day */}
          <button
            onClick={() => handleButtonClick(onCycleTime)}
            className="group relative bg-[#374151] hover:bg-[#4b5563] text-slate-200 py-2.5 px-3 border-t-2 border-l-2 border-white/40 border-b-[3px] border-r-[3px] border-black/70 rounded-none shadow flex items-center justify-center gap-2 text-xs font-mono font-bold"
          >
            {timeOfDay === "NIGHT" ? (
              <Moon className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>TIME: {timeOfDay}</span>
          </button>

          {/* Keybinds / Controls Help */}
          <button
            onClick={() => handleButtonClick(() => setShowControlsModal(true))}
            className="group relative bg-[#374151] hover:bg-[#4b5563] text-slate-200 py-2.5 px-3 border-t-2 border-l-2 border-white/40 border-b-[3px] border-r-[3px] border-black/70 rounded-none shadow flex items-center justify-center gap-2 text-xs font-mono font-bold"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>CONTROLS & HELP</span>
          </button>
        </div>

        {/* Replay Tutorial Story */}
        <button
          onClick={() => handleButtonClick(onReplayStory)}
          className="w-full text-center text-xs text-slate-400 hover:text-sky-300 py-1.5 flex items-center justify-center gap-1.5 transition-colors font-mono"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Replay Project Architecture Story</span>
        </button>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono px-4 gap-1">
        <div>
          Minecraft: Space Mission v1.2.0 • NASA Space Apps 2026
        </div>
        <div className="text-slate-400 text-center sm:text-right">
          Real Historical Flights: SLS Block 1 • Falcon 9 • Falcon Heavy • Ariane 5
        </div>
      </div>

      {/* Mission Selector Modal (Minecraft styled) */}
      {showMissionSelectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border-2 border-sky-500 rounded-lg p-5 w-[650px] max-w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex flex-col">
                <span className="font-pixel text-xs text-sky-400 tracking-wider">
                  SELECT MISSION DIRECTIVE
                </span>
                <span className="text-xs text-slate-400 font-mono mt-0.5">
                  Choose a real-world flight assignment
                </span>
              </div>
              <button
                onClick={() => {
                  try {
                    soundEngine.playUiClick();
                  } catch { }
                  setShowMissionSelectModal(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {Object.entries(MISSIONS).map(([key, m]) => {
                const isSelected = key === activeMissionKey;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      handleButtonClick(() => {
                        onSelectMission(key);
                        setShowMissionSelectModal(false);
                      });
                    }}
                    className={`p-3.5 rounded border text-left transition-all flex flex-col gap-1.5 ${isSelected
                        ? "bg-sky-950/80 border-sky-400 shadow-md shadow-sky-600/30"
                        : "bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-500"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        {m.name}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50">
                          <Check className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-mono">
                      <span className="text-sky-300 font-semibold">Resembles: </span>
                      {m.recommended_rocket}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono pt-1 border-t border-slate-800">
                      <span>Target: {m.target}</span>
                      <span className="text-emerald-400 font-bold">
                        Budget: ${m.budget_m}M
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Controls & Help Modal */}
      {showControlsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border-2 border-sky-500 rounded-lg p-5 w-[560px] max-w-[95vw] flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="font-pixel text-xs text-sky-400 tracking-wider">
                SPACEPORT FLIGHT CONTROLS
              </span>
              <button
                onClick={() => {
                  try {
                    soundEngine.playUiClick();
                  } catch { }
                  setShowControlsModal(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded border border-slate-800 flex flex-col gap-2 text-xs text-slate-300 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-sky-400 font-bold">MOUSE LOOK</span>
                <span>Move Mouse (Pointer Lock)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-sky-400 font-bold">PLACE COMPONENT</span>
                <span>RIGHT-CLICK</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-sky-400 font-bold">DISASSEMBLE BLOCK</span>
                <span>LEFT-CLICK</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-sky-400 font-bold">FLY AROUND SPACEPORT</span>
                <span>W, A, S, D</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-sky-400 font-bold">ASCEND / DESCEND</span>
                <span>SPACE / SHIFT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-sky-400 font-bold">SELECT HOTBAR SLOT</span>
                <span>Keys 1-9 or MOUSE SCROLL</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-sky-400 font-bold">COMPONENT INVENTORY</span>
                <span>Press &apos;E&apos;</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-sky-400 font-bold">TOGGLE FAIRING CUTAWAY</span>
                <span>Press &apos;X&apos;</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-sky-400 font-bold">ROCKET / SATELLITE VIEW</span>
                <span>Press &apos;V&apos;</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-sky-400 font-bold">BLUEPRINT GUIDE</span>
                <span>Press &apos;B&apos;</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-sky-400 font-bold">LAUNCH REVIEW / PAUSE</span>
                <span>&apos;L&apos; for Launch | &apos;ESC&apos; for Menu</span>
              </div>
            </div>

            <button
              onClick={() => {
                try {
                  soundEngine.playUiClick();
                } catch { }
                setShowControlsModal(false);
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded text-xs transition-colors"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
