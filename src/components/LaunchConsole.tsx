"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import {
  Rocket,
  Activity,
  Coins,
  Flame,
  Zap,
  Battery,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export function LaunchConsole() {
  const { grid, telemetry, activeMission, launchMission } = useGame();

  const isBudgetOk = telemetry.budget_xp >= 0;
  const isThrustOk =
    telemetry.total_thrust_kn >= telemetry.minRequiredThrust &&
    telemetry.total_thrust_kn >= activeMission.minThrustKn &&
    telemetry.total_mass_kg > 0;
  const isPowerOk = telemetry.net_power_watts >= 0 && telemetry.solarCount > 0;
  const isBatteryOk = telemetry.eclipseReady;
  const isCommsOk = telemetry.commsBalanced;

  return (
    <div className="space-y-4">
      {/* Pre-Flight Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-cyan-400" /> Pre-Flight Diagnostics
        </h3>

        <div className="space-y-2 font-mono text-xs">
          {/* 1. Budget Constraint */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-amber-400" /> XP Budget
            </span>
            {isBudgetOk ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                <XCircle className="h-3.5 w-3.5" /> OVER
              </span>
            )}
          </div>

          {/* 2. Thrust / TWR Constraint */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-rose-400" /> TWR Lift
            </span>
            {isThrustOk ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                <XCircle className="h-3.5 w-3.5" /> STALL
              </span>
            )}
          </div>

          {/* 3. Power Bus Constraint */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-yellow-400" /> EPS Bus
            </span>
            {isPowerOk ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                <XCircle className="h-3.5 w-3.5" /> DEFICIT
              </span>
            )}
          </div>

          {/* 4. Battery Umbra Buffer */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Battery className="h-3.5 w-3.5 text-emerald-400" /> Battery Umbra
            </span>
            {isBatteryOk ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> READY
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 text-[11px] font-semibold">
                <AlertTriangle className="h-3.5 w-3.5" /> UNREADY
              </span>
            )}
          </div>

          {/* 5. Comms Loop */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-cyan-400" /> Comms Loop
            </span>
            {isCommsOk ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> BALANCED
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 text-[11px] font-semibold">
                <AlertTriangle className="h-3.5 w-3.5" /> OVERFLOW
              </span>
            )}
          </div>
        </div>

        {/* Giant Launch Mission Button */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={launchMission}
            className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 p-[2px] transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/25 active:scale-[0.98]"
          >
            <div className="relative px-6 py-4 rounded-[10px] bg-slate-950 transition-colors group-hover:bg-opacity-80 flex items-center justify-center gap-2.5">
              <Rocket className="h-5 w-5 text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span className="font-mono text-sm font-black tracking-widest text-white uppercase">
                Launch Mission
              </span>
            </div>
          </button>
          <p className="text-[10px] font-mono text-center text-slate-500 mt-2">
            Executes NASA Systems Constraints Review
          </p>
        </div>
      </div>

      {/* Subsystem Mass Distribution Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 font-mono text-xs">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
          CubeSat Subsystem Allocations
        </div>
        <div className="space-y-1.5 text-slate-400 text-[11px]">
          <div className="flex justify-between">
            <span>Photovoltaic Solar Arrays:</span>
            <span className="text-slate-200">{telemetry.solarCount * 5} kg</span>
          </div>
          <div className="flex justify-between">
            <span>EPS Battery Storage:</span>
            <span className="text-slate-200">{telemetry.batteryCount * 10} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Ion Propulsion Modules:</span>
            <span className="text-slate-200">
              {grid.filter((g) => g?.id === "ion_thruster").length * 20} kg
            </span>
          </div>
          <div className="flex justify-between">
            <span>Multispectral Sensors:</span>
            <span className="text-slate-200">{telemetry.payloadCount * 15} kg</span>
          </div>
          <div className="flex justify-between">
            <span>High-Gain Telecomm:</span>
            <span className="text-slate-200">{telemetry.antennaCount * 10} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
