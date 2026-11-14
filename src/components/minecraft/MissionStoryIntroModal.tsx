"use client";

import React from "react";
import { MissionDef } from "../../engine/minecraft/types";
import {
  Rocket,
  Globe,
  Calendar,
  CloudSun,
  ShieldAlert,
  CheckCircle2,
  Play,
  X,
  Target,
  Sparkles,
  BookOpen,
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
  if (!isOpen) return null;

  const story = mission.storyline;
  const history = mission.historicalFlight;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_50px_rgba(2,132,199,0.45)] rounded-xl p-6 w-[780px] max-w-[95vw] max-h-[92vh] overflow-y-auto flex flex-col gap-4 text-left">
        {/* Header with NASA Badge */}
        <div className="flex justify-between items-start border-b border-slate-700/80 pb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest uppercase">
                {history?.agency || "NASA JPL"}
              </span>
              <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                {story?.chapterTitle || "Flight Assignment"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-0.5">
              {mission.name}
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Target: <strong className="text-slate-200">{mission.target}</strong></span>
              <span>•</span>
              <span>Budget Cap: <strong className="text-emerald-400">${mission.budget_m}M</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-1.5 rounded-lg text-xs transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Narrative Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider border-b border-slate-800/80 pb-1.5">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Mission Storyline & Strategic Context</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-200">
            {story?.narrativeIntro || mission.desc}
          </p>

          <div className="bg-sky-950/40 border border-sky-600/30 rounded-md p-3">
            <strong className="text-sky-300 text-[11px] uppercase tracking-wide block mb-1">
              Why This Mission Matters to Humanity:
            </strong>
            <p className="text-xs text-slate-300 leading-relaxed">
              {story?.whyImportant || mission.scientificGoal}
            </p>
          </div>
        </div>

        {/* Engineering Expectations / Deliverables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase">
              <Rocket className="w-3.5 h-3.5" />
              <span>Flight Engineer Deliverables:</span>
            </div>
            <ul className="flex flex-col gap-1.5 text-[11px] text-slate-300">
              {story?.engineeringDeliverables?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              )) || (
                <li>Deliver an aerodynamic multi-stage launcher within budget.</li>
              )}
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px] uppercase">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Mission Flight Constraints:</span>
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed">
              {story?.threatsAndRisks || "Aerodynamic drag, acoustic flutter during Max-Q, and electrical power balance."}
            </div>
            <div className="mt-auto pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
              <span>Required TWR: <strong>&gt;= 1.0x</strong></span>
              <span>Min Thrust: <strong>{mission.min_thrust_kn} kN</strong></span>
            </div>
          </div>
        </div>

        {/* Real-Life Historical Flight Card */}
        {history && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-2">
              <span className="text-[11px] font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Real-Life Historical Flight Record
              </span>
              <span className="text-[10px] text-slate-400">
                Vehicle: <strong className="text-slate-200">{history.rocketName}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">LAUNCH DATE</span>
                <strong className="text-white font-bold">{history.launchDate}</strong>
                <span className="text-slate-500 block text-[9px]">{history.launchTimeUTC}</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">LAUNCH SITE</span>
                <strong className="text-white font-bold truncate block">{history.pad}</strong>
                <span className="text-slate-500 block text-[9px] truncate">{history.launchSite}</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">WEATHER AT LIFTOFF</span>
                <strong className="text-white font-bold">{history.weather.tempC}°C • {history.weather.conditions}</strong>
                <span className="text-slate-500 block text-[9px]">Wind: {history.weather.windSpeedKmh} km/h {history.weather.windDirection}</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">REAL BUDGET</span>
                <strong className="text-emerald-400 font-bold">${history.realBudgetM}M USD</strong>
                <span className="text-slate-500 block text-[9px]">Historical Baseline</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            NASA Systems Engineering CML: <strong className="text-sky-400">Level 2 Feasibility</strong>
          </span>

          <button
            onClick={() => {
              onClose();
              onEnterVab();
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold text-xs px-5 py-2.5 border border-emerald-400 rounded-lg shadow-lg shadow-emerald-600/35 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>ACCEPT FLIGHT ORDERS & ENTER VAB</span>
          </button>
        </div>
      </div>
    </div>
  );
}
