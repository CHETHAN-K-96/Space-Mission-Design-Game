"use client";

import React, { useState } from "react";
import {
  TelemetryData,
  TimeOfDay,
  MissionDef,
  DevStage,
} from "../../engine/minecraft/types";
import {
  Rocket,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
  Sun,
  Moon,
  Users,
  FileText,
  BookOpen,
  Trash2,
  Compass,
  Box,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  MoreHorizontal,
} from "lucide-react";

interface CockpitHudProps {
  telemetry: TelemetryData;
  activeMissionKey: string;
  activeMission: MissionDef;
  timeOfDay: TimeOfDay;
  isFlying: boolean;
  blueprintVisible: boolean;
  fairingCutaway?: boolean;
  blueprintMode?: "SATELLITE" | "FULL_VEHICLE" | "ROCKET";
  devStage?: DevStage;
  onMissionChange: (key: string) => void;
  onAutoBuild: () => void;
  onEncloseFairing?: () => void;
  onToggleBlueprint: () => void;
  onToggleBlueprintMode?: () => void;
  onToggleCutaway?: () => void;
  onToggleDevStage?: () => void;
  onLaunchReview: () => void;
  onCycleTime: () => void;
  onOpenDossier: () => void;
  onOpenTeam: () => void;
  onOpenResources: () => void;
  onToggleFlight: () => void;
  onClearCraft: () => void;
  onOpenStory?: () => void;
}

