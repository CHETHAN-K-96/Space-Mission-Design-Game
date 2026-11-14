"use client";

import dynamic from "next/dynamic";
import React from "react";

const MinecraftGame = dynamic(
  () =>
    import("../components/minecraft/MinecraftGame").then(
      (mod) => mod.MinecraftGame
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-[#020617] flex items-center justify-center font-mono text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <span className="text-sm font-semibold tracking-wide">
            INITIALIZING NASA 3D SPACEPORT LAUNCH COMPLEX & VAB...
          </span>
        </div>
      </div>
    ),
  }
);

export default function RootPage() {
  return <MinecraftGame />;
}
