import React from 'react';
import { X, AlertCircle, AlertTriangle, Info, Check, ShieldAlert, Waves } from 'lucide-react';
import { AlertItem } from '../types';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  onAcknowledge: (id: string) => void;
  onViewAllAlerts: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledge,
  onViewAllAlerts,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-[#0c1322] border-l border-slate-800 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Active Hydro Alerts</h2>
                <p className="text-[11px] text-slate-400">Automated hydrological rules engine</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alert List */}
          <div className="mt-4 space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No active critical alerts in the monitored catchment.
              </div>
            ) : (
              alerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isWarning = alert.severity === 'warning';

                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl p-3.5 border transition-all ${
                      alert.acknowledged
                        ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                        : isCritical
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-cyan-950/20 border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isCritical ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300'
                              : isWarning
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-100 mt-2">{alert.title}</h3>

                    {alert.floodType && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-500/30 text-[10px] font-semibold text-cyan-300">
                        <Waves className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span>Flood Type: <strong>{alert.floodType}</strong></span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{alert.description}</p>

                    {alert.actionRequired && (
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] text-slate-300">
                        <span className="font-semibold text-cyan-400">Action: </span>
                        {alert.actionRequired}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
                        {alert.source}
                      </span>
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-medium">Acknowledged</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-6 flex gap-2">
          <button
            onClick={() => {
              onViewAllAlerts();
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition-colors"
          >
            Open Alert Center
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
