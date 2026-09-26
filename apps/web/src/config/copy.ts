/**
 * TRINETRA Sentinel — Centralized Language, Copy & Terminology Dictionary
 * 
 * CORE PRINCIPLE:
 * "Make an extremely advanced weather forecasting and early-warning system feel simple
 * enough that a normal person can understand it within seconds, while still making it
 * feel technically credible and professional."
 * 
 * Two-Layer System:
 * - PRIMARY: Simple human-readable language (what, where, when, how serious, why).
 * - SECONDARY: Technical scientific details available via tooltips, expandables, and badges.
 */

export interface TermDefinition {
  primary: string;
  technical: string;
  explanation: string;
  category: "weather" | "risk" | "terrain" | "model" | "system";
}

export const TERMINOLOGY: Record<string, TermDefinition> = {
  // 1. Weather & Storms
  convective_hazard: {
    primary: "Severe Storm Risk",
    technical: "Convective Hazard",
    explanation: "Risk of thunderstorms, cloudbursts, and heavy rain formed by rapidly rising warm air in mountain valleys.",
    category: "weather",
  },
  convective_progression: {
    primary: "Storm Development",
    technical: "Convective Progression",
    explanation: "How storm clouds form, grow, and move over mountain ridges over time.",
    category: "weather",
  },
  cloudburst: {
    primary: "Extremely Heavy Rain",
    technical: "Cloudburst (≥100 mm/h)",
    explanation: "Sudden, intense downpour dropping huge amounts of rain over a small mountain area in a short time.",
    category: "weather",
  },
  thunderstorm: {
    primary: "Thunderstorm Risk",
    technical: "Thunderstorm Potential",
    explanation: "Conditions favoring lightning, strong winds, hail, and heavy convective showers.",
    category: "weather",
  },
  atmospheric_forcing: {
    primary: "Rain & Storm Conditions",
    technical: "Atmospheric Forcing (P_meteo)",
    explanation: "Combines real-time radar rainfall, satellite cloud cooling rates, and storm energy.",
    category: "weather",
  },
  weather_risk: {
    primary: "Weather Risk",
    technical: "Atmospheric Risk",
    explanation: "Severe weather conditions detected from satellite imagery and ground radar scans.",
    category: "weather",
  },
  rain_forcing: {
    primary: "Rainfall Effect",
    technical: "Rain Forcing",
    explanation: "The contribution of heavy rainfall toward triggering a flash flood.",
    category: "weather",
  },

  // 2. Floods, Terrain & Hydrology
  flash_flood_probability: {
    primary: "Chance of Flash Flooding",
    technical: "Flash Flood Probability",
    explanation: "The estimated likelihood of fast-rising flood waters sweeping through valleys and river beds.",
    category: "risk",
  },
  flash_flood_surge: {
    primary: "Flash Flood Risk",
    technical: "Flash Flood Surge Hazard",
    explanation: "Combined risk when intense rainfall hits steep mountain terrain that channels water rapidly into rivers.",
    category: "risk",
  },
  surge_hazard: {
    primary: "Flood Risk",
    technical: "Surge Hazard (R_surge)",
    explanation: "Combined flood likelihood calculating how fast runoff gathers in narrow river gorges.",
    category: "risk",
  },
  terrain_susceptibility: {
    primary: "Terrain Vulnerability",
    technical: "Terrain Susceptibility (S_terrain)",
    explanation: "How prone the local mountain landscape is to rapid runoff, based on slope steepness and valley shape.",
    category: "terrain",
  },
  terrain_amplification: {
    primary: "Terrain Effect",
    technical: "Terrain Amplification",
    explanation: "Steep mountain slopes accelerate falling rain downhill into narrow gorges, intensifying flood danger.",
    category: "terrain",
  },
  catchment: {
    primary: "River Basin",
    technical: "Catchment / Watershed",
    explanation: "An area of land where all falling rain and snow drains downhill into a common stream or river.",
    category: "terrain",
  },
  catchment_topography: {
    primary: "Terrain & Slope",
    technical: "Catchment Topography",
    explanation: "Physical mountain features including slope angles, ridge elevations, and natural drainage paths.",
    category: "terrain",
  },
  slope_runoff: {
    primary: "Water Runoff Risk",
    technical: "Slope Runoff Acceleration",
    explanation: "How fast rainwater flows down steep hillsides rather than absorbing into the ground.",
    category: "terrain",
  },
  dual_factor_decomposition: {
    primary: "Main Factors Behind the Risk",
    technical: "Dual-Factor Physics Decomposition",
    explanation: "Separates risk into two components: Weather (how much rain falls) and Terrain (how fast mountains funnel water).",
    category: "model",
  },

  // 3. Technical Parameters (Soundings & Sensors)
  cape: {
    primary: "Storm Energy",
    technical: "CAPE (Convective Available Potential Energy)",
    explanation: "Measures atmospheric buoyancy. Values above 2,000 J/kg indicate strong potential for severe thunderstorms.",
    category: "weather",
  },
  cin: {
    primary: "Storm Cap",
    technical: "CIN (Convective Inhibition)",
    explanation: "An atmospheric lid preventing storms from forming until daytime heating or mountain lift breaks it.",
    category: "weather",
  },
  tpw: {
    primary: "Atmospheric Moisture",
    technical: "TPW (Total Precipitable Water)",
    explanation: "Total amount of water vapor in the air column. Values above 50 mm indicate tropical-like moisture capable of cloudbursts.",
    category: "weather",
  },
  twi: {
    primary: "Ground Saturation & Drainage",
    technical: "TWI (Topographic Wetness Index)",
    explanation: "Calculates where water naturally pools and flows in valley bottoms based on slope and upslope catchment area.",
    category: "terrain",
  },
  tir1_cooling: {
    primary: "Storm Cloud Growth Rate",
    technical: "TIR1 Cloud Top Cooling Rate",
    explanation: "How rapidly storm cloud tops are shooting upward into freezing altitudes. Rapid cooling signifies intense updrafts.",
    category: "weather",
  },
  radar_reflectivity: {
    primary: "Radar Rain Intensity",
    technical: "Radar Reflectivity (dBZ)",
    explanation: "Doppler radar beam reflections. Values above 45 dBZ indicate torrential rain, hail, or intense convective cores.",
    category: "weather",
  },
  dem: {
    primary: "Terrain Elevation Data",
    technical: "Digital Elevation Model (DEM)",
    explanation: "3D elevation raster mapping mountain ridges, steep gorges, and river channels at 30-meter resolution.",
    category: "terrain",
  },
  dwr: {
    primary: "Doppler Weather Radar",
    technical: "Doppler Weather Radar (DWR)",
    explanation: "Ground-based radar station (e.g. Dehradun / Mukteshwar) scanning clouds in real-time within a 75 km radius.",
    category: "system",
  },
  insat: {
    primary: "Indian Weather Satellite",
    technical: "INSAT-3D / INSAT-3DR",
    explanation: "India's geostationary weather satellite providing 15-minute thermal infrared imagery over the Himalayas.",
    category: "system",
  },

  // 4. Forecast Timeline & Lifecycle
  forecast_evolution: {
    primary: "How the Weather May Change",
    technical: "Forecast Evolution",
    explanation: "Projected weather changes from right now through the next 6 hours.",
    category: "model",
  },
  forecast_window: {
    primary: "Forecast Period",
    technical: "Forecast Horizon Window",
    explanation: "The forward-looking time period (Now to 6 Hours) covered by the AI forecast.",
    category: "model",
  },
  lead_window: {
    primary: "Warning Time",
    technical: "Lead Time Window",
    explanation: "Advance notice time before expected peak storm intensity or flash flood surge arrives.",
    category: "risk",
  },
  incident_queue: {
    primary: "Weather Alerts",
    technical: "Incident Queue",
    explanation: "Active severe weather events requiring attention or monitoring.",
    category: "risk",
  },
  lifecycle_state: {
    primary: "Alert Status",
    technical: "Lifecycle State",
    explanation: "Current workflow stage of an alert (New, Being Reviewed, Sent, Reviewed, or Resolved).",
    category: "system",
  },

  // 5. Model Benchmarks & Metrics
  inference: {
    primary: "AI Forecast",
    technical: "Inference",
    explanation: "The process of using trained deep learning models to predict weather from live satellite and radar data.",
    category: "model",
  },
  inference_job: {
    primary: "Forecast Run",
    technical: "Inference Job",
    explanation: "A single automated forecast calculation cycle executed every 15 minutes.",
    category: "model",
  },
  model_performance: {
    primary: "Forecast Accuracy",
    technical: "Model Performance",
    explanation: "Rigorous statistical benchmarks comparing model predictions against observed historical weather events.",
    category: "model",
  },
  pr_auc: {
    primary: "Event Detection Accuracy",
    technical: "PR-AUC (Precision-Recall Area Under Curve)",
    explanation: "Measures how accurately the model flags rare severe weather events without triggering false alarms.",
    category: "model",
  },
  f1_score: {
    primary: "Overall Detection Accuracy",
    technical: "F1 Score",
    explanation: "A balanced accuracy score (0 to 1) accounting for both detected storms and missed events.",
    category: "model",
  },
  brier_score: {
    primary: "Forecast Reliability Score",
    technical: "Brier Score",
    explanation: "Measures the accuracy of probability predictions. Lower scores (closer to 0) indicate higher reliability.",
    category: "model",
  },
  calibration_error: {
    primary: "Probability Reliability",
    technical: "Expected Calibration Error (ECE)",
    explanation: "Measures whether an 80% forecast chance actually happens 80% of the time in real-world observations.",
    category: "model",
  },
  inference_latency: {
    primary: "Forecast Speed",
    technical: "Inference Latency",
    explanation: "How fast the AI calculates predictions once new satellite imagery arrives (typically 3.7 milliseconds).",
    category: "model",
  },
  operational_hurdle: {
    primary: "Model Safety & Validation",
    technical: "Operational Deployment Hurdle Protocol",
    explanation: "Mandatory safety criteria an AI model must pass on independent test data before being approved for forecasting.",
    category: "model",
  },
  held_out_test: {
    primary: "Independent Model Testing",
    technical: "Held-Out Test Set Verification",
    explanation: "Testing model accuracy strictly on future or unseen historical events to prevent data memorization.",
    category: "model",
  },

  // 6. Data Sources & System Health
  data_ingestion: {
    primary: "Weather Data",
    technical: "Data Ingestion",
    explanation: "Receiving raw data feeds from satellites, radars, weather models, and mountain stations.",
    category: "system",
  },
  upstream_sensors: {
    primary: "Weather Data Sources",
    technical: "Upstream Sensor Feeds",
    explanation: "External observation networks supplying real-time weather information.",
    category: "system",
  },
  ingestion_latency: {
    primary: "Data Delay",
    technical: "Ingestion Latency / Observed Lag",
    explanation: "The time elapsed between when a satellite takes a photo and when it is processed in the system.",
    category: "system",
  },
  static_prior: {
    primary: "Background Terrain Data",
    technical: "Static Prior Dataset",
    explanation: "Permanent topographic maps of elevations, slopes, and river networks used to guide water flow simulations.",
    category: "terrain",
  },
  audit_trail: {
    primary: "Forecast Record",
    technical: "Cryptographic Audit Trail",
    explanation: "A tamper-evident historical log documenting every forecast run, data timestamp, and alert issued.",
    category: "system",
  },
  replay_governance: {
    primary: "Historical Data & Simulation",
    technical: "Synthetic & Historical Replay Data Governance",
    explanation: "Clearly marks when the system is evaluating past disasters (like Kedarnath 2013) rather than live real-time weather.",
    category: "system",
  },
  public_dispatch_interlock: {
    primary: "Public Alert Safety Lock",
    technical: "Public Dispatch Interlock",
    explanation: "Safety switch preventing test or non-verified forecasts from accidentally sending mass public alarms.",
    category: "system",
  },
};

