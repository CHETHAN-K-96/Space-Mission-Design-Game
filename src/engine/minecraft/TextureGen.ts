import * as THREE from "three";
import { BLOCKS } from "./constants";

export const TextureGen = {
  createCanvas(w = 32, h = 32): HTMLCanvasElement {
    if (typeof document === "undefined") {
      // Mock for SSR if needed
      return {} as HTMLCanvasElement;
    }
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  },

  fillNoise(ctx: CanvasRenderingContext2D, palette: string[]) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  },

  getBusFrame(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 24, 24);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(28, 28);
    ctx.moveTo(28, 4);
    ctx.lineTo(4, 28);
    ctx.stroke();
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(3, 3, 4, 4);
    ctx.fillRect(25, 3, 4, 4);
    ctx.fillRect(3, 25, 4, 4);
    ctx.fillRect(25, 25, 4, 4);
    return c;
  },

  getAvionics(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(4, 4, 24, 24);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, 24, 24);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(10, 10, 12, 12);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(13, 13, 6, 6);
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(6, 6, 2, 2);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(9, 6, 2, 2);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(12, 6, 2, 2);
    return c;
  },

  getSolarArray(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#64748b";
    ctx.fillRect(14, 2, 4, 28);
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(13, 14, 6, 4);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(2, 6, 11, 20);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 6, 11, 20);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(19, 6, 11, 20);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(19, 6, 11, 20);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(4, 15, 7, 2);
    ctx.fillRect(21, 15, 7, 2);
    ctx.fillRect(7, 8, 1, 16);
    ctx.fillRect(24, 8, 1, 16);
    return c;
  },

  getSolarWing(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#475569";
    ctx.fillRect(15, 1, 2, 30);
    ctx.fillStyle = "#0369a1";
    ctx.fillRect(1, 4, 13, 10);
    ctx.fillRect(1, 18, 13, 10);
    ctx.fillRect(18, 4, 13, 10);
    ctx.fillRect(18, 18, 13, 10);
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(1, 8, 13, 1);
    ctx.fillRect(1, 22, 13, 1);
    ctx.fillRect(18, 8, 13, 1);
    ctx.fillRect(18, 22, 13, 1);
    return c;
  },

  getBattery(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(4, 8, 24, 20);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(4, 8, 24, 20);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(8, 4, 4, 4);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(20, 4, 4, 4);
    ctx.fillStyle = "#34d399";
    ctx.fillRect(8, 12, 16, 3);
    ctx.fillRect(8, 17, 16, 3);
    ctx.fillRect(8, 22, 16, 3);
    return c;
  },

  getIonThruster(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(8, 3, 16, 12);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 3, 16, 12);
    ctx.fillStyle = "#06b6d4";
    ctx.fillRect(9, 15, 14, 3);
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(10, 18);
    ctx.lineTo(22, 18);
    ctx.lineTo(16, 30);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(14, 18, 4, 4);
    return c;
  },

  getSolidBooster(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(10, 7, 12, 18);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(10, 11, 12, 2);
    ctx.fillRect(10, 17, 12, 2);
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.moveTo(10, 7);
    ctx.lineTo(22, 7);
    ctx.lineTo(16, 1);
    ctx.fill();
    ctx.fillStyle = "#b45309";
    ctx.beginPath();
    ctx.moveTo(12, 25);
    ctx.lineTo(20, 25);
    ctx.lineTo(24, 31);
    ctx.lineTo(8, 31);
    ctx.fill();
    return c;
  },

  getMerlinCluster(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#334155";
    ctx.fillRect(4, 4, 24, 6);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(8, 2, 16, 2);
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(22, 10);
    ctx.lineTo(27, 26);
    ctx.lineTo(5, 26);
    ctx.fill();
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.moveTo(12, 12);
    ctx.lineTo(20, 12);
    ctx.lineTo(16, 22);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(15, 13, 2, 4);
    ctx.fillStyle = "#f97316";
    ctx.fillRect(7, 26, 18, 5);
    return c;
  },

  getRS25Engine(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(8, 2, 16, 6);
    ctx.fillStyle = "#b91c1c";
    ctx.beginPath();
    ctx.moveTo(10, 8);
    ctx.lineTo(22, 8);
    ctx.lineTo(28, 27);
    ctx.lineTo(4, 27);
    ctx.fill();
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(12, 10);
    ctx.lineTo(20, 10);
    ctx.lineTo(16, 23);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(15, 12, 2, 5);
    return c;
  },

  getFuselage(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(6, 0, 20, 32);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 0, 20, 32);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(14, 4, 4, 24);
    return c;
  },

  getCryoTank(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#d97706";
    ctx.fillRect(6, 0, 20, 32);
    ctx.strokeStyle = "#9a3412";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 0, 20, 32);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(23, 0, 2, 32);
    ctx.fillStyle = "#b45309";
    ctx.fillRect(6, 7, 20, 2);
    ctx.fillRect(6, 16, 20, 2);
    ctx.fillRect(6, 25, 20, 2);
    return c;
  },

  getInterstage(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(5, 6, 22, 20);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 6, 22, 20);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(8, 14, 16, 4);
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(15, 8, 2, 16);
    return c;
  },

  getFairing(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(5, 30);
    ctx.lineTo(27, 30);
    ctx.lineTo(27, 14);
    ctx.lineTo(16, 1);
    ctx.lineTo(5, 14);
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.fillRect(15, 1, 2, 29);
    return c;
  },

  getGridFin(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#475569";
    ctx.fillRect(4, 6, 24, 20);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(4, 6, 24, 20);
    ctx.fillStyle = "#090d16";
    for (let x = 7; x <= 21; x += 5) {
      for (let y = 9; y <= 21; y += 5) {
        ctx.fillRect(x, y, 3, 3);
      }
    }
    return c;
  },

  getRocketBody(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(5, 0, 22, 32);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 0, 22, 32);
    ctx.fillStyle = "#475569";
    ctx.fillRect(15, 0, 2, 32);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(5, 12, 22, 4);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(10, 20, 4, 4);
    ctx.fillRect(18, 20, 4, 4);
    return c;
  },

  getDockingPort(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#475569";
    ctx.fillRect(4, 10, 24, 12);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(4, 10, 24, 12);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(8, 6, 4, 8);
    ctx.fillRect(20, 6, 4, 8);
    ctx.fillRect(14, 18, 4, 8);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(10, 14, 12, 4);
    return c;
  },

  getPayloadAdapter(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(4, 28);
    ctx.lineTo(28, 28);
    ctx.lineTo(24, 8);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(7, 18, 18, 3);
    return c;
  },

  getVacuumEngine(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#d97706";
    ctx.fillRect(12, 2, 8, 6);
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.moveTo(12, 8);
    ctx.lineTo(20, 8);
    ctx.lineTo(27, 28);
    ctx.lineTo(5, 28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#9a3412";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    return c;
  },

  getLiquidFuelTank(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(5, 0, 22, 32);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 0, 22, 32);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(23, 0, 2, 32);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(8, 14, 16, 4);
    return c;
  },

  getUpperStageTank(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(5, 0, 22, 32);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 0, 22, 32);
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.arc(10, 16, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(22, 16, 3, 0, Math.PI * 2);
    ctx.fill();
    return c;
  },

  getSatPayloadContainer(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    // Outer composite structural cradle
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, 26, 26);
    // Alignment chevron hatch marks
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(4, 4, 6, 3);
    ctx.fillRect(22, 4, 6, 3);
    ctx.fillRect(4, 25, 6, 3);
    ctx.fillRect(22, 25, 6, 3);
    // Translucent payload envelope target
    ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
    ctx.fillRect(8, 8, 16, 16);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 16, 16);
    // Inner crosshair
    ctx.beginPath();
    ctx.moveTo(16, 10);
    ctx.lineTo(16, 22);
    ctx.moveTo(10, 16);
    ctx.lineTo(22, 16);
    ctx.stroke();
    return c;
  },

  getRCS(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#475569";
    ctx.fillRect(12, 12, 8, 8);
    ctx.fillStyle = "#f97316";
    ctx.fillRect(14, 2, 4, 10);
    ctx.fillRect(14, 20, 4, 10);
    ctx.fillRect(2, 14, 10, 4);
    ctx.fillRect(20, 14, 10, 4);
    return c;
  },

  getHighGainDish(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#64748b";
    ctx.fillRect(14, 22, 4, 8);
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(16, 15, 12, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#f8fafc";
    ctx.stroke();
    ctx.fillStyle = "#d97706";
    ctx.fillRect(14, 8, 4, 8);
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(16, 7, 3, 0, Math.PI * 2);
    ctx.fill();
    return c;
  },

  getPatchAntenna(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(4, 4, 24, 24);
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(8, 8, 16, 16);
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(14, 14, 4, 4);
    return c;
  },

  getCamera(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#d97706";
    ctx.fillRect(6, 12, 20, 16);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 12, 20, 16);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(10, 4, 12, 8);
    ctx.fillStyle = "#1d4ed8";
    ctx.fillRect(11, 2, 10, 3);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(13, 2, 3, 2);
    return c;
  },

  getSpectrometer(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#d97706";
    ctx.fillRect(4, 8, 24, 18);
    ctx.fillStyle = "#d946ef";
    ctx.fillRect(10, 12, 12, 10);
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(14, 4, 4, 4);
    return c;
  },

  getMagnetometer(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(15, 0, 2, 32);
    ctx.fillStyle = "#a855f7";
    ctx.fillRect(8, 4, 16, 5);
    ctx.fillRect(8, 22, 16, 5);
    return c;
  },

  getSAR(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#f43f5e";
    for (let y = 3; y <= 27; y += 5) ctx.fillRect(3, y, 26, 3);
    return c;
  },

  getReactionWheel(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#334155";
    ctx.fillRect(4, 4, 24, 24);
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(16, 16, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(14, 14, 4, 4);
    return c;
  },

  getRadiator(): HTMLCanvasElement {
    const c = this.createCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(4, 4, 24, 24);
    ctx.fillStyle = "#475569";
    for (let x = 7; x <= 25; x += 5) ctx.fillRect(x, 4, 2, 24);
    return c;
  },

  getLaunchPadSteel(): HTMLCanvasElement {
    const c = this.createCanvas(16, 16);
    const ctx = c.getContext("2d")!;
    this.fillNoise(ctx, ["#334155", "#1e293b", "#475569"]);
    ctx.fillStyle = "#64748b";
    ctx.strokeRect(1, 1, 14, 14);
    return c;
  },

  getGantryTower(): HTMLCanvasElement {
    const c = this.createCanvas(16, 16);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = "#7f1d1d";
    ctx.fillRect(2, 0, 2, 16);
    ctx.fillRect(12, 0, 2, 16);
    for (let i = 2; i < 14; i += 4) ctx.fillRect(2, i, 12, 2);
    return c;
  },

  getHazardStripe(): HTMLCanvasElement {
    const c = this.createCanvas(16, 16);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#eab308";
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = "#020617";
    for (let i = -16; i < 32; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 4, 0);
      ctx.lineTo(i + 4 + 16, 16);
      ctx.lineTo(i + 16, 16);
      ctx.fill();
    }
    return c;
  },

  getGrass(): HTMLCanvasElement {
    const c = this.createCanvas(16, 16);
    const ctx = c.getContext("2d")!;
    this.fillNoise(ctx, ["#2e7d32", "#1b5e20", "#388e3c", "#43a047"]);
    return c;
  },

  getWater(): HTMLCanvasElement {
    const c = this.createCanvas(16, 16);
    const ctx = c.getContext("2d")!;
    this.fillNoise(ctx, ["#0284c7", "#0369a1", "#0ea5e9"]);
    return c;
  },
};

