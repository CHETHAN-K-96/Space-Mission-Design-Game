"use client";

import React, { useState } from "react";
import { MissionDef } from "../../engine/minecraft/types";
import {
  Rocket,
  ShieldAlert,
  CheckCircle2,
  Play,
  X,
  Target,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Gauge,
  Layers,
  Terminal,
  Compass,
} from "lucide-react";

interface MissionStoryIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: MissionDef;
  onEnterVab: () => void;
}

export function MissionStoryIntroModal({
  isOpen,
  onClose,
  mission,
  onEnterVab,
}: MissionStoryIntroModalProps) {
  const [currentLineIdx, setCurrentLineIdx] = useState(0);

  if (!isOpen) return null;

  const story = mission.storyline;
  const history = mission.historicalFlight;
  const rawLines =
    story?.storyLines && story.storyLines.length > 0
      ? story.storyLines
      : [
          story?.narrativeIntro || mission.desc,
          story?.whyImportant || mission.scientificGoal || "",
          `Your Flight Assignment: Construct the outer launcher architecture for ${mission.name} within certified flight envelopes.`,
        ].filter(Boolean);

  const activeLine = rawLines[currentLineIdx] || rawLines[0];

  const handleNext = () => {
    if (currentLineIdx < rawLines.length - 1) {
      setCurrentLineIdx((prev) => prev + 1);
    } else {
      onEnterVab();
    }
  };

  const handlePrev = () => {
    if (currentLineIdx > 0) {
      setCurrentLineIdx((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_50px_rgba(2,132,199,0.45)] rounded-xl p-5 sm:p-6 w-[820px] max-w-[95vw] max-h-[92vh] overflow-y-auto flex flex-col gap-4 text-left">
        {/* Header with Agency Badge */}
        <div className="flex justify-between items-start border-b border-slate-700/80 pb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest uppercase">
                {history?.agency || "NASA JPL"}
              </span>
              <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                {story?.chapterTitle || "Mission Directive"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-0.5">
              {mission.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Briefing"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Line-by-Line Storyline Terminal Screen */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-3 relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
            <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>FLIGHT DIRECTOR BRIEFING DISPATCH</span>
            </div>
            <div className="text-[11px] font-bold text-slate-400">
              TRANSMISSION {String(currentLineIdx + 1).padStart(2, "0")} / {String(rawLines.length).padStart(2, "0")}
            </div>
          </div>

          {/* Stepped Line Display with Typing Accent */}
          <div className="min-h-[72px] flex items-center py-2 px-1">
            <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-medium">
              <span className="text-sky-400 font-bold mr-2">&gt;</span>
              {activeLine}
            </p>
          </div>

          {/* Line Stepper Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              {rawLines.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentLineIdx(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentLineIdx
                      ? "w-8 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                      : "w-2.5 bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={`Jump to Line ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentLineIdx === 0}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-700"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>PREV</span>
              </button>
              <button
                onClick={handleNext}
                className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>{currentLineIdx === rawLines.length - 1 ? "FINISH STORY" : "NEXT LINE"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Highlighted Mission Constraints Section */}
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>CRITICAL AEROSPACE CONSTRAINTS (HARD LIMITS):</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Constraint 1: Budget */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>Budget Ceiling</span>
              </div>
              <div className="text-base font-black text-emerald-400">
                ${mission.budget_m}M
              </div>
              <div className="text-[10px] text-slate-400">
                Strict NASA financial ceiling
              </div>
            </div>

            {/* Constraint 2: Min Thrust */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Gauge className="w-3 h-3 text-orange-400" />
                <span>Min Liftoff Thrust</span>
              </div>
              <div className="text-base font-black text-orange-400">
                {mission.min_thrust_kn} kN
              </div>
              <div className="text-[10px] text-slate-400">
                TWR &gt;= 1.2 to clear pad
              </div>
            </div>

            {/* Constraint 3: Target Profile */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Target className="w-3 h-3 text-sky-400" />
                <span>Target Trajectory</span>
              </div>
              <div className="text-xs font-bold text-sky-300 truncate">
                {mission.target}
              </div>
              <div className="text-[10px] text-slate-400">
                Gravity: {mission.gravityMultiplier || 1.0}g
              </div>
            </div>

            {/* Constraint 4: Architecture */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Rocket className="w-3 h-3 text-purple-400" />
                <span>Vehicle Profile</span>
              </div>
              <div className="text-xs font-bold text-purple-300 truncate">
                {mission.recommended_rocket?.split("(")[0]?.trim() || "Launch Stack"}
              </div>
              <div className="text-[10px] text-slate-400">
                Authentic mission stack
              </div>
            </div>
          </div>
        </div>

        {/* Clear Objectives Checklist */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>MISSION OBJECTIVES &amp; DELIVERABLES CHECKLIST:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800/80">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5">Stage 1: Outer Rocket Architecture</strong>
                Stack engines, booster thrust providers (matching real proportions), core propellant tanks, and upper stage within the ${mission.budget_m}M budget.
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800/80">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5" />
              <div>
                <strong className="text-sky-300 block mb-0.5">Stage 2: Satellite Payload Slot</strong>
                Keep top payload block designated for satellite instrumentation, enclosed beneath aerodynamic nosecone fairing.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            DISMISS BRIEFING
          </button>
          <button
            onClick={onEnterVab}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold text-xs tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>ENTER SYSTEMS ENGINEERING VAB</span>
          </button>
        </div>
      </div>
    </div>
  );
}
