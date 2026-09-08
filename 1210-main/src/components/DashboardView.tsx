import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CloudRain,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Layers,
  TrendingUp,
  Waves,
  Zap,
  Building2,
  ShieldAlert,
  Radio,
  Send,
  ArrowRight,
  Clock,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { RiverGauge, RiskFactor, ForecastPoint, PageId, WatershedRegion, RescueCamp } from '../types';
import { FloodMapInteractive } from './FloodMapInteractive';
import { TrajectoryChart } from './TrajectoryChart';
import { fetchLiveWeather, LiveWeatherReport } from '../services/floodIntelligenceApi';

interface DashboardViewProps {
  gauges: RiverGauge[];
  camps?: RescueCamp[];
  currentRegion?: WatershedRegion;
  riskFactors: RiskFactor[];
  forecastData: ForecastPoint[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onNavigate: (page: PageId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  gauges,
  camps = [],
  currentRegion,
  riskFactors,
  forecastData,
  isSimulating,
  onToggleSimulation,
  onNavigate,
}) => {
  const [liveWeather, setLiveWeather] = useState<LiveWeatherReport | null>(null);

  useEffect(() => {
    let isMounted = true;
    const lat = currentRegion?.centerLat || 23.0225;
    const lon = currentRegion?.centerLng || 72.5714;
    fetchLiveWeather(lat, lon).then((data) => {
      if (isMounted && data) {
        setLiveWeather(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentRegion?.id, currentRegion?.centerLat, currentRegion?.centerLng]);

  // Dynamic calculations based on selected region
  const riskScore = currentRegion?.currentOverallRisk ?? (forecastData[0]?.riskScore ?? 50);
  const isSafeRegion = riskScore <= 25;
  const isWarningRegion = riskScore > 25 && riskScore < 70;
  const isCriticalRegion = riskScore >= 70;

  // Rainfall value calculation
  const rainAmountMm =
    liveWeather?.rain?.['1h'] !== undefined
      ? liveWeather.rain['1h']
      : currentRegion?.id === 'tapi'
      ? 0
      : currentRegion?.id === 'narmada'
      ? 18
      : 124;

  const weatherConditionText =
    liveWeather?.weather?.[0]?.description ||
    (isSafeRegion ? 'clear sky & dry' : isWarningRegion ? 'moderate drizzle' : 'heavy monsoon downpour');

  // Highest gauge calculation
  const highestGauge =
    gauges && gauges.length > 0
      ? gauges.reduce(
          (prev, curr) =>
            curr.currentLevel / curr.threshold > prev.currentLevel / prev.threshold ? curr : prev,
          gauges[0]
        )
      : null;

  // Total open shelter beds
  const totalOpenBeds = camps.reduce(
    (sum, c) => sum + Math.max(0, c.capacityTotal - c.capacityOccupied),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            Live Flood Safety Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {currentRegion?.name || 'Sabarmati Basin'} Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live river height, rainfall radar, water flow forecast, and nearest safe rescue shelters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('Flood Map')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Layers className="w-4 h-4" />
            <span>Open Full Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Risk */}
        <div
          className={`rounded-2xl bg-gradient-to-b from-[#111a2d] to-[#0d1424] border p-4 relative overflow-hidden shadow-lg ${
            isSafeRegion
              ? 'border-emerald-500/30'
              : isWarningRegion
              ? 'border-amber-500/30'
              : 'border-rose-500/30'
          }`}
        >
          <div
            className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-xl pointer-events-none ${
              isSafeRegion ? 'bg-emerald-500/10' : isWarningRegion ? 'bg-amber-500/10' : 'bg-rose-500/10'
            }`}
          ></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Flood Danger Level
              </span>
              <div className="flex items-baseline gap-1 mt-1.5 font-mono-telemetry">
                <span
                  className={`text-3xl font-extrabold ${
                    isSafeRegion
                      ? 'text-emerald-400'
                      : isWarningRegion
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {riskScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  isSafeRegion
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : isWarningRegion
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {isSafeRegion
                  ? 'ALL NORMAL & SAFE'
                  : isWarningRegion
                  ? 'MODERATE WATCH ZONE'
                  : 'HIGH DANGER ZONE'}
              </span>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                isSafeRegion
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : isWarningRegion
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              }`}
            >
              {isSafeRegion ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span
              className={`font-semibold flex items-center ${
                isSafeRegion
                  ? 'text-emerald-400'
                  : isWarningRegion
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {isSafeRegion ? (
                'Steady normal flow'
              ) : isWarningRegion ? (
                'Reservoir monitoring active'
              ) : (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14% in last 6 hours
                </>
              )}
            </span>
            <span className="text-[11px] text-slate-500">Live Telemetry</span>
          </div>
        </div>

        {/* Metric 2: 24h Rainfall */}
        <div className="rounded-2xl bg-[#0d1424] border border-slate-800 p-4 relative overflow-hidden shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                24h Total Rain
              </span>
              <div className="flex items-baseline gap-1 mt-1.5 font-mono-telemetry">
                <span className="text-3xl font-extrabold text-white">{rainAmountMm}</span>
                <span className="text-sm font-semibold text-slate-400">mm</span>
              </div>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  rainAmountMm === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : rainAmountMm < 30
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}
              >
                {rainAmountMm === 0 ? 'DRY & CLEAR' : rainAmountMm < 30 ? 'LIGHT DRIZZLE' : 'HEAVY RAINFALL'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <CloudRain className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-slate-300 font-semibold capitalize truncate max-w-[150px]">
              {weatherConditionText}
            </span>
            <span className="text-[11px] text-slate-500">Weather API</span>
          </div>
        </div>

        {/* Metric 3: Critical Gauge */}
        <div className="rounded-2xl bg-[#0d1424] border border-slate-800 p-4 relative overflow-hidden shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Highest River Water Level
              </span>
              <div className="flex items-baseline gap-1 mt-1.5 font-mono-telemetry">
                <span
                  className={`text-3xl font-extrabold ${
                    highestGauge?.status === 'Critical'
                      ? 'text-rose-400'
                      : highestGauge?.status === 'Warning'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {highestGauge?.currentLevel ?? 4.12}
                </span>
                <span className="text-sm font-semibold text-slate-400">m</span>
              </div>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border truncate max-w-[170px] ${
                  highestGauge?.status === 'Critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : highestGauge?.status === 'Warning'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {highestGauge?.name || 'Main Gauge'}
              </span>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                highestGauge?.status === 'Critical'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  : highestGauge?.status === 'Warning'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}
            >
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span
              className={`font-semibold ${
                highestGauge?.status === 'Critical'
                  ? 'text-rose-400'
                  : highestGauge?.status === 'Warning'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {highestGauge?.status === 'Critical'
                ? 'Above Danger Mark'
                : highestGauge?.status === 'Warning'
                ? 'Near Warning Mark'
                : `Safe (Threshold ${highestGauge?.threshold}m)`}
            </span>
            <span className="text-[11px] text-slate-500">{highestGauge?.rateOfRise || 'Stable'}</span>
          </div>
        </div>

        {/* Metric 4: Safe Camps Capacity */}
        <div className="rounded-2xl bg-[#0d1424] border border-slate-800 p-4 relative overflow-hidden shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Safe Camps Open Beds
              </span>
              <div className="flex items-baseline gap-1 mt-1.5 font-mono-telemetry">
                <span className="text-3xl font-extrabold text-emerald-400">
                  {totalOpenBeds.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-400">beds</span>
              </div>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isSafeRegion ? 'STANDBY READINESS' : 'FOOD & DOCTORS READY'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">
              {isSafeRegion ? 'All routes clear' : 'High dry ground'}
            </span>
            <span className="text-[11px] text-slate-500">{camps.length} Shelters mapped</span>
          </div>
        </div>
      </div>

      {/* GOVERNMENT RAPID ACTION & EVACUATION TRIAGE CORRIDOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Feature 1: Rescue Camps & Safe Destinations */}
        <div
          onClick={() => onNavigate('Rescue Camps')}
          className="p-4 rounded-2xl bg-gradient-to-b from-[#0e1829] to-[#0a1120] border border-emerald-500/30 hover:border-emerald-400/60 transition-all cursor-pointer shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Shelter Triage
              </span>
              <Building2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Where People Should Go: Rescue Camps
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {currentRegion?.id === 'tapi'
                ? '5 municipal relief hubs (Surat Indoor Stadium, Althan Complex & Dumas Center) on standby. All approach flyovers and causeways 100% dry and open.'
                : currentRegion?.id === 'narmada'
                ? 'Bharuch Town Hall & Ankleshwar GIDC Auditorium ready on high ground with 5-day food rations.'
                : '5 elevated district shelters (2,430 open beds). Ward 3 & 4 evacuees directed to Sardar Patel Stadium via dry 132ft Ring Rd corridor.'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>View Safe Camp Allocations</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Feature 2: Flood Types & Early Warnings */}
        <div
          onClick={() => onNavigate('Flood Types')}
          className="p-4 rounded-2xl bg-gradient-to-b from-[#0e1829] to-[#0a1120] border border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                  isSafeRegion
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : isWarningRegion
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                }`}
              >
                {isSafeRegion
                  ? 'Normal River Flow: Safe'
                  : isWarningRegion
                  ? 'Dam Spillway Inflow Watch'
                  : 'Active Threat: Flash Flood / Inundation'}
              </span>
              <ShieldAlert className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              Flood Hazard Types & Protocol SOPs
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {isSafeRegion
                ? `Water levels along ${currentRegion?.name || 'river'} are completely normal and safe. Zero active flood hazards detected.`
                : 'Cloudburst flash surge, dam releases, riverine, and coastal tidal hazards with automated government response checklists and lead-time physics.'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span>Open Threat Matrix & SOPs</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Feature 3: Better Govt Alert Broadcast */}
        <div
          onClick={() => onNavigate('Alerts')}
          className="p-4 rounded-2xl bg-gradient-to-b from-[#0e1829] to-[#0a1120] border border-rose-500/30 hover:border-rose-400/60 transition-all cursor-pointer shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                CAP Engine Ready
              </span>
              <Radio className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
              Rapid Government Alert Broadcast
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Instant multi-channel alert dispatch: Cell Broadcast SMS, 110dB municipal sirens, Doordarshan crawler, and tactical NDRF radio channels for {currentRegion?.riverName || 'river'} catchment.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-rose-400 font-semibold">
            <span>Launch Broadcast Console</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Middle Row: Spatial Heatmap + Explainable AI Attribution */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-6">
        {/* Interactive Spatial Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Spatial Inundation Heatmap
            </h2>
            <button
              onClick={() => onNavigate('Flood Map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5"
            >
              Full Interactive GIS <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <FloodMapInteractive
            gauges={gauges}
            camps={camps}
            currentRegion={currentRegion}
            isSimulating={isSimulating}
            onToggleSimulation={onToggleSimulation}
          />
        </div>

        {/* Explainable AI Factor Attribution */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                  Explainable AI (XAI)
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {isSafeRegion
                    ? `Why ${currentRegion?.riverName || 'River'} is Safe`
                    : isWarningRegion
                    ? 'Sensor Risk Contributions'
                    : 'Why Risk is Critical'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-telemetry bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                SHAP Attribution
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              {isSafeRegion
                ? 'Hydrological sensors confirm reservoir cushions, clear skies, and calm tides keeping river levels completely safe:'
                : 'Sensor fusion model decomposes real-time contributions driving current risk levels:'}
            </p>

            <div className="mt-4 space-y-3.5">
              {riskFactors.map((factor) => (
                <div key={factor.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">{factor.name}</span>
                    <span
                      className={`font-mono-telemetry font-bold ${
                        isSafeRegion ? 'text-emerald-400' : 'text-cyan-400'
                      }`}
                    >
                      {factor.attributionPct}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSafeRegion
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, factor.attributionPct * 2.2)}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigate('Explainability')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Counterfactual Interventions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: AI Risk Forecast Curve + Live River Gauges */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        {/* Forecast Curve */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                Predictive Intelligence
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                24–48 Hour Risk Trajectory
              </h3>
            </div>
            <button
              onClick={() => onNavigate('Prediction')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5"
            >
              Expanded Curves <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <TrajectoryChart data={forecastData} height={240} />
        </div>

        {/* Live Gauges Summary */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Telemetry Stream
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Key River Gauges</h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {gauges.slice(0, 3).map((gauge) => {
                const isCritical = gauge.status === 'Critical';
                const isWarning = gauge.status === 'Warning';

                return (
                  <div
                    key={gauge.id}
                    className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{gauge.name}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {gauge.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between font-mono-telemetry">
                      <div>
                        <span className="text-xl font-extrabold text-white">{gauge.currentLevel}</span>
                        <span className="text-xs text-slate-500"> m</span>
                        <span className="text-[11px] text-slate-400 ml-2 font-sans">
                          Rate: <span className={isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>{gauge.rateOfRise}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans">
                        Threshold: <b className="text-slate-200">{gauge.threshold}m</b>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, gauge.pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigate('River Gauges')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>View All {gauges.length} River Gauges</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

