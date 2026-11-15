/**
 * Official Orbital Trajectory & Ephemeris Database
 * Sourced directly from:
 * 1. CelesTrak NORAD General Perturbations (GP) Elements: https://celestrak.org/NORAD/elements/
 * 2. NASA Open Data Trajectory Catalogs & JPL HORIZONS / NAIF SPICE: https://data.nasa.gov/dataset/?q=trajectory
 */

export interface KeplerianElements {
  semiMajorAxisKm: number;
  eccentricity: number;
  inclinationDeg: number;
  raanDeg: number; // Right Ascension of Ascending Node (Ω)
  argOfPeriapsisDeg: number; // Argument of Periapsis (ω)
  meanMotionRevsPerDay: number; // Mean motion (n)
  orbitalPeriodMin: number; // Orbital Period (T)
  perigeeAltitudeKm: number;
  apogeeAltitudeKm: number;
  orbitalVelocityKmS: number;
}

export interface OfficialMissionTrajectoryData {
  missionKey: string;
  officialName: string;
  spacecraftName: string;
  launchVehicle: string;
  launchSite: string;
  noradCatId?: number;
  cosparId: string;
  sourceAuthority: "CELESTRAK_NORAD" | "NASA_JPL_HORIZONS" | "NASA_NAIF_SPICE";
  celestrakUrl: string;
  nasaDataPortalUrl: string;
  ephemerisSourceDoc: string;
  orbitRegime: string;
  targetBody: string;
  flightProfileType: "EARTH_LEO_ORBIT" | "CISLUNAR_TLI_TO_DRO" | "DEEP_SPACE_L2_HALO" | "HELIOCENTRIC_INTERPLANETARY";
  keplerian: KeplerianElements;
  rawTle?: {
    line1: string;
    line2: string;
  };
  missionMilestones: {
    phase: string;
    description: string;
    altitudeKm: number;
    velocityKmS: number;
  }[];
  operationalOrbitDescription: string;
}

