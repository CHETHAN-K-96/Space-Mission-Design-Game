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
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex flex-col justify-end p-4 sm:p-8 select-none font-mono">
      {/* Top Banner Hint */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 border border-slate-700/70 px-4 py-1.5 rounded-full text-xs text-sky-300 shadow-lg">
        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="font-semibold tracking-wider uppercase text-[11px]">
          PROJECT INTRO & MISSION ARCHITECTURE TUTORIAL
        </span>
      </div>

      {/* Cinematic Dialogue Subtitle Box at Bottom of Screen */}
      <div className="w-full max-w-4xl mx-auto bg-slate-900/95 border-2 border-sky-500 shadow-[0_0_50px_rgba(2,132,199,0.45)] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600/30 border border-sky-400/50 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">
                NASA FLIGHT DIRECTOR DISPATCH
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                SYSTEMS OVERVIEW & ORIENTATION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-600/50 px-2.5 py-0.5 rounded">
              TRANSMISSION {String(currentIdx + 1).padStart(2, "0")} /{" "}
              {String(STORY_SENTENCES.length).padStart(2, "0")}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors border border-slate-700"
              title="Skip tutorial and enter main menu"
            >
              <FastForward className="w-3.5 h-3.5 text-slate-400" />
              <span>SKIP</span>
            </button>
          </div>
        </div>

        {/* The Single Sentence Display */}
        <div className="min-h-[76px] flex items-center px-2 py-1">
          <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
            <span className="text-sky-400 font-bold mr-2.5 animate-pulse">&gt;</span>
            {STORY_SENTENCES[currentIdx]}
          </p>
        </div>

        {/* Stepper Dots & Control Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {STORY_SENTENCES.map((_, idx) => (
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
                    ? "w-8 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
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
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/30 hover:scale-105"
            >
              <span>
                {currentIdx === STORY_SENTENCES.length - 1
                  ? "ENTER TITLE SCREEN"
                  : "NEXT"}
              </span>
              {currentIdx === STORY_SENTENCES.length - 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
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
