"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import { MISSIONS } from "../data/missions";
import {
  Compass,
  ChevronDown,
  Info,
  BookOpen,
  DollarSign,
  Flame,
  Zap,
  Battery,
  Radio,
} from "lucide-react";

export function MissionBriefing() {
  const { activeMission, selectMission, difficulty } = useGame();

  const difficultyMultiplier =
    difficulty === "easy"
      ? { budget: 1.5, thrust: 0.8 }
      : difficulty === "hard"
        ? { budget: 0.85, thrust: 1.25 }
        : { budget: 1.0, thrust: 1.0 };

  const currentBudgetM = (activeMission.baseBudgetM * difficultyMultiplier.budget).toFixed(1);
  const currentThrustKn = Math.round(activeMission.minThrustKn * difficultyMultiplier.thrust);

  return (
    <div className="space-y-4">
      {/* Mission Selector Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-bold">
            <Compass className="h-3.5 w-3.5" /> Mission Profile
          </span>
          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded font-mono font-semibold">
            {activeMission.cmlLevel}
          </span>
        </div>

        {/* Mission Select Dropdown */}
        <div className="relative mb-3">
          <select
            value={activeMission.id}
            onChange={(e) => selectMission(e.target.value)}
            className="w-full appearance-none bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
          >
            {MISSIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (${(m.baseBudgetM * difficultyMultiplier.budget).toFixed(1)}M)
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
          {activeMission.briefing}
        </p>

        {/* Engineering Constraints Table */}
        <div className="border-t border-slate-800/80 pt-3 space-y-2 font-mono text-xs">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            NASA Baseline Constraints ({difficulty.toUpperCase()})
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400 flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-cyan-400" /> Budget Ceiling:
            </span>
            <span className="text-cyan-400 font-bold">${currentBudgetM}M</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400 flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-400" /> Min Lift Thrust:
            </span>
            <span className="text-orange-400 font-bold">&gt;= {currentThrustKn} kN</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" /> Net EPS Margin:
            </span>
            <span className="text-emerald-400 font-bold">&gt;= 0 W (Sunlight)</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400 flex items-center gap-1">
              <Battery className="h-3 w-3 text-emerald-400" /> Eclipse Umbra:
            </span>
            <span className="text-purple-400 font-bold">
              &gt;= {activeMission.minBatteries} Battery Pack(s)
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Radio className="h-3 w-3 text-cyan-400" /> Telemetry Comms:
            </span>
            <span className="text-cyan-400 font-bold">
              {activeMission.requireClosedComms ? "Closed Link Mandatory" : "Recommended"}
            </span>
          </div>
        </div>

        {/* Mission Engineering Tips */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
            <Info className="h-3 w-3" /> Systems Engineering Tips:
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-400 font-sans">
            {activeMission.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-cyan-400 text-xs leading-none">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* NASA CubeSat 101 Educational Callout */}
      <div className="bg-slate-900/60 border border-slate-800/70 rounded-xl p-4 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-2 text-[11px] uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" /> Creative Design Freedom
        </div>
        <p className="text-[11px] leading-relaxed font-sans text-slate-300">
          There is no single rigid solution! You can design a lightweight electric propulsion probe, a high-thrust solid booster satellite, or a heavy multi-instrument observatory.
        </p>
      </div>
    </div>
  );
}
