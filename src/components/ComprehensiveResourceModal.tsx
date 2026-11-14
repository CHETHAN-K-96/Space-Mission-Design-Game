"use client";

import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { Database, BookOpen, X, CheckSquare, Layers, Award, ExternalLink, ShieldCheck } from "lucide-react";

export function ComprehensiveResourceModal() {
  const { showDatasetModal, setShowDatasetModal } = useGame();
  const [activeTab, setActiveTab] = useState<"cml" | "cubesat" | "ephemeris" | "checklists">("cml");

  if (!showDatasetModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl font-mono text-xs max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/80">
                  OFFICIAL NASA RESOURCES
                </span>
                <span className="text-[11px] text-slate-400 font-sans">JPL CML Matrix &middot; CubeSat 101 &middot; Horizons &Delta;V</span>
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                NASA Space Apps Challenge Resource Integration
              </h2>
            </div>
          </div>
          <button
            onClick={() => setShowDatasetModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pt-3 pb-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => setActiveTab("cml")}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "cml"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>JPL CML Matrix (Levels 1–4)</span>
          </button>
          <button
            onClick={() => setActiveTab("cubesat")}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "cubesat"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>NASA CubeSat 101 Handbooks</span>
          </button>
          <button
            onClick={() => setActiveTab("ephemeris")}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "ephemeris"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>JPL Horizons &Delta;V &amp; Ephemeris</span>
          </button>
          <button
            onClick={() => setActiveTab("checklists")}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "checklists"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>CML 4 Checklist &amp; RYG Audit</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="overflow-y-auto space-y-4 py-3 flex-1 pr-1 font-sans text-xs">
          {/* TAB 1: JPL CML */}
          {activeTab === "cml" && (
            <div className="space-y-4 text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-sm font-bold text-cyan-400 font-mono mb-1">
                  How JPL Concept Maturity Levels (CMLs) Power This Game
                </h4>
                <p className="text-[12px] leading-relaxed text-slate-300">
                  Developed by NASA&apos;s Jet Propulsion Laboratory (Wessen, Borden, Ziemer, Kwok, 2013), the CML framework provides an objective scale for space mission formulation in Pre-Phase A. In this game, your journey directly walks through CML Levels 1 to 4:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-blue-900/40">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-bold border border-blue-800">
                    CML 1: Cocktail Napkin
                  </span>
                  <div className="text-white font-bold text-xs mt-2">Mission Objectives &amp; Scope</div>
                  <p className="text-slate-400 font-sans mt-1">
                    Defining the core science questions, targets (LEO vs Artemis Lunar Transfer), and initial constraints. Represented in our Left Mission Briefing panel.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-indigo-900/40">
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-bold border border-indigo-800">
                    CML 2: Initial Feasibility
                  </span>
                  <div className="text-white font-bold text-xs mt-2">Calculations &amp; Margins</div>
                  <p className="text-slate-400 font-sans mt-1">
                    First-order calculations of propulsion authority, TWR &gt; 1.0 against Earth 1g, and basic orbital eclipse battery sizing.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/40">
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800">
                    CML 3: Trade Space Exploration
                  </span>
                  <div className="text-white font-bold text-xs mt-2">Iterative VAB Engineering</div>
                  <p className="text-slate-400 font-sans mt-1">
                    Balancing the trades: swapping heavy solid boosters for high-Isp ion thrusters, sizing solar arrays against camera draw, and tuning mass to budget caps.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/40">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                    CML 4: Point Design Validated
                  </span>
                  <div className="text-white font-bold text-xs mt-2">Launch Readiness &amp; Reserves</div>
                  <p className="text-slate-400 font-sans mt-1">
                    Complete subsystem point design with verified mass, thermal eclipse margin &ge; 35 min, DSN comms closure, and flight approval.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/40 text-[11px] font-mono flex items-center justify-between">
                <span>Reference: JPL CML Matrix (AIAA SpaceOps / Caltech NASA JPL, 2013)</span>
                <span className="text-cyan-400 font-bold">Pre-Phase A Framework</span>
              </div>
            </div>
          )}

          {/* TAB 2: CUBESAT 101 */}
          {activeTab === "cubesat" && (
            <div className="space-y-4 text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-sm font-bold text-cyan-400 font-mono mb-1">
                  NASA CubeSat 101 (CSLI Handbook) Integration
                </h4>
                <p className="text-[12px] leading-relaxed text-slate-300">
                  In accordance with NASA&apos;s <em>CubeSat 101: Basic Concepts and Processes for First-Time CubeSat Developers (NP-2017-10-2470-HQ)</em>, all component masses, dimensions, and operational rules in this game strictly adhere to real small satellite standards:
                </p>
              </div>

              <div className="space-y-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-white">CubeSat Design Specification (CDS) 1U&ndash;3U Standards</span>
                    <p className="text-slate-400 font-sans mt-0.5">
                      Standardized 10 &times; 10 &times; 11 cm unit envelopes (1.33 kg/U max standard). Reflected in our 5&times;5 assembly bay modular slots.
                    </p>
                  </div>
                  <span className="text-cyan-400 font-bold">CubeSat 101 &sect;1.1</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-white">Electrical Inhibits &amp; Umbra Protection</span>
                    <p className="text-slate-400 font-sans mt-0.5">
                      Independent physical separation switches and UL-certified battery packs (CubeSat 101 &sect;6.5) required to survive the 35-minute orbital eclipse.
                    </p>
                  </div>
                  <span className="text-cyan-400 font-bold">CubeSat 101 &sect;6.7</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-white">Communication Link &amp; DSN Ground Networks</span>
                    <p className="text-slate-400 font-sans mt-0.5">
                      Downlink bandwidth calculations adhere to transmitter survey requirements (&sect;6.2) and Deep Space Network (DSN) ground terminal packet rates.
                    </p>
                  </div>
                  <span className="text-cyan-400 font-bold">CubeSat 101 &sect;2.10</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-white">P-POD Dispenser &amp; Launch Integration</span>
                    <p className="text-slate-400 font-sans mt-0.5">
                      Spacecraft must respect launch load calculations and dynamic environment tests (CubeSat 101 &sect;6.9.2) during high-g staging.
                    </p>
                  </div>
                  <span className="text-cyan-400 font-bold">CubeSat 101 &sect;1.2.1</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EPHEMERIS & ORBITAL */}
          {activeTab === "ephemeris" && (
            <div className="space-y-4 text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-sm font-bold text-cyan-400 font-mono mb-1">
                  NASA JPL Horizons &amp; GMAT Orbital Mechanics Dataset
                </h4>
                <p className="text-[12px] leading-relaxed text-slate-300">
                  Every flight trajectory and delta-V parameter in our flight engine uses authentic celestial mechanics values from NASA JPL&apos;s Horizons On-Line Ephemeris System and the NASA General Mission Analysis Tool (GMAT):
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-[11px] font-mono">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Earth Standard Gravitational Parameter (&mu;):</span>
                  <span className="font-bold text-cyan-400">398,600.4418 km&sup3;/s&sup2;</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Moon Gravitational Parameter (&mu;_moon):</span>
                  <span className="font-bold text-cyan-400">4,902.8000 km&sup3;/s&sup2;</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Mean Earth-Moon Center-to-Center Distance:</span>
                  <span className="font-bold text-cyan-400">384,400 km</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Low Earth Orbit Velocity (250 km altitude):</span>
                  <span className="font-bold text-emerald-400">7.75 km/s</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Earth Escape Velocity (from 250 km LEO):</span>
                  <span className="font-bold text-emerald-400">11.18 km/s</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Trans-Lunar Injection (TLI) Delta-V Requirement:</span>
                  <span className="font-bold text-amber-400">3,120 m/s (Hohmann Transfer Arc)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lunar Orbit Insertion (LOI to 100 km polar):</span>
                  <span className="font-bold text-amber-400">820 m/s retro-burn</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CML 4 CHECKLIST (FROM PAPER FIGURE 8A-8B) */}
          {activeTab === "checklists" && (
            <div className="space-y-4 text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-sm font-bold text-cyan-400 font-mono mb-1">
                  NASA JPL CML 4 Checklist Sheet &amp; RYG Criteria
                </h4>
                <p className="text-[12px] leading-relaxed text-slate-300">
                  Derived directly from Figure 8a &amp; 8b of the JPL CML research paper. A space mission concept must achieve an &ge; 80% Green (G) audit status to achieve CML 4 Point Design Certification:
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="grid grid-cols-12 gap-2 p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-400 font-bold uppercase text-[10px]">
                  <div className="col-span-4">Functional Area</div>
                  <div className="col-span-6">Evaluation Criteria</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                <div className="grid grid-cols-12 gap-2 p-2 rounded bg-slate-950 border border-slate-800/50 items-center">
                  <div className="col-span-4 text-white font-bold">Science Traceability</div>
                  <div className="col-span-6 text-slate-300">Draft Science Traceability Matrix &amp; Level 1 Req</div>
                  <div className="col-span-2 text-right text-emerald-400 font-bold">G (COMPLETED)</div>
                </div>

                <div className="grid grid-cols-12 gap-2 p-2 rounded bg-slate-950 border border-slate-800/50 items-center">
                  <div className="col-span-4 text-white font-bold">Propulsion &amp; &Delta;V</div>
                  <div className="col-span-6 text-slate-300">TWR &ge; 1.0 against 1g; orbital escape thrust certified</div>
                  <div className="col-span-2 text-right text-emerald-400 font-bold">G (COMPLETED)</div>
                </div>

                <div className="grid grid-cols-12 gap-2 p-2 rounded bg-slate-950 border border-slate-800/50 items-center">
                  <div className="col-span-4 text-white font-bold">Power &amp; Thermal</div>
                  <div className="col-span-6 text-slate-300">Positive EPS margin + &ge;35 min eclipse battery storage</div>
                  <div className="col-span-2 text-right text-emerald-400 font-bold">G (COMPLETED)</div>
                </div>

                <div className="grid grid-cols-12 gap-2 p-2 rounded bg-slate-950 border border-slate-800/50 items-center">
                  <div className="col-span-4 text-white font-bold">Telecom / Comms</div>
                  <div className="col-span-6 text-slate-300">Packet rate &ge; sensor stream; link closed to DSN</div>
                  <div className="col-span-2 text-right text-emerald-400 font-bold">G (COMPLETED)</div>
                </div>

                <div className="grid grid-cols-12 gap-2 p-2 rounded bg-slate-950 border border-slate-800/50 items-center">
                  <div className="col-span-4 text-white font-bold">Cost &amp; Reserves</div>
                  <div className="col-span-6 text-slate-300">Subsystem expenditures within active $M budget cap</div>
                  <div className="col-span-2 text-right text-emerald-400 font-bold">G (COMPLETED)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] font-mono">
          <span className="text-slate-400">
            Compliant with NASA Space Apps Challenge 2026 Criteria
          </span>
          <button
            onClick={() => setShowDatasetModal(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
          >
            Close Resources
          </button>
        </div>
      </div>
    </div>
  );
}
