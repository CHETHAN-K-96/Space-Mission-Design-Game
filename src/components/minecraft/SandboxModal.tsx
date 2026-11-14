"use client";

import React, { useState } from "react";
import { MissionDef } from "../../engine/minecraft/types";

interface SandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (mission: MissionDef) => void;
}

export function SandboxModal({
  isOpen,
  onClose,
  onApply,
}: SandboxModalProps) {
  const [budget, setBudget] = useState(150);
  const [thrust, setThrust] = useState(50);
  const [battery, setBattery] = useState(1);
  const [gravity, setGravity] = useState("1.0");

  if (!isOpen) return null;

  const handleApply = () => {
    const customMission: MissionDef = {
      name: "⚙️ Custom Engineering Sandbox",
      target: "Custom User Orbit",
      budget_xp: budget,
      min_thrust_kn: thrust,
      min_batteries: battery,
      min_payloads: 1,
      gravityMultiplier: parseFloat(gravity),
      require_closed_comms: false,
      counterpart: "NASA Mission Design Lab (MDL) Advanced Concept Studies",
      scientificGoal:
        "Freeform systems engineering experimentation with custom resource constraints and gravitational environments.",
      desc: "Custom sandbox scenario with user-configured parameters.",
    };
    onApply(customMission);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_40px_rgba(2,132,199,0.4)] rounded-lg p-5 w-[680px] max-w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col gap-3.5 text-left">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
          <div className="text-base font-bold text-sky-400 flex items-center gap-2">
            <span>⚙️</span> Custom Sandbox Constraints Editor
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sliders Form */}
        <div className="flex flex-col gap-3 text-xs text-slate-200">
          <div>
            <label className="flex justify-between mb-1">
              <span>BUDGET CEILING (XP):</span>
              <strong className="text-amber-400">{budget} XP</strong>
            </label>
            <input
              type="range"
              min="40"
              max="500"
              step="10"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value, 10))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="flex justify-between mb-1">
              <span>MINIMUM LIFT THRUST:</span>
              <strong className="text-orange-400">{thrust} kN</strong>
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={thrust}
              onChange={(e) => setThrust(parseInt(e.target.value, 10))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="flex justify-between mb-1">
              <span>MINIMUM BATTERY PACKS (ECLIPSE):</span>
              <strong className="text-emerald-400">{battery} unit(s)</strong>
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={battery}
              onChange={(e) => setBattery(parseInt(e.target.value, 10))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300">
              CELESTIAL GRAVITY ENVIRONMENT:
            </label>
            <select
              value={gravity}
              onChange={(e) => setGravity(e.target.value)}
              className="w-full bg-slate-800 text-sky-400 border border-slate-700 p-2 rounded text-xs outline-none"
            >
              <option value="1.0">Earth Orbit (1.0g - 0.0098 kN/kg)</option>
              <option value="0.166">Moon Orbit (0.166g - 0.0016 kN/kg)</option>
              <option value="0.38">Mars Transfer (0.38g - 0.0037 kN/kg)</option>
              <option value="0.0">Microgravity Deep Space (0.0g - Free Float)</option>
            </select>
          </div>

          <button
            onClick={handleApply}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold p-2.5 rounded text-xs border border-sky-400 shadow-md shadow-sky-600/30 transition-all mt-2"
          >
            APPLY CUSTOM SANDBOX SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
}
