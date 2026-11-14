"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import {
  Rocket,
  Coins,
  Weight,
  Zap,
  Flame,
  Radio,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
} from "lucide-react";

export function TelemetryHud() {
  const {
    telemetry,
    activeMission,
    soundEnabled,
    setSoundEnabled,
    loadPreset,
    clearGrid,
  } = useGame();

  const budgetPct = Math.min(
    Math.max((telemetry.budget_xp / activeMission.initialBudget) * 100, 0),
    100
  );

  return (
    <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Brand & Mission Identity */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
              <Rocket className="h-6 w-6 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  NASA Space Apps 2026
                </span>
                <span className="text-[10px] font-mono text-slate-400">CubeSat VAB v2.5</span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Space Mission Design Game
                <span className="text-xs font-normal text-slate-400 font-mono hidden md:inline">
                  (CML-1 Systems Engineering)
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Presets & Audio Toggle (Mobile/Desktop) */}
          <div className="flex items-center gap-1.5 sm:ml-auto xl:ml-0 font-mono text-xs">
            <a
              href="/minecraft.html"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold border border-emerald-400 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <span>⛏️ 3D Minecraft View</span>
            </a>
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => loadPreset("balanced")}
                className="px-2 py-1 rounded text-[11px] text-slate-300 hover:text-cyan-300 hover:bg-slate-850 transition-colors flex items-center gap-1"
                title="Load Balanced Lunar Point Design"
              >
                <Sparkles className="h-3 w-3 text-cyan-400" /> Balanced
              </button>
              <button
                onClick={() => loadPreset("science")}
                className="px-2 py-1 rounded text-[11px] text-slate-300 hover:text-purple-300 hover:bg-slate-850 transition-colors"
                title="Load Heavy Science Configuration"
              >
                Science
              </button>
              <button
                onClick={() => loadPreset("minimal")}
                className="px-2 py-1 rounded text-[11px] text-slate-300 hover:text-amber-300 hover:bg-slate-850 transition-colors"
                title="Load Minimal Flight Configuration"
              >
                Minimal
              </button>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? "border-cyan-800 bg-cyan-950/50 text-cyan-300"
                  : "border-slate-800 bg-slate-900 text-slate-500"
              }`}
              title={soundEnabled ? "Mute Mission SFX" : "Enable Mission SFX"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Real-Time Live Telemetry HUD Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 font-mono text-xs">
          {/* Budget Gauge */}
          <div
            className={`px-3 py-2 rounded-lg border flex flex-col justify-between transition-all ${
              telemetry.budget_xp < 0
                ? "bg-rose-950/50 border-rose-500/80 text-rose-300 shadow-md shadow-rose-950/40"
                : "bg-slate-900/90 border-slate-800 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Coins className="h-3 w-3 text-amber-400" /> BUDGET
              </span>
              <span>{telemetry.budget_xp}/{activeMission.initialBudget} XP</span>
            </div>
            <div className="text-sm font-bold mt-0.5">
              {telemetry.budget_xp >= 0 ? `${telemetry.budget_xp} XP` : "OVERBUDGET"}
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  telemetry.budget_xp < 0 ? "bg-rose-500" : "bg-amber-400"
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>

          {/* Mass Gauge */}
          <div className="px-3 py-2 rounded-lg border bg-slate-900/90 border-slate-800 text-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Weight className="h-3 w-3 text-blue-400" /> TOTAL MASS
              </span>
              <span>{telemetry.total_mass_kg} kg</span>
            </div>
            <div className="text-sm font-bold mt-0.5">{telemetry.total_mass_kg} kg</div>
            <div className="text-[10px] text-slate-400">
              Min Lift: <span className="text-slate-300">{telemetry.minRequiredThrust} kN</span>
            </div>
          </div>

          {/* Power Gauge */}
          <div
            className={`px-3 py-2 rounded-lg border flex flex-col justify-between transition-all ${
              telemetry.net_power_watts < 0
                ? "bg-rose-950/50 border-rose-500/80 text-rose-300 shadow-md shadow-rose-950/40"
                : "bg-slate-900/90 border-slate-800 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Zap className="h-3 w-3 text-yellow-400" /> NET POWER
              </span>
              <span>{telemetry.net_power_watts > 0 ? `+${telemetry.net_power_watts}` : telemetry.net_power_watts} W</span>
            </div>
            <div className="text-sm font-bold mt-0.5">
              {telemetry.net_power_watts >= 0 ? (
                <span className="text-emerald-400">+{telemetry.net_power_watts} W</span>
              ) : (
                <span className="text-rose-400">{telemetry.net_power_watts} W</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              {telemetry.eclipseReady ? (
                <span className="text-emerald-400 font-medium">✓ Eclipse Buffered</span>
              ) : (
                <span className="text-amber-400 font-medium">⚠ Battery Required</span>
              )}
            </div>
          </div>

          {/* Thrust Gauge */}
          <div
            className={`px-3 py-2 rounded-lg border flex flex-col justify-between transition-all ${
              telemetry.total_thrust_kn < telemetry.minRequiredThrust
                ? "bg-rose-950/50 border-rose-500/80 text-rose-300 shadow-md shadow-rose-950/40"
                : "bg-slate-900/90 border-slate-800 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Flame className="h-3 w-3 text-rose-400" /> THRUST
              </span>
              <span>{telemetry.total_thrust_kn} kN</span>
            </div>
            <div className="text-sm font-bold mt-0.5">{telemetry.total_thrust_kn} kN</div>
            <div className="text-[10px] text-slate-400">
              TWR: <span className={telemetry.twr >= 1 ? "text-emerald-400 font-bold" : "text-rose-400"}>{telemetry.twr}</span>
            </div>
          </div>

          {/* Comms / Science Downlink */}
          <div
            className={`px-3 py-2 rounded-lg border flex flex-col justify-between transition-all ${
              telemetry.net_data_mbps > 0
                ? "bg-amber-950/50 border-amber-500/80 text-amber-300 shadow-md shadow-amber-950/40"
                : "bg-slate-900/90 border-slate-800 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Radio className="h-3 w-3 text-cyan-400" /> DATA COMMS
              </span>
              <span>{telemetry.net_data_mbps} MBps</span>
            </div>
            <div className="text-sm font-bold mt-0.5">
              {telemetry.net_data_mbps <= 0 ? (
                <span className="text-emerald-400">BALANCED</span>
              ) : (
                <span className="text-amber-400">OVERFLOW</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              {telemetry.payloadCount} Payload / {telemetry.antennaCount} Ant
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