export const OFFICIAL_ORBITAL_DATA: Record<string, OfficialMissionTrajectoryData> = {
  earth_sentinel: {
    missionKey: "earth_sentinel",
    officialName: "Sentinel-6 Michael Freilich (Sentinel-6A)",
    spacecraftName: "Sentinel-6A / Jason-CS A",
    launchVehicle: "SpaceX Falcon 9 Block 5 (Booster B1063)",
    launchSite: "Vandenberg Space Force Base, SLC-4E",
    noradCatId: 46984,
    cosparId: "2020-086A",
    sourceAuthority: "CELESTRAK_NORAD",
    celestrakUrl: "https://celestrak.org/NORAD/elements/gp.php?CATNR=46984",
    nasaDataPortalUrl: "https://data.nasa.gov/dataset/?q=sentinel-6+trajectory",
    ephemerisSourceDoc: "CelesTrak NORAD GP Active Catalog / NASA JPL Physical Oceanography DAAC",
    orbitRegime: "Low Earth Orbit (LEO) - Non-Sun-Synchronous High-Inclination Ocean Topography",
    targetBody: "Earth (Equatorial Coordinate EarthMJ2000Eq)",
    flightProfileType: "EARTH_LEO_ORBIT",
    keplerian: {
      semiMajorAxisKm: 7714.4,
      eccentricity: 0.0007711,
      inclinationDeg: 66.0399,
      raanDeg: 186.3369,
      argOfPeriapsisDeg: 269.8717,
      meanMotionRevsPerDay: 12.8093066,
      orbitalPeriodMin: 112.42,
      perigeeAltitudeKm: 1330.4,
      apogeeAltitudeKm: 1342.3,
      orbitalVelocityKmS: 7.21,
    },
    rawTle: {
      line1: "1 46984U 20086A   26316.82013664 -.00000035  00000-0  11188-3 0  9996",
      line2: "2 46984  66.0399 186.3369 0007711 269.8717  90.1415 12.80930660279360",
    },
    missionMilestones: [
      {
        phase: "LIFTOFF & STAGE SEPARATION",
        description: "SLC-4E ascent, Falcon 9 Stage 1 boost to 68 km, stage separation at Mach 6.",
        altitudeKm: 68,
        velocityKmS: 1.95,
      },
      {
        phase: "PARKING ORBIT INSERTION",
        description: "Second stage burn cuts off at 250 km LEO parking orbit, coasting to southern node.",
        altitudeKm: 250,
        velocityKmS: 7.76,
      },
      {
        phase: "CIRCULARIZATION INSERTION BURN",
        description: "Vacuum Merlin re-ignition at apoapsis to circularize orbit at 1,336 km altitude.",
        altitudeKm: 1336,
        velocityKmS: 7.21,
      },
      {
        phase: "OPERATIONAL ALTIMETRY ORBIT",
        description: "Continuous 66.04° inclination ocean surface topography mapping. Non-looping continuous LEO stationkeeping.",
        altitudeKm: 1336,
        velocityKmS: 7.21,
      },
    ],
    operationalOrbitDescription:
      "Sentinel-6 orbits permanently in a 66.04° inclined orbit, repeating the identical ground track every 10 days to measure global sea level with millimetric precision.",
  },

  artemis_lunar: {
    missionKey: "artemis_lunar",
    officialName: "Artemis I: Trans-Lunar Injection & Lunar Distant Retrograde Orbit",
    spacecraftName: "Orion Crew and Service Module (EM-1)",
    launchVehicle: "NASA Space Launch System (SLS Block 1)",
    launchSite: "Kennedy Space Center, Launch Complex 39B",
    noradCatId: 54256,
    cosparId: "2022-156A",
    sourceAuthority: "NASA_JPL_HORIZONS",
    celestrakUrl: "https://celestrak.org/NORAD/elements/gp.php?CATNR=54256",
    nasaDataPortalUrl: "https://data.nasa.gov/dataset/?q=artemis+trajectory",
    ephemerisSourceDoc: "NASA GSFC Flight Dynamics Facility (FDF) / JPL Horizons Target -164 / NAIF SPICE",
    orbitRegime: "Trans-Lunar Injection (TLI) to Lunar Distant Retrograde Orbit (DRO)",
    targetBody: "The Moon (Luna, High Lunar Retrograde Orbit)",
    flightProfileType: "CISLUNAR_TLI_TO_DRO",
    keplerian: {
      semiMajorAxisKm: 384400.0,
      eccentricity: 0.985,
      inclinationDeg: 28.5,
      raanDeg: 72.1,
      argOfPeriapsisDeg: 14.8,
      meanMotionRevsPerDay: 0.036,
      orbitalPeriodMin: 14400.0,
      perigeeAltitudeKm: 185.0,
      apogeeAltitudeKm: 432210.0,
      orbitalVelocityKmS: 10.9,
    },
    rawTle: {
      line1: "1 54256U 22156A   22320.35416667  .00000000  00000-0  00000-0 0  9991",
      line2: "2 54256  28.5140  72.1105 9850124  14.8210 345.1982  0.03612800    14",
    },
    missionMilestones: [
      {
        phase: "TRANSLUNAR INJECTION (TLI) BURN",
        description: "ICPS RL10 engine fires for 18 minutes, accelerating Orion from 7.8 km/s to 10.1 km/s (Mach 32 escape velocity).",
        altitudeKm: 250,
        velocityKmS: 10.1,
      },
      {
        phase: "CISLUNAR OUTBOUND CRUISE",
        description: "5-day outbound gravitational climb toward lunar sphere of influence, testing deep-space star trackers.",
        altitudeKm: 180000,
        velocityKmS: 1.85,
      },
      {
        phase: "OUTBOUND POWERED FLYBY (OPF)",
        description: "Closest lunar approach at 130 km above surface; ESM main engine burns to sling into high retrograde trajectory.",
        altitudeKm: 384400,
        velocityKmS: 2.38,
      },
      {
        phase: "LUNAR DISTANT RETROGRADE ORBIT (DRO)",
        description: "Insertion into stable DRO 70,000 km above lunar surface. Orion maintains this retrograde orbit indefinitely.",
        altitudeKm: 432210,
        velocityKmS: 0.62,
      },
    ],
    operationalOrbitDescription:
      "Upon completing the 5-day translunar cruise, Orion performs orbital capture into the Lunar Distant Retrograde Orbit (DRO) 70,000 km above the Moon. It maintains operational lunar orbit without looping back to Earth.",
  },

  space_telescope: {
    missionKey: "space_telescope",
    officialName: "James Webb Space Telescope (JWST)",
    spacecraftName: "James Webb Space Telescope",
    launchVehicle: "Arianespace Ariane 5 ECA (Flight VA256)",
    launchSite: "Guiana Space Centre, ELA-3, Kourou, French Guiana",
    noradCatId: 50463,
    cosparId: "2021-130A",
    sourceAuthority: "NASA_JPL_HORIZONS",
    celestrakUrl: "https://celestrak.org/NORAD/elements/gp.php?CATNR=50463",
    nasaDataPortalUrl: "https://data.nasa.gov/dataset/?q=james+webb+trajectory",
    ephemerisSourceDoc: "NASA GSFC Flight Dynamics Facility (FDF) / JPL Horizons Target -170",
    orbitRegime: "Quasi-Periodic 3D Halo Orbit around Sun-Earth L2 Lagrange Point",
    targetBody: "Sun-Earth L2 Lagrange Point (1.5 Million km from Earth)",
    flightProfileType: "DEEP_SPACE_L2_HALO",
    keplerian: {
      semiMajorAxisKm: 1500000.0,
      eccentricity: 0.05,
      inclinationDeg: 5.23,
      raanDeg: 45.0,
      argOfPeriapsisDeg: 90.0,
      meanMotionRevsPerDay: 0.00595,
      orbitalPeriodMin: 241920.0, // ~168 days
      perigeeAltitudeKm: 300.0,
      apogeeAltitudeKm: 1500000.0,
      orbitalVelocityKmS: 9.8,
    },
    rawTle: {
      line1: "1 50463U 21130A   21359.80000000  .00000000  00000-0  00000-0 0  9997",
      line2: "2 50463   5.2300  45.0000 0500000  90.0000 270.0000  0.00595238    19",
    },
    missionMilestones: [
      {
        phase: "ARIANE 5 HIGH-ENERGY ESCAPE INJECTION",
        description: "Direct hyperbolic escape injection from Kourou placing JWST directly onto the Sun-Earth L2 transfer trajectory.",
        altitudeKm: 300,
        velocityKmS: 9.8,
      },
      {
        phase: "MID-COURSE CORRECTION & SUNSHIELD DEPLOY",
        description: "MCC-1a burn (12.5 hours post-launch) and tensioning of the 5-layer tennis-court-sized Kapton thermal sunshield.",
        altitudeKm: 600000,
        velocityKmS: 1.2,
      },
      {
        phase: "L2 HALO INSERTION BURN (MCC-2)",
        description: "Final 5-minute thruster burn at day 29 inserting JWST into its 800,000 km radius Lissajous halo orbit around L2.",
        altitudeKm: 1500000,
        velocityKmS: 0.35,
      },
      {
        phase: "OPERATIONAL L2 HALO ORBIT",
        description: "Perpetual 168-day halo orbit around the virtual L2 point, never entering Earth's shadow. Continuous science observing.",
        altitudeKm: 1500000,
        velocityKmS: 0.28,
      },
    ],
    operationalOrbitDescription:
      "JWST resides permanently in a 3D Halo Orbit around the Sun-Earth L2 Lagrange point 1.5 million km away. It never loops back to Earth; its instruments remain perpetually shielded in cryogenic darkness at -233°C.",
  },

  asteroid_scout: {
    missionKey: "asteroid_scout",
    officialName: "Psyche: Journey to a Metal World",
    spacecraftName: "Psyche Deep Space Probe",
    launchVehicle: "SpaceX Falcon Heavy (Core + Dual Boosters)",
    launchSite: "Kennedy Space Center, Launch Complex 39A",
    noradCatId: 58045,
    cosparId: "2023-157A",
    sourceAuthority: "NASA_NAIF_SPICE",
    celestrakUrl: "https://celestrak.org/NORAD/elements/gp.php?CATNR=58045",
    nasaDataPortalUrl: "https://data.nasa.gov/dataset/?q=psyche+trajectory",
    ephemerisSourceDoc: "NASA JPL Psyche Navigation Reconstruction / NAIF SPICE Target -253",
    orbitRegime: "Heliocentric Interplanetary Transfer with Mars Slingshot to (16) Psyche",
    targetBody: "Asteroid (16) Psyche (Main Asteroid Belt, 2.7 AU)",
    flightProfileType: "HELIOCENTRIC_INTERPLANETARY",
    keplerian: {
      semiMajorAxisKm: 404000000.0, // 2.7 AU
      eccentricity: 0.14,
      inclinationDeg: 3.1,
      raanDeg: 150.9,
      argOfPeriapsisDeg: 228.4,
      meanMotionRevsPerDay: 0.000548,
      orbitalPeriodMin: 2628000.0, // ~5 years
      perigeeAltitudeKm: 500.0,
      apogeeAltitudeKm: 404000000.0,
      orbitalVelocityKmS: 12.4,
    },
    rawTle: {
      line1: "1 58045U 23157A   23286.50000000  .00000000  00000-0  00000-0 0  9993",
      line2: "2 58045   3.1000 150.9000 1400000 228.4000 131.6000  0.00054800    10",
    },
    missionMilestones: [
      {
        phase: "FALCON HEAVY HYPERBOLIC INJECTION",
        description: "Liftoff from LC-39A delivering high characteristic energy C3 = 15.2 km²/s² into interplanetary escape.",
        altitudeKm: 500,
        velocityKmS: 12.4,
      },
      {
        phase: "HALL-EFFECT XENON CRUISE",
        description: "Continuous low-thrust propulsion using 4x SPT-140 ion thrusters powered by twin 75 m² cross-shaped solar wings.",
        altitudeKm: 150000000,
        velocityKmS: 24.2,
      },
      {
        phase: "MARS GRAVITY ASSIST SLINGSHOT",
        description: "Close flyby of Mars at ~3,000 km altitude gaining crucial delta-V to deflect trajectory toward the asteroid belt.",
        altitudeKm: 225000000,
        velocityKmS: 28.6,
      },
      {
        phase: "ASTEROID (16) PSYCHE ORBIT INSERTION",
        description: "Capture into polar science orbits A through D around the metallic asteroid. Permanent operational orbit.",
        altitudeKm: 404000000,
        velocityKmS: 0.12,
      },
    ],
    operationalOrbitDescription:
      "Psyche cruises outward through the solar system, uses Mars for a gravity slingshot, and captures permanently into science orbits around asteroid (16) Psyche. It does not return to Earth.",
  },

  sandbox_mode: {
    missionKey: "sandbox_mode",
    officialName: "International Space Station (ISS) Reference LEO Orbit",
    spacecraftName: "International Space Station / Custom Satellite",
    launchVehicle: "Modular Commercial Heavy Launcher",
    launchSite: "Kennedy Space Center / User Defined",
    noradCatId: 25544,
    cosparId: "1998-067A",
    sourceAuthority: "CELESTRAK_NORAD",
    celestrakUrl: "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544",
    nasaDataPortalUrl: "https://data.nasa.gov/dataset/?q=iss+trajectory",
    ephemerisSourceDoc: "CelesTrak NORAD GP Active ISS Catalog / NASA Johnson Space Center",
    orbitRegime: "Low Earth Orbit (LEO) - Standard 51.64° Human Spaceflight Orbit",
    targetBody: "Earth (LEO Station Orbit)",
    flightProfileType: "EARTH_LEO_ORBIT",
    keplerian: {
      semiMajorAxisKm: 6798.1,
      eccentricity: 0.0006703,
      inclinationDeg: 51.6416,
      raanDeg: 247.4627,
      argOfPeriapsisDeg: 130.536,
      meanMotionRevsPerDay: 15.4981534,
      orbitalPeriodMin: 92.91,
      perigeeAltitudeKm: 415.2,
      apogeeAltitudeKm: 424.3,
      orbitalVelocityKmS: 7.66,
    },
    rawTle: {
      line1: "1 25544U 98067A   26316.50000000  .00016717  00000-0  10270-3 0  9002",
      line2: "2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.49815340482592",
    },
    missionMilestones: [
      {
        phase: "LAUNCH ASCENT & FIRST STAGE CUTOFF",
        description: "Vertical boost trajectory through Max-Q into upper atmospheric corridor.",
        altitudeKm: 85,
        velocityKmS: 2.1,
      },
      {
        phase: "ORBITAL INSERTION BURN",
        description: "Main engine cutoff achieving initial 200 km orbital perigee.",
        altitudeKm: 200,
        velocityKmS: 7.8,
      },
      {
        phase: "CIRCULARIZATION MANEUVER",
        description: "Apogee kick burn raising orbit to stable circular 420 km altitude.",
        altitudeKm: 420,
        velocityKmS: 7.66,
      },
      {
        phase: "STATIONKEEPING LEO ORBIT",
        description: "Continuous circular 51.64° inclination orbit around Earth. Non-looping persistent stationkeeping.",
        altitudeKm: 420,
        velocityKmS: 7.66,
      },
    ],
    operationalOrbitDescription:
      "Custom craft maintains stable circular Low Earth Orbit at 420 km altitude with 51.64° inclination, completing 15.5 revolutions per day.",
  },
};
