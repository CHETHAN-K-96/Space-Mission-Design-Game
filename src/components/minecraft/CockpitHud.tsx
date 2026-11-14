"use client";

import React from "react";
import { TelemetryData, TimeOfDay, MissionDef } from "../../engine/minecraft/types";

interface CockpitHudProps {
  telemetry: TelemetryData;
  activeMissionKey: string;
  activeMission: MissionDef;
  timeOfDay: TimeOfDay;
  isFlying: boolean;
  blueprintVisible: boolean;
  fairingCutaway?: boolean;
  onMissionChange: (key: string) => void;
  onAutoBuild: () => void;
  onToggleBlueprint: () => void;
  onToggleCutaway?: () => void;
  onLaunchReview: () => void;
  onCycleTime: () => void;
  onOpenDossier: () => void;
  onOpenTeam: () => void;
  onOpenResources: () => void;
  onToggleFlight: () => void;
  onClearCraft: () => void;
}

export function CockpitHud({
  telemetry,
  activeMissionKey,
  activeMission,
  timeOfDay,
  isFlying,
  blueprintVisible,
  fairingCutaway = false,
  onMissionChange,
  onAutoBuild,
  onToggleBlueprint,
  onToggleCutaway,
  onLaunchReview,
  onCycleTime,
  onOpenDossier,
  onOpenTeam,
  onOpenResources,
  onToggleFlight,
  onClearCraft,
}: CockpitHudProps) {
  const maxBudget = activeMission.budget_m || activeMission.budget_xp || 100;
  const budgetRatio = activeMission.budget_m
    ? `$${telemetry.totalCostM || 0}M / $${activeMission.budget_m}M`
    : `${telemetry.totalXP}/${activeMission.budget_xp} XP`;
  const budgetVal = activeMission.budget_m
    ? `${telemetry.budgetRemaining >= 0 ? `$${telemetry.budgetRemaining}M` : "OVER"}`
    : `${telemetry.budgetRemaining >= 0 ? telemetry.budgetRemaining : "OVER"} XP`;
  const budgetPct = Math.min(
    Math.max(
      (((activeMission.budget_m ? telemetry.totalCostM : telemetry.totalXP) || 0) /
        maxBudget) *
        100,
      0
    ),
    100
  );
  const budgetAlert = telemetry.budgetRemaining < 0;

  const massPct = Math.min(telemetry.totalMass / 2, 100);
  const powerAlert =
    telemetry.netPower < 0 && telemetry.blocksCount > 0;
  const thrustAlert =
    telemetry.twr < 1.0 && telemetry.blocksCount > 0;
  const commsAlert =
    telemetry.dataGen > telemetry.dataDownlink &&
    activeMission.require_closed_comms;

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[98%] max-w-[1380px] z-20 flex flex-col gap-1.5 pointer-events-auto font-mono">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center bg-slate-900/95 border border-sky-400/35 backdrop-blur-md px-3.5 py-1.5 rounded-md shadow-2xl gap-2.5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest">
            NASA JPL
          </span>
          <strong className="text-white text-xs sm:text-sm tracking-wide">
            SPACECRAFT VAB CRAFTING SIMULATOR
          </strong>
        </div>

        {/* Mission Selector */}
        <div className="flex items-center">
          <select
            value={activeMissionKey}
            onChange={(e) => onMissionChange(e.target.value)}
            className="bg-slate-800 text-sky-400 border border-sky-600 px-2 py-1 rounded font-mono text-[11px] cursor-pointer outline-none"
          >
            <option value="artemis_lunar">
              Artemis: Lunar Transfer Orbiter (100 XP)
            </option>
            <option value="earth_sentinel">
              Earth Observation Sentinel (120 XP)
            </option>
            <option value="asteroid_scout">
              Deep Space Asteroid Scout (150 XP)
            </option>
            <option value="space_telescope">
              James Webb Space Observatory (180 XP)
            </option>
            <option value="sandbox_mode">⚙️ Custom Sandbox Mode</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={onAutoBuild}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold border border-sky-400 px-2.5 py-1 rounded text-[11px] transition-all"
            title="Auto-build flight ready spacecraft"
          >
            ✨ BUILD READY CRAFT
          </button>
          <button
            onClick={onToggleBlueprint}
            className={`px-2 py-1 rounded border text-[11px] transition-all font-semibold ${
              blueprintVisible
                ? "border-sky-400 text-sky-400 bg-sky-950/40"
                : "border-slate-600 text-slate-400 bg-slate-800"
            }`}
            title="Toggle Holographic Blueprint Wireframe (B)"
          >
            📐 BLUEPRINT: {blueprintVisible ? "ON" : "OFF"} (B)
          </button>
          <button
            onClick={onToggleCutaway}
            className={`px-2 py-1 rounded border text-[11px] transition-all font-semibold ${
              fairingCutaway
                ? "border-sky-400 text-sky-400 bg-sky-950/40"
                : "border-purple-400 text-purple-300 bg-purple-950/40"
            }`}
            title="Toggle Fairing Shroud X-Ray Cutaway / Solid Hull (X)"
          >
            👁️ SHROUD: {fairingCutaway ? "CUTAWAY" : "SOLID"} (X)
          </button>
          <button
            onClick={onLaunchReview}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold text-[11px] px-3 py-1 border border-emerald-400 rounded shadow-md shadow-emerald-600/40 transition-all hover:scale-105 flex items-center gap-1"
            title="Flight Readiness Review (L)"
          >
            <span>🚀</span> LAUNCH MISSION (L)
          </button>
          <button
            onClick={onCycleTime}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded text-[11px] transition-all"
          >
            TIME: {timeOfDay}
          </button>
          <button
            onClick={onOpenDossier}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded text-[11px] transition-all"
          >
            📋 DOSSIER
          </button>
          <button
            onClick={onOpenTeam}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded text-[11px] transition-all"
          >
            👥 4-PLAYER TEAM
          </button>
          <button
            onClick={onOpenResources}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded text-[11px] transition-all"
          >
            📚 NASA RESOURCES
          </button>
          <button
            onClick={onToggleFlight}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded text-[11px] transition-all"
          >
            FLY: {isFlying ? "ON" : "OFF"} (F)
          </button>
          <button
            onClick={onClearCraft}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded text-[11px] transition-all"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Live Telemetry Gauges Grid (6 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
        {/* Budget */}
        <div
          className={`bg-slate-900/90 border p-1.5 rounded-md shadow-md flex flex-col justify-between transition-colors ${
            budgetAlert
              ? "border-rose-500 bg-rose-950/40"
              : "border-slate-700/80"
          }`}
        >
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>BUDGET (XP)</span>
            <span>{budgetRatio}</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {budgetVal}
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-sm mt-1 overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${budgetPct}%`,
                backgroundColor: budgetAlert ? "#f43f5e" : "#38bdf8",
              }}
            />
          </div>
        </div>

        {/* Mass */}
        <div className="bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-md shadow-md flex flex-col justify-between">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>TOTAL MASS</span>
            <span>{telemetry.blocksCount} Blocks</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {telemetry.totalMass} kg
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-sm mt-1 overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${massPct}%` }}
            />
          </div>
        </div>

        {/* Net Power */}
        <div
          className={`bg-slate-900/90 border p-1.5 rounded-md shadow-md flex flex-col justify-between transition-colors ${
            powerAlert
              ? "border-rose-500 bg-rose-950/40"
              : "border-slate-700/80"
          }`}
        >
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>NET POWER (EPS)</span>
            <span>+{telemetry.powerGen}W Gen</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {telemetry.netPower >= 0 ? "+" : ""}
            {telemetry.netPower} W
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-sm mt-1 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: "50%" }}
            />
          </div>
        </div>

        {/* Thrust */}
        <div
          className={`bg-slate-900/90 border p-1.5 rounded-md shadow-md flex flex-col justify-between transition-colors ${
            thrustAlert
              ? "border-rose-500 bg-rose-950/40"
              : "border-slate-700/80"
          }`}
        >
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>PROPULSION (TWR)</span>
            <span>Min: {telemetry.minLiftThrust} kN</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {telemetry.totalThrust} kN ({telemetry.twr}x)
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-sm mt-1 overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{
                width: `${Math.min(telemetry.totalThrust / 2, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Comms */}
        <div
          className={`bg-slate-900/90 border p-1.5 rounded-md shadow-md flex flex-col justify-between transition-colors ${
            commsAlert
              ? "border-rose-500 bg-rose-950/40"
              : "border-slate-700/80"
          }`}
        >
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>COMMS DOWNLINK</span>
            <span>+{telemetry.dataGen} MBps</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {telemetry.dataDownlink} MBps
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-sm mt-1 overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{
                width: `${Math.min(telemetry.dataDownlink, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Science Return */}
        <div className="bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-md shadow-md flex flex-col justify-between">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>SCIENCE RETURN</span>
            <span>{telemetry.batteryCount} Batt</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {telemetry.sciencePts} pts
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-sm mt-1 overflow-hidden">
            <div
              className="h-full bg-pink-500 transition-all duration-300"
              style={{
                width: `${Math.min(telemetry.sciencePts / 2, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
