"use client";

import React from "react";
import { useGame } from "../context/GameContext";
import {
  Rocket,
  Activity,
  DollarSign,
  Flame,
  Zap,
  Battery,
  Radio,
  Camera,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function LaunchConsole() {
  const { telemetry, activeMission, launchMission } = useGame();

  const isLaunchReady =
    telemetry.budgetReady &&
    telemetry.thrustReady &&
    telemetry.powerReady &&
    telemetry.eclipseReady &&
    telemetry.commsBalanced &&
    telemetry.scienceReady;

  return (
    <div className="space-y-4">
      {/* Pre-Flight Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-cyan-400" /> Pre-Flight Diagnostics
        </h3>

        <div className="space-y-2 font-mono text-xs">
          {/* 1. Real Budget Constraint */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-cyan-400" /> Budget Cap
            </span>
            {telemetry.budgetReady ? (
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
              <Flame className="h-3.5 w-3.5 text-orange-400" /> Thrust & TWR
            </span>
            {telemetry.thrustReady ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                <XCircle className="h-3.5 w-3.5" /> INSUFF
              </span>
            )}
          </div>

          {/* 3. Solar Power Generation */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-yellow-400" /> Positive Power
            </span>
            {telemetry.powerReady ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                <XCircle className="h-3.5 w-3.5" /> DEFICIT
              </span>
            )}
          </div>

          {/* 4. Eclipse Battery Reserve */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Battery className="h-3.5 w-3.5 text-emerald-400" /> Eclipse Storage
            </span>
            {telemetry.eclipseReady ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                <XCircle className="h-3.5 w-3.5" /> NO BATT
              </span>
            )}
          </div>

          {/* 5. Comms Downlink Margin */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-cyan-400" /> Comms Link
            </span>
            {telemetry.commsBalanced ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                <XCircle className="h-3.5 w-3.5" /> UNBAL
              </span>
            )}
          </div>

          {/* 6. Science Payload */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-pink-400" /> Science Payload
            </span>
            {telemetry.scienceReady ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                <XCircle className="h-3.5 w-3.5" /> NEED PAYLOAD
              </span>
            )}
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={launchMission}
          disabled={!isLaunchReady}
          className={`w-full mt-4 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
            isLaunchReady
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/30 cursor-pointer animate-pulse"
              : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
          }`}
        >
          <Rocket className="h-4 w-4" />
          <span>Launch & View Trajectory</span>
        </button>
      </div>

      {/* NASA Horizons Dataset Quick Card */}
      <div className="bg-slate-900/60 border border-slate-800/70 rounded-xl p-3 font-mono text-[10px] text-slate-400 space-y-1">
        <div className="text-cyan-400 font-bold uppercase tracking-wider">
          NASA Horizons Dataset Quick-Look
        </div>
        <div className="flex justify-between">
          <span>Earth &mu;:</span>
          <span className="text-slate-200">398,600 km&sup3;/s&sup2;</span>
        </div>
        <div className="flex justify-between">
          <span>Escape Velocity (LEO):</span>
          <span className="text-slate-200">11.18 km/s</span>
        </div>
        <div className="flex justify-between">
          <span>Trans-Lunar &Delta;V Req:</span>
          <span className="text-slate-200">3.12 km/s</span>
        </div>
      </div>
    </div>
  );
}
