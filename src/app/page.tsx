"use client";

import React from "react";
import { GameProvider, useGame } from "../context/GameContext";
import { TelemetryHud } from "../components/TelemetryHud";
import { MissionBriefing } from "../components/MissionBriefing";
import { AssemblyGrid } from "../components/AssemblyGrid";
import { InventoryHotbar } from "../components/InventoryHotbar";
import { LaunchConsole } from "../components/LaunchConsole";
import { MissionVizModal } from "../components/MissionVizModal";
import { COMPONENT_CATALOG } from "../data/components";
import { ComponentIcon } from "../components/AssemblyGrid";
import { Database, BookOpen, X } from "lucide-react";

// Modal for NASA Dataset
function DatasetModal() {
  const { showDatasetModal, setShowDatasetModal } = useGame();
  if (!showDatasetModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl font-mono text-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">NASA JPL HORIZONS EPHEMERIS DATASET</h3>
          </div>
          <button onClick={() => setShowDatasetModal(false)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-slate-300 font-sans text-xs leading-relaxed">
          The orbital transfer simulations and propulsion requirement calculations in this game are backed by official celestial mechanics datasets from the <strong>NASA JPL Horizons System</strong> and <strong>NASA Lunar Reconnaissance Orbiter (LRO)</strong> target catalogs.
        </p>

        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2 text-slate-300 text-[11px]">
          <div className="flex justify-between border-b border-slate-800/60 pb-1">
            <span className="text-slate-400">Earth Gravitational Parameter (&mu;):</span>
            <span className="font-bold text-cyan-400">398,600.4418 km&sup3;/s&sup2;</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/60 pb-1">
            <span className="text-slate-400">Moon Gravitational Parameter (&mu;_moon):</span>
            <span className="font-bold text-cyan-400">4,902.8000 km&sup3;/s&sup2;</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/60 pb-1">
            <span className="text-slate-400">Mean Earth-Moon Distance:</span>
            <span className="font-bold text-cyan-400">384,400 km</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/60 pb-1">
            <span className="text-slate-400">Low Earth Orbit Velocity (250 km LEO):</span>
            <span className="font-bold text-emerald-400">7.75 km/s</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/60 pb-1">
            <span className="text-slate-400">Earth Escape Velocity (from LEO):</span>
            <span className="font-bold text-emerald-400">11.18 km/s</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/60 pb-1">
            <span className="text-slate-400">Trans-Lunar Injection (TLI) Req &Delta;V:</span>
            <span className="font-bold text-amber-400">3,120 m/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Lunar Orbit Insertion (LOI to 100 km):</span>
            <span className="font-bold text-amber-400">820 m/s</span>
          </div>
        </div>

        <button
          onClick={() => setShowDatasetModal(false)}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
        >
          Close Dataset
        </button>
      </div>
    </div>
  );
}

// Modal for Component Encyclopedia
function GuideModal() {
  const { showGuideModal, setShowGuideModal } = useGame();
  if (!showGuideModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl font-mono text-xs space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">NASA SPACECRAFT COMPONENT FIELD GUIDE</h3>
          </div>
          <button onClick={() => setShowGuideModal(false)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
          {COMPONENT_CATALOG.map((comp) => (
            <div key={comp.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
              <div className={`p-2 rounded-lg ${comp.color}`}>
                <ComponentIcon name={comp.iconName} className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">{comp.name} [{comp.category.toUpperCase()}]</span>
                  <span className="text-cyan-400 font-bold">${comp.cost_m.toFixed(1)}M</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Mass: {comp.mass_kg}kg | Thrust: {comp.thrust_kn}kN | Net Power: {comp.power_w > 0 ? `+${comp.power_w}` : comp.power_w}W | Comms: {comp.data_mbps}MBps
                </div>
                <div className="text-[11px] font-sans text-slate-300 mt-1 leading-relaxed">
                  <strong>NASA Heritage:</strong> {comp.flightHeritage}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowGuideModal(false)}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
        >
          Close Guide
        </button>
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden">
      {/* Background Starfield Pattern */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 z-0" />

      {/* Top HUD (Live Telemetry & Presets) */}
      <TelemetryHud />

      {/* Main Cockpit Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Mission Briefing (3 Cols) */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <MissionBriefing />
          </aside>

          {/* Center Column: 5x5 Assembly Grid & Hotbar (6 Cols) */}
          <section className="lg:col-span-6 space-y-6 order-1 lg:order-2 flex flex-col items-center">
            <AssemblyGrid />
            <InventoryHotbar />
          </section>

          {/* Right Column: Pre-Flight Checklist & Launch Console (3 Cols) */}
          <aside className="lg:col-span-3 order-3">
            <LaunchConsole />
          </aside>
        </div>
      </main>

      {/* Modals */}
      <MissionVizModal />
      <DatasetModal />
      <GuideModal />
    </div>
  );
}

export default function SpaceMissionApp() {
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
}
