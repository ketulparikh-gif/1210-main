import React from 'react';
import { ThemeConfig, ThemeMode, AccentColor } from '../types';
import {
  Moon,
  Sun,
  Eye,
  Shield,
  Check,
  X,
  Palette,
  Sliders,
  Sparkles,
  Contrast,
  Zap,
} from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ThemeConfig;
  onChangeConfig: (newConfig: ThemeConfig) => void;
}

interface ThemeOption {
  id: ThemeMode;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  previewBg: string;
  previewCard: string;
  previewBorder: string;
  previewText: string;
  previewAccent: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'deep-ops',
    name: 'Deep Ops Night',
    badge: 'Standard Command',
    description: 'Deep navy and slate command center with balanced contrast for dimly lit control rooms.',
    icon: Moon,
    previewBg: '#080d19',
    previewCard: '#0d1424',
    previewBorder: '#1e293b',
    previewText: '#f8fafc',
    previewAccent: '#22d3ee',
  },
  {
    id: 'oled-black',
    name: 'OLED Midnight Black',
    badge: 'True Black 0% Light',
    description: 'Pure black (#000000) for zero light pollution, pitch-dark stations, and OLED battery preservation.',
    icon: Shield,
    previewBg: '#000000',
    previewCard: '#05070d',
    previewBorder: '#162035',
    previewText: '#ffffff',
    previewAccent: '#22d3ee',
  },
  {
    id: 'night-vision',
    name: 'Tactical Red Night Vision',
    badge: 'Maritime / Emergency',
    description: 'Low-kelvin red and amber scotopic spectrum that preserves human night vision during nocturnal deployments.',
    icon: Eye,
    previewBg: '#080203',
    previewCard: '#120406',
    previewBorder: '#450a0a',
    previewText: '#fee2e2',
    previewAccent: '#f87171',
  },
  {
    id: 'daylight',
    name: 'Daylight Field Ops',
    badge: 'High-Visibility Light',
    description: 'Crisp white & slate high-contrast daylight mode engineered for outdoor sunlight and field tablet use.',
    icon: Sun,
    previewBg: '#f1f5f9',
    previewCard: '#ffffff',
    previewBorder: '#cbd5e1',
    previewText: '#0f172a',
    previewAccent: '#0284c7',
  },
];

const ACCENT_OPTIONS: { id: AccentColor; name: string; colorHex: string }[] = [
  { id: 'cyan', name: 'Cyan (Hydro)', colorHex: '#22d3ee' },
  { id: 'emerald', name: 'Emerald (Eco)', colorHex: '#34d399' },
  { id: 'amber', name: 'Amber (Tactical)', colorHex: '#fbbf24' },
  { id: 'blue', name: 'Cobalt (Marine)', colorHex: '#60a5fa' },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-700/80 bg-[#0c1322] text-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        id="theme-customizer-modal"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Display & Night Mode Profiles
              </h2>
              <p className="text-xs text-slate-400">
                Calibrate ambient luminance, contrast, and telemetry spectral colors.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Theme Presets */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Environment & Night Mode Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_OPTIONS.map((theme) => {
                const Icon = theme.icon;
                const isSelected = config.mode === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onChangeConfig({ ...config, mode: theme.id })}
                    className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400/50 shadow-lg'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      {/* Theme Mini Palette Preview */}
                      <div
                        className="h-10 rounded-lg border mb-3 flex items-center px-3 justify-between shadow-inner"
                        style={{
                          backgroundColor: theme.previewBg,
                          borderColor: theme.previewBorder,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ backgroundColor: theme.previewAccent }}
                          />
                          <span
                            className="text-[10px] font-bold font-mono-telemetry"
                            style={{ color: theme.previewText }}
                          >
                            SAMPLE
                          </span>
                        </div>
                        <div
                          className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                          style={{
                            backgroundColor: theme.previewCard,
                            color: theme.previewAccent,
                            border: `1px solid ${theme.previewBorder}`,
                          }}
                        >
                          LIVE
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-cyan-400" />
                          {theme.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold text-cyan-400/80">
                        {theme.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {theme.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telemetry Accent Color */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Telemetry Accent Color Spectrum
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ACCENT_OPTIONS.map((acc) => {
                const isSelected = config.accent === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => onChangeConfig({ ...config, accent: acc.id })}
                    className={`px-3 py-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/20 text-white'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: acc.colorHex }}
                    />
                    <span className="truncate">{acc.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contrast & Visibility Toggles */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Ergonomics & Field Adjustments
            </label>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <Contrast className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    High-Contrast Grid & Outer Borders
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Amplifies demarcation lines for harsh glare or low-resolution screens.
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  onChangeConfig({ ...config, highContrast: !config.highContrast })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  config.highContrast ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    config.highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() =>
              onChangeConfig({
                mode: 'deep-ops',
                accent: 'cyan',
                highContrast: false,
              })
            }
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
