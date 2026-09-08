import React, { useState } from 'react';
import { ImpactNode } from '../types';
import { GitCommit, Waves, ArrowDownRight, Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface ImpactViewProps {
  impactNodes: ImpactNode[];
}

export const ImpactView: React.FC<ImpactViewProps> = ({ impactNodes }) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(3); // default Vasna (Node 4)

  const selectedNode = impactNodes[selectedNodeIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            Hydrodynamic Cascade Modeling
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Upstream → Downstream Impact
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cascading wave propagation, flood crest arrival timelines (ETA), and discharge kinematics across the watershed.
          </p>
        </div>
      </div>

      {/* Upstream -> Downstream Propagation Chain Visualizer */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400" />
            Watershed River Reach Cascade (168 km Reach)
          </h3>
          <span className="text-xs font-mono-telemetry text-slate-400">
            Flow Direction: <b className="text-cyan-400">North → South (Gulf of Khambhat)</b>
          </span>
        </div>

        {/* Nodes Grid / Flow Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {impactNodes.map((node, i) => {
            const isSelected = selectedNodeIndex === i;
            const isCritical = node.status === 'Critical';
            const isWarning = node.status === 'Warning';

            return (
              <div
                key={node.nodeNumber}
                onClick={() => setSelectedNodeIndex(i)}
                className={`relative cursor-pointer rounded-2xl p-4 border transition-all ${
                  isSelected
                    ? 'ring-2 ring-cyan-400/80 bg-cyan-950/20 border-cyan-400/50 shadow-lg'
                    : isCritical
                    ? 'bg-rose-950/15 border-rose-500/30 hover:border-rose-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono-telemetry text-slate-400">
                  <span className="font-bold">NODE 0{node.nodeNumber}</span>
                  <span className={isCritical ? 'text-rose-400 font-bold' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                    {node.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-100 mt-2 line-clamp-1">{node.name}</h4>

                <div className="mt-3 flex items-baseline gap-1 font-mono-telemetry">
                  <span className={`text-2xl font-black ${isCritical ? 'text-rose-400' : 'text-white'}`}>
                    {node.currentStage}
                  </span>
                  <span className="text-xs text-slate-500">m</span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono-telemetry text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Clock className="w-3 h-3" /> +{node.etaHours}h
                  </span>
                  <span>{node.distanceKm} km</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Kinematic Inspection Panel */}
        {selectedNode && (
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono-telemetry">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                Station & Location
              </span>
              <span className="text-sm font-bold text-white mt-1 block">
                {selectedNode.name}
              </span>
              <span className="text-slate-500 text-[11px] font-sans">
                {selectedNode.distanceKm} km downstream from Dharoi
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                Current vs Crest Stage
              </span>
              <span className="text-sm font-bold text-cyan-300 mt-1 block">
                {selectedNode.currentStage} m / {selectedNode.crestStage} m
              </span>
              <span className="text-slate-500 text-[11px] font-sans">
                Model crest buffer: {(selectedNode.crestStage - selectedNode.currentStage).toFixed(2)}m
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                Discharge Flow Rate
              </span>
              <span className="text-sm font-bold text-amber-300 mt-1 block">
                {selectedNode.flowRateCusecs.toLocaleString()} cusecs
              </span>
              <span className="text-slate-500 text-[11px] font-sans">
                Velocity: ~3.2 m/sec
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                Flood Wave ETA
              </span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">
                +{selectedNode.etaHours} Hours
              </span>
              <span className="text-slate-500 text-[11px] font-sans">
                Wave propagation velocity calibrated
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hydraulic Propagation Warning Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-[#0d1424] to-[#0d1424] p-5 shadow-md flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex-shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-300">
            Hydrodynamic Wave Propagation Alert: Dharoi → Vasna
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            A 0.25 m surge release from Dharoi Dam spillway takes approximately <b>13 hours</b> to travel the 126 km reach to Vasna Barrage under saturated soil antecedent conditions. Downstream municipal authorities in Ahmedabad North have an ~8-hour operational response window before peak stage arrival.
          </p>
        </div>
      </div>
    </div>
  );
};
