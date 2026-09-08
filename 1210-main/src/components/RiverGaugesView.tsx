import React, { useState } from 'react';
import { RiverGauge } from '../types';
import { Gauge, AlertTriangle, ArrowUpRight, Search, CheckCircle2, ShieldAlert, Sliders } from 'lucide-react';

interface RiverGaugesViewProps {
  gauges: RiverGauge[];
}

export const RiverGaugesView: React.FC<RiverGaugesViewProps> = ({ gauges }) => {
  const [filter, setFilter] = useState<'All' | 'Critical' | 'Warning' | 'Normal'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGauges = gauges.filter((g) => {
    const matchesFilter = filter === 'All' || g.status === filter;
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.river.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.stationCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            River Water Level Stations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Live River Water Levels
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Check real-time river heights, danger marks, and how fast the water is rising along the river.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 text-xs">
            {(['All', 'Critical', 'Warning', 'Normal'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filter === status
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gauge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGauges.map((gauge) => {
          const isCritical = gauge.status === 'Critical';
          const isWarning = gauge.status === 'Warning';

          return (
            <div
              key={gauge.id}
              className={`rounded-2xl p-5 border transition-all shadow-md ${
                isCritical
                  ? 'bg-gradient-to-b from-[#18111e] to-[#0f1424] border-rose-500/40 shadow-rose-950/20'
                  : isWarning
                  ? 'bg-[#0d1424] border-amber-500/30'
                  : 'bg-[#0d1424] border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono-telemetry uppercase text-slate-400">
                    {gauge.stationCode} • {gauge.river} River
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-0.5">{gauge.name}</h3>
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {gauge.status}
                </span>
              </div>

              {/* Stage Numbers */}
              <div className="mt-4 flex items-baseline justify-between font-mono-telemetry">
                <div>
                  <span className="text-3xl font-black text-white">{gauge.currentLevel}</span>
                  <span className="text-xs text-slate-400"> m Stage</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-sans block">Danger Limit:</span>
                  <span className="text-sm font-bold text-rose-400">{gauge.threshold} m</span>
                </div>
              </div>

              {/* Gauge Level Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, gauge.pct)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono-telemetry text-slate-500">
                  <span>0.0 m (Dry)</span>
                  <span>Warn {gauge.warningLevel}m</span>
                  <span className="text-rose-400">Danger {gauge.threshold}m</span>
                </div>
              </div>

              {/* Rate of rise & Telemetry sparkline */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono-telemetry">
                  Rate:{' '}
                  <b className={isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                    {gauge.rateOfRise}
                  </b>
                </span>
                <span className="text-[11px] text-slate-500">{gauge.lastUpdated}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Automated Alert Rules Reference Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Automated Hydrological Action Rules</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono-telemetry">Engine v4.2 Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Severity Rule</th>
                <th className="py-3 px-4">Trigger Condition</th>
                <th className="py-3 px-4">Automated Protocol Action</th>
                <th className="py-3 px-4">Dispatch Channels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-rose-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  Critical Stage
                </td>
                <td className="py-3 px-4 font-mono-telemetry">Stage ≥ Danger Mark (8.00m)</td>
                <td className="py-3 px-4">Immediate floodgate sector discharge & municipal sirens</td>
                <td className="py-3 px-4 text-slate-400">SMS Broadcast, Command Radio, Siren Audio</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  Warning Stage
                </td>
                <td className="py-3 px-4 font-mono-telemetry">Stage ≥ Warning Mark (7.20m)</td>
                <td className="py-3 px-4">Operator station alert, dam gate readiness standby</td>
                <td className="py-3 px-4 text-slate-400">Dashboard Notification, Engineer Pager</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-cyan-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                  Rate of Rise
                </td>
                <td className="py-3 px-4 font-mono-telemetry">d(Level)/dt ≥ 0.15 m/hour</td>
                <td className="py-3 px-4">Predictive trajectory recalculation and early warning flag</td>
                <td className="py-3 px-4 text-slate-400">Automated Webhook, Control Desk</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
