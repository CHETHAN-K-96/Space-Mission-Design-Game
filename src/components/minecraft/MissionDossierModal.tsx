"use client";

import React from "react";
import { MissionDef } from "../../engine/minecraft/types";
import { FileText, X } from "lucide-react";

interface MissionDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: MissionDef;
}

export function MissionDossierModal({
  isOpen,
  onClose,
  mission,
}: MissionDossierModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_40px_rgba(2,132,199,0.4)] rounded-lg p-5 w-[680px] max-w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col gap-3.5 text-left">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
          <div className="text-base font-bold text-sky-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" /> NASA Mission Dossier & Objectives
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded text-xs transition-colors flex items-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-xs leading-relaxed text-slate-300 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest">
              {mission.name}
            </span>
            <strong className="text-sky-400">Target: {mission.target}</strong>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-md">
            <div className="mb-1.5">
              <strong className="text-amber-400">NASA Counterpart:</strong>{" "}
              {mission.counterpart || "NASA Deep Space Program"}
            </div>
            <div>
              <strong className="text-emerald-400">Scientific Objective:</strong>{" "}
              {mission.scientificGoal || mission.desc}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded">
              <div>
                <strong>Budget Cap:</strong> ${mission.budget_m ?? 100}M
              </div>
              <div className="mt-1">
                <strong>Min Insertion Thrust:</strong> {mission.min_thrust_kn} kN
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded">
              <div>
                <strong>Min Battery Reserves:</strong> {mission.min_batteries} Units (Eclipse)
              </div>
              <div className="mt-1">
                <strong>Telemetry Comms:</strong>{" "}
                {mission.require_closed_comms
                  ? "Strict Closure Required"
                  : "Standard Downlink"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