export function CockpitHud({
  telemetry,
  activeMissionKey,
  activeMission,
  timeOfDay,
  isFlying,
  blueprintVisible,
  fairingCutaway = false,
  blueprintMode = "FULL_VEHICLE",
  devStage = "STAGE_1_ROCKET",
  onMissionChange,
  onAutoBuild,
  onEncloseFairing,
  onToggleBlueprint,
  onToggleBlueprintMode,
  onToggleCutaway,
  onToggleDevStage,
  onLaunchReview,
  onCycleTime,
  onOpenDossier,
  onOpenTeam,
  onOpenResources,
  onToggleFlight,
  onClearCraft,
  onOpenStory,
}: CockpitHudProps) {
  const [showUtilities, setShowUtilities] = useState(false);

  const maxBudget = activeMission.budget_m || 160;
  const currentCost = telemetry.totalCostM ?? 0;
  const budgetPct = Math.min(
    Math.max((currentCost / maxBudget) * 100, 0),
    100
  );

  const massPct = Math.min(telemetry.totalMass / 2, 100);
  const powerAlert =
    devStage === "STAGE_2_SATELLITE" &&
    telemetry.netPower < 0 &&
    telemetry.blocksCount > 0;
  const thrustAlert = telemetry.twr < 1.0 && telemetry.blocksCount > 0;
  const commsAlert =
    devStage === "STAGE_2_SATELLITE" &&
    telemetry.dataGen > telemetry.dataDownlink &&
    activeMission.require_closed_comms;

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[98%] max-w-[1400px] z-20 flex flex-col gap-2 pointer-events-auto font-sans">
      {/* Sleek Aerospace Top Navigation Bar */}
      <div className="flex justify-between items-center bg-slate-950/90 border border-slate-700/60 backdrop-blur-md px-4 py-2 rounded-xl shadow-2xl gap-3 flex-wrap">
        {/* Left Section: Branding & Mission Select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest uppercase">
              NASA JPL
            </span>
            <span className="text-slate-200 font-semibold text-xs tracking-wider uppercase hidden sm:inline">
              VAB Simulator
            </span>
          </div>

          <div className="relative">
            <select
              value={activeMissionKey}
              onChange={(e) => onMissionChange(e.target.value)}
              className="bg-slate-900 text-sky-400 border border-slate-700 hover:border-sky-500 px-3 py-1.5 pr-7 rounded-lg text-xs font-medium cursor-pointer outline-none appearance-none transition-colors"
            >
              <option value="earth_sentinel">
                Earth Sentinel (Falcon 9 • $160M)
              </option>
              <option value="asteroid_scout">
                Asteroid Scout (Falcon Heavy • $290M)
              </option>
              <option value="space_telescope">
                Space Observatory (SLS • $520M)
              </option>
              <option value="artemis_lunar">
                Artemis Lunar (Saturn V • $880M)
              </option>
              <option value="sandbox_mode">Sandbox Mode ($1000M)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {onOpenStory && (
            <button
              onClick={onOpenStory}
              className="bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 hover:border-sky-500 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Open Mission Storyline, Objectives & Historical Flight Details"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Mission Story</span>
            </button>
          )}
        </div>

        {/* Center Section: Stage Switcher (Rocket vs Satellite) */}
        {onToggleDevStage && (
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => devStage !== "STAGE_1_ROCKET" && onToggleDevStage()}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                devStage === "STAGE_1_ROCKET"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Stage 1: Build outer rocket architecture, fuel tanks, and booster engines"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Stage 1: Rocket Architecture</span>
            </button>
            <button
              onClick={() => devStage !== "STAGE_2_SATELLITE" && onToggleDevStage()}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                devStage === "STAGE_2_SATELLITE"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Stage 2: Satellite payload integration, power, and science instruments"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Stage 2: Satellite Payload</span>
            </button>
          </div>
        )}

        {/* Right Section: Primary Actions & Launch */}
        <div className="flex items-center gap-2">
          {/* Auto-Build Button */}
          <button
            onClick={onAutoBuild}
            className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 hover:border-sky-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            title="Auto-build flight ready spacecraft"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Auto Build</span>
          </button>

          {/* Blueprint Toggle */}
          <button
            onClick={onToggleBlueprint}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
              blueprintVisible
                ? "border-sky-500 text-sky-300 bg-sky-950/50"
                : "border-slate-700 text-slate-400 bg-slate-900 hover:bg-slate-800"
            }`}
            title="Toggle Holographic Blueprint Wireframe (Key: B)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Blueprint (B)</span>
          </button>

          {/* Fairing Cutaway Toggle */}
          <button
            onClick={onToggleCutaway}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
              fairingCutaway
                ? "border-purple-500 text-purple-300 bg-purple-950/50"
                : "border-slate-700 text-slate-400 bg-slate-900 hover:bg-slate-800"
            }`}
            title="Toggle Fairing Shroud X-Ray Cutaway / Solid Fuselage (Key: X)"
          >
            {fairingCutaway ? (
              <Eye className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span>{fairingCutaway ? "Cutaway" : "Solid"} (X)</span>
          </button>

          {/* LAUNCH BUTTON */}
          <button
            onClick={onLaunchReview}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold text-xs px-4 py-1.5 border border-emerald-400 rounded-lg shadow-md shadow-emerald-600/30 transition-all hover:scale-105 flex items-center gap-1.5"
            title="Flight Readiness Review and Orbital Launch (Key: L)"
          >
            <Rocket className="w-4 h-4" />
            <span>Launch Test (L)</span>
          </button>

          {/* Utilities Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUtilities(!showUtilities)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 p-1.5 rounded-lg transition-colors"
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showUtilities && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-md">
                <button
                  onClick={() => {
                    onCycleTime();
                    setShowUtilities(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors w-full text-left"
                >
                  {timeOfDay === "NIGHT" ? (
                    <Moon className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Time: {timeOfDay}</span>
                </button>
                <button
                  onClick={() => {
                    onToggleFlight();
                    setShowUtilities(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors w-full text-left"
                >
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>Free Fly: {isFlying ? "ON" : "OFF"} (F)</span>
                </button>
                <button
                  onClick={() => {
                    onOpenDossier();
                    setShowUtilities(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors w-full text-left"
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Mission Dossier</span>
                </button>
                <button
                  onClick={() => {
                    onOpenTeam();
                    setShowUtilities(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors w-full text-left"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Mission Team</span>
                </button>
                <button
                  onClick={() => {
                    onOpenResources();
                    setShowUtilities(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors w-full text-left"
                >
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>NASA Standards</span>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  onClick={() => {
                    onClearCraft();
                    setShowUtilities(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 transition-colors w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Launchpad</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simplified Aerospace Telemetry Readout Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
        {/* Budget Metric */}
        <div
          className={`bg-slate-950/85 border p-2 rounded-lg shadow-sm flex flex-col justify-between transition-colors ${
            telemetry.isOverBudget
              ? "border-rose-500 bg-rose-950/30"
              : "border-slate-800"
          }`}
        >
          <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
            <span>Budget Ceiling</span>
            <span>${maxBudget}M Max</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1 flex justify-between items-baseline">
            <span>${currentCost}M Spent</span>
            <span
              className={`text-[10px] font-semibold ${
                telemetry.isOverBudget ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {telemetry.isOverBudget
                ? `+$${telemetry.overBudgetAmount}M Over`
                : `$${telemetry.budgetRemaining}M Left`}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-sm mt-1.5 overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${budgetPct}%`,
                backgroundColor: telemetry.isOverBudget ? "#f43f5e" : "#10b981",
              }}
            />
          </div>
        </div>

        {/* Total Mass Metric */}
        <div className="bg-slate-950/85 border border-slate-800 p-2 rounded-lg shadow-sm flex flex-col justify-between">
          <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
            <span>Vehicle Mass</span>
            <span>{telemetry.blocksCount} Components</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1">
            {telemetry.totalMass.toLocaleString()} kg
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-sm mt-1.5 overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${massPct}%` }}
            />
          </div>
        </div>

        {/* Propulsion / TWR Metric */}
        <div
          className={`bg-slate-950/85 border p-2 rounded-lg shadow-sm flex flex-col justify-between transition-colors ${
            thrustAlert ? "border-amber-500 bg-amber-950/20" : "border-slate-800"
          }`}
        >
          <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
            <span>Propulsion Authority</span>
            <span>Min: {telemetry.minLiftThrust} kN</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1 flex justify-between items-baseline">
            <span>{telemetry.totalThrust} kN</span>
            <span
              className={`text-[11px] font-bold ${
                telemetry.twr >= 1.0 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {telemetry.twr}x TWR
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-sm mt-1.5 overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{
                width: `${Math.min(telemetry.totalThrust / 2, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Stage-Dependent 4th Metric */}
        {devStage === "STAGE_1_ROCKET" ? (
          <div className="bg-slate-950/85 border border-slate-800 p-2 rounded-lg shadow-sm flex flex-col justify-between">
            <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
              <span>Payload Container Slot</span>
              <span className="text-[10px] text-sky-400">Stage 1 Envelope</span>
            </div>
            <div className="text-sm font-bold mt-1 flex items-center gap-1.5">
              {telemetry.hasPayloadContainer ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Container Mounted</span>
                </>
              ) : (
                <>
                  <Box className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">Direct Launch (Optional)</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Detailed payload systems in Stage 2
            </div>
          </div>
        ) : (
          <div
            className={`bg-slate-950/85 border p-2 rounded-lg shadow-sm flex flex-col justify-between transition-colors ${
              powerAlert
                ? "border-rose-500 bg-rose-950/30"
                : "border-slate-800"
            }`}
          >
            <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
              <span>Solar EPS Balance</span>
              <span>+{telemetry.powerGen}W Gen</span>
            </div>
            <div className="text-sm font-bold text-slate-100 mt-1">
              {telemetry.netPower >= 0 ? "+" : ""}
              {telemetry.netPower} W Margin
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-sm mt-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: "50%" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