export function makeTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapLinearFilter;
  return tex;
}

export const MATERIALS: Record<number, THREE.Material> = {};
export const CANVAS_MAP: Record<number, HTMLCanvasElement> = {};

export function initMaterials() {
  if (typeof document === "undefined") return;

  const texMap: Record<number, HTMLCanvasElement> = {
    [BLOCKS.BUS_FRAME]: TextureGen.getBusFrame(),
    [BLOCKS.AVIONICS_C_DH]: TextureGen.getAvionics(),
    [BLOCKS.SOLAR_ARRAY]: TextureGen.getSolarArray(),
    [BLOCKS.SOLAR_WING]: TextureGen.getSolarWing(),
    [BLOCKS.BATTERY_PACK]: TextureGen.getBattery(),
    [BLOCKS.ION_THRUSTER]: TextureGen.getIonThruster(),
    [BLOCKS.SOLID_BOOSTER]: TextureGen.getSolidBooster(),
    [BLOCKS.RCS_THRUSTER]: TextureGen.getRCS(),
    [BLOCKS.HIGH_GAIN_DISH]: TextureGen.getHighGainDish(),
    [BLOCKS.PATCH_ANTENNA]: TextureGen.getPatchAntenna(),
    [BLOCKS.MULTISPECTRAL_CAM]: TextureGen.getCamera(),
    [BLOCKS.SPECTROMETER_IR]: TextureGen.getSpectrometer(),
    [BLOCKS.MAGNETOMETER]: TextureGen.getMagnetometer(),
    [BLOCKS.RADAR_SAR]: TextureGen.getSAR(),
    [BLOCKS.REACTION_WHEEL]: TextureGen.getReactionWheel(),
    [BLOCKS.RADIATOR_PANEL]: TextureGen.getRadiator(),
    [BLOCKS.MERLIN_CLUSTER]: TextureGen.getMerlinCluster(),
    [BLOCKS.RS25_ENGINE]: TextureGen.getRS25Engine(),
    [BLOCKS.ROCKET_FUSELAGE]: TextureGen.getFuselage(),
    [BLOCKS.CRYOGENIC_TANK]: TextureGen.getCryoTank(),
    [BLOCKS.INTERSTAGE_RING]: TextureGen.getInterstage(),
    [BLOCKS.PAYLOAD_FAIRING]: TextureGen.getFairing(),
    [BLOCKS.GRID_FIN]: TextureGen.getGridFin(),
    [BLOCKS.ROCKET_BODY_SHROUD]: TextureGen.getRocketBody(),
    [BLOCKS.DOCKING_PORT]: TextureGen.getDockingPort(),
    [BLOCKS.PAYLOAD_ADAPTER]: TextureGen.getPayloadAdapter(),
    [BLOCKS.VACUUM_ENGINE]: TextureGen.getVacuumEngine(),
    [BLOCKS.LIQUID_FUEL_TANK]: TextureGen.getLiquidFuelTank(),
    [BLOCKS.UPPER_STAGE_TANK]: TextureGen.getUpperStageTank(),
    [BLOCKS.SAT_PAYLOAD_CONTAINER]: TextureGen.getSatPayloadContainer(),
    [BLOCKS.LAUNCH_PAD_STEEL]: TextureGen.getLaunchPadSteel(),
    [BLOCKS.GANTRY_TOWER]: TextureGen.getGantryTower(),
    [BLOCKS.CONCRETE_TILES]: TextureGen.getLaunchPadSteel(),
    [BLOCKS.HAZARD_STRIPE]: TextureGen.getHazardStripe(),
    [BLOCKS.GRASS_PLAINS]: TextureGen.getGrass(),
    [BLOCKS.OCEAN_WATER]: TextureGen.getWater(),
  };

  Object.entries(texMap).forEach(([typeStr, canvas]) => {
    const type = parseInt(typeStr, 10);
    CANVAS_MAP[type] = canvas;
    const tex = makeTexture(canvas);
    MATERIALS[type] = new THREE.MeshLambertMaterial({ map: tex });
  });
}
