"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import {
  Rocket,
  DollarSign,
  Weight,
  Zap,
  Flame,
  Radio,
  Volume2,
  VolumeX,
  Compass,
  Database,
  BookOpen,
} from "lucide-react";

export function TelemetryHud() {
  const {
    telemetry,
    difficulty,
    setDifficulty,
    soundEnabled,
    setSoundEnabled,
    setShowDatasetModal,
    setShowGuideModal,
  } = useGame();

  const budgetPct = Math.min(
    Math.max((telemetry.spent_cost_m / telemetry.budget_cap_m) * 100, 0),
    100
  );

  return (
    <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Brand & Mission Identity */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
              <Rocket className="h-5 w-5 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  NASA SPACE APPS 2026
                </span>
                <span className="text-[10px] font-mono text-slate-400">Next.js Systems Workbench</span>
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-wide text-white uppercase flex items-center gap-2">
                Space Mission Design Game
              </h1>
            </div>
          </div>

          {/* Action Links & Audio Toggle */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setShowDatasetModal(true)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Database className="h-3.5 w-3.5" />
              <span>NASA Dataset</span>
            </button>

            <button
              onClick={() => setShowGuideModal(true)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Guide</span>
            </button>

            <a
              href="/minecraft.html"
              className="px-2.5 py-1 rounded bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-cyan-500/20"
            >
              3D Spaceport
            </a>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title={soundEnabled ? "Mute SFX" : "Unmute SFX"}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> : <VolumeX className="h-3.5 w-3.5 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Difficulty Flow Controller */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-xs">
          <span className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1">
            <Compass className="h-3 w-3" /> Flow Mode:
          </span>
          <button
            onClick={() => setDifficulty("easy")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
              difficulty === "easy"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            EASY
          </button>
          <button
            onClick={() => setDifficulty("normal")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
              difficulty === "normal"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            NORMAL
          </button>
          <button
            onClick={() => setDifficulty("hard")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
              difficulty === "hard"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            HARD
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="max-w-7xl mx-auto mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 font-mono">
        {/* 1. Real Budget ($M) */}
        <div
          className={`p-2.5 rounded-xl border transition-colors ${
            telemetry.spent_cost_m > telemetry.budget_cap_m
              ? "border-rose-500/80 bg-rose-950/30"
              : "border-slate-800 bg-slate-950/60"
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-cyan-400" /> BUDGET
            </span>
            <span className="text-slate-300">CAP: ${telemetry.budget_cap_m.toFixed(1)}M</span>
          </div>
          <div className="text-sm font-bold text-white">
            ${telemetry.spent_cost_m.toFixed(1)}M
          </div>
          <div className="w-full bg-slate-800/80 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                telemetry.spent_cost_m > telemetry.budget_cap_m ? "bg-rose-500" : "bg-cyan-400"
              }`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>

        {/* 2. Total Mass */}
        <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Weight className="h-3 w-3 text-purple-400" /> MASS
            </span>
            <span>KG</span>
          </div>
          <div className="text-sm font-bold text-white">
            {telemetry.total_mass_kg} kg
          </div>
          <div className="w-full bg-slate-800/80 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-purple-400 transition-all duration-300"
              style={{ width: `${Math.min((telemetry.total_mass_kg / 120) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* 3. EPS Net Power */}
        <div
          className={`p-2.5 rounded-xl border transition-colors ${
            telemetry.net_power_watts < 0 && telemetry.total_mass_kg > 0
              ? "border-rose-500/80 bg-rose-950/30"
              : "border-slate-800 bg-slate-950/60"
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" /> EPS POWER
            </span>
            <span className="text-slate-300">+{telemetry.power_generation_w}W</span>
          </div>
          <div className="text-sm font-bold text-white">
            {telemetry.net_power_watts >= 0 ? `+${telemetry.net_power_watts}` : telemetry.net_power_watts} W
          </div>
          <div className="w-full bg-slate-800/80 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                telemetry.net_power_watts >= 0 ? "bg-emerald-400" : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(Math.max(telemetry.net_power_watts + 50, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* 4. Eclipse Battery Storage */}
        <div
          className={`p-2.5 rounded-xl border transition-colors ${
            !telemetry.eclipseReady && telemetry.total_mass_kg > 0
              ? "border-rose-500/80 bg-rose-950/30"
              : "border-slate-800 bg-slate-950/60"
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-emerald-400" /> ECLIPSE
            </span>
            <span>MINUTES</span>
          </div>
          <div className="text-sm font-bold text-white">
            {telemetry.eclipseMinutes} / 35 min
          </div>
          <div className="w-full bg-slate-800/80 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min((telemetry.eclipseMinutes / 35) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* 5. Propulsion & TWR */}
        <div
          className={`p-2.5 rounded-xl border transition-colors ${
            !telemetry.thrustReady && telemetry.total_mass_kg > 0
              ? "border-rose-500/80 bg-rose-950/30"
              : "border-slate-800 bg-slate-950/60"
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-400" /> TWR LIFT
            </span>
            <span className="text-slate-300">{telemetry.twr.toFixed(2)}x</span>
          </div>
          <div className="text-sm font-bold text-white">
            {telemetry.total_thrust_kn} kN
          </div>
          <div className="w-full bg-slate-800/80 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-orange-400 transition-all duration-300"
              style={{ width: `${Math.min((telemetry.total_thrust_kn / 150) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* 6. Comms Downlink Bandwidth */}
        <div
          className={`p-2.5 rounded-xl border transition-colors ${
            !telemetry.commsBalanced
              ? "border-rose-500/80 bg-rose-950/30"
              : "border-slate-800 bg-slate-950/60"
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Radio className="h-3 w-3 text-cyan-400" /> COMMS
            </span>
            <span className="text-slate-300">
              {telemetry.net_data_mbps > 0 ? `+${telemetry.net_data_mbps}` : telemetry.net_data_mbps} MBps
            </span>
          </div>
          <div className="text-sm font-bold text-white">
            {telemetry.commsBalanced ? "LINK CLOSED" : "DEFICIT"}
          </div>
          <div className="w-full bg-slate-800/80 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${Math.min(Math.max(50 - telemetry.net_data_mbps, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
