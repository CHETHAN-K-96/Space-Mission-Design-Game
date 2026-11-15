"use client";

import React, { useEffect, useState } from "react";
import { soundEngine } from "../../engine/minecraft/SoundEngine";
import { Sparkles, Terminal } from "lucide-react";

interface GameInitLoadingProps {
  onComplete: () => void;
}

const LOADING_STEPS = [
  "Loading terrain & Launch Complex 39B...",
  "Reticulating rocket nozzles & gimbal actuators...",
  "Loading cryogenic RP-1 & Liquid Oxygen tanks...",
  "Calibrating 3-axis reaction wheels & star trackers...",
  "Generating VAB mobile gantry physics...",
  "Pre-heating RS-25 hydrolox combustion chambers...",
  "Connecting to NASA Mission Control telemetry link...",
  "Polishing triple-junction GaAs solar wings...",
  "Spawning aerospace flight engineers...",
  "Aerospace Voxel Simulator 100% Nominal!",
];

export function GameInitLoading({ onComplete }: GameInitLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const totalDuration = 2400; // ms
    const intervalTime = 30; // ms
    const stepIncrement = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + stepIncrement;
        if (next >= 100) {
          clearInterval(timer);
          try {
            soundEngine.playUiChirp();
          } catch { }
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const step = Math.min(
      Math.floor((progress / 100) * LOADING_STEPS.length),
      LOADING_STEPS.length - 1
    );
    setStepIndex(step);
  }, [progress]);

  const handleSkip = () => {
    try {
      soundEngine.playUiClick();
    } catch { }
    onComplete();
  };

  return (
    <div
      onClick={handleSkip}
      className="fixed inset-0 z-[100] bg-[#c41525] flex flex-col items-center justify-center p-6 select-none cursor-pointer overflow-hidden font-pixel"
      style={{
        backgroundImage:
          "radial-gradient(circle at center, #ef323d 0%, #a8101e 75%, #7a0c16 100%)",
      }}
    >
      {/* Background Pixel Scanlines Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px)",
          backgroundSize: "100% 4px",
        }}
      />

      <div className="relative flex flex-col items-center max-w-xl w-full text-center z-10">
        {/* Iconic White Pixelated Box Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="border-[5px] border-white px-8 py-5 shadow-[0_8px_0_rgba(0,0,0,0.35)] bg-[#c41525]/80 flex flex-col items-center gap-1">
            <span className="text-white text-2xl sm:text-4xl tracking-widest font-black uppercase drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
              HighFive
            </span>
            <span className="text-[10px] sm:text-xs text-white/90 tracking-[0.3em] font-bold uppercase">
              STUDIOS
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-white/80 text-[10px] sm:text-[11px] uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>NASA Space Apps Edition • Aerospace VAB</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-xl sm:text-2xl text-white font-extrabold tracking-wide drop-shadow-[0_3px_0_#000]">
            SPACECRAFT: SPACE MISSION
          </h1>
          <p className="text-[9px] sm:text-[10px] text-white/70 font-mono tracking-widest mt-1">
            INITIALIZING 3D SYSTEMS ARCHITECTURE...
          </p>
        </div>

        {/* Minecraft Style Loading Bar */}
        <div className="w-full max-w-md flex flex-col gap-2">
          {/* Outer Border Frame */}
          <div className="w-full h-7 bg-[#240306] border-[3px] border-white p-0.5 shadow-[0_5px_0_rgba(0,0,0,0.4)] relative">
            {/* Progress Fill */}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-75 relative"
              style={{ width: `${progress}%` }}
            >
              {/* Highlight Bevel */}
              <div className="absolute inset-x-0 top-0 h-1 bg-white/40" />
            </div>
          </div>

          {/* Status Text and Percentage */}
          <div className="flex items-center justify-between text-[10px] text-white/90 font-mono mt-1 px-1">
            <div className="flex items-center gap-1.5 truncate max-w-[80%] text-left">
              <Terminal className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span className="truncate">{LOADING_STEPS[stepIndex]}</span>
            </div>
            <span className="font-pixel text-[11px] text-yellow-300 font-bold shrink-0">
              {Math.floor(progress)}%
            </span>
          </div>
        </div>

        {/* Bottom Hint */}
        <div className="mt-12 text-[10px] text-white/60 tracking-wider font-mono animate-pulse">
          Click anywhere or press any key to skip intro
        </div>
      </div>
    </div>
  );
}
