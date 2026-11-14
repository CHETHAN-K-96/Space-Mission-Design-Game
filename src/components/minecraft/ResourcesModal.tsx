"use client";

import React from "react";
import { BookOpen, X } from "lucide-react";

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESOURCES = [
  {
    title: "1. Design & Develop Science Missions (NASA Systems Engineering)",
    desc: "Incorporates the 4 mission segments: Launch Segment (Booster thrust authority), Space Segment (CubeSat bus & avionics), Ground Segment (Deep Space Network downlink), and User Segment (Payload science score).",
  },
  {
    title: "2. General Mission Analysis Tool (GMAT)",
    desc: "Simulates trajectory dynamics, orbital insertion thrust requirements, and low Earth orbit gravity constraints (TWR >= 1.0).",
  },
  {
    title: "3. Concept Maturity Levels (JPL CML 1–4)",
    desc: "Quantifies mission maturity: CML 1 (Concept Feasibility), CML 2 (Trade Studies), CML 3 (Point Design Validated & Flight Readiness Certified).",
  },
  {
    title: "4. NASA Mission Design Lab (MDL) Trades",
    desc: "Simulates concurrent multidisciplinary trade-offs: Adding cameras increases science return but demands battery capacity, power generation, mass, and high-gain antenna bandwidth.",
  },
  {
    title: "5. CubeSat 101 Standard (NASA CSLI)",
    desc: "Employs 1U modular form factors and models the 35-minute orbital shadow occultation (eclipse umbra) where primary solar power drops to 0W.",
  },
  {
    title: "6. NASA Mission Viz & VR Challenge",
    desc: "Translates abstract numerical orbital mathematics into an intuitive, interactive 3D first-person simulation environment.",
  },
];

export function ResourcesModal({ isOpen, onClose }: ResourcesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_40px_rgba(2,132,199,0.4)] rounded-lg p-5 w-[680px] max-w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col gap-3.5 text-left">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
          <div className="text-base font-bold text-sky-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" /> NASA Space Apps Challenge Reference Frameworks
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded text-xs transition-colors flex items-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List */}
        <div className="text-xs leading-relaxed text-slate-300 flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
          {RESOURCES.map((item, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 p-2.5 rounded">
              <strong className="text-sky-400 block mb-1">{item.title}</strong>
              <p className="text-slate-400 text-[11px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
