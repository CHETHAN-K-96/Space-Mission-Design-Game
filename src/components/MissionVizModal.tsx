"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useGame } from "../context/GameContext";
import {
  Rocket,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Award,
  Terminal,
} from "lucide-react";

export function MissionVizModal() {
  const {
    showModal,
    launchStage,
    validationReport,
    telemetry,
    activeMission,
    closeModal,
  } = useGame();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw 2D canvas Earth-to-Space & Moon Trajectory
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Starfield background
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 40; i++) {
      const sx = (i * 37) % w;
      const sy = (i * 23) % h;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // 1. Earth at bottom-left
    ctx.fillStyle = "#1d4ed8";
    ctx.beginPath();
    ctx.arc(60, h + 35, 75, 0, Math.PI * 2);
    ctx.fill();

    // Atmosphere Glow
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(60, h + 35, 78, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Moon at top-right
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.arc(w - 70, 45, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.arc(w - 74, 40, 5, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.font = "10px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("EARTH", 38, h - 15);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("MOON", w - 85, 20);

    // 3. Hohmann Transfer Ellipse Arc
    ctx.beginPath();
    ctx.moveTo(60, h - 42);
    ctx.bezierCurveTo(90, 80, 240, 25, w - 70, 45);
    ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Craft Position along trajectory based on stage
    let progress = 0;
    if (launchStage === "PAD_IGNITION") progress = 0.05;
    else if (launchStage === "MAX_Q") progress = 0.2;
    else if (launchStage === "STAGE_SEP") progress = 0.4;
    else if (launchStage === "LEO_PARKING") progress = 0.6;
    else if (launchStage === "TLI_BURN") progress = 0.85;
    else if (launchStage === "LUNAR_ORBIT" || launchStage === "FINAL_REPORT") progress = 1.0;

    const p0 = { x: 60, y: h - 42 };
    const p1 = { x: 90, y: 80 };
    const p2 = { x: 240, y: 25 };
    const p3 = { x: w - 70, y: 45 };
    const t = progress;

    const cx =
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * p1.x +
      3 * (1 - t) * Math.pow(t, 2) * p2.x +
      Math.pow(t, 3) * p3.x;
    const cy =
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * p1.y +
      3 * (1 - t) * Math.pow(t, 2) * p2.y +
      Math.pow(t, 3) * p3.y;

    // Draw Spacecraft Position
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();
  }, [launchStage]);

  useEffect(() => {
    if (launchStage === "FINAL_REPORT" && validationReport?.passed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#38bdf8", "#34d399", "#f59e0b", "#a855f7"],
      });
    }
  }, [launchStage, validationReport]);

  if (!showModal || !validationReport) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden font-mono"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-3 w-3 rounded-full ${
                  validationReport.passed ? "bg-emerald-400 animate-ping" : "bg-rose-500"
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                NASA Flight Review: {activeMission.name}
              </span>
            </div>
            <button
              onClick={closeModal}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Trajectory Canvas Display */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <div className="flex justify-between text-[11px] text-slate-400 mb-2 font-mono">
                <span className="text-cyan-400 font-bold">FLIGHT STAGE: {launchStage}</span>
                <span>
                  {launchStage === "LUNAR_ORBIT" || launchStage === "FINAL_REPORT"
                    ? "ALT: 384,400 km | V: 1.63 km/s"
                    : launchStage === "TLI_BURN"
                    ? "ALT: 3,800 km | V: 11.18 km/s"
                    : "ALT: 250 km | V: 7.78 km/s"}
                </span>
              </div>
              <canvas
                ref={canvasRef}
                width={560}
                height={160}
                className="w-full h-40 bg-slate-950 rounded-lg"
              />
            </div>

            {/* Flight Diagnostics Terminal Log */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 h-36 overflow-y-auto text-xs space-y-1">
              <div className="text-slate-500 flex items-center gap-1 mb-2">
                <Terminal className="h-3 w-3 text-cyan-400" /> Cape Canaveral Range Telemetry Feed:
              </div>
              {validationReport.logs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.startsWith("PASS")
                      ? "text-emerald-400"
                      : log.startsWith("FAIL")
                      ? "text-rose-400 font-bold"
                      : "text-slate-300"
                  }
                >
                  {log}
                </div>
              ))}
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                <div>
                  <div className="text-[10px] text-slate-400">CERTIFICATION RATING</div>
                  <div className="text-xs font-bold text-emerald-400">
                    {validationReport.cmlAchieved}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/minecraft.html"
                  className="px-4 py-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Rocket className="h-3.5 w-3.5" /> Open 3D Spaceport
                </a>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
