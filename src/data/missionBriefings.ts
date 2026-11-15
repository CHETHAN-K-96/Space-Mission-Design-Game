export interface MissionBriefing {
  missionKey: string;
  missionName: string;
  agency: string;
  rocketName: string;
  targetOrbit: string;
  budgetM: number;
  minThrustKn: number;
  sentences: string[];
}

export const MISSION_BRIEFINGS: Record<string, MissionBriefing> = {
  artemis_lunar: {
    missionKey: "artemis_lunar",
    missionName: "Artemis I: Lunar Transfer Vehicle",
    agency: "NASA / EXPLORATION SYSTEMS",
    rocketName: "NASA Space Launch System (SLS Block 1)",
    targetOrbit: "Trans-Lunar Injection & Distant Retrograde Orbit (DRO)",
    budgetM: 350.0,
    minThrustKn: 1500,
    sentences: [
      "This mission faithfully recreates NASA's actual Artemis I flight—the flagship mission returning humanity to deep space and the Moon.",
      "The rocket you will construct directly resembles NASA's real-life Space Launch System (SLS Block 1), featuring four RS-25 cryogenic core engines and twin 5-segment solid rocket boosters.",
      "Primary Objective: Propel the Orion spacecraft onto a Trans-Lunar Injection (TLI) trajectory toward a high-apogee lunar retrograde orbit.",
      "Stage 1 Architecture: Stack the orange cryogenic core tank, RS-25 hydrolox engines, twin solid boosters, and interstage to deliver over 1,500 kN of liftoff thrust for TWR > 1.0.",
      "Stage 2 Spacecraft Directive: Integrate the Orion crew capsule, high-gain communications dish, and articulated solar wings beneath an aerodynamic fairing nosecone.",
      "Financial Flight Envelope: Complete the full launch vehicle assembly within the certified $350M program budget ceiling.",
      "All systems are Go at Kennedy Space Center Launch Complex 39B. Flight Director, commence assembly!"
    ],
  },
  earth_sentinel: {
    missionKey: "earth_sentinel",
    missionName: "Earth Observation Sentinel-6",
    agency: "NASA / ESA / EUMETSAT / NOAA",
    rocketName: "SpaceX Falcon 9 Block 5 (Booster B1063.1)",
    targetOrbit: "Sun-Synchronous Polar Low Earth Orbit (1,336 km)",
    budgetM: 160.0,
    minThrustKn: 800,
    sentences: [
      "This mission recreates the real-life international Sentinel-6 Michael Freilich flight, launched from Vandenberg Space Force Base.",
      "The vehicle you will build closely resembles SpaceX's actual Falcon 9 Block 5 launcher, featuring a 9x Merlin 1D first-stage cluster, carbon-composite tanks, and a vacuum upper stage.",
      "Primary Objective: Insert the ocean radar altimeter into a 1,336 km polar orbit to measure global sea level change down to the single millimeter.",
      "Stage 1 Launch Directive: Construct a streamlined single-core Falcon 9 launcher with Merlin engine cluster, RP-1 fuel tanks, and upper vacuum stage with at least 800 kN thrust.",
      "Stage 2 Spacecraft Directive: Equip the payload bus with Synthetic Aperture Radar (SAR), multispectral imager, LiFePO4 batteries, and GaAs solar wings inside the payload slot.",
      "Financial Flight Envelope: Deliver full mission flight certification within the strict $160M program budget ceiling.",
      "Space Launch Complex 4E telemetry is green. Flight Director, begin vehicle integration!"
    ],
  },
  asteroid_scout: {
    missionKey: "asteroid_scout",
    missionName: "Psyche Deep Space Asteroid Scout",
    agency: "NASA JET PROPULSION LABORATORY (JPL)",
    rocketName: "SpaceX Falcon Heavy (Core + Dual Side Boosters)",
    targetOrbit: "Heliocentric Mars-Slingshot Transfer (2.7 AU)",
    budgetM: 290.0,
    minThrustKn: 1200,
    sentences: [
      "This mission is modeled directly after NASA JPL's real-life Psyche deep-space voyage toward the metal-rich asteroid belt.",
      "The launch vehicle mirrors the massive triple-core SpaceX Falcon Heavy, utilizing a high-thrust central booster core flanked by twin strap-on liquid rocket boosters.",
      "Primary Objective: Slingshot past Mars and cruise to a 2.7 AU heliocentric orbit to explore a primordial metallic planetary core.",
      "Stage 1 Launch Directive: Assemble the triple-core heavy-lift launcher with dual side boosters, generating at least 1,200 kN thrust to achieve solar escape velocity.",
      "Stage 2 Spacecraft Directive: Equip the interplanetary probe with NEXT Xenon Ion Thrusters, fluxgate magnetometers, and infrared spectrometers for scientific analysis.",
      "Financial Flight Envelope: Balance deep-space sensor arrays and heavy propellant staging within the $290M certified budget envelope.",
      "Deep Space Network (DSN) link established. Flight Director, prepare the heavy-lift stack for flight!"
    ],
  },
  space_telescope: {
    missionKey: "space_telescope",
    missionName: "James Webb-Class Space Observatory",
    agency: "NASA / ESA / CSA",
    rocketName: "Arianespace Ariane 5 ECA (Flight VA256)",
    targetOrbit: "Sun-Earth L2 Lagrange Halo Orbit (1,500,000 km)",
    budgetM: 300.0,
    minThrustKn: 1400,
    sentences: [
      "This mission recreates the historic Christmas 2021 launch of the James Webb Space Telescope (JWST) from the Guiana Space Centre in Kourou.",
      "The rocket architecture directly reflects Arianespace's heavy-lift Ariane 5 ECA, featuring a cryogenic Vulcain core stage, twin solid boosters, and an acoustic-attenuating payload fairing.",
      "Primary Objective: Achieve pinpoint orbital injection toward the Sun-Earth L2 Lagrange point 1.5 million kilometers from Earth to image the first stars in cosmic history.",
      "Stage 1 Launch Directive: Assemble a heavy-lift booster stack delivering over 1,400 kN liftoff thrust while safeguarding delicate space optics through Max-Q transonic buffeting.",
      "Stage 2 Spacecraft Directive: Enclose the Atmospheric IR Spectrometer, deployable thermal radiators, and high-gain parabolic antenna beneath the aerodynamic fairing shroud.",
      "Financial Flight Envelope: Satisfy all flagship observatory mission parameters under the certified $300M budget allocation.",
      "Guiana Launch Center telemetry is synchronized. Flight Director, commence observatory integration!"
    ],
  },
  sandbox_mode: {
    missionKey: "sandbox_mode",
    missionName: "Custom Engineering Sandbox",
    agency: "NASA MISSION DESIGN LAB & ADVANCED CONCEPTS",
    rocketName: "Experimental Modular Rapid Prototype Vehicle",
    targetOrbit: "User-Defined Custom Orbital Trajectory",
    budgetM: 999.0,
    minThrustKn: 0,
    sentences: [
      "Welcome to NASA's Advanced Systems Concepts Sandbox—an unrestricted aerospace engineering playground.",
      "In this environment, you have unrestricted access to all aerospace components, RS-25 and Merlin engines, cryogenic tanks, and scientific instrumentation.",
      "Architect and test extreme multi-core rocket configurations, orbital space stations, or futuristic deep-space probes without budget caps or mass constraints.",
      "Validate structural staging, aerodynamic fairing cutaways, and thrust-to-weight liftoff physics against genuine aerospace equations.",
      "Flight Director, the entire 3D Launch Complex and VAB are at your disposal—engineer the impossible!"
    ],
  },
};
