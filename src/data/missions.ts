import { MissionScenario } from "../types/game";

export const MISSIONS: MissionScenario[] = [
  {
    id: "lunar_orbiter",
    name: "Artemis Path: Lunar Orbiter",
    target: "Moon (Trans-Lunar Injection)",
    cmlLevel: "CML 1 (Concept Feasibility)",
    objective: "Achieve positive power, at least 40 kN thrust to escape LEO, and stay within an $80M budget limit.",
    initialBudget: 80,
    minThrustKn: 40,
    minDataDelivered: false,
    requiredBatteryCount: 1,
    briefing:
      "NASA Mission Design Lab (MDL) Phase-A Study: Design a lunar transfer CubeSat. Must generate sufficient power to prevent eclipse brownouts, overcome Earth gravitational pull with >= 40 kN thrust, and not exceed $80M cost.",
    tips: [
      "Solar arrays generate +50W each; balance with ion thruster (-40W) consumption.",
      "At least 1 Battery is required to survive the 35-minute lunar orbital eclipse.",
      "Thrust-to-weight ratio must stay strictly above 1.0 against Earth gravity.",
    ],
  },
  {
    id: "earth_climate_sentinel",
    name: "Earth Observation Sentinel",
    target: "Sun-Synchronous Orbit (500 km)",
    cmlLevel: "CML 2 (Trade Studies)",
    objective: "Deploy a multispectral imaging payload (+50 MBps data) and ensure 100% downlink through High-Gain Antenna.",
    initialBudget: 100,
    minThrustKn: 10,
    minDataDelivered: true,
    requiredBatteryCount: 1,
    briefing:
      "NASA Earth Science Division Requirement: Observe carbon and vegetation indices using a Multispectral Camera. Telemetry data buffer overflow must be avoided by downlinking all generated science data to ground stations.",
    tips: [
      "Each Multispectral Camera generates +50 MBps; pair each camera with a High-Gain Antenna (-50 MBps).",
      "Camera + Antenna draws -45W together, requiring at least one Solar Array Block.",
      "Keep remaining budget positive for post-launch operations reserve.",
    ],
  },
  {
    id: "psyche_asteroid_scout",
    name: "Deep Space Asteroid Scout",
    target: "Main Asteroid Belt (2.7 AU)",
    cmlLevel: "CML 3 (Point Design)",
    objective: "Heavy deep-space science probe. Minimum 50 kN thrust, dual payload sensors, and full downlink balance.",
    initialBudget: 120,
    minThrustKn: 50,
    minDataDelivered: true,
    requiredBatteryCount: 2,
    briefing:
      "JPL Deep Space Mission: Probe requires intense propulsion thrust for solar system escape velocity, dual battery storage to survive prolonged occultation, and balanced optical telecommunications.",
    tips: [
      "Heavy spacecraft mass increases required lift thrust; check the live TWR meter.",
      "2 Batteries are mandatory for this deep space trajectory.",
      "Multiple solar arrays are needed to maintain positive power under heavy electrical loads.",
    ],
  },
];
