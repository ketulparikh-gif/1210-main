import React, { useState, useEffect } from 'react';
import { AlertItem, RescueCamp, Severity, WatershedRegion } from '../types';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Send,
  ShieldAlert,
  Clock,
  Radio,
  Volume2,
  VolumeX,
  Smartphone,
  Tv,
  CheckCircle2,
  Users,
  Compass,
  Zap,
  Building,
  RotateCcw,
  Sparkles,
  Waves,
} from 'lucide-react';
import { playEmergencySiren, stopEmergencySiren } from '../utils/audioSiren';
import { buildFloodEmergencyMessage } from '../utils/floodAlertMessage';
import { GroqIntelligenceModal } from './GroqIntelligenceModal';

interface AlertsViewProps {
  alerts: AlertItem[];
  camps?: RescueCamp[];
  currentRegion?: WatershedRegion;
  onAcknowledge: (id: string) => void;
  onDispatchAlert: (alertId: string) => void;
  onAddNewAlert?: (alert: AlertItem) => void;
}

const REGION_WARDS: Record<string, string[]> = {
  sabarmati: [
    'Ward 1 (Dudheshwar)',
    'Ward 2 (Gheekanta)',
    'Ward 3 (Paldi)',
    'Ward 4 (Usmanpura)',
    'Ward 5 (Sharda Nagar)',
    'Ward 6 (Wadaj Slums)',
    'Ward 7 (Shahpur)',
    'Dholka Rural Sector 4',
  ],
  tapi: [
    'Adajan Causeway Sector',
    'Rander Ward 1',
    'Nanpura Riverfront',
    'Katargam Lowlands',
    'Varachha Waterworks',
    'Singanpor Weir Sector',
    'Athwa Lines Embankment',
    'Dumas Coastal Reach',
  ],
  narmada: [
    'Bharuch Golden Bridge Ward',
    'Zadeshwar Embankment',
    'Ankleshwar GIDC Low Area',
    'Shuklatirth Riverfront',
    'Garudeshwar Outfall',
    'Tilakwada Riverside Sector',
    'Nandod Lowlands',
    'Hansot Estuary Sector',
  ],
};

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  camps = [],
  currentRegion,
  onAcknowledge,
  onDispatchAlert,
  onAddNewAlert,
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'advisory'>('all');
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [sirenCountdown, setSirenCountdown] = useState<number | null>(null);

  const isSafeRegion = currentRegion?.id === 'tapi';

  // Broadcast Form State
  const [alertTitle, setAlertTitle] = useState(
    isSafeRegion
      ? 'STATUS NORMAL: Tapi River Basin Safe (All Embankments Stable)'
      : 'CRITICAL FLASH FLOOD RED ALERT: Immediate Evacuation Order'
  );
  const [severity, setSeverity] = useState<Severity>(isSafeRegion ? 'advisory' : 'critical');
  const [floodType, setFloodType] = useState<string>(
    isSafeRegion
      ? 'Normal Seasonal River Flow (Safe)'
      : currentRegion?.id === 'narmada'
      ? 'Dam Spillway Release Surge'
      : 'River Rise (Fluvial Inundation)'
  );

  const regionWards = (currentRegion && REGION_WARDS[currentRegion.id]) || REGION_WARDS.sabarmati;
  const [selectedWards, setSelectedWards] = useState<string[]>(regionWards.slice(0, 3));
  const [selectedCampId, setSelectedCampId] = useState<string>(camps[0]?.id || 'camp-1');
  const [enableSMS, setEnableSMS] = useState(true);
  const [enableSirens, setEnableSirens] = useState(!isSafeRegion);
  const [enableMedia, setEnableMedia] = useState(true);
  const [enableNDRF, setEnableNDRF] = useState(!isSafeRegion);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccessNotice, setBroadcastSuccessNotice] = useState<string | null>(null);
  const [groqModalOpen, setGroqModalOpen] = useState(false);
  const [customMsgEnglish, setCustomMsgEnglish] = useState<string | null>(null);
  const [teamAlertPlace, setTeamAlertPlace] = useState('Old City, Ahmedabad');
  const [teamAlertSeverity, setTeamAlertSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [teamAlertDepth, setTeamAlertDepth] = useState('1.5m');
  const [teamAlertEta, setTeamAlertEta] = useState('in 30 mins');
  const [teamAlertRecipient, setTeamAlertRecipient] = useState('hackathon team');

  const teamAlertMessage = buildFloodEmergencyMessage({
    place: teamAlertPlace,
    severity: teamAlertSeverity,
    floodDepth: teamAlertDepth,
    eta: teamAlertEta,
    recipient: teamAlertRecipient,
  });

  // Sync with region changes
  useEffect(() => {
    const wards = (currentRegion && REGION_WARDS[currentRegion.id]) || REGION_WARDS.sabarmati;
    setSelectedWards(wards.slice(0, 3));
    if (camps.length > 0) {
      setSelectedCampId(camps[0].id);
    }
    if (currentRegion?.id === 'tapi') {
      setAlertTitle('STATUS NORMAL: Tapi River Basin Safe (All Embankments Stable)');
      setSeverity('advisory');
      setFloodType('Normal Seasonal River Flow (Safe)');
      setEnableSirens(false);
      setEnableNDRF(false);
    } else if (currentRegion?.id === 'narmada') {
      setAlertTitle('NOTICE: Sardar Sarovar Spillway Discharge Watch Active');
      setSeverity('warning');
      setFloodType('Dam Spillway Release Surge');
      setEnableSirens(false);
      setEnableNDRF(true);
    } else {
      setAlertTitle('CRITICAL FLASH FLOOD RED ALERT: Immediate Evacuation Order');
      setSeverity('critical');
      setFloodType('River Rise (Fluvial Inundation)');
      setEnableSirens(true);
      setEnableNDRF(true);
    }
  }, [currentRegion?.id, camps]);

  // Multilingual Messages
  const [langTab, setLangTab] = useState<'en' | 'hi' | 'gu'>('en');

  const selectedCamp = camps.find((c) => c.id === selectedCampId) || camps[0];
  const riverName = currentRegion?.riverName || 'Sabarmati';

  const getEnglishText = () =>
    customMsgEnglish ||
    (isSafeRegion
      ? `PUBLIC NOTICE [GOVT OF GUJARAT / DISASTER CONTROL]: River ${riverName} levels at Surat remain well within safe operating limits (9.4m vs warning line 13.5m). All flyovers, weir bridges, and embankments are normal. Designated standby relief center: ${selectedCamp?.name || 'Surat Indoor Stadium'}. Emergency helpline: 1077.`
      : `URGENT FLOOD ALERT [GOVT OF GUJARAT / NDMA]: River ${riverName} water levels are rising rapidly. If you are residing in riverfront low-lying areas, EVACUATE IMMEDIATELY. Move to designated relief camp: ${selectedCamp?.name || 'Sardar Patel Sports Complex'}. Safe approach route: ${selectedCamp?.safeApproachRoute || 'Via 132ft Outer Ring Road'}. Dial 1077 for emergency NDRF rescue.`);

  const getHindiText = () =>
    isSafeRegion
      ? `सार्वजनिक सूचना [गुजरात सरकार / आपदा नियंत्रण]: सूरत में ${riverName} नदी का जलस्तर सामान्य और पूरी तरह सुरक्षित है। सभी पुल और कॉजवे सामान्य रूप से खुले हैं। आपातकालीन संपर्क: 1077।`
      : `अत्यंत जरूरी बाढ़ चेतावनी [गुजरात सरकार / आपदा नियंत्रण]: ${riverName} नदी का जलस्तर खतरे के निशान को पार कर रहा है। नदी किनारे और निचले इलाकों के नागरिक तुरंत घर खाली करें। सुरक्षित राहत शिविर "${selectedCamp?.name || 'सरदार पटेल स्पोर्ट्स कॉम्प्लेक्स'}" में तुरंत पहुंचें। सुरक्षित रास्ता: "${selectedCamp?.safeApproachRoute || '132 फीट आउटर रिंग रोड'}"। आपातकालीन एनडीआरएफ सहायता के लिए 1077 डायल करें।`;

  const getGujaratiText = () =>
    isSafeRegion
      ? `જાહેર માહિતી [ગુજરાત આપત્તિ વ્યવસ્થાપન]: સુરતમાં ${riverName} નદીનું જળસ્તર સલામત અને સામાન્ય છે. તમામ બ્રિજ અને કૉઝવે ખુલ્લા છે. હેલ્પલાઇન 1077.`
      : `અતિ તાત્કાલિક પૂર ચેતવણી [ગુજરાત આપત્તિ વ્યવસ્થાપન]: ${riverName} નદીનું જળસ્તર ભયજનક સપાટીએ પહોંચી ગયું છે. નદીકાંઠાના નાગરિકોને તુરંત જ સલામત સ્થળે ખસી જવા સૂચના આપવામાં આવે છે. નિયુક્ત રાહત કેમ્પ "${selectedCamp?.name || 'સરદાર પટેલ સ્પોર્ટ્સ સંકુલ'}" તરફ પ્રસ્થાન કરો. સલામત માર્ગ: "${selectedCamp?.safeApproachRoute || '132 ફૂટ આઉટર રિંગ રોડ'}". બચાવ હેલ્પલાઇન 1077.`;

  const handleToggleSiren = () => {
    if (isSirenPlaying) {
      stopEmergencySiren();
      setIsSirenPlaying(false);
      setSirenCountdown(null);
    } else {
      setIsSirenPlaying(true);
      playEmergencySiren(8);
      let count = 8;
      setSirenCountdown(count);
      const timer = setInterval(() => {
        count -= 1;
        setSirenCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          setIsSirenPlaying(false);
          setSirenCountdown(null);
        }
      }, 1000);
    }
  };

  const handleQuickPreset = (preset: 'flash' | 'dam' | 'shelter' | 'safe') => {
    if (preset === 'flash') {
      setSeverity('critical');
      setFloodType('Flash Flood (Cloudburst)');
      setAlertTitle('EMERGENCY: Upstream Flash Surge Approaching Urban Front within 60 Mins');
      setSelectedWards(regionWards.slice(0, 4));
      setEnableSirens(true);
      setEnableSMS(true);
    } else if (preset === 'dam') {
      setSeverity('warning');
      setFloodType('Dam Spillway Release Surge');
      setAlertTitle('NOTICE: Dam Spillway Releasing Controlled Volume - 4-Hour Evacuation Window');
      setSelectedWards(regionWards.slice(1, 3));
      setEnableSirens(false);
      setEnableSMS(true);
    } else if (preset === 'shelter') {
      setSeverity('advisory');
      setFloodType('River Rise (Fluvial Inundation)');
      setAlertTitle(`RELIEF DIRECTIVE: Open Beds Active at ${selectedCamp?.name || 'Rescue Camp'}`);
      setSelectedWards(regionWards.slice(0, 2));
      setEnableSirens(false);
      setEnableSMS(true);
    } else if (preset === 'safe') {
      setSeverity('advisory');
      setFloodType('Normal Seasonal River Flow (Safe)');
      setAlertTitle(`ALL CLEAR: ${riverName} River Levels Well Below Danger Threshold`);
      setSelectedWards(regionWards.slice(0, 2));
      setEnableSirens(false);
      setEnableSMS(true);
    }
  };

  const handleSendTeamAlert = () => {
    const message = buildFloodEmergencyMessage({
      place: teamAlertPlace,
      severity: teamAlertSeverity,
      floodDepth: teamAlertDepth,
      eta: teamAlertEta,
      recipient: teamAlertRecipient,
    });

    setCustomMsgEnglish(message);
    setAlertTitle(`TEAM FLOOD ALERT: ${teamAlertPlace}`);
    setSeverity(teamAlertSeverity === 'Critical' ? 'critical' : teamAlertSeverity === 'High' ? 'warning' : 'advisory');
    setFloodType('Flash Flood (Cloudburst)');
    setBroadcastSuccessNotice(`Demo message sent to ${teamAlertRecipient}: ${message}`);
    setTimeout(() => setBroadcastSuccessNotice(null), 6000);
  };

  const handleAuthorizeBroadcast = () => {
    setIsBroadcasting(true);

    if (enableSirens) {
      playEmergencySiren(6);
      setIsSirenPlaying(true);
      setTimeout(() => {
        setIsSirenPlaying(false);
      }, 6000);
    }

    const newId = `gov-${Date.now()}`;
    const newAlertObj: AlertItem = {
      id: newId,
      severity,
      title: alertTitle,
      description: getEnglishText(),
      location: selectedWards.join(', '),
      timestamp: 'Just now',
      acknowledged: false,
      source: 'District Collector Emergency Broadcast Console (C-DOT CAP)',
      actionRequired: isSafeRegion
        ? 'No evacuation needed. Maintain standard monsoon vigilance.'
        : `Evacuate to ${selectedCamp?.name}. Safe approach: ${selectedCamp?.safeApproachRoute}`,
      floodType: floodType,
    };

    if (onAddNewAlert) {
      onAddNewAlert(newAlertObj);
    }

    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSuccessNotice(
        `SUCCESS: Emergency broadcast transmitted across ${
          enableSMS ? 'Cell Broadcast (SMS), ' : ''
        }${enableSirens ? '110dB Municipal Sirens, ' : ''}${
          enableMedia ? 'Doordarshan/Radio, ' : ''
        }${enableNDRF ? 'NDRF Tactical Radio' : ''}. Target Reach: ~285,000 citizens in ${selectedWards.length} wards.`
      );
      setTimeout(() => setBroadcastSuccessNotice(null), 6000);
    }, 1200);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'all') return true;
    return a.severity === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Siren Controller */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            Emergency Flood Warnings & Siren Alarms
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Public Emergency Warnings & Evacuation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Send instant flood alerts, mobile phone emergency text messages, and neighborhood sirens to protect families.
          </p>
        </div>

        {/* Siren Trigger Switch */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <button
            id="btn-trigger-municipal-siren"
            onClick={handleToggleSiren}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg border ${
              isSirenPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 ring-4 ring-rose-500/30 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            {isSirenPlaying ? (
              <>
                <VolumeX className="w-4 h-4 text-white animate-spin" />
                <span>Stop Siren ({sirenCountdown}s)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-rose-400" />
                <span>Play Loud Siren Alarm</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Broadcast Success Notice */}
      {broadcastSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-start gap-3 animate-in slide-in-from-top-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-emerald-200 text-sm">EMERGENCY BROADCAST CONFIRMED</div>
            <p className="text-xs text-emerald-300/90 mt-1 leading-relaxed">
              {broadcastSuccessNotice}
            </p>
          </div>
        </div>
      )}

      {/* Team Emergency Alert Composer */}
      <div className="p-5 rounded-2xl bg-[#101b2d] border border-violet-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300">Emergency Team Message</div>
            <h2 className="text-lg font-bold text-white mt-1">Send a flood alert to your team</h2>
          </div>
          <button
            type="button"
            onClick={handleSendTeamAlert}
            className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Send Alert
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wide text-slate-400">Location</label>
            <input
              value={teamAlertPlace}
              onChange={(e) => setTeamAlertPlace(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              placeholder="Old City, Ahmedabad"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wide text-slate-400">Severity</label>
            <select
              value={teamAlertSeverity}
              onChange={(e) => setTeamAlertSeverity(e.target.value as 'Low' | 'Medium' | 'High' | 'Critical')}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wide text-slate-400">Flood Water</label>
            <input
              value={teamAlertDepth}
              onChange={(e) => setTeamAlertDepth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              placeholder="1.5m"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wide text-slate-400">Time</label>
            <input
              value={teamAlertEta}
              onChange={(e) => setTeamAlertEta(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              placeholder="in 30 mins"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wide text-slate-400">Send to</label>
          <input
            value={teamAlertRecipient}
            onChange={(e) => setTeamAlertRecipient(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            placeholder="hackathon team"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
          {teamAlertMessage}
        </div>
      </div>

      {/* GOVT RAPID BROADCAST CONSOLE */}
      <div className="p-6 rounded-2xl bg-[#0c1322] border border-cyan-500/30 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Rapid High-Speed Broadcast Console
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  CAP PROTOCOL READY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sends loud siren sounds and SMS warnings directly to phones in threatened areas.
              </p>
            </div>
          </div>

          {/* Quick-Fire Preset Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1 hidden md:inline">Quick Templates:</span>
            <button
              onClick={() => handleQuickPreset('flash')}
              className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-[11px] font-semibold transition-colors"
            >
              ⚡ Fast Flood
            </button>
            <button
              onClick={() => handleQuickPreset('dam')}
              className="px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-[11px] font-semibold transition-colors"
            >
              🌊 Dam Surge
            </button>
            <button
              onClick={() => handleQuickPreset('shelter')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors"
            >
              🏥 Camp Open
            </button>
            <button
              onClick={() => handleQuickPreset('safe')}
              className="px-2.5 py-1 rounded-lg bg-teal-950/40 hover:bg-teal-900/60 border border-teal-500/30 text-teal-300 text-[11px] font-semibold transition-colors"
            >
              🟢 Safe / All Clear
            </button>
            <button
              onClick={() => setGroqModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fix with Groq AI</span>
            </button>
          </div>
        </div>

        {/* Broadcast Config Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Form Config */}
          <div className="lg:col-span-2 space-y-4">
            {/* Title & Severity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Warning Title (Simple Words)
              </label>
              <input
                type="text"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Severity and Flood Type Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Danger Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['critical', 'warning', 'advisory'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        severity === s
                          ? s === 'critical'
                            ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                            : s === 'warning'
                            ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                            : 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {s === 'critical' ? 'Urgent' : s === 'warning' ? 'Warning' : 'Notice'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Type of Flood Event</span>
                </label>
                <select
                  value={floodType}
                  onChange={(e) => setFloodType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="River Rise (Fluvial Inundation)">River Rise (Fluvial Inundation)</option>
                  <option value="Dam Spillway Release Surge">Dam Spillway Release Surge</option>
                  <option value="Flash Flood (Cloudburst)">Flash Flood (Cloudburst)</option>
                  <option value="Urban Drainage Waterlogging">Urban Drainage Waterlogging</option>
                  <option value="Coastal Tidal Surge">Coastal Tidal Surge</option>
                  <option value="Normal Seasonal River Flow (Safe)">Normal Seasonal River Flow (Safe)</option>
                </select>
              </div>
            </div>

            {/* Rescue Shelter Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Safe Rescue Shelter (Where people should go)
              </label>
              <select
                value={selectedCampId}
                onChange={(e) => setSelectedCampId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
              >
                {camps.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name} ({camp.capacityTotal - camp.capacityOccupied} open beds - Height {camp.elevationMeters}m)
                  </option>
                ))}
              </select>
            </div>

            {/* Target Riverside Wards (Checkboxes) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Threatened Neighborhoods & Areas ({currentRegion?.name || 'Region'})</span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  {selectedWards.length} Areas Selected
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {regionWards.map((ward) => {
                  const isChecked = selectedWards.includes(ward);
                  return (
                    <button
                      key={ward}
                      type="button"
                      onClick={() => {
                        setSelectedWards((prev) =>
                          isChecked ? prev.filter((w) => w !== ward) : [...prev, ward]
                        );
                      }}
                      className={`p-2 rounded-xl text-left text-[11px] border transition-all ${
                        isChecked
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 font-semibold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      {ward}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Channels Switchboard */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                How to Send Warning
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setEnableSMS(!enableSMS)}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                    enableSMS
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Cell Broadcast SMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEnableSirens(!enableSirens)}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                    enableSirens
                      ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>City Sirens (110dB)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEnableMedia(!enableMedia)}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                    enableMedia
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>Doordarshan / Radio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEnableNDRF(!enableNDRF)}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                    enableNDRF
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>NDRF Tactical VHF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Live Multilingual Message Preview & Transmit Action */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200">Public Alert Preview</span>
                {/* Language Switch */}
                <div className="flex bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                  {(['en', 'hi', 'gu'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLangTab(l)}
                      className={`px-2 py-0.5 rounded uppercase ${
                        langTab === l
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono-telemetry min-h-[140px]">
                {langTab === 'en' && getEnglishText()}
                {langTab === 'hi' && getHindiText()}
                {langTab === 'gu' && getGujaratiText()}
              </div>

              {/* Approach Route Highlight */}
              <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] space-y-1">
                <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Designated Safe Dry Route:</span>
                </div>
                <div className="text-slate-300 leading-normal">
                  {selectedCamp?.safeApproachRoute || '132ft Outer Ring Road'}
                </div>
              </div>
            </div>

            {/* Big Authorize Button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                id="btn-fire-emergency-broadcast"
                onClick={handleAuthorizeBroadcast}
                disabled={isBroadcasting}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-rose-600/30 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isBroadcasting ? 'Transmitting to All Channels...' : 'AUTHORIZE & FIRE EMERGENCY ALERT'}</span>
              </button>
              <div className="text-[10px] text-center text-slate-400 mt-1.5 font-mono">
                Operator: DEOC-AHMEDABAD-COMMISSIONER-01
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCHED INCIDENTS & AUDIT LOG */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Active Warning Logs & Operator Acknowledgements
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filteredAlerts.length} Recorded
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 text-xs self-start sm:self-auto">
            {(['all', 'critical', 'warning', 'advisory'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilter(sev)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  filter === sev
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Feed List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-12 text-center text-slate-400 text-sm">
              No alerts found matching filter criteria.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl p-5 border transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    alert.acknowledged
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                      : isCritical
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-cyan-950/20 border-cyan-500/40'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {alert.severity}
                      </span>

                      {alert.floodType && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                          <Waves className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span>Flood Type: <strong>{alert.floodType}</strong></span>
                        </span>
                      )}

                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-cyan-400" />
                        {alert.source}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{alert.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                      {alert.description}
                    </p>

                    {alert.actionRequired && (
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>Action Required: <strong>{alert.actionRequired}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        alert.acknowledged
                          ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
                    </button>

                    <button
                      onClick={() => onDispatchAlert(alert.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Re-broadcast alert"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <GroqIntelligenceModal
        isOpen={groqModalOpen}
        onClose={() => setGroqModalOpen(false)}
        weather={null}
        gauges={[]}
        camps={camps}
        onApplyToBroadcast={(title, message) => {
          setAlertTitle(title);
          setCustomMsgEnglish(message);
        }}
      />
    </div>
  );
};
