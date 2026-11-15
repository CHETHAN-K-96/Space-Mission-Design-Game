"use client";

import React, { useState, useEffect } from "react";
import { soundEngine } from "../../engine/minecraft/SoundEngine";
import {
  ChevronRight,
  ChevronLeft,
  FastForward,
  Radio,
  Rocket,
  CheckCircle2,
  Cpu,
  Sparkles,
  Wifi,
} from "lucide-react";

interface ProjectStoryIntroProps {
  onComplete: () => void;
}

const STORY_SENTENCES = [
  "Welcome to the NASA Space Mission Design Game, an interactive 3D voxel simulator for aerospace systems engineering.",
  "You are appointed as the Lead Flight Director and Chief Systems Architect at NASA's orbital Launch Complex.",
  "Instead of studying static documents or complex spreadsheets, you physically architect, stage, and fly orbital vehicles block by block.",
  "Every single block corresponds to genuine aerospace hardware—from RS-25 cryogenic engines and Merlin clusters to deployable solar wings and deep space spectrometers.",
  "You must balance real engineering trade-offs: optimize mass against budget, manage electrical power grids, and verify thrust-to-weight ratios (TWR > 1.0) to escape Earth's gravity well.",
  "Your creations are flight-tested against authentic historical aerospace missions—simulating liftoff acoustics, Max-Q aerodynamic pressure, booster staging, and orbital insertion.",
  "Prepare to enter the launch facility, choose your mission, and engineer humanity's next giant leap into the cosmos!",
];

