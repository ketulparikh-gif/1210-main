import React, { useState } from 'react';
import { FloodTypeWarning, RescueCamp } from '../types';
import {
  CloudLightning,
  Waves,
  CloudRain,
  Building,
  AlertTriangle,
  Clock,
  Gauge,
  CheckSquare,
  Square,
  Send,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface FloodTypesViewProps {
  warnings: FloodTypeWarning[];
  camps: RescueCamp[];
  onTriggerAlert: (warning: FloodTypeWarning) => void;
}

export const FloodTypesView: React.FC<FloodTypesViewProps> = ({
  warnings,
  camps,
  onTriggerAlert,
}) => {
  const [selectedId, setSelectedId] = useState<string>(warnings[0]?.id || '');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedWarning = warnings.find((w) => w.id === selectedId) || warnings[0];

  const toggleChecklist = (itemKey: string) => {
    setChecklistState((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const getIcon = (type: FloodTypeWarning['type']) => {
    switch (type) {
      case 'flash-flood':
        return <CloudLightning className="w-5 h-5 text-amber-400" />;
      case 'dam-spillway':
        return <Waves className="w-5 h-5 text-rose-400" />;
      case 'monsoon-riverine':
        return <CloudRain className="w-5 h-5 text-cyan-400" />;
      case 'urban-drainage':
        return <Building className="w-5 h-5 text-purple-400" />;
      case 'cyclonic-surge':
        return <Waves className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleDispatch = (warning: FloodTypeWarning) => {
    onTriggerAlert(warning);
    setToastMsg(`Early warning advisory for ${warning.name} loaded into Dispatch Console!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            Flood Safety Guide
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Flood Types & Safety Steps
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Learn how fast different floods happen (flash floods, river rise, dam gates) and simple steps to stay safe.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{toastMsg}</span>
          </div>
          <span className="text-[11px] text-cyan-400/80 font-mono">GOVT ALERT READY</span>
        </div>
      )}

      {/* Flood Types Selector Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {warnings.map((w) => {
          const isSelected = w.id === selectedId;
          const isImmediate = w.urgency === 'immediate';

          return (
            <button
              key={w.id}
              onClick={() => setSelectedId(w.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0f172a] border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg'
                  : 'bg-[#0c1322] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {getIcon(w.type)}
                  </div>
                  {isImmediate && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold animate-pulse">
                      IMMEDIATE
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white tracking-tight leading-snug">
                  {w.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{w.categoryLabel}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Lead Time:</span>
                <span className="font-mono font-bold text-cyan-300">{w.leadTimeRemaining}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Threat Deep-Dive Panel */}
      {selectedWarning && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Physics, Causes, and Govt SOP Checklist */}
          <div className="lg:col-span-2 space-y-5">
            {/* Main Overview Card */}
            <div className="p-6 rounded-2xl bg-[#0c1322] border border-slate-800 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    {getIcon(selectedWarning.type)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {selectedWarning.name}
                    </h2>
                    <p className="text-xs text-slate-400">{selectedWarning.categoryLabel}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDispatch(selectedWarning)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-md whitespace-nowrap self-start sm:self-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Threat Alert</span>
                </button>
              </div>

              {/* Physics & Timelines Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lead Time to Front</span>
                  </div>
                  <div className="text-lg font-extrabold font-mono text-cyan-300">
                    {selectedWarning.leadTimeRemaining}
                  </div>
                  <div className="text-[10px] text-slate-400">Before initial bank overflow</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    <span>Peak Surge Velocity</span>
                  </div>
                  <div className="text-lg font-extrabold font-mono text-amber-300">
                    {selectedWarning.peakVelocity.split(' ')[0]} {selectedWarning.peakVelocity.split(' ')[1]}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{selectedWarning.peakVelocity.split('(')[1]?.replace(')', '') || 'Hydro-momentum'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Target Water Stage</span>
                  </div>
                  <div className="text-sm font-extrabold font-mono text-rose-400 mt-1 leading-tight">
                    {selectedWarning.waterCrestPrediction.split('at')[0]}
                  </div>
                </div>
              </div>

              {/* Cause Analysis */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs leading-relaxed">
                <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hydrological Origin & Mechanism</span>
                </div>
                <p className="text-slate-300">{selectedWarning.causeDescription}</p>
              </div>

              {/* Affected Zones */}
              <div className="text-xs space-y-1.5">
                <span className="text-slate-400 font-semibold">Priority Inundation Sectors:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWarning.affectedAreas.map((area, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Government Standard Operating Procedure (SOP) Checklist */}
            <div className="p-6 rounded-2xl bg-[#0c1322] border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Mandatory Government Response SOP Checklist
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">NDMA Protocol Compliant</span>
              </div>

              <div className="space-y-2.5">
                {selectedWarning.govtChecklist.map((item, idx) => {
                  const itemKey = `${selectedWarning.id}-${idx}`;
                  const isChecked = checklistState[itemKey] ?? item.done;

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleChecklist(itemKey)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <button className="mt-0.5 text-emerald-400 focus:outline-none">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className={`font-medium ${isChecked ? 'line-through opacity-80' : ''}`}>
                          {item.task}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Action Dept: <span className="text-slate-300">{item.department}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Associated Relief Camps & Direct Triage Guidance */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Recommended Relief Camps</h3>
                <span className="text-[10px] text-cyan-400 font-mono">Elevated & Dry</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-designated safe locations recommended for evacuees fleeing from this specific flood threat.
              </p>

              <div className="space-y-3 pt-2">
                {selectedWarning.recommendedShelterIds.map((cid) => {
                  const camp = camps.find((c) => c.id === cid);
                  if (!camp) return null;

                  return (
                    <div
                      key={camp.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white text-xs">{camp.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                          {camp.elevationMeters}m MSL
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{camp.location}</div>
                      <div className="text-[10px] text-cyan-300 bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20">
                        {camp.safeApproachRoute}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0c1322] border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-200">Official Decision Protocol:</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                When a <strong>{selectedWarning.name}</strong> alert is authorized by the District Collector, the Common Alerting Protocol (CAP) simultaneously pings local mobile towers, sounds warble sirens, and informs NDRF battalions within 45 seconds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
