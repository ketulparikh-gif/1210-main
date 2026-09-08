import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Check,
  Copy,
  AlertTriangle,
  Brain,
  Layers,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { perfectWithGroq, LiveWeatherReport } from '../services/floodIntelligenceApi';
import { RiverGauge, AlertItem, RescueCamp, FloodTypeWarning } from '../types';

interface GroqIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: LiveWeatherReport | null;
  gauges: RiverGauge[];
  activeThreat?: FloodTypeWarning | null;
  camps: RescueCamp[];
  onApplyToBroadcast?: (title: string, message: string) => void;
}

export const GroqIntelligenceModal: React.FC<GroqIntelligenceModalProps> = ({
  isOpen,
  onClose,
  weather,
  gauges,
  activeThreat,
  camps,
  onApplyToBroadcast,
}) => {
  const [activeTab, setActiveTab] = useState<'advisory' | 'hydro' | 'chat'>('advisory');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseContent, setResponseContent] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('openai/gpt-oss-20b');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const criticalGauge = gauges.find((g) => g.status === 'Critical') || gauges[0];

  const handleGenerate = async (mode: 'perfect_advisory' | 'hydrological_intelligence' | 'custom_query', promptText?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setResponseContent(null);

    try {
      const context = {
        weather: weather
          ? {
              temp: `${weather.main.temp}°C`,
              humidity: `${weather.main.humidity}%`,
              pressure: `${weather.main.pressure} hPa`,
              wind: `${weather.wind.speed} km/h`,
              rain1h: weather.rain?.['1h'] || '12.4 mm',
              condition: weather.weather?.[0]?.description,
            }
          : { temp: '31°C', humidity: '51%', pressure: '1008 hPa' },
        gauge: criticalGauge
          ? {
              station: criticalGauge.name,
              level: `${criticalGauge.currentLevel}m`,
              dangerLevel: `${criticalGauge.dangerLevel}m`,
              status: criticalGauge.status,
            }
          : { station: 'Main River Gauge', level: '8.42m', dangerLevel: '8.00m' },
        floodType: activeThreat?.name || 'Heavy Monsoon River Flood',
        camps: camps.map((c) => ({
          name: c.name,
          capacity: `${c.capacityOccupied}/${c.capacityTotal} occupied`,
          elevation: `${c.elevationMeters}m above sea level`,
          safeRoute: c.safeApproachRoute,
        })),
      };

      const result = await perfectWithGroq(mode, context, promptText || customPrompt);
      setResponseContent(result.content);
      setModelUsed(result.model);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Groq processing failed. Please check network/credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responseContent) return;
    navigator.clipboard.writeText(responseContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToBroadcast = () => {
    if (!responseContent || !onApplyToBroadcast) return;
    // Extract first title line or summary
    const lines = responseContent.split('\n').filter((l) => l.trim().length > 0);
    const title = lines[0].replace(/[*#]/g, '').trim() || 'PUBLIC FLOOD WARNING & SAFETY ADVISORY';
    onApplyToBroadcast(title, responseContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#090f1d] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0d1627] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Groq AI Flood Assistant</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Fast AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Combines live weather, river levels, and ground height into clear, easy guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800/80 bg-[#070c17] px-5 pt-2 gap-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('advisory');
              setResponseContent(null);
            }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'advisory'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Plain Safety Warning
          </button>

          <button
            onClick={() => {
              setActiveTab('hydro');
              setResponseContent(null);
            }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'hydro'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Where Water Will Rise
          </button>

          <button
            onClick={() => {
              setActiveTab('chat');
              setResponseContent(null);
            }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Ask Flood Questions
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Live Context Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Live Weather Used:</span>
              <span className="font-mono-telemetry text-cyan-300 font-semibold">
                {weather ? `${weather.main.temp}°C, ${weather.main.humidity}% humidity, ${weather.main.pressure} hPa` : 'Live Weather Online'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Highest River Level:</span>
              <span className="font-mono-telemetry text-rose-400 font-bold">
                {criticalGauge ? `${criticalGauge.name} (${criticalGauge.currentLevel}m)` : 'Water Level High'}
              </span>
            </div>
          </div>

          {activeTab === 'advisory' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Click below to turn live rain radar, river height, and land elevations into a <strong>simple, easy-to-understand safety warning</strong> for families and citizens with clear safe shelter routes.
              </p>
              <button
                onClick={() => handleGenerate('perfect_advisory')}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing Plain Warning with Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Easy Public Safety Warning</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'hydro' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Check how fast rain will flow into the river, how soaked the ground is, and when the highest water wave will reach towns downstream.
              </p>
              <button
                onClick={() => handleGenerate('hydrological_intelligence')}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing River & Rain Flow...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Explain Where & When Water Will Rise</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-medium">Click an easy question or type below:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Will my neighborhood flood in the next 12 hours?',
                  'Which rescue camp has open beds and food right now?',
                  'What walking routes are dry and safe from rising water?',
                  'Are upstream dam gates opening soon?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setCustomPrompt(q);
                      handleGenerate('custom_query', q);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 hover:border-cyan-500/30 transition-all text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && customPrompt.trim() && handleGenerate('custom_query')}
                  placeholder="Ask Groq AI any question regarding flood operations or logistics..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleGenerate('custom_query')}
                  disabled={isLoading || !customPrompt.trim()}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Result Container */}
          {responseContent && (
            <div className="mt-4 p-4 rounded-xl bg-[#060b15] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-200">Groq Synthesized Intelligence</span>
                  <span className="text-[10px] text-slate-500 font-mono-telemetry">({modelUsed})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  {onApplyToBroadcast && (
                    <button
                      onClick={handleApplyToBroadcast}
                      className="px-2.5 py-1 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Push to Broadcast Console</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans max-h-[380px] overflow-y-auto pr-1">
                {responseContent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
