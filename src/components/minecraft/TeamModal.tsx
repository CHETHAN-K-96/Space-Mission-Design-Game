"use client";

import React, { useState } from "react";
import { Users, Award, Rocket, Zap, Radio, X } from "lucide-react";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (roleName: string) => void;
}

const ROLES = [
  {
    id: "commander",
    icon: Award,
    title: "1. Flight Commander",
    desc: "Oversees Mission Profile, Orbital Trajectory Selection, Budget Allocation, and Final Launch Go/No-Go Decision.",
  },
  {
    id: "propulsion",
    icon: Rocket,
    title: "2. Propulsion & Structures Lead",
    desc: "Oversees Solid Rocket Boosters, Ion Thruster, RCS Microthrusters, Chassis Mass, and Thrust-to-Weight (TWR).",
  },
  {
    id: "power",
    icon: Zap,
    title: "3. EPS Power & Thermal Lead",
    desc: "Oversees Solar Array generation, LiFePO4 Battery sizing for 35-min orbital eclipse umbra, and thermal radiators.",
  },
  {
    id: "science",
    icon: Radio,
    title: "4. Science & Communications Lead",
    desc: "Oversees Multispectral Camera, Spectrometers, Magnetometers, and DSN X-Band Downlink closed loop.",
  },
];

export function TeamModal({ isOpen, onClose, onRoleSelect }: TeamModalProps) {
  const [activeRole, setActiveRole] = useState("commander");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_40px_rgba(2,132,199,0.4)] rounded-lg p-5 w-[680px] max-w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col gap-3.5 text-left">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
          <div className="text-base font-bold text-sky-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" /> 4-Player Mission Team Command Station
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded text-xs transition-colors flex items-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Select your mission engineering discipline. Each member oversees dedicated spacecraft subsystems and signs off on the flight readiness review.
        </p>

        {/* Roles 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-1">
          {ROLES.map((role) => {
            const isSelected = activeRole === role.id;
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => {
                  setActiveRole(role.id);
                  onRoleSelect(role.title);
                }}
                className={`p-3 rounded-md border cursor-pointer transition-all ${
                  isSelected
                    ? "border-sky-400 bg-[#0f2744]"
                    : "border-slate-700 bg-slate-950 hover:border-sky-400/60"
                }`}
              >
                <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-sky-400 shrink-0" /> {role.title}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  {role.desc}
                </p>
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-2 bg-emerald-950 text-emerald-400 border border-emerald-600/40">
                  STATUS: AUTHORIZED
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded text-xs text-sky-400">
          <strong>Team Coordination Consensus:</strong> All 4 engineering disciplines must certify their respective subsystem checks before the Flight Readiness Review can be passed!
        </div>
      </div>
    </div>
  );
}
