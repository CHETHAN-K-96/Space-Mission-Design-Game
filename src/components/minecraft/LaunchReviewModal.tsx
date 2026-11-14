"use client";

import React, { useMemo } from "react";
import { TelemetryData, MissionDef } from "../../engine/minecraft/types";

interface LaunchReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLaunch: () => void;
  telemetry: TelemetryData;
  activeMission: MissionDef;
}

export function LaunchReviewModal({
  isOpen,
  onClose,
  onConfirmLaunch,
  telemetry,
  activeMission,
}: LaunchReviewModalProps) {
  const reviewResult = useMemo(() => {
    const logs: { text: string; type: "info" | "pass" | "fail" }[] = [];
    const errors: string[] = [];

    logs.push({
      text: "T-00:10:00 - Flight Readiness Review initiated at Launch Complex 39A.",
      type: "info",
    });
    logs.push({
      text: `Target Profile: ${activeMission.name} (${activeMission.target})`,
      type: "info",
    });

    if (telemetry.blocksCount === 0) {
      errors.push("Payload bay empty. No spacecraft mounted.");
      logs.push({
        text: "FAIL: Zero spacecraft components mounted on pad.",
        type: "fail",
      });
    }

    if (telemetry.budgetRemaining < 0) {
      errors.push(
        `Budget ceiling breached by ${Math.abs(telemetry.budgetRemaining)} XP.`
      );
      logs.push({
        text: `FAIL: Cost ceiling breached (${telemetry.totalXP} XP / ${activeMission.budget_xp} XP).`,
        type: "fail",
      });
    } else {
      logs.push({
        text: `PASS: Budget certified with ${telemetry.budgetRemaining} XP reserve.`,
        type: "pass",
      });
    }

    if (telemetry.totalThrust < telemetry.minLiftThrust) {
      errors.push(
        `TWR is ${telemetry.twr} < 1.0. Vehicle cannot lift off against gravity.`
      );
      logs.push({
        text: "FAIL: Gravity exceeds propulsion authority.",
        type: "fail",
      });
    } else if (telemetry.totalThrust < activeMission.min_thrust_kn) {
      errors.push(
        `Shortfall: Mission requires >= ${activeMission.min_thrust_kn} kN thrust.`
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

    if (telemetry.netPower < 0) {
      errors.push(
        `Power brownout: Spacecraft experiences deficit of ${Math.abs(
          telemetry.netPower
        )} W in sunlight.`
      );
      logs.push({
        text: "FAIL: Electrical power system (EPS) brownout.",
        type: "fail",
      });
    } else if (telemetry.powerGen === 0 && telemetry.blocksCount > 0) {
      errors.push("No solar arrays installed. Spacecraft will exhaust batteries.");
      logs.push({ text: "FAIL: Zero primary solar power source.", type: "fail" });
    } else {
      logs.push({
        text: `PASS: Positive solar power margin (+${telemetry.netPower} W).`,
        type: "pass",
      });
    }

    if (telemetry.batteryCount < activeMission.min_batteries) {
      errors.push(
        `Insufficient energy storage: Mission requires >= ${activeMission.min_batteries} Battery Pack(s) for 35-min eclipse.`
      );
      logs.push({
        text: "FAIL: Spacecraft will perish in orbital eclipse shadow.",
        type: "fail",
      });
    } else {
      logs.push({
        text: `PASS: Eclipse battery storage certified (${telemetry.batteryCount} units).`,
        type: "pass",
      });
    }

    if (
      activeMission.require_closed_comms &&
      telemetry.dataGen > telemetry.dataDownlink
    ) {
      errors.push(
        `Comms buffer overflow: Scientific instruments generate +${telemetry.dataGen} MBps but antenna only downlinks ${telemetry.dataDownlink} MBps.`
      );
      logs.push({
        text: "FAIL: Onboard data buffer saturation.",
        type: "fail",
      });
    } else {
      logs.push({
        text: "PASS: Telemetry downlink and DSN communication closed.",
        type: "pass",
      });
    }

    if (telemetry.payloadCount < activeMission.min_payloads) {
      errors.push(
        `Primary science objective unfulfilled: Install at least ${activeMission.min_payloads} scientific instruments.`
      );
      logs.push({
        text: "FAIL: Mission lacks primary sensor payload.",
        type: "fail",
      });
    } else {
      logs.push({
        text: `PASS: Scientific payload certified (${telemetry.payloadCount} instruments, ${telemetry.sciencePts} science return).`,
        type: "pass",
      });
    }

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
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded text-xs transition-colors"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Status Title Box */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-md text-center">
          <div
            className={`text-base font-bold ${
              reviewResult.isFlightCertified
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
              ? "All NASA systems engineering requirements satisfied!"
              : reviewResult.errors[0]}
          </div>
        </div>

        {/* Review Logs Console */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-md h-40 overflow-y-auto text-xs leading-relaxed font-mono flex flex-col gap-1">
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
            className={`text-xs font-bold ${
              reviewResult.isFlightCertified
                ? "text-emerald-400"
                : "text-rose-400"
            }`}
          >
            {reviewResult.isFlightCertified
              ? "CML: Level 3 (Point Design Validated & Flight Certified)"
              : "CML: Level 1 (Concept Abort)"}
          </div>

          {reviewResult.isFlightCertified && (
            <button
              onClick={() => {
                onClose();
                onConfirmLaunch();
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold text-xs px-5 py-2 border border-emerald-400 rounded shadow-lg shadow-emerald-600/40 transition-all hover:scale-105"
            >
              CONFIRM ORBITAL LAUNCH
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
