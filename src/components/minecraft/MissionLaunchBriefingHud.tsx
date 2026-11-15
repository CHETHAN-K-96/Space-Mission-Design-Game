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
  Orbit,
  Radio,
  Compass,
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
    briefingData?.sentences || [
      `This mission faithfully recreates the real-life flight of ${mission.name} (${mission.counterpart}).`,
      `The vehicle you will construct closely resembles the ${
        mission.recommended_rocket || "certified aerospace launch vehicle"
      }.`,
      `Primary Scientific Objective: ${mission.scientificGoal || mission.desc}`,
      `Stage 1 Propulsion Directive: ${
        mission.stage1_desc || "Assemble the launch vehicle to achieve TWR > 1.0."
      }`,
      `Stage 2 Spacecraft Directive: ${
        mission.stage2_desc || "Integrate payload modules and power systems."
      }`,
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
    <div className="fixed inset-0 z-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/70 via-slate-950/90 to-black flex flex-col justify-end p-3 sm:p-6 select-none font-mono overflow-hidden">
      {/* Background Subtle Orbital Grid / Scanline Ambiance */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(16, 185, 129, 0.2) 0px, rgba(16, 185, 129, 0.2) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Top Banner Real-World Certification Tag */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-slate-900/90 border border-emerald-500/40 px-5 py-1.5 rounded-full text-xs text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] backdrop-blur-md">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="font-bold tracking-widest uppercase text-[11px] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
          GENUINE AEROSPACE MISSION DIRECTIVE • FLIGHT SPECIFICATION
        </span>
      </div>

      {/* ========================================================================= */}
      {/* TACTICAL MISSION CONTROL LAUNCH CONSOLE                                   */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-4xl mx-auto backdrop-blur-xl">
        {/* Exterior Neon Glow Underlay */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-sky-500/30 rounded-2xl blur-lg opacity-75" />

        <div className="relative bg-slate-950/95 border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.35)] rounded-2xl p-5 sm:p-7 flex flex-col gap-4 overflow-hidden">
          {/* Cybernetic Corner Reticle Brackets */}
          <div className="pointer-events-none absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
          <div className="pointer-events-none absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
          <div className="pointer-events-none absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
          <div className="pointer-events-none absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

          {/* Decorative Mission Pad Coordinates */}
          <div className="pointer-events-none absolute right-4 bottom-2 text-[9px] text-emerald-500/30 tracking-widest uppercase font-mono">
            PAD LC-39B // VAB BAY-2 • CAPCOM ACTIVE
          </div>

          {/* Header Row: Agency Emblem, Mission Profile & Radio Comm Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950/80 pb-3">
            <div className="flex items-center gap-3">
              {/* Mission Patch / Rocket Icon */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-950 to-teal-900 border border-emerald-500/60 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Rocket className="w-5 h-5 text-emerald-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950 animate-ping" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded tracking-widest uppercase shadow-sm">
                    {briefingData?.agency || "NASA JPL"}
                  </span>
                  <span className="text-sm text-white font-extrabold tracking-wide">
                    {mission.name}
                  </span>
                  <span className="text-[10px] text-sky-400 font-semibold bg-sky-950/70 border border-sky-600/40 px-2 py-0.5 rounded flex items-center gap-1">
                    <Orbit className="w-3 h-3 text-sky-400" />
                    {mission.target}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-emerald-300 font-semibold">
                    Launch Vehicle:{" "}
                    <span className="text-white">
                      {briefingData?.rocketName || mission.recommended_rocket}
                    </span>
                  </span>
                  {/* Comm Voice Visualizer */}
                  <div className="flex items-center gap-0.5 ml-2">
                    <div className="h-2 w-0.5 bg-emerald-400 rounded animate-[pulse_0.6s_ease-in-out_infinite]" />
                    <div className="h-3 w-0.5 bg-emerald-300 rounded animate-[pulse_0.8s_ease-in-out_infinite]" />
                    <div className="h-1.5 w-0.5 bg-teal-400 rounded animate-[pulse_0.4s_ease-in-out_infinite]" />
                    <div className="h-2.5 w-0.5 bg-emerald-400 rounded animate-[pulse_0.5s_ease-in-out_infinite]" />
                    <span className="text-[9px] text-emerald-400/80 font-mono ml-1.5 uppercase">
                      COMMS: FLIGHT DIRECTOR VOICE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Directive Counter & Skip Button */}
            <div className="flex items-center gap-2.5 justify-end">
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-600/50 px-3 py-1 rounded-lg shadow-inner">
                DIRECTIVE {String(currentIdx + 1).padStart(2, "0")} /{" "}
                {String(sentences.length).padStart(2, "0")}
              </span>

              <button
                onClick={handleSkip}
                className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors border border-slate-700/80 hover:border-amber-500/50 group"
                title="Skip briefing and enter Launch Complex (Key: ESC)"
              >
                <FastForward className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                <span className="font-semibold">SKIP [ESC]</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE SINGLE SENTENCE TRANSMISSION DISPLAY                                 */}
          {/* ========================================================================= */}
          <div className="relative min-h-[88px] flex items-center px-3 py-2 bg-slate-900/60 border border-emerald-900/40 rounded-xl shadow-inner">
            {/* Glowing Emerald Accent Bar */}
            <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-gradient-to-b from-emerald-400 via-teal-400 to-sky-400 rounded-r shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

            <div className="pl-3.5 flex items-start gap-2">
              <span className="text-emerald-400 font-bold text-xl leading-none mt-0.5 animate-pulse">
                &gt;
              </span>
              <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                {sentences[currentIdx]}
                <span className="inline-block w-2.5 h-4 ml-1.5 bg-emerald-400 align-middle animate-pulse" />
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEPPER PROGRESS CELLS & ACTION BUTTONS                                   */}
          {/* ========================================================================= */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-emerald-950">
            {/* Segmented Aerospace Fuel Cells (Progress Indicators) */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {sentences.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    try {
                      soundEngine.playUiClick();
                    } catch {}
                    setCurrentIdx(idx);
                  }}
                  className={`h-2.5 rounded-sm transition-all duration-300 ${
                    idx === currentIdx
                      ? "w-10 bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                      : idx < currentIdx
                      ? "w-5 bg-emerald-800 hover:bg-emerald-600"
                      : "w-3 bg-slate-800 hover:bg-slate-700"
                  }`}
                  title={`Jump to directive ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] text-emerald-400/80 ml-2 font-mono font-bold">
                {Math.round(((currentIdx + 1) / sentences.length) * 100)}%
              </span>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 hover:border-slate-500"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>PREV [←]</span>
              </button>

              <button
                onClick={handleNext}
                className="relative group px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:via-teal-500 hover:to-sky-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.65)] hover:scale-105 active:scale-95"
              >
                <span>
                  {currentIdx === sentences.length - 1
                    ? "COMMENCE ASSEMBLY (ENTER VAB) [ENTER]"
                    : "NEXT DIRECTIVE [SPACE]"}
                </span>
                {currentIdx === sentences.length - 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-bounce" />
                ) : (
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
