import React from 'react';
import { SensorCategory } from '../types';
import {
  Radio,
  CloudRain,
  Waves,
  Droplets,
  Wind,
  Satellite,
  Layers,
  CheckCircle2,
  Cpu,
  Database,
  Workflow,
  ArrowRight,
} from 'lucide-react';

interface SensorsViewProps {
  sensors: SensorCategory[];
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'CloudRain':
      return <CloudRain className="w-5 h-5 text-blue-400" />;
    case 'Waves':
      return <Waves className="w-5 h-5 text-cyan-400" />;
    case 'Droplets':
      return <Droplets className="w-5 h-5 text-amber-400" />;
    case 'Wind':
      return <Wind className="w-5 h-5 text-teal-400" />;
    case 'Satellite':
      return <Satellite className="w-5 h-5 text-purple-400" />;
    case 'Layers':
    default:
      return <Layers className="w-5 h-5 text-indigo-400" />;
  }
};

export const SensorsView: React.FC<SensorsViewProps> = ({ sensors }) => {
  const totalSensors = sensors.reduce((acc, s) => acc + s.total, 0);
  const activeSensors = sensors.reduce((acc, s) => acc + s.active, 0);
  const avgHealth = Math.round(
    sensors.reduce((acc, s) => acc + s.healthPct, 0) / sensors.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            Multi-Source Sensor Telemetry Mesh
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Sensor Fusion Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Physical sensor arrays, synthetic aperture radar (SAR), automated weather stations, and telemetry health.
          </p>
        </div>

        {/* Global Health Pill */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-semibold font-mono-telemetry">
              {activeSensors} / {totalSensors} Online ({avgHealth}% Health)
            </span>
          </div>
        </div>
      </div>

      {/* Sensor Categories Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sensors.map((sensor) => {
          return (
            <div
              key={sensor.id}
              className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 shadow-md hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  {getIcon(sensor.iconName)}
                </div>
                <span className="text-xs font-mono-telemetry font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {sensor.healthPct}% Health
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-100">{sensor.name}</h3>
                <div className="flex items-baseline gap-1 mt-1 font-mono-telemetry">
                  <span className="text-2xl font-black text-white">{sensor.active}</span>
                  <span className="text-xs text-slate-400">/ {sensor.total} Active Nodes</span>
                </div>
              </div>

              {/* Health Bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                    style={{ width: `${sensor.healthPct}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Sync: {sensor.updateFrequency}</span>
                  <span className="text-cyan-400 font-medium">{sensor.contribution}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensor Fusion Pipeline Architecture Diagram */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Sensor-to-Inference Pipeline
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Live Hydrological Ingestion & AI Fusion Flow
            </h3>
          </div>
          <span className="text-xs font-mono-telemetry text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pipeline Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {[
            {
              step: '01',
              title: 'Telemetry Ingestion',
              stat: '127 Live Feeds',
              desc: 'Sub-second real-time ingestion of radar river stages, AWS rain gauges, and satellite SAR layers.',
              icon: Radio,
            },
            {
              step: '02',
              title: 'Validation & Filtering',
              stat: '98.1% Valid (0.4s lag)',
              desc: 'Outlier rejection, sensor drift detection, and physical rate-of-rise continuity boundary checks.',
              icon: Database,
            },
            {
              step: '03',
              title: 'Spatiotemporal Fusion',
              stat: '6 Modalities Mesh',
              desc: 'Continuous Kalman assimilation merging 1D hydrodynamic hydraulics with 2D DEM topography grids.',
              icon: Workflow,
            },
            {
              step: '04',
              title: 'AI Hydro Risk Model',
              stat: '94% Ensemble Conf',
              desc: 'Multi-head transformer predicting downstream crest arrival times and inundation footprints.',
              icon: Cpu,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-2 group hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-telemetry font-bold text-cyan-400">
                    STAGE {item.step}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h4 className="text-xs font-bold text-slate-100 mt-1">{item.title}</h4>
                <div className="text-[11px] font-mono-telemetry text-emerald-400 font-semibold">
                  {item.stat}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
