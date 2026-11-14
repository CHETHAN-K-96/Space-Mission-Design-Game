"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import { MISSIONS } from "../data/missions";
import {
  Compass,
  Layers,
  ChevronDown,
  Info,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export function MissionBriefing() {
  const { activeMission, selectMission } = useGame();

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
                {m.name} ({m.target})
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
            NASA MDL Baseline Constraints
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Budget Limit:</span>
            <span className="text-amber-400 font-bold">${activeMission.initialBudget}M</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Min Thrust (Exit LEO):</span>
            <span className="text-rose-400 font-bold">&gt;= {activeMission.minThrustKn} kN</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Power Net Margin:</span>
            <span className="text-emerald-400 font-bold">&gt;= 0 W (No Brownout)</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Eclipse Buffer:</span>
            <span className="text-purple-400 font-bold">
              &gt;= {activeMission.requiredBatteryCount} Battery Block(s)
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Payload Downlink:</span>
            <span className="text-cyan-400 font-bold">
              {activeMission.minDataDelivered ? "High-Gain Antenna Required" : "Recommended"}
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
          <BookOpen className="h-3.5 w-3.5" /> CubeSat 101 Standard
        </div>
        <p className="text-[11px] leading-relaxed font-sans text-slate-300">
          In actual NASA CubeSat development (CSLI Program), spacecraft are built from standardized 1U form-factor blocks (10cm x 10cm x 10cm).
          Every component placed represents a physical mass and electrical load trade-off that determines orbit lifetime.
        </p>
      </div>
    </div>
  );
}
