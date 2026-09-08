export type Severity = 'critical' | 'warning' | 'advisory' | 'normal';

export type ThemeMode = 'deep-ops' | 'oled-black' | 'night-vision' | 'daylight';
export type AccentColor = 'cyan' | 'emerald' | 'amber' | 'blue';

export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentColor;
  highContrast: boolean;
}

export type PageId =
  | 'Dashboard'
  | 'Flood Map'
  | 'Rescue Camps'
  | 'Flood Types'
  | 'Prediction'
  | 'River Gauges'
  | 'Sensors'
  | 'Impact'
  | 'Explainability'
  | 'History'
  | 'Alerts';

export interface RescueCamp {
  id: string;
  name: string;
  type: 'School' | 'Stadium' | 'Community Hall' | 'College Campus' | 'Police Ground';
  location: string;
  elevationMeters: number;
  capacityTotal: number;
  capacityOccupied: number;
  status: 'Accepting' | 'Near Full' | 'Full' | 'Standby';
  medicalOfficer: boolean;
  drinkingWaterLiters: number;
  foodRationsDays: number;
  generatorBackup: boolean;
  safeApproachRoute: string;
  contactOfficer: string;
  contactPhone: string;
  assignedWards: string[];
  lat?: number;
  lng?: number;
}

export interface FloodTypeWarning {
  id: string;
  type: 'flash-flood' | 'monsoon-riverine' | 'dam-spillway' | 'cyclonic-surge' | 'urban-drainage';
  name: string;
  categoryLabel: string;
  leadTimeRemaining: string;
  urgency: 'immediate' | 'high' | 'moderate';
  peakVelocity: string;
  causeDescription: string;
  affectedAreas: string[];
  waterCrestPrediction: string;
  govtChecklist: { task: string; done: boolean; department: string }[];
  recommendedShelterIds: string[];
}

export interface GovtBroadcastPayload {
  title: string;
  floodType: string;
  severity: Severity;
  channels: {
    cellBroadcast: boolean;
    sirens: boolean;
    tvRadio: boolean;
    ndrfRadio: boolean;
  };
  targetWards: string[];
  assignedCampId: string;
  instructionsEnglish: string;
  instructionsHindi: string;
  instructionsGujarati: string;
  soundSiren: boolean;
}

export interface RiverGauge {
  id: string;
  name: string;
  river: string;
  currentLevel: number;
  threshold: number;
  dangerLevel: number;
  warningLevel: number;
  rateOfRise: string;
  status: 'Critical' | 'Warning' | 'Normal';
  pct: number;
  stationCode: string;
  lastUpdated: string;
  history24h: number[];
}

export interface RiskFactor {
  id: string;
  name: string;
  attributionPct: number;
  description: string;
  category: 'meteorology' | 'hydrology' | 'terrain' | 'soil';
  deltaRiskIfMitigated: number;
  mitigationText: string;
}

export interface SensorCategory {
  id: string;
  name: string;
  active: number;
  total: number;
  healthPct: number;
  contribution: string;
  updateFrequency: string;
  iconName: string;
}

export interface ImpactNode {
  nodeNumber: number;
  name: string;
  currentStage: number;
  crestStage: number;
  distanceKm: number;
  etaHours: number;
  status: 'Critical' | 'Warning' | 'Normal';
  flowRateCusecs: number;
}

export interface ForecastPoint {
  hourLabel: string;
  hoursAhead: number;
  riskScore: number;
  rainfallForecastMm: number;
  waterLevelM: number;
  confidenceUpper: number;
  confidenceLower: number;
  dateStr?: string;
  dayName?: string;
  fullDateLabel?: string;
}

export interface AlertItem {
  id: string;
  severity: Severity;
  floodType?: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  acknowledged: boolean;
  source: string;
  actionRequired?: string;
}

export interface WatershedRegion {
  id: string;
  name: string;
  areaKm2: number;
  sensorsCount: number;
  riverBasin: string;
  criticalGaugesCount: number;
  currentOverallRisk: number;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  riverName?: string;
  weatherCity?: string;
  riverCoords?: [number, number][];
  inundationCoords?: [number, number][];
  inundationTitle?: string;
  inundationDepth?: string;
  peopleAtRisk?: string;
  elevationRange?: string;
}
