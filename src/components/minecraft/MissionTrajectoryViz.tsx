"use client";

import React, { useEffect, useRef } from "react";
import { MissionDef } from "../../engine/minecraft/types";
import { Rocket, Globe, Compass, CheckCircle2 } from "lucide-react";

interface MissionTrajectoryVizProps {
  isVisible: boolean;
  mission: MissionDef;
  flightTimeSec: number;
  stageName: string;
  altKm: number;
  velKmh: number;
}

export function MissionTrajectoryViz({
  isVisible,
  mission,
  flightTimeSec,
  stageName,
  altKm,
  velKmh,
}: MissionTrajectoryVizProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep space background with subtle starfield
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);

      // Background stars
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 37) % w);
        const sy = ((i * 53) % h);
        const sr = (i % 3 === 0) ? 1.5 : 0.8;
        ctx.globalAlpha = 0.3 + 0.4 * Math.sin(flightTimeSec * 2 + i);
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      const trajType = mission.trajectoryType;

      if (trajType === "TRANS_LUNAR") {
        // --- ARTEMIS LUNAR TRAJECTORY ANIMATION ---
        const earthX = w * 0.22;
        const earthY = h * 0.52;
        const moonX = w * 0.78;
        const moonY = h * 0.44;

        // Draw Earth
        const earthGrad = ctx.createRadialGradient(earthX, earthY, 4, earthX, earthY, 26);
        earthGrad.addColorStop(0, "#38bdf8");
        earthGrad.addColorStop(0.7, "#0284c7");
        earthGrad.addColorStop(1, "#0369a1");
        ctx.fillStyle = earthGrad;
        ctx.beginPath();
        ctx.arc(earthX, earthY, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#93c5fd";
        ctx.font = "bold 10px monospace";
        ctx.fillText("EARTH", earthX - 16, earthY + 36);

        // Earth Parking Orbit rings
        ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.ellipse(earthX, earthY, 44, 32, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Moon
        const moonGrad = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 16);
        moonGrad.addColorStop(0, "#f1f5f9");
        moonGrad.addColorStop(0.8, "#94a3b8");
        moonGrad.addColorStop(1, "#475569");
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#cbd5e1";
        ctx.fillText("MOON", moonX - 14, moonY + 28);

        // Lunar Orbit rings (DRO)
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.beginPath();
        ctx.ellipse(moonX, moonY, 32, 22, -0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Trans-Lunar Injection (TLI) Transfer Arc (Bézier curve)
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(earthX + 38, earthY - 14);
        ctx.bezierCurveTo(w * 0.45, h * 0.15, w * 0.65, h * 0.22, moonX - 25, moonY - 12);
        ctx.stroke();

        // Animated Spacecraft along lunar transfer path
        const tProgress = Math.min(1.0, (flightTimeSec % 12) / 12);
        let shipX: number, shipY: number;

        if (tProgress < 0.28) {
          // Phase 1: Spinning around Earth in parking orbit
          const orbitAngle = tProgress * Math.PI * 8;
          shipX = earthX + Math.cos(orbitAngle) * 44;
          shipY = earthY + Math.sin(orbitAngle) * 32;
        } else if (tProgress < 0.72) {
          // Phase 2: Trans-Lunar coasting arc
          const coastT = (tProgress - 0.28) / 0.44;
          const p0 = { x: earthX + 38, y: earthY - 14 };
          const p1 = { x: w * 0.45, y: h * 0.15 };
          const p2 = { x: w * 0.65, y: h * 0.22 };
          const p3 = { x: moonX - 25, y: moonY - 12 };
          const u = 1 - coastT;
          shipX = u * u * u * p0.x + 3 * u * u * coastT * p1.x + 3 * u * coastT * coastT * p2.x + coastT * coastT * coastT * p3.x;
          shipY = u * u * u * p0.y + 3 * u * u * coastT * p1.y + 3 * u * coastT * coastT * p2.y + coastT * coastT * coastT * p3.y;
        } else {
          // Phase 3: Spinning around Moon in Lunar Orbit & Landing
          const moonAngle = (tProgress - 0.72) * Math.PI * 10;
          const radius = Math.max(16, 32 - (tProgress - 0.72) * 40);
          shipX = moonX + Math.cos(moonAngle) * radius;
          shipY = moonY + Math.sin(moonAngle) * (radius * 0.7);
        }

        // Draw glowing spacecraft pulse
        ctx.fillStyle = "#34d399";
        ctx.beginPath();
        ctx.arc(shipX, shipY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#10b981";
        ctx.font = "bold 9px monospace";
        ctx.fillText(
          tProgress < 0.28 ? "EARTH ORBIT" : tProgress < 0.72 ? "TLI COAST" : "LUNAR CAPTURE",
          shipX - 24,
          shipY - 9
        );

      } else if (trajType === "SUN_EARTH_L2") {
        // --- JAMES WEBB SUN-EARTH L2 LAGRANGE HALO TRAJECTORY ---
        const earthX = w * 0.25;
        const earthY = h * 0.52;
        const l2X = w * 0.80;
        const l2Y = h * 0.52;

        // Earth
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(earthX, earthY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#93c5fd";
        ctx.font = "bold 10px monospace";
        ctx.fillText("EARTH", earthX - 16, earthY + 32);

        // L2 Point Crosshair
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(l2X - 8, l2Y);
        ctx.lineTo(l2X + 8, l2Y);
        ctx.moveTo(l2X, l2Y - 8);
        ctx.lineTo(l2X, l2Y + 8);
        ctx.stroke();

        // L2 Halo Orbit Loop
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.ellipse(l2X, l2Y, 34, 24, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#fbbf24";
        ctx.fillText("L2 (1.5M km)", l2X - 28, l2Y + 38);

        // Parabolic Outward Flight Path
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(earthX + 22, earthY);
        ctx.lineTo(l2X - 30, l2Y);
        ctx.stroke();

        const tProgress = Math.min(1.0, (flightTimeSec % 10) / 10);
        let shipX: number, shipY: number;
        if (tProgress < 0.6) {
          const u = tProgress / 0.6;
          shipX = earthX + 22 + u * (l2X - 30 - (earthX + 22));
          shipY = earthY + Math.sin(u * Math.PI) * -12;
        } else {
          const haloT = (tProgress - 0.6) / 0.4;
          const angle = haloT * Math.PI * 4;
          shipX = l2X + Math.cos(angle) * 34;
          shipY = l2Y + Math.sin(angle) * 24;
        }

        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(shipX, shipY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#fde68a";
        ctx.font = "bold 9px monospace";
        ctx.fillText(tProgress < 0.6 ? "L2 CRUISE" : "HALO ORBIT", shipX - 22, shipY - 8);

      } else if (trajType === "DEEP_SPACE_ASTEROID") {
        // --- PSYCHE ASTEROID MARS-SLINGSHOT BELT TRANSFER ---
        const earthX = w * 0.18;
        const earthY = h * 0.65;
        const marsX = w * 0.48;
        const marsY = h * 0.38;
        const astX = w * 0.82;
        const astY = h * 0.45;

        // Earth
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(earthX, earthY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#93c5fd";
        ctx.font = "bold 9px monospace";
        ctx.fillText("EARTH", earthX - 14, earthY + 26);

        // Mars
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(marsX, marsY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fca5a5";
        ctx.fillText("MARS GRAVITY ASSIST", marsX - 44, marsY + 22);

        // Asteroid 16 Psyche (Metallic asteroid shape)
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.ellipse(astX, astY, 16, 12, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText("16 PSYCHE (2.7 AU)", astX - 38, astY + 26);

        // Trajectory Path through Mars slingshot to Asteroid
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(earthX, earthY);
        ctx.quadraticCurveTo(marsX - 20, marsY - 25, marsX + 15, marsY);
        ctx.quadraticCurveTo(w * 0.66, h * 0.62, astX, astY);
        ctx.stroke();

        const tProgress = Math.min(1.0, (flightTimeSec % 12) / 12);
        let shipX: number, shipY: number;

        if (tProgress < 0.5) {
          const u = tProgress / 0.5;
          const p0 = { x: earthX, y: earthY };
          const p1 = { x: marsX - 20, y: marsY - 25 };
          const p2 = { x: marsX + 15, y: marsY };
          const inv = 1 - u;
          shipX = inv * inv * p0.x + 2 * inv * u * p1.x + u * u * p2.x;
          shipY = inv * inv * p0.y + 2 * inv * u * p1.y + u * u * p2.y;
        } else {
          const u = (tProgress - 0.5) / 0.5;
          const p0 = { x: marsX + 15, y: marsY };
          const p1 = { x: w * 0.66, y: h * 0.62 };
          const p2 = { x: astX, y: astY };
          const inv = 1 - u;
          shipX = inv * inv * p0.x + 2 * inv * u * p1.x + u * u * p2.x;
          shipY = inv * inv * p0.y + 2 * inv * u * p1.y + u * u * p2.y;
        }

        ctx.fillStyle = "#c084fc";
        ctx.beginPath();
        ctx.arc(shipX, shipY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#e9d5ff";
        ctx.font = "bold 9px monospace";
        ctx.fillText(tProgress < 0.5 ? "MARS SLINGSHOT" : "ASTEROID CRUISE", shipX - 32, shipY - 8);

      } else {
        // --- EARTH SENTINEL POLAR SSO ORBIT ---
        const cx = w * 0.5;
        const cy = h * 0.52;

        // Rotating Blue Earth
        const earthGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 45);
        earthGrad.addColorStop(0, "#38bdf8");
        earthGrad.addColorStop(0.7, "#0284c7");
        earthGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = earthGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#bae6fd";
        ctx.font = "bold 10px monospace";
        ctx.fillText("EARTH (POLAR SSO)", cx - 52, cy + 62);

        // Inclined Polar Orbit Ring (66° inclination)
        ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 86, 32, -0.65, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting Satellite with multispectral scanner cone
        const orbitAngle = flightTimeSec * 1.8;
        const rot = -0.65;
        const rawX = Math.cos(orbitAngle) * 86;
        const rawY = Math.sin(orbitAngle) * 32;
        const shipX = cx + rawX * Math.cos(rot) - rawY * Math.sin(rot);
        const shipY = cy + rawX * Math.sin(rot) + rawY * Math.cos(rot);

        // Ground Scan Swath Projection
        ctx.fillStyle = "rgba(56, 189, 248, 0.18)";
        ctx.beginPath();
        ctx.moveTo(shipX, shipY);
        ctx.lineTo(cx + Math.cos(orbitAngle + 0.2) * 38, cy + Math.sin(orbitAngle + 0.2) * 20);
        ctx.lineTo(cx + Math.cos(orbitAngle - 0.2) * 38, cy + Math.sin(orbitAngle - 0.2) * 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(shipX, shipY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#7dd3fc";
        ctx.font = "bold 9px monospace";
        ctx.fillText("SENTINEL-6 (786 km)", shipX - 44, shipY - 8);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isVisible, mission, flightTimeSec]);

  if (!isVisible) return null;

  return (
    <div className="absolute left-6 bottom-20 z-40 bg-slate-950/90 border border-sky-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md font-mono text-slate-200 pointer-events-none min-w-[340px] max-w-[420px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400 animate-spin" />
          <span className="text-xs font-bold text-sky-300 tracking-wider">
            ORBITAL TRAJECTORY SIMULATION
          </span>
        </div>
        <span className="bg-sky-950 border border-sky-600/50 text-[10px] text-sky-400 font-bold px-2 py-0.5 rounded">
          {mission.historicalFlight?.orbitProfile?.orbitName || mission.target}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={380}
        height={170}
        className="rounded-lg border border-slate-800/80 w-full bg-slate-950"
      />

      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
          <span className="text-slate-400 block">TRAJECTORY STATUS</span>
          <strong className="text-emerald-400 font-bold">{stageName}</strong>
        </div>
        <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
          <span className="text-slate-400 block">REAL COUNTERPART</span>
          <strong className="text-amber-300 font-bold truncate block">
            {mission.historicalFlight?.missionName}
          </strong>
        </div>
      </div>
    </div>
  );
}
