"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useGame } from "../context/GameContext";
import {
  Rocket,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  Activity,
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
          className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden font-mono"
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
                NASA Mission Viz: Launch Simulation & Telemetry Stream
              </span>
            </div>
            <button
              onClick={closeModal}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {launchStage !== "FINAL_REPORT" ? (
              // ANIMATED LAUNCH SEQUENCE
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative w-36 h-36 rounded-full border-4 border-dashed border-cyan-500/50 flex items-center justify-center animate-spin">
                  <Rocket className="h-14 w-14 text-cyan-400 -rotate-45" />
                </div>

                <div className="space-y-2">
                  <div className="text-xl font-black tracking-widest text-white uppercase">
                    {launchStage === "COUNTDOWN" && "T-Minus 00:00:03... Main Engine Ignition"}
                    {launchStage === "MAX_Q" && "Passing Max-Q Aerodynamic Boundary"}
                    {launchStage === "STAGE_SEP" && "Fairing Jettison & Stage Separation"}
                    {launchStage === "ORBITAL_INSERTION" && "Deploying Solar Arrays & Trans-Lunar Injection"}
                  </div>
                  <p className="text-xs text-slate-400">
                    Synchronizing live telemetry with NASA Deep Space Network...
                  </p>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-72 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: "0%" }}
                    animate={{
                      width:
                        launchStage === "COUNTDOWN"
                          ? "25%"
                          : launchStage === "MAX_Q"
                          ? "50%"
                          : launchStage === "STAGE_SEP"
                          ? "75%"
                          : "100%",
                    }}
                    transition={{ duration: 1.2 }}
                  />
                </div>
              </div>
            ) : (
              // FINAL SCORECARD & MISSION REPORT
              <div className="space-y-6">
                {/* Status Callout Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-4 ${
                    validationReport.passed
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                      : "bg-rose-950/40 border-rose-500/50 text-rose-200"
                  }`}
                >
                  {validationReport.passed ? (
                    <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="h-7 w-7 text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <h4 className="text-base font-bold uppercase tracking-wide">
                      {validationReport.passed
                        ? "MISSION SUCCESS: Flight Readiness Certified"
                        : "MISSION ABORT: Systems Engineering Failure"}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {validationReport.passed
                        ? `Spacecraft achieved mission trajectory! Concept Maturity Level elevated to ${validationReport.cmlAchieved}. Score: ${validationReport.score} pts.`
                        : "Pre-flight checks flagged physical and orbital constraints violations:"}
                    </p>

                    {validationReport.errors.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-rose-300 font-semibold list-disc list-inside">
                        {validationReport.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Scorecard Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Mass Dry/Wet</span>
                    <div className="text-base font-bold text-white mt-1">
                      {telemetry.total_mass_kg} kg
                    </div>
                    <span className="text-[9px] text-slate-500">CubeSat Bus</span>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Budget Remaining</span>
                    <div
                      className={`text-base font-bold mt-1 ${
                        telemetry.budget_xp >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {telemetry.budget_xp} XP
                    </div>
                    <span className="text-[9px] text-slate-500">Reserve Fund</span>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Power Margin</span>
                    <div className="text-base font-bold text-amber-400 mt-1">
                      +{telemetry.net_power_watts} W
                    </div>
                    <span className="text-[9px] text-slate-500">Day/Night Orbit</span>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Thrust-To-Weight</span>
                    <div className="text-base font-bold text-cyan-400 mt-1">
                      {telemetry.twr}
                    </div>
                    <span className="text-[9px] text-slate-500">Lift Capability</span>
                  </div>
                </div>

                {/* Telemetry Stream Log */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 max-h-36 overflow-y-auto text-[11px] font-mono space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                    <Terminal className="h-3 w-3" /> NASA Telemetry Event Stream:
                  </div>
                  {validationReport.logs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.startsWith("FAIL")
                          ? "text-rose-400 font-semibold"
                          : log.startsWith("PASS")
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>

                {/* Return Control */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Return to Assembly Grid
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
