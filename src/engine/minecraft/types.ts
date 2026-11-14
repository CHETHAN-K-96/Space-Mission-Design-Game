export type BlockType = number;

export interface ComponentDef {
  name: string;
  subsystem: string;
  category: "POWER" | "PROPULSION" | "SCIENCE" | "COMMS" | "ROCKET";
  cost_m: number;
  mass_kg: number;
  power_w: number;
  thrust_kn: number;
  data_mbps: number;
  science_pts: number;
  is_battery?: boolean;
  is_payload?: boolean;
  desc: string;
  color: string;
}

export interface MissionDef {
  name: string;
  target: string;
  budget_m: number;
  min_thrust_kn: number;
  min_batteries: number;
  min_payloads: number;
  gravityMultiplier: number;
  require_closed_comms: boolean;
  counterpart?: string;
  scientificGoal?: string;
  desc: string;
}

export interface TelemetryData {
  blocksCount: number;
  totalCostM: number;
  budgetRemaining: number;
  totalMass: number;
  powerGen: number;
  powerDraw: number;
  netPower: number;
  totalThrust: number;
  minLiftThrust: number;
  twr: number;
  dataGen: number;
  dataDownlink: number;
  batteryCount: number;
  payloadCount: number;
  sciencePts: number;
}

export type TimeOfDay = "DAY" | "SUNSET" | "NIGHT" | "SUNRISE";

export interface RaycastHit {
  block: { x: number; y: number; z: number; type: number };
  adjacent: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
}
