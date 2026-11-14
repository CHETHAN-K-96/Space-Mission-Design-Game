"use client";

import React from "react";
import { MissionDef, MissionDebriefScore } from "../../engine/minecraft/types";
import {
  Award,
  Calendar,
  CloudSun,
  Globe,
  Rocket,
  CheckCircle2,
  X,
  TrendingUp,
  DollarSign,
  Scale,
  Zap,
  Atom,
} from "lucide-react";

interface MissionDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: MissionDef;
  debriefScore: MissionDebriefScore | null;
  onReturnToVab: () => void;
}

export function MissionDebriefModal({
  isOpen,
  onClose,
  mission,
  debriefScore,
  onReturnToVab,
}: MissionDebriefModalProps) {
  if (!isOpen || !debriefScore) return null;

  const history = mission.historicalFlight;
  const { totalScore, grade, verdict, breakdown, telemetrySnapshot } = debriefScore;

  const gradeColor =
    grade === "A+"
      ? "text-emerald-400 border-emerald-400 bg-emerald-950/40"
      : grade === "A"
      ? "text-teal-400 border-teal-400 bg-teal-950/40"
      : grade === "B"
      ? "text-sky-400 border-sky-400 bg-sky-950/40"
      : grade === "C"
      ? "text-amber-400 border-amber-400 bg-amber-950/40"
      : "text-rose-400 border-rose-400 bg-rose-950/40";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_55px_rgba(2,132,199,0.5)] rounded-xl p-6 w-[820px] max-w-[96vw] max-h-[92vh] overflow-y-auto flex flex-col gap-4 text-left">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-700 pb-3">
          <div className="flex flex-col gap-1">
            <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest uppercase w-fit">
              MISSION DEBRIEF & FLIGHT EVALUATION
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-0.5">
              {mission.name}
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Target: <strong className="text-slate-200">{mission.target}</strong></span>
              <span>•</span>
              <span>Historical Flight: <strong className="text-amber-300">{history?.missionName}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-1.5 rounded-lg text-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Score Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-3 sm:border-r sm:border-slate-800 pr-2">
            <div
              className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-black shadow-lg ${gradeColor}`}
            >
              {grade}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Overall Engineering Score
              </span>
              <strong className="text-2xl font-black text-white">
                {totalScore} <span className="text-sm text-slate-400 font-normal">/ 100</span>
              </strong>
            </div>
          </div>

          <div className="col-span-2 flex flex-col justify-center">
            <span className="text-[10px] text-sky-400 uppercase tracking-wider font-bold">
              Flight Operations Verdict
            </span>
            <div className="text-sm font-bold text-slate-100 mt-0.5">
              {verdict}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Evaluated against NASA JPL Concept Maturity Level (CML Level 3 Point Design Certification).
            </div>
          </div>
        </div>

        {/* 5-Pillar Systems Engineering Score Breakdown */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            Systems Engineering Scorecard Breakdown
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" /> Budget
              </span>
              <div className="text-base font-black text-white mt-1">
                {breakdown.budgetEfficiency} <span className="text-[10px] text-slate-500 font-normal">/ 20</span>
              </div>
              <div className="text-[9px] text-emerald-400 font-medium">Reserve Managed</div>
            </div>

            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Scale className="w-3 h-3 text-purple-400" /> Structure
              </span>
              <div className="text-base font-black text-white mt-1">
                {breakdown.structuralMass} <span className="text-[10px] text-slate-500 font-normal">/ 20</span>
              </div>
              <div className="text-[9px] text-purple-400 font-medium">{telemetrySnapshot.massKg} kg Stack</div>
            </div>

            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Rocket className="w-3 h-3 text-orange-400" /> TWR Thrust
              </span>
              <div className="text-base font-black text-white mt-1">
                {breakdown.propulsionTWR} <span className="text-[10px] text-slate-500 font-normal">/ 20</span>
              </div>
              <div className="text-[9px] text-orange-400 font-medium">{telemetrySnapshot.twr}x TWR</div>
            </div>

            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Power EPS
              </span>
              <div className="text-base font-black text-white mt-1">
                {breakdown.powerBalance} <span className="text-[10px] text-slate-500 font-normal">/ 20</span>
              </div>
              <div className="text-[9px] text-amber-400 font-medium">Solar Equilibrium</div>
            </div>

            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Atom className="w-3 h-3 text-sky-400" /> Objectives
              </span>
              <div className="text-base font-black text-white mt-1">
                {breakdown.scienceAlignment} <span className="text-[10px] text-slate-500 font-normal">/ 20</span>
              </div>
              <div className="text-[9px] text-sky-400 font-medium">Payload Ready</div>
            </div>
          </div>
        </div>

        {/* Real-Life Historical Implementation Record */}
        {history && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                How This Mission Was Actually Implemented in Real Life
              </span>
              <span className="text-[10px] text-slate-400">
                Agency: <strong className="text-white">{history.agency}</strong>
              </span>
            </div>

            {/* Launch Weather & Operational Environment */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">LAUNCH DATE & TIME</span>
                <strong className="text-white font-bold block">{history.launchDate}</strong>
                <span className="text-slate-500 block text-[9px]">{history.launchTimeUTC}</span>
              </div>

              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">LAUNCH SITE & PAD</span>
                <strong className="text-white font-bold block truncate">{history.pad}</strong>
                <span className="text-slate-500 block text-[9px] truncate">{history.launchSite}</span>
              </div>

              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">LIFTOFF WEATHER</span>
                <strong className="text-white font-bold block">{history.weather.tempC}°C • {history.weather.conditions}</strong>
                <span className="text-slate-500 block text-[9px]">
                  Wind: {history.weather.windSpeedKmh} km/h • Vis: {history.weather.visibilityKm} km ({history.weather.favorablePercentage}% go)
                </span>
              </div>

              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">HISTORICAL VEHICLE</span>
                <strong className="text-amber-300 font-bold block truncate">{history.rocketName}</strong>
                <span className="text-slate-500 block text-[9px] truncate">{history.rocketStages}</span>
              </div>
            </div>

            {/* Orbit & Implementation Comparison */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between text-[11px]">
                <strong className="text-sky-300">Target Orbit Executed: {history.orbitProfile.orbitName}</strong>
                <span className="text-slate-400">
                  {history.orbitProfile.perigeeKm.toLocaleString()} x {history.orbitProfile.apogeeKm.toLocaleString()} km ({history.orbitProfile.inclinationDeg}°)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong>Trajectory Profile: </strong>
                {history.orbitProfile.trajectoryDescription}
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800 pt-1.5 mt-1">
                <strong>Historical Outcome & Planning Comparison: </strong>
                {history.historicalOutcome} Our simulation validates your multi-stage engineering decisions against this historical flight envelope.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Peak Altitude: <strong className="text-white">{telemetrySnapshot.finalAltKm} km</strong> • Max Velocity: <strong className="text-amber-400">{telemetrySnapshot.maxVelKmh.toLocaleString()} km/h</strong>
          </div>

          <button
            onClick={() => {
              onClose();
              onReturnToVab();
            }}
            className="bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-cyan-500 hover:to-sky-400 text-white font-bold text-xs px-5 py-2.5 border border-sky-400 rounded-lg shadow-lg shadow-sky-600/35 transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <Rocket className="w-4 h-4" />
            <span>RETURN TO VEHICLE ASSEMBLY BUILDING (VAB)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
