import { MissionScenario } from "../types/game";

export const MISSIONS: MissionScenario[] = [
  {
    id: "artemis_lunar",
    name: "Artemis: Lunar Transfer Orbiter",
    target: "Moon (Trans-Lunar Injection)",
    cmlLevel: "CML 1 (Concept Feasibility)",
    objective: "Escape Low Earth Orbit and enter Lunar Polar Orbit. Survive lunar eclipse and downlink surface data.",
    baseBudgetM: 10.0,
    minThrustKn: 50,
    minBatteries: 1,
    minPayloads: 1,
    requireClosedComms: false,
    briefing:
      "NASA Artemis CSLI Mission: Design an Artemis secondary payload CubeSat. Must generate positive solar power, survive 35 minutes of eclipse darkness, overcome gravity well with >= 50 kN thrust, and stay within $10.0M budget.",
    tips: [
      "Solid Rocket Boosters provide instant 120 kN thrust to overcome Earth gravity well.",
      "Solar arrays generate +50W each; pair with battery packs to survive orbital occultation.",
      "Check the live TWR meter (must be >= 1.0 to clear Cape Canaveral Pad 39A).",
    ],
  },
  {
    id: "earth_sentinel",
    name: "Earth Observation Sentinel",
    target: "Sun-Synchronous LEO (500 km)",
    cmlLevel: "CML 2 (Trade Studies)",
    objective: "Deploy multispectral camera for global climate/vegetation monitoring and ensure balanced telemetry downlink.",
    baseBudgetM: 12.0,
    minThrustKn: 40,
    minBatteries: 1,
    minPayloads: 1,
    requireClosedComms: true,
    briefing:
      "NASA Earth Science Technology Office: Deploy high-cadence multispectral imaging into 500 km SSO polar orbit. Telemetry downlink must equal or exceed sensor generation to prevent memory buffer overflow.",
    tips: [
      "Multispectral Camera produces +50 MBps; pair with High-Gain X-Band Dish (-50 MBps).",
      "Camera + Dish consumes -40W; deploy at least one Solar Array to maintain net positive power.",
      "Thrust requirement is 40 kN for orbit-raising maneuvers.",
    ],
  },
  {
    id: "asteroid_scout",
    name: "Deep Space Asteroid Scout",
    target: "Main Asteroid Belt (2.7 AU)",
    cmlLevel: "CML 3 (Point Design Validated)",
    objective: "High delta-V interplanetary mission. Dual science payloads, redundant batteries, and high thrust.",
    baseBudgetM: 15.0,
    minThrustKn: 80,
    minBatteries: 2,
    minPayloads: 2,
    requireClosedComms: true,
    briefing:
      "JPL Deep Space Mission: Probe requires high propulsion thrust for solar system escape velocity, dual battery storage to survive prolonged occultation, and balanced optical telecommunications.",
    tips: [
      "Heavy spacecraft mass increases required lift thrust; check the live TWR meter.",
      "2 Batteries are mandatory for this deep space trajectory.",
      "Multiple solar arrays are needed to maintain positive power under heavy electrical loads.",
    ],
  },
  {
    id: "space_telescope",
    name: "James Webb-Class Space Observatory",
    target: "Sun-Earth L2 Lagrange Point (1.5M km)",
    cmlLevel: "CML 3 (Point Design Validated)",
    objective: "Deep space astronomical observatory. Maximum solar generation, persistent payload sensing, and DSN downlink.",
    baseBudgetM: 18.0,
    minThrustKn: 60,
    minBatteries: 2,
    minPayloads: 2,
    requireClosedComms: true,
    briefing:
      "NASA Astrophysics Division: Halo orbit observatory at Sun-Earth L2. Requires extreme power stability, high-throughput downlink, and scientific sensor integration.",
    tips: [
      "Requires high solar capacity (+100W) to power cryo instruments.",
      "High-gain dish is required for persistent deep space tracking.",
      "Ensure structural bus and avionics computers are properly mounted.",
    ],
  },
];
