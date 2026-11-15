"use client";

import React, { useState, useEffect } from "react";
import { soundEngine } from "../../engine/minecraft/SoundEngine";
import { MissionDef } from "../../engine/minecraft/types";
import { MISSION_BRIEFINGS } from "../../data/missionBriefings";
import {
  Rocket,
  ChevronRight,
  ChevronLeft,
  FastForward,
  CheckCircle2,
  ShieldCheck,
  Target,
} from "lucide-react";

interface MissionLaunchBriefingHudProps {
  missionKey: string;
  mission: MissionDef;
  onComplete: () => void;
}

export function MissionLaunchBriefingHud({
  missionKey,
  mission,
  onComplete,
}: MissionLaunchBriefingHudProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Retrieve customized real-life briefing sentences
  const briefingData = MISSION_BRIEFINGS[missionKey];
  const sentences =
    briefingData?.sentences ||
    [
      `This mission faithfully recreates the real-life flight of ${mission.name} (${mission.counterpart}).`,
      `The vehicle you will construct closely resembles the ${mission.recommended_rocket || "certified aerospace launch vehicle"}.`,
      `Primary Scientific Objective: ${mission.scientificGoal || mission.desc}`,
      `Stage 1 Propulsion Directive: ${mission.stage1_desc || "Assemble the launch vehicle to achieve TWR > 1.0."}`,
      `Stage 2 Spacecraft Directive: ${mission.stage2_desc || "Integrate payload modules and power systems."}`,
      `Program Budget Constraint: Maximum certified cost ceiling of $${mission.budget_m}M.`,
      `Telemetry checks nominal. Flight Director, commence assembly!`,
    ];

  const handleNext = () => {
    try {
      soundEngine.playUiClick();
    } catch {}
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    try {
      soundEngine.playUiClick();
    } catch {}
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    try {
      soundEngine.playUiClick();
    } catch {}
    onComplete();
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowRight" || e.code === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.code === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIdx]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex flex-col justify-end p-4 sm:p-8 select-none font-mono">
      {/* Top Banner Tag */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 border border-emerald-500/50 px-4 py-1.5 rounded-full text-xs text-emerald-300 shadow-xl">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="font-bold tracking-wider uppercase text-[11px]">
          REAL-WORLD FLIGHT ENVELOPE BRIEFING
        </span>
      </div>

      {/* Cinematic Dialogue Subtitle Box at Bottom of Screen */}
      <div className="w-full max-w-4xl mx-auto bg-slate-900/95 border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/60 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded tracking-widest uppercase">
                  {briefingData?.agency || "NASA JPL"}
                </span>
                <span className="text-xs text-white font-bold tracking-wide">
                  {mission.name}
                </span>
              </div>
              <span className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                Resembles: {briefingData?.rocketName || mission.recommended_rocket}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-sky-400 bg-sky-950/60 border border-sky-600/50 px-2.5 py-0.5 rounded">
              DIRECTIVE {String(currentIdx + 1).padStart(2, "0")} /{" "}
              {String(sentences.length).padStart(2, "0")}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              title="Skip briefing and enter Launch Complex"
            >
              <FastForward className="w-3.5 h-3.5 text-slate-400" />
              <span>SKIP BRIEFING</span>
            </button>
          </div>
        </div>

        {/* The Single Sentence Display */}
        <div className="min-h-[76px] flex items-center px-2 py-1">
          <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
            <span className="text-emerald-400 font-bold mr-2.5 animate-pulse">&gt;</span>
            {sentences[currentIdx]}
          </p>
        </div>

        {/* Stepper Dots & Control Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {sentences.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  try {
                    soundEngine.playUiClick();
                  } catch {}
                  setCurrentIdx(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIdx
                    ? "w-8 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                    : "w-2.5 bg-slate-700 hover:bg-slate-500"
                }`}
                title={`Jump to sentence ${idx + 1}`}
              />
            ))}
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PREV</span>
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30 hover:scale-105"
            >
              <span>
                {currentIdx === sentences.length - 1
                  ? "COMMENCE ASSEMBLY (ENTER VAB)"
                  : "NEXT"}
              </span>
              {currentIdx === sentences.length - 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