/**
 * Standardized Severity Vocabulary
 */
export const SEVERITY_COPY = {
  critical: {
    label: "Critical Risk",
    shortLabel: "Critical",
    shapeSymbol: "▲",
    description: "Severe weather conditions likely to cause rapid flash flooding or dangerous runoff.",
    action: "Immediate attention recommended. Follow local emergency advice.",
    badgeClass: "bg-[#241418] text-rose-300 border-rose-500/40",
  },
  warning: {
    label: "High Risk",
    shortLabel: "High",
    shapeSymbol: "▲",
    description: "Heavy rain or storm activity expected; conditions may deteriorate quickly.",
    action: "Stay alert and monitor updates closely.",
    badgeClass: "bg-[#241F12] text-amber-300 border-amber-500/40",
  },
  watch: {
    label: "Watch",
    shortLabel: "Watch",
    shapeSymbol: "◆",
    description: "Conditions are favorable for severe weather to develop over the next few hours.",
    action: "Be prepared for weather changes.",
    badgeClass: "bg-[#1C1F30] text-indigo-300 border-indigo-500/40",
  },
  low: {
    label: "Low Risk",
    shortLabel: "Low",
    shapeSymbol: "●",
    description: "Normal weather conditions; no immediate severe storm threat detected.",
    action: "Routine monitoring active.",
    badgeClass: "bg-[#11221A] text-emerald-300 border-emerald-500/40",
  },
  none: {
    label: "Normal",
    shortLabel: "Normal",
    shapeSymbol: "●",
    description: "Nominal conditions with no significant weather threats.",
    action: "No action required.",
    badgeClass: "bg-[#161820] text-zinc-400 border-white/[0.08]",
  },
};

