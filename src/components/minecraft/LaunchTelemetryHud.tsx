"use client";

import React from "react";

interface LaunchTelemetryHudProps {
  isVisible: boolean;
  altitude: string;
  velocity: string;
  stageName: string;
}

export function LaunchTelemetryHud({
  isVisible,
  altitude,
  velocity,
  stageName,
}: LaunchTelemetryHudProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute right-5 top-28 bg-slate-900/95 border border-sky-400 p-3.5 rounded-md z-30 flex flex-col gap-1.5 text-xs shadow-2xl font-mono text-slate-200 pointer-events-none">
      <div className="font-bold text-sky-400 border-b border-slate-700 pb-1">
        ORBITAL ASCENT TELEMETRY
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">ALTITUDE:</span>
        <strong className="text-white">{altitude}</strong>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">VELOCITY:</span>
        <strong className="text-white">{velocity}</strong>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">STAGE STATUS:</span>
        <strong className="text-emerald-400">{stageName}</strong>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">DOWNLINK FREQ:</span>
        <strong className="text-white">8.4 GHz (X-Band)</strong>
      </div>
    </div>
  );
}
