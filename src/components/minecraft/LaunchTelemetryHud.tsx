"use client";

import React from "react";

interface LaunchTelemetryHudProps {
  isVisible: boolean;
  altitude: string;
  velocity: string;
  stageName: string;
  met?: string;
  gForce?: string;
  altKm?: number;
  velKmh?: number;
  mach?: number;
}

export function LaunchTelemetryHud({
  isVisible,
  altitude,
  velocity,
  stageName,
  met = "T+00:00",
  gForce = "1.0 G",
  altKm = 0,
  velKmh = 0,
  mach = 0,
}: LaunchTelemetryHudProps) {
  if (!isVisible) return null;

  // Calculate target apogee percentage (Target LEO is 450 km)
  const apogeePct = Math.min(100, Math.max(0, (altKm / 450) * 100));

  return (
    <div className="absolute right-6 top-24 bg-slate-950/90 border-2 border-sky-400 p-4 rounded-xl z-40 flex flex-col gap-3 text-xs shadow-[0_0_50px_rgba(14,165,233,0.35)] font-mono text-slate-200 pointer-events-none min-w-[320px] max-w-[380px] backdrop-blur-md">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-sky-500/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <strong className="text-sky-300 font-bold tracking-widest text-xs">
            LIVE FLIGHT TELEMETRY
          </strong>
        </div>
        <span className="bg-sky-950 border border-sky-500/40 text-sky-400 font-bold text-[11px] px-2 py-0.5 rounded">
          {met}
        </span>
      </div>

      {/* Flight Phase Badge */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-md">
        <span className="text-[11px] text-slate-400">FLIGHT PHASE</span>
        <span className="text-xs font-black text-emerald-400 tracking-wider">
          {stageName}
        </span>
      </div>

      {/* Live Altitude Readout */}
      <div className="flex flex-col gap-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
        <div className="flex justify-between items-baseline">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">
            Altitude
          </span>
          <span className="text-sm font-black text-white">{altitude}</span>
        </div>
        {/* Apogee Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
          <div
            className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-150"
            style={{ width: `${apogeePct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
          <span>0 km (Surface)</span>
          <span>Target Apogee (450 km)</span>
        </div>
      </div>

      {/* Live Velocity Readout */}
      <div className="flex flex-col gap-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
        <div className="flex justify-between items-baseline">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">
            Velocity
          </span>
          <span className="text-xs font-bold text-amber-300">{velocity}</span>
        </div>
      </div>

      {/* Grid of Dynamic Parameters */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded flex flex-col">
          <span className="text-slate-400">G-FORCE</span>
          <strong className="text-white text-xs font-bold">{gForce}</strong>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded flex flex-col">
          <span className="text-slate-400">DOWNLINK</span>
          <strong className="text-emerald-400 text-xs font-bold">
            8.4 GHz (DSN-X)
          </strong>
        </div>
      </div>
    </div>
  );
}