/**
 * Alert Status Translation
 */
export const ALERT_STATUS_COPY: Record<string, { label: string; description: string }> = {
  GENERATED: {
    label: "New Alert",
    description: "Automatically identified by the AI weather model and queued for review.",
  },
  UNDER_REVIEW: {
    label: "Being Reviewed",
    description: "Currently being checked by duty weather analysts.",
  },
  DISPATCHED: {
    label: "Sent to Authorities",
    description: "Forwarded to emergency operations centers and district channels.",
  },
  ACKNOWLEDGED: {
    label: "Reviewed",
    description: "Reviewed and acknowledged by emergency teams.",
  },
  RESOLVED: {
    label: "Resolved",
    description: "Weather threat has passed and conditions have stabilized.",
  },
  REVOKED: {
    label: "Cancelled",
    description: "Alert cancelled as updated conditions no longer indicate high risk.",
  },
};

/**
 * Scenario Labels & Badges
 */
export const SCENARIO_COPY: Record<string, { label: string; badge: string; isHistorical: boolean; description: string }> = {
  kedarnath_2013: {
    label: "2013 Kedarnath Flood",
    badge: "HISTORICAL SCENARIO",
    isHistorical: true,
    description: "Evaluation scenario recreating the extreme cloudburst and flash flood in the Mandakini valley.",
  },
  chamoli_2021: {
    label: "2021 Chamoli Surge",
    badge: "HISTORICAL SCENARIO",
    isHistorical: true,
    description: "Evaluation scenario recreating the flash flood surge in the Alaknanda and Rishi Ganga valleys.",
  },
  fair_weather_nominal: {
    label: "Normal Weather (Sample)",
    badge: "DEMO DATA",
    isHistorical: false,
    description: "Sample nominal conditions with low thunderstorm risk and clear skies.",
  },
};

