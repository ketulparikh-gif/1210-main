import React, { useState } from 'react';
import { RiskFactor } from '../types';
import { Brain, Check, RefreshCcw, Sparkles, TrendingDown, HelpCircle, Shield } from 'lucide-react';

interface ExplainabilityViewProps {
  riskFactors: RiskFactor[];
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({ riskFactors }) => {
  const [activeMitigations, setActiveMitigations] = useState<string[]>([]);

  const toggleMitigation = (id: string) => {
    setActiveMitigations((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const baseRisk = 82;
  const totalReduction = riskFactors
    .filter((f) => activeMitigations.includes(f.id))
    .reduce((sum, f) => sum + f.deltaRiskIfMitigated, 0);

  const calculatedRisk = Math.max(25, baseRisk - totalReduction);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            Why is Flood Danger High?
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            What Causes This Flood Risk?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Understand each reason making flood risk high (heavy rain, full dams, wet soil) and how safety actions lower the danger.
          </p>
        </div>

        {activeMitigations.length > 0 && (
          <button
            onClick={() => setActiveMitigations([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs hover:text-white transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Actions</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Left Column: Factor Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                Primary Attribution Drivers
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Current Risk Decomposition
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-rose-400 font-mono-telemetry">{baseRisk}</span>
              <span className="text-xs text-slate-400"> / 100 Risk</span>
            </div>
          </div>

          <div className="space-y-4">
            {riskFactors.map((factor) => {
              const isMitigated = activeMitigations.includes(factor.id);

              return (
                <div
                  key={factor.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isMitigated
                      ? 'bg-emerald-950/15 border-emerald-500/40 opacity-80'
                      : 'bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      {factor.name}
                      {isMitigated && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-telemetry bg-emerald-500/20 text-emerald-300">
                          Mitigated (−{factor.deltaRiskIfMitigated} pts)
                        </span>
                      )}
                    </span>
                    <span className="font-mono-telemetry text-xs font-bold text-cyan-400">
                      +{factor.attributionPct}% Weight
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMitigated
                          ? 'bg-emerald-400'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${factor.attributionPct * 2.5}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Counterfactual "What-If" Analysis */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 shadow-lg flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Counterfactual What-If Sandbox
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Actionable Risk Reduction
                </h3>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Test operational water management interventions to simulate dynamic risk mitigation:
            </p>

            <div className="mt-4 space-y-2.5">
              {riskFactors.map((factor) => {
                const isChecked = activeMitigations.includes(factor.id);

                return (
                  <button
                    key={factor.id}
                    onClick={() => toggleMitigation(factor.id)}
                    className={`w-full p-3 rounded-xl text-left border flex items-center justify-between transition-all ${
                      isChecked
                        ? 'bg-emerald-950/25 border-emerald-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 pr-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          isChecked
                            ? 'bg-emerald-500 text-slate-950'
                            : 'border border-slate-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium">{factor.mitigationText}</span>
                    </div>
                    <span className="text-xs font-mono-telemetry font-bold text-emerald-400 whitespace-nowrap">
                      −{factor.deltaRiskIfMitigated} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulated Score Outcome Result Card */}
          <div className="mt-6 p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-[#0e1c2e] to-[#0a1220] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Simulated Post-Intervention Risk
            </span>
            <div className="flex items-baseline justify-between font-mono-telemetry">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-black ${
                    calculatedRisk < 60
                      ? 'text-emerald-400'
                      : calculatedRisk < 75
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {calculatedRisk}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              {totalReduction > 0 && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                  <TrendingDown className="w-4 h-4" /> −{totalReduction} points mitigated
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {calculatedRisk < 60
                ? 'Safe Threshold: Operational emergency downgraded to Stage 1 Alert.'
                : 'Elevated Risk: Continued monitoring and floodgate regulation advised.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
