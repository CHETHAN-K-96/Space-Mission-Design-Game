"use client";

import React from "react";
import { GameProvider } from "../context/GameContext";
import { TelemetryHud } from "../components/TelemetryHud";
import { MissionBriefing } from "../components/MissionBriefing";
import { AssemblyGrid } from "../components/AssemblyGrid";
import { InventoryHotbar } from "../components/InventoryHotbar";
import { LaunchConsole } from "../components/LaunchConsole";
import { MissionVizModal } from "../components/MissionVizModal";

export default function SpaceMissionApp() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden">
        {/* Subtle Background Starfield Grid Pattern */}
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 z-0" />

        {/* Top HUD (Live Telemetry & Presets) */}
        <TelemetryHud />

        {/* Main Cockpit Layout */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Mission Briefing & CML Framework (3 Cols) */}
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

        {/* NASA Mission Viz Modal (Simulation & Scorecard) */}
        <MissionVizModal />
      </div>
    </GameProvider>
  );
}
