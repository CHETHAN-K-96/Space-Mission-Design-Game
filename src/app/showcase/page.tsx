"use client";

import dynamic from "next/dynamic";
import React from "react";

const ShowcaseView = dynamic(
  () =>
    import("../../components/showcase/ShowcaseView").then(
      (mod) => mod.ShowcaseView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center font-mono text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <span>Loading 3D Component Models...</span>
        </div>
      </div>
    ),
  }
);

export default function ShowcasePage() {
  return <ShowcaseView />;
}
