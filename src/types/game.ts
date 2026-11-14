export type SubsystemType =
  | "STRUCTURE"
  | "AVIONICS"
  | "POWER"
  | "PROPULSION"
  | "COMMS"
  | "PAYLOAD"
  | "ROCKET"
  | "EPS"
  | "STORAGE"
  | "BUS"
  | "ADCS"
  | "THERMAL";

export type DifficultyMode = "easy" | "normal" | "hard";

export interface SpacecraftComponent {
  id: string;
  name: string;
  category: "Engine" | "Payload" | "Structure" | "Avionics" | "Power" | "Comms" | "Rocket";
  subsystem: SubsystemType;
  mass_kg: number;
  power_w: number;
  cost_m: number;
  thrust_kn: number;
  data_mbps: number;
  science_pts: number;
  isBattery?: boolean;
  isPayload?: boolean;
  color: string;
  borderColor: string;
  glowColor: string;
  iconName: "Rocket" | "Zap" | "Wind" | "Box" | "Cpu" | "Sun" | "Battery" | "Radio" | "Antenna" | "Camera" | "Magnet";
  description: string;
  flightHeritage: string;
}

export type GridSlot = SpacecraftComponent | null;

export interface TelemetryState {
  budget_cap_m: number;
  spent_cost_m: number;
  budget_remaining_m: number;
  total_mass_kg: number;
  net_power_watts: number;
  power_generation_w: number;
  power_consumption_w: number;
  net_data_mbps: number;
  total_thrust_kn: number;
  minRequiredThrust: number;
  twr: number;
  batteryCount: number;
  solarCount: number;
  payloadCount: number;
  commsCount: number;
  eclipseMinutes: number;
  eclipseReady: boolean;
  commsBalanced: boolean;
  thrustReady: boolean;
  budgetReady: boolean;
  powerReady: boolean;
  scienceReady: boolean;
}

export interface MissionScenario {
  id: string;
  name: string;
  target: string;
  cmlLevel: string;
  objective: string;
  baseBudgetM: number;
  minThrustKn: number;
  minBatteries: number;
  minPayloads: number;
  requireClosedComms: boolean;
  briefing: string;
  tips: string[];
}

export type LaunchStage =
  | "IDLE"
  | "PAD_IGNITION"
  | "MAX_Q"
  | "STAGE_SEP"
  | "LEO_PARKING"
  | "TLI_BURN"
  | "LUNAR_ORBIT"
  | "FINAL_REPORT";

export interface ValidationReport {
  passed: boolean;
  errors: string[];
  logs: string[];
  cmlAchieved: string;
  score: number;
}
