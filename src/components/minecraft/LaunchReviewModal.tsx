"use client";

import React, { useMemo } from "react";
import { TelemetryData, MissionDef } from "../../engine/minecraft/types";
import {
  X,
  AlertTriangle,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface LaunchReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLaunch: () => void;
  telemetry: TelemetryData;
  activeMission: MissionDef;
  devStage?: string;
}

interface ReviewLog {
  text: string;
  type: "pass" | "fail" | "info";
}

export function LaunchReviewModal({
  isOpen,
  onClose,
  onConfirmLaunch,
  telemetry,
  activeMission,
}: LaunchReviewModalProps) {
  const reviewResult = useMemo(() => {
    const logs: ReviewLog[] = [];
    const errors: string[] = [];

    logs.push({
      text: "=== NASA LAUNCH COMPLEX 39 FLIGHT READINESS REVIEW ===",
      type: "info",
    });
    logs.push({
      text: `Target Profile: ${activeMission.name} (${activeMission.target})`,
      type: "info",
    });

    // 1. STAGE 1 AIRCRAFT LAUNCHER CHECKS (STRICT LAUNCH GATES)
    const rocketCount = telemetry.rocketBlocksCount ?? telemetry.blocksCount;
    if (rocketCount === 0) {
      errors.push("Launch pad empty. No rocket aircraft launcher mounted in Stage 1.");
      logs.push({
        text: "FAIL: Zero rocket launcher components mounted on launch pad.",
        type: "fail",
      });
    }

    // Stage 1 Aircraft Launcher Budget
    if (telemetry.isRocketOverBudget) {
      errors.push(
        `Stage 1 Aircraft Budget Breached: $${telemetry.rocketCostM}M spent exceeds $${telemetry.rocketBudgetM}M budget by $${(
          telemetry.rocketCostM - telemetry.rocketBudgetM
        ).toFixed(1)}M.`
      );
      logs.push({
        text: `FAIL: Aircraft launcher budget breached ($${telemetry.rocketCostM}M / $${telemetry.rocketBudgetM}M).`,
        type: "fail",
      });
    } else {
      logs.push({
        text: `PASS: Stage 1 Aircraft launcher budget certified ($${telemetry.rocketCostM}M / $${telemetry.rocketBudgetM}M, $${telemetry.rocketBudgetRemaining}M reserve).`,
        type: "pass",
      });
    }

    // Propulsion authority & TWR
    if (telemetry.totalThrust < telemetry.minLiftThrust || telemetry.twr < 1.0) {
      errors.push(
        `TWR is ${telemetry.twr} < 1.0. Vehicle cannot lift off against gravity.`
      );
      logs.push({
        text: "FAIL: Gravity exceeds propulsion authority (TWR < 1.0).",
        type: "fail",
      });
    } else if (telemetry.totalThrust < activeMission.min_thrust_kn * 0.75) {
      errors.push(
        `Propulsion Shortfall: Mission requires >= ${activeMission.min_thrust_kn} kN launch thrust.`
      );
      logs.push({
        text: `FAIL: Trajectory shortfall. Requires >= ${activeMission.min_thrust_kn} kN.`,
        type: "fail",
      });
    } else {
      logs.push({
        text: `PASS: Propulsion authority certified (TWR = ${telemetry.twr}x, Thrust = ${telemetry.totalThrust} kN).`,
        type: "pass",
      });
    }

    // Structural Docking & Contiguity Check (No Floating Blocks)
    if (!telemetry.isStructurallyConnected && rocketCount > 0) {
      errors.push(
        "Structural Discontinuity: Disconnected floating modules detected. All rocket blocks must be docked and physically contiguous without air gaps."
      );
      logs.push({
        text: "FAIL: Floating modules detected. Rocket launcher structure has air gaps.",
        type: "fail",
      });
    } else if (rocketCount > 0) {
      logs.push({
        text: "PASS: 100% Structural contiguity verified. All stages docked without air gaps.",
        type: "pass",
      });
    }

    // Aerodynamic Fairing Capping Check
    if (!telemetry.hasAerodynamicNose && rocketCount > 0) {
      errors.push(
        "Aerodynamic Violation: Rocket is missing an aerodynamic nosecone fairing on top. Atmospheric Max-Q dynamic pressure will tear apart an unshielded blunt payload."
      );
      logs.push({
        text: "FAIL: Missing aerodynamic nosecone fairing on top of rocket.",
        type: "fail",
      });
    } else if (rocketCount > 0) {
      logs.push({
        text: "PASS: Aerodynamic nosecone fairing installed. Max-Q airflow stream shielded.",
        type: "pass",
      });
    }

    // Launch Pad Ground Engine Check
    if (!telemetry.hasPadEngine && rocketCount > 0) {
      errors.push("No primary liftoff engine installed at launch pad level.");
      logs.push({
        text: "FAIL: Zero liftoff propulsion engines mounted at pad level.",
        type: "fail",
      });
    }

    // Payload Container Block Check
    if (telemetry.hasPayloadContainer) {
      logs.push({
        text: "PASS: Satellite payload container block mounted beneath nose fairing.",
        type: "pass",
      });
    } else if (rocketCount > 0) {
      errors.push(
        "Payload Missing: No satellite payload container block installed in the payload bay."
      );
      logs.push({
        text: "FAIL: Missing satellite payload container block.",
        type: "fail",
      });
    }

    // Any other structural issues from simulator
    if (telemetry.structuralIssues && telemetry.structuralIssues.length > 0) {
      telemetry.structuralIssues.forEach((issue) => {
        if (!errors.includes(issue)) {
          errors.push(issue);
          logs.push({
            text: `FAIL: ${issue}`,
            type: "fail",
          });
        }
      });
    }

    // 2. STAGE 2 SATELLITE PAYLOAD CHECKS (NON-BLOCKING / ADVISORY)
    // One can launch without developing or entering Stage 2; stage 2 violations do not block launch.
    const satCount = telemetry.satelliteBlocksCount ?? 0;
    if (satCount === 0) {
      logs.push({
        text: "STAGE 2 ADVISORY: Satellite not yet customized (Rocket will launch with sealed payload container).",
        type: "info",
      });
    } else {
      if (telemetry.isSatelliteOverBudget) {
        logs.push({
          text: `STAGE 2 ADVISORY: Satellite budget exceeded ($${telemetry.satelliteCostM}M / $${telemetry.satelliteBudgetM}M) - Non-blocking for rocket launch.`,
          type: "info",
        });
      } else {
        logs.push({
          text: `PASS: Stage 2 Satellite budget certified ($${telemetry.satelliteCostM}M / $${telemetry.satelliteBudgetM}M).`,
          type: "pass",
        });
      }

      if (telemetry.netPower < 0) {
        logs.push({
          text: `STAGE 2 ADVISORY: Satellite power deficit (${telemetry.netPower} W) - Non-blocking for rocket launch.`,
          type: "info",
        });
      } else {
        logs.push({
          text: `PASS: Positive satellite solar power margin (+${telemetry.netPower} W).`,
          type: "pass",
        });
      }

      if (telemetry.batteryCount < activeMission.min_batteries) {
        logs.push({
          text: `STAGE 2 ADVISORY: Satellite battery packs (${telemetry.batteryCount}/${activeMission.min_batteries}) below recommendation.`,
          type: "info",
        });
      } else {
        logs.push({
          text: `PASS: Satellite battery packs certified (${telemetry.batteryCount} units).`,
          type: "pass",
        });
      }

      if (telemetry.payloadCount < activeMission.min_payloads) {
        logs.push({
          text: `STAGE 2 ADVISORY: Satellite scientific payloads (${telemetry.payloadCount}/${activeMission.min_payloads}) below recommendation.`,
          type: "info",
        });
      } else {
        logs.push({
          text: `PASS: Satellite scientific instrumentation certified (${telemetry.sciencePts} Science Points).`,
          type: "pass",
        });
      }
    }

    // Launch readiness is strictly governed by the rocket aircraft launcher
    const isFlightCertified = errors.length === 0;

    return {
      isFlightCertified,
      errors,
      logs,
    };
  }, [telemetry, activeMission]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-sky-600 shadow-[0_0_40px_rgba(2,132,199,0.4)] rounded-lg p-5 w-[680px] max-w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col gap-3.5 text-left">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
          <div>
            <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest">
              FLIGHT READINESS REVIEW
            </span>
            <h3 className="text-white text-base font-bold mt-1">
              Launch Complex 39A Certification
            </h3>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded text-xs transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> CLOSE
          </button>
        </div>

        {/* Status Title Box */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-md text-center">
          <div
            className={`text-base font-bold ${reviewResult.isFlightCertified
              ? "text-emerald-400"
              : "text-rose-400"
              }`}
          >
            {reviewResult.isFlightCertified
              ? "FLIGHT READINESS CERTIFIED (PASS)"
              : "MISSION ABORT: CONSTRAINTS BREACHED"}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {reviewResult.isFlightCertified
              ? "Aircraft launcher verified! Rocket is cleared for orbital launch."
              : reviewResult.errors[0]}
          </div>
        </div>

        {/* Review Logs Console */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-md h-44 overflow-y-auto text-xs leading-relaxed font-mono flex flex-col gap-1">
          {reviewResult.logs.map((item, idx) => (
            <div
              key={idx}
              className={
                item.type === "pass"
                  ? "text-emerald-400"
                  : item.type === "fail"
                    ? "text-rose-400 font-bold"
                    : "text-slate-400"
              }
            >
              {item.text}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-1">
          <div
            className={`text-xs font-bold ${reviewResult.isFlightCertified
              ? "text-emerald-400"
              : "text-rose-400"
              }`}
          >
            {reviewResult.isFlightCertified
              ? "CML: Level 3 (Point Design Validated & Flight Certified)"
              : "CML: Level 1 (Launcher Constraints Breached)"}
          </div>

          {reviewResult.isFlightCertified ? (
            <button
              onClick={() => {
                onClose();
                onConfirmLaunch();
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold text-xs px-5 py-2 border border-emerald-400 rounded shadow-lg shadow-emerald-600/40 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <Rocket className="w-4 h-4" /> CONFIRM ORBITAL LAUNCH
            </button>
          ) : (
            <div className="bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs px-3 py-2 rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>LAUNCH BLOCKED: Resolve rocket structural &amp; propulsion errors</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
