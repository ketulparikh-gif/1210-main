import React, { useState } from 'react';
import { RescueCamp } from '../types';
import {
  Building2,
  Users,
  ShieldCheck,
  MapPin,
  Phone,
  Droplets,
  Zap,
  Activity,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Bed,
  UtensilsCrossed,
} from 'lucide-react';

interface RescueCampsViewProps {
  camps: RescueCamp[];
  onBroadcastEvacuation: (camp: RescueCamp) => void;
  onUpdateCapacity?: (campId: string, delta: number) => void;
}

export const RescueCampsView: React.FC<RescueCampsViewProps> = ({
  camps,
  onBroadcastEvacuation,
  onUpdateCapacity,
}) => {
  const [filter, setFilter] = useState<'all' | 'Accepting' | 'Near Full' | 'Full'>('all');
  const [selectedCamp, setSelectedCamp] = useState<RescueCamp | null>(camps[0] || null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filteredCamps = camps.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const totalCapacity = camps.reduce((acc, c) => acc + c.capacityTotal, 0);
  const totalOccupied = camps.reduce((acc, c) => acc + c.capacityOccupied, 0);
  const totalAvailable = totalCapacity - totalOccupied;
  const overallOccupancyPct = Math.round((totalOccupied / totalCapacity) * 100);

  const handleBroadcast = (camp: RescueCamp) => {
    onBroadcastEvacuation(camp);
    setSuccessToast(`Evacuation directive for ${camp.name} prepared in Alert Dispatch Console!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Safe Relief Shelters
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Safe Shelters & Relief Camps
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Find safe dry shelters with free open beds, clean drinking water, hot food, and medical doctors.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 text-xs self-start md:self-auto">
          {(['all', 'Accepting', 'Near Full', 'Full'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                filter === st
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <span className="text-[11px] text-emerald-400/80 font-mono">BROADCAST READY</span>
        </div>
      )}

      {/* High-Level Govt Capacity Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Bed Capacity</span>
            <Bed className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono-telemetry tracking-tight">
            {totalCapacity.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across 5 district hubs</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Currently Sheltered</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono-telemetry tracking-tight">
            {totalOccupied.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {overallOccupancyPct}% occupied district-wide
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Available Vacant Beds</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono-telemetry tracking-tight">
            {totalAvailable.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">Ready for immediate intake</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Medical Readiness</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono-telemetry tracking-tight">
            4 / 5 Camps
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Doctors & ORS units stationed</div>
        </div>
      </div>

      {/* AI Shelter Evacuation Suggestion Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/30 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wide">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Automated Evacuation Route & Shelter Suggestion (Govt Decision Aid)</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              <strong className="text-white">Recommendation for Wards 3 & 4 (Paldi & Usmanpura):</strong> Water levels near Vasna Barrage are predicted to crest +1.1m above Danger Mark. Citizens in these riverbank sectors should be urgently directed to{' '}
              <strong className="text-cyan-300">Sardar Patel Indoor Sports Complex</strong> via{' '}
              <span className="underline decoration-cyan-400 font-semibold text-white">132ft Outer Ring Road Corridor</span>. Route is 100% dry at 54m elevation with 420 open beds.
            </p>
          </div>
          <button
            onClick={() => handleBroadcast(camps[0])}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-md whitespace-nowrap self-start lg:self-auto"
          >
            <Send className="w-4 h-4" />
            <span>1-Click Broadcast to Citizens</span>
          </button>
        </div>
      </div>

      {/* Camps List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCamps.map((camp) => {
          const occupancyPct = Math.round((camp.capacityOccupied / camp.capacityTotal) * 100);
          const isFull = camp.status === 'Full';
          const isNearFull = camp.status === 'Near Full';

          return (
            <div
              key={camp.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-md ${
                isFull
                  ? 'bg-rose-950/15 border-rose-500/30'
                  : isNearFull
                  ? 'bg-amber-950/15 border-amber-500/30'
                  : 'bg-[#0c1322] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Status & Type */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {camp.type}
                  </span>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isFull
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isNearFull
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                {/* Name & Location */}
                <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                  {camp.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{camp.location}</span>
                </div>

                {/* Elevation Safety */}
                <div className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Ground Elevation</span>
                  <span className="text-cyan-300 font-bold font-mono">
                    {camp.elevationMeters}m MSL (Zero Flood Risk)
                  </span>
                </div>

                {/* Capacity Meter */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Occupancy</span>
                    <span className="font-mono font-bold text-slate-200">
                      {camp.capacityOccupied} / {camp.capacityTotal}{' '}
                      <span className="text-slate-400 font-normal">({occupancyPct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull
                          ? 'bg-rose-500'
                          : isNearFull
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Logistics Badges */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                    <span>Food: <strong>{camp.foodRationsDays} days</strong></span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Water: <strong>{(camp.drinkingWaterLiters / 1000).toFixed(1)}k L</strong></span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                    <Activity className={`w-3.5 h-3.5 ${camp.medicalOfficer ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>Doctor: <strong>{camp.medicalOfficer ? 'Stationed' : 'None'}</strong></span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                    <Zap className={`w-3.5 h-3.5 ${camp.generatorBackup ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>Generator: <strong>{camp.generatorBackup ? 'Ready' : 'Pending'}</strong></span>
                  </div>
                </div>

                {/* Safe Approach Route */}
                <div className="mt-3.5 p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs">
                  <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-0.5">
                    Safe Dry Approach Route
                  </div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    {camp.safeApproachRoute}
                  </div>
                </div>

                {/* Assigned Wards */}
                <div className="mt-3 text-xs">
                  <span className="text-slate-400 text-[11px]">Assigned Population Wards:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {camp.assignedWards.map((w, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Officer Liason & Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400">
                  <div className="font-semibold text-slate-200 truncate">{camp.contactOfficer}</div>
                  <div className="flex items-center gap-1 text-[10px] text-cyan-400">
                    <Phone className="w-2.5 h-2.5" />
                    <span>{camp.contactPhone}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBroadcast(camp)}
                  disabled={isFull}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ${
                    isFull
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <Send className="w-3 h-3" />
                  <span>Direct Wards Here</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
