import React, { useState } from 'react';
import { FloodMapInteractive } from './FloodMapInteractive';
import { RiverGauge, RescueCamp, WatershedRegion } from '../types';
import { Sliders, AlertTriangle, Users } from 'lucide-react';

interface FloodMapViewProps {
  gauges: RiverGauge[];
  camps?: RescueCamp[];
  currentRegion: WatershedRegion;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export const FloodMapView: React.FC<FloodMapViewProps> = ({
  gauges,
  camps = [],
  currentRegion,
  isSimulating,
  onToggleSimulation,
}) => {
  const [inflowModifier, setInflowModifier] = useState(25); // %
  const [embankmentBreachScenario, setEmbankmentBreachScenario] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            Live River & Flooding Map
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {currentRegion.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time river water levels, ground elevation above sea level, flood areas, and safe rescue camps.
          </p>
        </div>
      </div>

      {/* Main Full-Size Map Studio */}
      <FloodMapInteractive
        gauges={gauges}
        camps={camps}
        currentRegion={currentRegion}
        isSimulating={isSimulating}
        onToggleSimulation={onToggleSimulation}
        fullView={true}
      />

      {/* Hydrodynamic Simulation Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Dam Water Release Level
            </h3>
            <span className="text-xs font-mono-telemetry font-bold text-cyan-400">
              +{inflowModifier}% Extra Water
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Adjust how much water is released from upstream dams to see where water spreads downstream:
          </p>

          <input
            type="range"
            min="0"
            max="60"
            value={inflowModifier}
            onChange={(e) => setInflowModifier(Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono-telemetry">
            <span>Normal Flow (0%)</span>
            <span>Current (+25%)</span>
            <span>Heavy Spill (+60%)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Riverbank Wall Safety Test
          </h3>
          <p className="text-xs text-slate-400">
            Simulate what happens if riverbank walls overflow or breach near low settlements:
          </p>

          <button
            onClick={() => setEmbankmentBreachScenario(!embankmentBreachScenario)}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
              embankmentBreachScenario
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>Riverbank Barrier Spill Simulation</span>
            <span className="font-mono-telemetry text-[11px] font-bold">
              {embankmentBreachScenario ? 'ACTIVE' : 'TEST NOW'}
            </span>
          </button>
          <span className="text-[11px] text-slate-500 block">
            {embankmentBreachScenario
              ? 'Warning: Water spreads 6.8 km² further inland into low fields.'
              : 'Status: Riverbank walls currently holding water safely.'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Where People Need to Move
          </h3>
          <div className="space-y-2 text-xs">
            {currentRegion.id === 'narmada' ? (
              <>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Bharuch Furja & Dandia Bazar</span>
                  <span className="text-rose-400 font-bold">Leave Now to Camp</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Ankleshwar Low Creek</span>
                  <span className="text-amber-400 font-bold">Ready to Move</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Bharuch High Town Hall</span>
                  <span className="text-emerald-400 font-bold">Safe High Ground</span>
                </div>
              </>
            ) : currentRegion.id === 'tapi' ? (
              <>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Singanpore Causeway & Rander</span>
                  <span className="text-rose-400 font-bold">Leave Now to Camp</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Adajan Riverside Lowlands</span>
                  <span className="text-amber-400 font-bold">Ready to Move</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Indoor Stadium Athwalines</span>
                  <span className="text-emerald-400 font-bold">Safe High Ground</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Vasna Riverfront & Paldi Lowlands</span>
                  <span className="text-rose-400 font-bold">Leave Now to Camp</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Dholka Low Agricultural Fields</span>
                  <span className="text-amber-400 font-bold">Ready to Move</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Navrangpura High Sports Complex</span>
                  <span className="text-emerald-400 font-bold">Safe High Ground</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