/**
 * Navigation & Workspace Titles
 */
export const WORKSPACE_COPY = {
  overview: {
    navLabel: "Overview",
    title: "Uttarakhand Weather Risk Overview",
    subtitle: "Severe weather conditions that may develop over the next 2–6 hours.",
  },
  map: {
    navLabel: "Weather Map",
    title: "Interactive Weather Map",
    subtitle: "Explore real-time storm risk, rain intensity, and mountain terrain.",
  },
  timeline: {
    navLabel: "Forecast",
    title: "Weather Forecast: Now to 6 Hours",
    subtitle: "See when severe weather risk may increase or decrease over time.",
  },
  alerts: {
    navLabel: "Alerts",
    title: "Active Weather Alerts",
    subtitle: "Review active severe-weather warnings and forecast events.",
  },
  insights: {
    navLabel: "Forecast Insights",
    title: "Forecast Model & Accuracy",
    subtitle: "How well the AI model performs and where its predictions have limits.",
  },
  provenance: {
    navLabel: "Weather Data",
    title: "Weather Data & System Status",
    subtitle: "See where the forecast data comes from and whether the system is working normally.",
  },
  globe: {
    navLabel: "Earth View",
    title: "Earth View (Satellite)",
    subtitle: "Global satellite view zooming into the Uttarakhand Himalayas.",
  },
};

/**
 * Standard Action Buttons
 */
export const BUTTON_COPY = {
  updateForecast: "Update Forecast",
  updatingForecast: "Updating forecast...",
  viewOnMap: "View on Map",
  viewDetails: "View Details",
  whyThisForecast: "Why this forecast?",
  modelDetails: "Model Details",
  exportMapData: "Export Map Data",
  exportModelDetails: "Export Model Details",
  exportAlert: "Export Alert",
  reconnect: "Reconnect",
  reviewAlert: "Review Alert",
  reviewAllAlerts: "View All Alerts",
  close: "Close",
};

/**
 * System Messages (Loading, Empty, Error)
 */
export const SYSTEM_MESSAGES = {
  loading: {
    title: "Updating the forecast...",
    description: "Loading weather data and analyzing local terrain...",
  },
  emptyAlerts: {
    title: "No Active Alerts",
    description: "Good news. There are currently no active weather alerts for this area.",
  },
  emptyForecast: {
    title: "No Forecast Available",
    description: "We don't have enough recent weather data to generate a forecast right now.",
  },
  error: {
    title: "We couldn't update the forecast right now",
    description: "The weather data provider did not respond in time. Please try again in a moment.",
  },
  offline: {
    title: "Offline — Showing Saved Weather Data",
    description: "We lost connection to the weather server. You are viewing the latest saved forecast.",
  },
  staleData: {
    title: "Weather Data Delayed",
    description: "Satellite observations are running slightly behind. Prediction uncertainty is slightly higher.",
  },
};
