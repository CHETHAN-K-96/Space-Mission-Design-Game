export type SubsystemType =
  | "EPS"
  | "STORAGE"
  | "PAYLOAD"
  | "COMMS"
  | "PROPULSION"
  | "BUS"
  | "AVIONICS"
  | "ADCS"
  | "THERMAL"
  | "STRUCTURE"
  | "ROCKET";

export interface SpacecraftComponent {
  id: string;
  name: string;
  subsystem: SubsystemType;
  mass_kg: number;
  power_w: number;
  cost_m: number;
  thrust_kn: number;
  data_mbps: number;
  color: string;
  borderColor: string;
  glowColor: string;
  iconName: "Sun" | "Battery" | "Camera" | "Radio" | "Rocket" | "Cpu";
  description: string;
  flightHeritage: string;
}

export type GridSlot = SpacecraftComponent | null;

export interface TelemetryState {
  budget_m: number;
  spent_cost_m: number;
  total_mass_kg: number;
  net_power_watts: number;
  net_data_mbps: number;
  total_thrust_kn: number;
  minRequiredThrust: number;
  twr: number;
  batteryCount: number;
  solarCount: number;
  payloadCount: number;
  antennaCount: number;
  eclipseReady: boolean;
  commsBalanced: boolean;
}

export interface MissionScenario {
  id: string;
  name: string;
  target: string;
  cmlLevel: string;
  objective: string;
  initialBudget: number;
  minThrustKn: number;
  minDataDelivered: boolean;
  requiredBatteryCount: number;
  briefing: string;
  tips: string[];
}

export type LaunchStage =
  | "IDLE"
  | "COUNTDOWN"
  | "MAX_Q"
  | "STAGE_SEP"
  | "ORBITAL_INSERTION"
  | "FINAL_REPORT";

export interface ValidationReport {
  passed: boolean;
  errors: string[];
  logs: string[];
  cmlAchieved: string;
  score: number;
}
