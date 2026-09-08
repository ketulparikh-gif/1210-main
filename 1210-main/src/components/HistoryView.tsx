import React from 'react';
import { CALIBRATION_YEARS } from '../data/mockData';
import { History, Award, CheckCircle2, Target, BarChart2, ShieldCheck } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const chartWidth = 640;
  const chartHeight = 260;
  const padLeft = 40;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 30;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const getX = (i: number) => padLeft + (i / (CALIBRATION_YEARS.length - 1)) * innerW;
  const getY = (val: number) => padTop + innerH - (val / 100) * innerH;

  const predictedPoints = CALIBRATION_YEARS.map((d, i) => `${getX(i)},${getY(d.predicted)}`).join(' L ');
  const observedPoints = CALIBRATION_YEARS.map((d, i) => `${getX(i)},${getY(d.observed)}`).join(' L ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            Model Verification & Empirical Calibration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Historical Calibration & Accuracy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            6-Year retrospective backtesting validation against observed gauging station discharge benchmarks.
          </p>
        </div>
      </div>

      {/* Primary Calibration KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'F1 Classification Score', val: '0.91', sub: 'Target: > 0.85', icon: Award, color: 'text-cyan-400' },
          { label: 'Model Precision', val: '0.93', sub: 'Low false positive alert rate', icon: Target, color: 'text-emerald-400' },
          { label: 'Recall (Sensitivity)', val: '0.89', sub: 'Captures 89% of surge events', icon: CheckCircle2, color: 'text-blue-400' },
          { label: 'Brier Calibration Score', val: '0.08', sub: 'Ideal ≤ 0.10 (Excellent)', icon: ShieldCheck, color: 'text-teal-400' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className={`text-3xl font-black mt-2 font-mono-telemetry ${item.color}`}>
                {item.val}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">{item.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Historical Predicted vs Observed Comparison Chart */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
              Longitudinal Backtesting
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Predicted Peak Risk vs Observed Inundation Severity (2021–2026)
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <span className="h-2 w-3 rounded-sm bg-cyan-400"></span> Predicted
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="h-2 w-3 rounded-sm bg-slate-400"></span> Observed Gauge Ground Truth
            </span>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line x1={padLeft} y1={y} x2={chartWidth - padRight} y2={y} stroke="rgba(30, 41, 59, 0.8)" strokeWidth="1" />
                  <text x={padLeft - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Predicted Line */}
            <path d={`M ${predictedPoints}`} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />

            {/* Observed Line */}
            <path d={`M ${observedPoints}`} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round" />

            {/* Points & Labels */}
            {CALIBRATION_YEARS.map((item, i) => {
              const x = getX(i);
              const yPred = getY(item.predicted);
              const yObs = getY(item.observed);

              return (
                <g key={item.year}>
                  <circle cx={x} cy={yPred} r={4} fill="#22d3ee" stroke="#080d19" strokeWidth={2} />
                  <circle cx={x} cy={yObs} r={4} fill="#94a3b8" stroke="#080d19" strokeWidth={2} />
                  <text x={x} y={chartHeight - 10} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                    {item.year}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <b className="text-cyan-400">Calibration Summary:</b> Model tracks observed monsoon crest events with an average root-mean-square error (RMSE) of 3.4 index points. No significant model drift detected after the 2024 sensor mesh recalibration.
        </div>
      </div>
    </div>
  );
};