export function ProjectStoryIntro({ onComplete }: ProjectStoryIntroProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const handleNext = () => {
    try {
      soundEngine.playUiClick();
    } catch {}
    if (currentIdx < STORY_SENTENCES.length - 1) {
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
    <div className="fixed inset-0 z-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/60 via-slate-950/85 to-black flex flex-col justify-end p-3 sm:p-6 select-none font-mono overflow-hidden">
      {/* Background Animated Starlight / Scanlines Ambiance */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(56, 189, 248, 0.15) 0px, rgba(56, 189, 248, 0.15) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Top Banner Holo-Badge */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-slate-900/90 border border-sky-500/40 px-5 py-1.5 rounded-full text-xs text-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.3)] backdrop-blur-md">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
        <span className="font-bold tracking-widest uppercase text-[11px] text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-sky-400">
          DEEP SPACE NETWORK • INCOMING TRANSMISSION
        </span>
      </div>

      {/* ========================================================================= */}
      {/* TACTICAL SCI-FI FLIGHT TERMINAL CHASSIS                                 */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-4xl mx-auto backdrop-blur-xl">
        {/* Exterior Neon Glow Underlay */}
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/30 via-indigo-500/20 to-teal-500/30 rounded-2xl blur-lg opacity-75" />

        <div className="relative bg-slate-950/95 border border-sky-500/50 shadow-[0_0_50px_rgba(14,165,233,0.35)] rounded-2xl p-5 sm:p-7 flex flex-col gap-4 overflow-hidden">
          {/* Cybernetic Corner Brackets */}
          <div className="pointer-events-none absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-sky-400" />
          <div className="pointer-events-none absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-sky-400" />
          <div className="pointer-events-none absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-sky-400" />
          <div className="pointer-events-none absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-sky-400" />

          {/* Decorative Coordinate Watermark */}
          <div className="pointer-events-none absolute right-4 bottom-2 text-[9px] text-sky-500/30 tracking-widest uppercase font-mono">
            SYS.ID // 0x7E4-NASA • LAT 28.5721°N
          </div>

          {/* Header Row: Radio Audio Visualizer & Transmitter Stats */}
          <div className="flex items-center justify-between border-b border-sky-900/60 pb-3">
            <div className="flex items-center gap-3">
              {/* Pulsing Transmitter Beacon */}
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600/30 to-indigo-700/30 border border-sky-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                <Rocket className="w-5 h-5 text-sky-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950 animate-ping" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                    DSN LINK LIVE
                  </span>
                  <span className="text-xs text-slate-200 font-bold tracking-wide">
                    NASA FLIGHT DIRECTOR DISPATCH
                  </span>
                </div>
                {/* Audio Equalizer Simulation */}
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-2.5 w-1 bg-sky-400 rounded animate-[pulse_0.6s_ease-in-out_infinite]" />
                  <div className="h-4 w-1 bg-sky-300 rounded animate-[pulse_0.9s_ease-in-out_infinite]" />
                  <div className="h-1.5 w-1 bg-sky-500 rounded animate-[pulse_0.4s_ease-in-out_infinite]" />
                  <div className="h-3.5 w-1 bg-emerald-400 rounded animate-[pulse_0.7s_ease-in-out_infinite]" />
                  <div className="h-2 w-1 bg-sky-400 rounded animate-[pulse_0.5s_ease-in-out_infinite]" />
                  <span className="text-[10px] text-sky-400/80 font-mono ml-2 tracking-wider">
                    FREQ: 2.215 GHz S-BAND [AUDIO UPLINK CLEAR]
                  </span>
                </div>
              </div>
            </div>

            {/* Stage Counter & Skip Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-600/50 px-3 py-1 rounded-lg shadow-inner">
                <Cpu className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span className="text-xs font-bold text-sky-300 tracking-wider">
                  DISPATCH {String(currentIdx + 1).padStart(2, "0")} /{" "}
                  {String(STORY_SENTENCES.length).padStart(2, "0")}
                </span>
              </div>

              <button
                onClick={handleSkip}
                className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors border border-slate-700/80 hover:border-amber-500/50 group"
                title="Skip briefing and enter Main Menu (Key: ESC)"
              >
                <FastForward className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                <span className="font-semibold">SKIP INTRO [ESC]</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE SINGLE SENTENCE TRANSMISSION DISPLAY                                 */}
          {/* ========================================================================= */}
          <div className="relative min-h-[88px] flex items-center px-3 py-2 bg-slate-900/60 border border-sky-900/40 rounded-xl shadow-inner">
            {/* Glowing Accent Bar */}
            <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-gradient-to-b from-sky-400 via-indigo-400 to-teal-400 rounded-r shadow-[0_0_10px_rgba(56,189,248,0.8)]" />

            <div className="pl-3.5 flex items-start gap-2">
              <span className="text-sky-400 font-bold text-xl leading-none mt-0.5 animate-pulse">
                &gt;
              </span>
              <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                {STORY_SENTENCES[currentIdx]}
                <span className="inline-block w-2.5 h-4 ml-1.5 bg-sky-400 align-middle animate-pulse" />
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEPPER PROGRESS CELLS & ACTION BUTTONS                                   */}
          {/* ========================================================================= */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-sky-950">
            {/* Segmented Aerospace Fuel Cells (Progress Indicators) */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {STORY_SENTENCES.map((_, idx) => (
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
                      ? "w-10 bg-gradient-to-r from-sky-400 to-teal-300 shadow-[0_0_12px_rgba(56,189,248,0.9)]"
                      : idx < currentIdx
                      ? "w-5 bg-sky-700 hover:bg-sky-500"
                      : "w-3 bg-slate-800 hover:bg-slate-700"
                  }`}
                  title={`Jump to transmission ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] text-sky-400/80 ml-2 font-mono font-bold">
                {Math.round(((currentIdx + 1) / STORY_SENTENCES.length) * 100)}%
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
                className="relative group px-5 py-2 rounded-lg bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-500 hover:from-sky-500 hover:via-indigo-500 hover:to-teal-400 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.65)] hover:scale-105 active:scale-95"
              >
                <span>
                  {currentIdx === STORY_SENTENCES.length - 1
                    ? "COMMENCE ARCHITECTURE [ENTER]"
                    : "NEXT TRANSMISSION [SPACE]"}
                </span>
                {currentIdx === STORY_SENTENCES.length - 1 ? (
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
