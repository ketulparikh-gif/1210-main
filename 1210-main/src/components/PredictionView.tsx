import React, { useState } from 'react';
import { ForecastPoint } from '../types';
import { TrajectoryChart } from './TrajectoryChart';
import { TrendingUp, AlertTriangle, CloudRain, CheckCircle2, Clock, Zap, Calendar } from 'lucide-react';

interface PredictionViewProps {
  forecastData: ForecastPoint[];
}

export const PredictionView: React.FC<PredictionViewProps> = ({ forecastData }) => {
  const [activeScenario, setActiveScenario] = useState<'baseline' | 'highInflow' | 'drained'>('baseline');

  const modifiedData = forecastData.map((pt) => {
    if (activeScenario === 'highInflow') {
      return {
        ...pt,
        riskScore: Math.min(98, pt.riskScore + 8),
        waterLevelM: Number((pt.waterLevelM + 0.25).toFixed(2)),
      };
    }
    if (activeScenario === 'drained') {
      return {
        ...pt,
        riskScore: Math.max(35, pt.riskScore - 18),
        waterLevelM: Number((pt.waterLevelM - 0.45).toFixed(2)),
      };
    }
    return pt;
  });

  const peakPoint = [...modifiedData].sort((a, b) => b.riskScore - a.riskScore)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            48-Hour Flood Forecast
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Flood Forecast & Water Rise Prediction
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            See how high water is expected to rise over the next 48 hours based on upcoming rain and upstream river flow.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => setActiveScenario('baseline')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeScenario === 'baseline'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Baseline Model
          </button>
          <button
            onClick={() => setActiveScenario('highInflow')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeScenario === 'highInflow'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            +20% Catchment Surge
          </button>
          <button
            onClick={() => setActiveScenario('drained')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeScenario === 'drained'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Canal Pre-Drain
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-rose-500/30 bg-[#0d1424] p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Peak Predicted Risk
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-2 font-mono-telemetry">
            {peakPoint.riskScore} <small className="text-sm font-normal text-slate-400">/ 100</small>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Expected on <b>{peakPoint.dayName || 'Wed'}, {peakPoint.dateStr || '9 Sep'}</b> ({peakPoint.hourLabel})
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              48h Forecast Rainfall
            </span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono-telemetry">
            186 <small className="text-sm font-normal text-slate-400">mm</small>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            ±18 mm ensemble spread across meteorological models
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Forecast Reliability
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono-telemetry">
            91%
          </div>
          <div className="text-xs text-slate-400 mt-2">
            High consistency across 127 physical sensor inputs
          </div>
        </div>
      </div>

      {/* Main Curve */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Hydrodynamic Risk Trajectory Model
          </h3>
          <span className="text-xs font-mono-telemetry text-slate-400">
            Current Stage: <b className="text-white">8.42m</b> → Peak Stage:{' '}
            <b className="text-rose-400">{peakPoint.waterLevelM}m</b>
          </span>
        </div>
        <TrajectoryChart data={modifiedData} height={300} />
      </div>

      {/* 4 Time Interval Horizon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            range: '0 – 12 Hours',
            dateLabel: 'Tue, 8 Sep (Today)',
            status: 'Moderate',
            score: 59,
            waterLevel: '8.42m → 8.58m',
            desc: 'Initial storm runoff entering upstream tributaries. River rise steady at +0.12 m/h.',
          },
          {
            range: '12 – 30 Hours',
            dateLabel: '8 Sep – 9 Sep',
            status: 'Critical',
            score: 83,
            waterLevel: '8.58m → 8.79m',
            desc: 'Catchment crest reaches Vasna Barrage. Riverbank spillway capacity stressed.',
          },
          {
            range: '30 – 36 Hours',
            dateLabel: 'Wed, 9 Sep (Peak)',
            status: 'Critical',
            score: 81,
            waterLevel: '8.79m → 8.68m',
            desc: 'Peak inundation zone sustained downstream across low-lying agricultural zones.',
          },
          {
            range: '36 – 48 Hours',
            dateLabel: '9 Sep – 10 Sep',
            status: 'High',
            score: 61,
            waterLevel: '8.68m → 8.12m',
            desc: 'Gradual hydrograph recession begins as rainfall eases over northern hill catchment.',
          },
        ].map((interval) => {
          const isCrit = interval.status === 'Critical';
          const isHigh = interval.status === 'High';

          return (
            <div
              key={interval.range}
              className={`rounded-2xl p-4 border transition-all ${
                isCrit
                  ? 'bg-rose-950/15 border-rose-500/30'
                  : isHigh
                  ? 'bg-amber-950/15 border-amber-500/30'
                  : 'bg-[#0d1424] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-white block">{interval.range}</span>
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>{interval.dateLabel}</span>
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isCrit
                      ? 'bg-rose-500/20 text-rose-300'
                      : isHigh
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {interval.status}
                </span>
              </div>

              <div className="flex items-baseline gap-1 mt-3 font-mono-telemetry">
                <span className="text-2xl font-extrabold text-white">{interval.score}</span>
                <span className="text-xs text-slate-500">/ 100 Risk</span>
              </div>

              <div className="text-[11px] font-mono-telemetry text-cyan-400 mt-1">
                Stage: {interval.waterLevel}
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {interval.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
