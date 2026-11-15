export type BlockType = number;

export type DevStage = "STAGE_1_ROCKET" | "STAGE_2_SATELLITE";

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
  is_container?: boolean;
  desc: string;
  color: string;
}

export interface HistoricalFlightInfo {
  missionName: string;
  agency: string;
  launchDate: string;
  launchTimeUTC: string;
  launchSite: string;
  pad: string;
  weather: {
    tempC: number;
    conditions: string;
    windSpeedKmh: number;
    windDirection: string;
    visibilityKm: number;
    favorablePercentage: number;
  };
  rocketName: string;
  rocketStages: string;
  orbitProfile: {
    orbitName: string;
    perigeeKm: number;
    apogeeKm: number;
    inclinationDeg: number;
    orbitalPeriodMin: number;
    trajectoryDescription: string;
  };
  historicalOutcome: string;
  realBudgetM: number;
}

export interface MissionDef {
  name: string;
  target: string;
  budget_m: number;
  rocket_budget_m?: number;
  satellite_budget_m?: number;
  min_thrust_kn: number;
  min_batteries: number;
  min_payloads: number;
  gravityMultiplier: number;
  require_closed_comms: boolean;
  counterpart?: string;
  scientificGoal?: string;
  desc: string;
  stage1_desc?: string;
  stage2_desc?: string;
  recommended_rocket?: string;
  storyline: {
    chapterTitle: string;
    narrativeIntro: string;
    whyImportant: string;
    engineeringDeliverables: string[];
    threatsAndRisks: string;
    storyLines?: string[];
  };
  historicalFlight: HistoricalFlightInfo;
  trajectoryType: "LEO_POLAR" | "DEEP_SPACE_ASTEROID" | "SUN_EARTH_L2" | "TRANS_LUNAR";
}

export interface MissionDebriefScore {
  totalScore: number;
  grade: "A+" | "A" | "B" | "C" | "FAIL";
  verdict: string;
  breakdown: {
    budgetEfficiency: number;
    structuralMass: number;
    propulsionTWR: number;
    powerBalance: number;
    scienceAlignment: number;
  };
  telemetrySnapshot: {
    finalAltKm: number;
    maxVelKmh: number;
    maxG: string;
    flightDurationSec: number;
    costSpentM: number;
    massKg: number;
    twr: number;
  };
}

export interface TelemetryData {
  blocksCount: number;
  rocketBlocksCount: number;
  satelliteBlocksCount: number;
  totalCostM: number;
  totalBudgetM?: number;
  budgetRemaining: number;
  isOverBudget: boolean;
  overBudgetAmount: number;

  // Separate Stage 1 Aircraft / Rocket Budget & Metrics
  rocketCostM: number;
  rocketBudgetM: number;
  rocketBudgetRemaining: number;
  isRocketOverBudget: boolean;
  rocketMass: number;

  // Separate Stage 2 Satellite Budget & Metrics
  satelliteCostM: number;
  satelliteBudgetM: number;
  satelliteBudgetRemaining: number;
  isSatelliteOverBudget: boolean;
  satelliteMass: number;

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
  hasPayloadContainer: boolean;
  isStructurallyConnected: boolean;
  hasAerodynamicNose: boolean;
  hasPadEngine: boolean;
  structuralIssues: string[];
  stage1Certified: boolean;
  stage2Certified: boolean;
  devStage: DevStage;
}

export type TimeOfDay = "DAY" | "NIGHT";

export interface RaycastHit {
  block: { x: number; y: number; z: number; type: number };
  adjacent: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
}
