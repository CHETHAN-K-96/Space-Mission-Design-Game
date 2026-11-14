"use client";

import React from "react";

export function Crosshair() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10">
      <div className="absolute top-2 left-0 w-5 h-1 bg-white/90 shadow-[0_0_3px_rgba(0,0,0,0.9)]" />
      <div className="absolute top-0 left-2 w-1 h-5 bg-white/90 shadow-[0_0_3px_rgba(0,0,0,0.9)]" />
    </div>
  );
}
