"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  createShowcaseComponents,
  ShowcaseComponent,
} from "../../data/showcaseComponents";
import { ShowcaseCard } from "./ShowcaseCard";

type CategoryFilter = "ALL" | "PROPULSION" | "POWER" | "COMMS" | "PAYLOAD" | "BUS";

const FILTER_TABS: { label: string; value: CategoryFilter }[] = [
  { label: "All Subsystems", value: "ALL" },
  { label: "Propulsion & Engines", value: "PROPULSION" },
  { label: "Power & Solar (EPS)", value: "POWER" },
  { label: "Communications", value: "COMMS" },
  { label: "Science Instruments", value: "PAYLOAD" },
  { label: "Avionics & Bus", value: "BUS" },
];

export function ShowcaseView() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");

  const components = useMemo<ShowcaseComponent[]>(() => {
    return createShowcaseComponents();
  }, []);

  const filteredComponents = useMemo(() => {
    if (activeCategory === "ALL") return components;
    return components.filter((comp) => comp.category === activeCategory);
  }, [components, activeCategory]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900/95 border-b-2 border-sky-600 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xl sticky top-0 z-50 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase bg-red-600 px-2 py-0.5 rounded">
              NASA JPL
            </span>
            <span className="text-xs font-mono text-cyan-400">
              3D Voxel Models
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold font-mono text-sky-400 tracking-wider flex items-center gap-2 mt-1">
            <span>🚀</span> NASA AEROSPACE VOXEL COMPONENT SHOWCASE
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Procedural compound pixelated 3D models with physical systems engineering constraints (1 Block = 1U Form Factor Envelope)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-semibold transition-all hover:scale-105"
          >
            ⚙️ 2D Systems VAB
          </Link>
          <Link
            href="/minecraft"
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white border border-sky-400 font-mono text-xs font-bold shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
          >
            🎮 ENTER 3D FLIGHT VAB
          </Link>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-3.5 bg-slate-900 border-b border-slate-800 sticky top-[76px] z-40 backdrop-blur-md">
        <span className="text-xs font-mono font-bold text-slate-400 mr-2">
          FILTER:
        </span>
        {FILTER_TABS.map((tab) => {
          const isActive = activeCategory === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveCategory(tab.value)}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-all ${
                isActive
                  ? "bg-sky-600 text-white border border-sky-400 shadow-md shadow-sky-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-sky-400 hover:text-slate-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of 3D Model Cards */}
      <main className="p-6 max-w-[1600px] mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredComponents.map((comp) => (
            <ShowcaseCard key={comp.id} component={comp} />
          ))}
        </div>
      </main>
    </div>
  );
}
